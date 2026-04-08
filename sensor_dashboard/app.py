from flask import Flask, jsonify, request, redirect, url_for, send_file, send_from_directory
from datetime import datetime
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from sensor_dashboard.services.visualization import get_sensor_data, get_sensor_data_from_sql
import time
import threading
import os
import mimetypes
from werkzeug.exceptions import NotFound
from sensor_dashboard.hardware import arduino_read
from sensor_dashboard.hardware.arduino_connect import connect
from sensor_dashboard.models import db
from sensor_dashboard.models.user import User, Measurement
from sensor_dashboard.models.dataset import ImportedDataset
from sensor_dashboard.paths import (
    DATA_DIR,
    DB_DIR,
    FRONTEND_BUILD_DIR,
    MEASUREMENTS_DIR,
    ROOT_DIR,
    TEMP_MEASUREMENTS_DIR,
)
import pandas as pd

mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")

# create the Flask app and global variables
app = Flask(
    __name__,
    static_folder=str(ROOT_DIR / "static"),
    static_url_path="/static",
)

# Configure Flask app
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-please-change')

# Create directories if they don't exist
DB_DIR.mkdir(parents=True, exist_ok=True)
MEASUREMENTS_DIR.mkdir(parents=True, exist_ok=True)

# Configure database URI with absolute path
db_path = DB_DIR / 'sensor_dashboard.db'
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path.as_posix()}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.unauthorized_handler
def unauthorized():
    if request.path.startswith("/api/"):
        return jsonify({"error": "Unauthorized"}), 401
    return redirect(url_for("home"))

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

latest_data_log = []  # simple list to keep logs (timestamp + 12 x sensor values)


def sync_default_datasets_to_sql():
    if not DATA_DIR.exists():
        return

    for filename in os.listdir(DATA_DIR):
        if not filename.lower().endswith(".csv"):
            continue

        file_path = DATA_DIR / filename
        display_name = filename.replace("_Measure.CSV", "").replace("_", " ")
        dataset = ImportedDataset.query.filter_by(filename=filename).first()
        file_mtime = datetime.utcfromtimestamp(file_path.stat().st_mtime)

        if dataset and dataset.updated_at and dataset.updated_at >= file_mtime:
            continue

        df = pd.read_csv(file_path, sep=",")
        df.columns = [column.strip() for column in df.columns]
        rows = df.to_dict(orient="records")

        if dataset is None:
            dataset = ImportedDataset(
                filename=filename,
                display_name=display_name,
                source_path=file_path,
            )
            db.session.add(dataset)

        dataset.display_name = display_name
        dataset.source_path = file_path
        dataset.updated_at = file_mtime
        dataset.set_rows(rows)

    db.session.commit()


def serve_frontend():
    index_path = FRONTEND_BUILD_DIR / "index.html"
    if not index_path.exists():
        return (
            "Frontend build not found. Run `npm.cmd install` and `npm.cmd run build` in `frontend/`.",
            503,
        )
    return send_from_directory(str(FRONTEND_BUILD_DIR), "index.html")


@app.route("/")
def home():
    return serve_frontend()


@app.route("/live")
def live():
    return serve_frontend()


# Get list of all available CSV files (default + user measurements)
@app.route("/api/available-files")
def get_available_files():
    source = request.args.get("source", "csv").lower()
    print("DEBUG: Getting available files")

    if source == "sql":
        datasets = ImportedDataset.query.order_by(ImportedDataset.filename.asc()).all()
        return jsonify([dataset.filename for dataset in datasets])
    
    # Add user's measurements if logged in
    user_files = []
    if current_user.is_authenticated:
        print(f"DEBUG: User is authenticated, getting measurements")
        user_files = [m.filename for m in current_user.measurements]
        print(f"DEBUG: User measurements: {user_files}")
    
    # Combine files and check existence
    all_files = []
    
    print(f"DEBUG: Data directory: {DATA_DIR}")
    print(f"DEBUG: Measurements directory: {MEASUREMENTS_DIR}")
    
    # Check all CSV files in the default data directory
    if DATA_DIR.exists():
        for file in os.listdir(DATA_DIR):
            if not file.lower().endswith(".csv"):
                continue
            path = DATA_DIR / file
            if path.exists():
                print(f"DEBUG: Found default file: {path}")
                all_files.append(file)
    
    # Check user files in measurements directory
    if MEASUREMENTS_DIR.exists():
        for file in user_files:
            path = MEASUREMENTS_DIR / file
            if path.exists():
                print(f"DEBUG: Found user file: {path}")
                all_files.append(file)
    
    # Remove duplicates and sort
    files = sorted(list(set(all_files)))
    print(f"DEBUG: Final available files: {files}")
    return jsonify(files)

# API endpoint for frontend to retrieve full CSV sensor data for offline Plotting
@app.route("/api/sensor/<sensor_id>")
def api_sensor(sensor_id):
    filename = request.args.get("file")
    source = request.args.get("source", "csv").lower()
    if not filename:
        return jsonify({"error": "No filename provided"}), 400

    if source == "sql":
        result = get_sensor_data_from_sql(sensor_id, filename)
    else:
        result = get_sensor_data(sensor_id, filename)
    return jsonify(result)


# GET endpoint for frontend polling for getting the live simulation data from CSV
@app.route("/api/data", methods=["GET"])
def get_latest_data():
    return jsonify(latest_data_log)


# POST endpoint for the life data simulation , retrieve file Avacado.... and sensor id to send to simulate live.js
@app.route("/api/sensor_data", methods=["POST"])
def api_sensor_data():
    # Parse incoming JSON data from the POST request
    data = request.get_json()
    sensor_id = data.get("sensorId")  # Get the selected sensor ID (e.g., "mq135")
    filename = data.get(
        "selectedFile"
    )  # Get the selected CSV filename (e.g., "Tomate_Enrich2_Measure.CSV")

    # Check if both sensor ID and filename were provided
    if not sensor_id or not filename:
        return jsonify({"error": "Missing sensorId or filename"}), 400

    # Call the main logic function to extract and process sensor data from the CSV file
    result = get_sensor_data(sensor_id, filename)

    # Return the processed data (or error) as a JSON response to the frontend
    return jsonify(result)


######################################################
######################################################
######################################################
# START FOR THE SIMULATION OF REAL TIME DATA SENDING TO THE FRONTEND
######################################################
######################################################
######################################################
# POST endpoint for simulator.py to send data
@app.route("/api/live-stream-data", methods=["POST"])
def receive_live_data():
    MAX_LOG_ENTRIES = 60  # or any number you want
    global latest_data_log
    data = request.get_json()
    print("RECIEVED from simulatir:", data)
    data["received_at"] = time.strftime("%H:%M:%S")
    latest_data_log.insert(0, data)
    latest_data_log = latest_data_log[:MAX_LOG_ENTRIES]
    return jsonify({"status": "received"})


# POST endpoint to connect to Arduino terminal
@app.route("/api/connect_arduino_terminal", methods=["POST"])
def connect_arduino_terminal():
    body = request.get_json(silent=True) or {}
    # for windows
    # port = body.get("port", "COM10")  # override if needed

    # Port will be detected automatically
    port = body.get("port", None)  # if None, will auto-detect
    result = connect(port=port)
    return jsonify(result), (200 if result["status"] == "connected" else 500)


# already this route is in use later in code ARDUINO BLOCK
# # GET endpoint for frontend to fetch latest live data
# @app.route("/api/live-stream-data", methods=["GET"])
# def get_latest_live_data():
#     return jsonify(latest_data_log)

######################################################
######################################################
######################################################
# END FOR THE SIMULATION OF REAL TIME DATA SENDING TO THE FRONTEND
######################################################
######################################################


##########################################
# START FOR THE ARDUINO MEASUREMENT OUTPUT IN LOG BOX
##########################################
##########################################


# POST endpoint to start the Arduino measurement and read the data from the Arduino
@app.route("/api/start_measurement", methods=["POST"])
def start_measurement():
    data = request.get_json()
    arduino_read.clear_log()
    t = threading.Thread(target=arduino_read.start_measurement, args=(data,))
    t.daemon = True
    t.start()
    return jsonify({"status": "started"})


# GET endpoint to retrieve the latest live data from the Arduino
@app.route("/api/live-stream-data", methods=["GET"])
def get_latest_live_data():
    log_data = arduino_read.get_log()
    print("DEBUG: Got log data from arduino_read")
    
    # Check for measurement completion
    for entry in log_data:
        if isinstance(entry, dict) and 'raw' in entry:
            print(f"DEBUG: Processing log entry: {entry}")
            if 'Measurement ended.' in entry['raw']:
                print("DEBUG: Found measurement completion message")
                # Get measurement data
                measurement_data = arduino_read.get_measurement_data()
                print(f"DEBUG: Got measurement data: {measurement_data}")
                
                if len(measurement_data['buffer']) > 0 and current_user.is_authenticated:
                    print("DEBUG: Saving measurement for authenticated user")
                    try:
                        # Save measurement
                        current_user.add_measurement(
                            measurement_data['buffer'],
                            measurement_data['info']['product_name'],
                            measurement_data['info']['product_number'],
                            measurement_data['info']['date']
                        )
                        print("DEBUG: Successfully saved measurement")
                        
                        # Clear measurement data and logs
                        arduino_read.clear_measurement_data()
                        arduino_read.clear_log()
                        print("DEBUG: Cleared measurement data and logs")
                        
                        # Return success message only
                        return jsonify([{
                            'raw': '✅ Measurement completed and saved to your account.',
                            'type': 'success'
                        }])
                    except Exception as e:
                        print(f"DEBUG: Error saving measurement: {str(e)}")
                        log_data.append({
                            'raw': f'❌ Error saving measurement: {str(e)}',
                            'type': 'error'
                        })
    
    return jsonify(log_data)


## a route sending stop to arduino d
@app.route("/api/stop_arduino", methods=["POST"])
def stop_arduino():
    result = arduino_read.stop()
    return jsonify(result)


## ////FUNKRION FOR CHECKING CONNECTION TO ARDUINO TERMINAL
# @app.route("/api/arduino_status", methods=["GET"])
# def arduino_status():
#     return jsonify(arduino_read.get_status())


##########################################
# END FOR THE ARDUINO MEASUREMENT OUTPUT IN LOG BOX


# Login routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        matrikelnummer = request.form.get('matrikelnummer')
        password = request.form.get('password')
        
        user = User.get_by_matrikelnummer(matrikelnummer)
        if user and user.check_password(password):
            login_user(user)
            user.last_login = datetime.utcnow()
            db.session.commit()
            return jsonify({'status': 'success'})
        return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401
    
    return serve_frontend()

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    matrikelnummer = data.get('matrikelnummer')
    password = data.get('password')
    
    if User.get_by_matrikelnummer(matrikelnummer):
        return jsonify({'status': 'error', 'message': 'Matrikelnummer already registered'}), 400
        
    user = User(matrikelnummer=matrikelnummer)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'status': 'success'})

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))

@app.route('/api/logout', methods=['POST'])
@login_required
def api_logout():
    logout_user()
    return jsonify({'status': 'success'})

@app.route('/api/session')
def api_session():
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': current_user.id,
                'matrikelnummer': current_user.matrikelnummer
            }
        })

    return jsonify({'authenticated': False, 'user': None})

@app.route('/api/measurements')
@login_required
def get_measurements():
    """Get list of user's measurements"""
    measurements = [m.to_dict() for m in current_user.measurements]
    return jsonify(measurements)

@app.route('/api/temp-measurements')
def get_temp_measurements():
    """Get list of CSV files in temp_measurements directory"""
    try:
        temp_dir = TEMP_MEASUREMENTS_DIR
        print(f"DEBUG: Looking for temp directory at: {temp_dir}")
        print(f"DEBUG: Directory exists: {temp_dir.exists()}")
        
        if not temp_dir.exists():
            print("DEBUG: Temp directory does not exist, returning empty list")
            return jsonify([])
        
        files = os.listdir(temp_dir)
        print(f"DEBUG: Found {len(files)} files in temp directory: {files}")
        
        csv_files = []
        for filename in files:
            print(f"DEBUG: Checking file: {filename}")
            if filename.endswith('.CSV') or filename.endswith('.csv'):
                print(f"DEBUG: File {filename} is a CSV file")
                # Parse filename to extract measurement info
                # Format: ProductName_ProductNumber_Date_Measure.CSV
                parts = filename.replace('_Measure.CSV', '').split('_')
                print(f"DEBUG: Parsed parts: {parts}")
                if len(parts) >= 3:
                    product_name = parts[0]
                    product_number = parts[1] 
                    date = parts[2]
                    measurement = {
                        'filename': filename,
                        'product_name': product_name,
                        'product_number': product_number,
                        'date': date,
                        'display_name': f"{product_name} {product_number} ({date})"
                    }
                    csv_files.append(measurement)
                    print(f"DEBUG: Added measurement: {measurement}")
        
        print(f"DEBUG: Returning {len(csv_files)} measurements")
        return jsonify(csv_files)
    except Exception as e:
        print(f"Error getting temp measurements: {e}")
        import traceback
        traceback.print_exc()
        return jsonify([])

@app.route('/api/clear-temp-measurements', methods=['POST'])
def clear_temp_measurements():
    """Clear all CSV files from temp_measurements directory"""
    try:
        temp_dir = TEMP_MEASUREMENTS_DIR
        if temp_dir.exists():
            for filename in os.listdir(temp_dir):
                if filename.endswith('.CSV') or filename.endswith('.csv'):
                    filepath = temp_dir / filename
                    filepath.unlink()
                    print(f"Cleared temp file: {filepath}")
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error clearing temp measurements: {e}")
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/measurements/<int:measurement_id>/delete', methods=['POST'])
@login_required
def delete_measurement(measurement_id):
    """Delete measurement and its CSV file"""
    measurement = Measurement.query.get_or_404(measurement_id)
    if measurement.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Delete CSV file from persistent storage
    filepath = MEASUREMENTS_DIR / measurement.filename
    try:
        if filepath.exists():
            filepath.unlink()
    except Exception as e:
        return jsonify({'error': f'Error deleting file: {str(e)}'}), 500
    
    # Delete from database
    db.session.delete(measurement)
    db.session.commit()
    
    return jsonify({'status': 'success'})

@app.route('/api/measurements/<int:measurement_id>/download')
@login_required
def download_measurement(measurement_id):
    """Download measurement CSV file"""
    measurement = Measurement.query.get_or_404(measurement_id)
    if measurement.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Debug prints for troubleshooting
    print(f"DEBUG: Download requested for measurement ID: {measurement_id}")
    print(f"DEBUG: Filename from database: {measurement.filename}")
    
    # List all files in measurements directory
    measurements_dir = MEASUREMENTS_DIR
    print(f"DEBUG: Looking in directory: {measurements_dir}")
    if measurements_dir.exists():
        print("DEBUG: Files in measurements directory:")
        for file in os.listdir(measurements_dir):
            print(f"DEBUG: Found file: {file}")
    else:
        print("DEBUG: Measurements directory does not exist!")
    
    filepath = measurements_dir / measurement.filename
    print(f"DEBUG: Full file path: {filepath}")
    
    if not filepath.exists():
        print(f"DEBUG: File not found at: {filepath}")
        return jsonify({'error': 'File not found'}), 404
    
    return send_file(
        str(filepath),
        mimetype='text/csv',
        as_attachment=True
    )

@app.route('/api/measurements/<int:measurement_id>/data')
@login_required
def get_measurement_data(measurement_id):
    """Get measurement data for plotting"""
    measurement = Measurement.query.get_or_404(measurement_id)
    if measurement.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Get the file path
    filepath = MEASUREMENTS_DIR / measurement.filename
    
    if not filepath.exists():
        return jsonify({'error': 'File not found'}), 404
    
    try:
        # Read CSV data using pandas
        import pandas as pd
        data = pd.read_csv(filepath)
        
        # Convert to the format expected by the frontend
        result = {}
        for column in data.columns:
            if column != 'time':
                result[column] = {
                    'time': data['time'].tolist(),
                    'values': data[column].tolist(),
                    'sensor_id': column
                }
        
        return jsonify(result)
    except Exception as e:
        print(f"Error reading measurement data: {e}")
        return jsonify({'error': str(e)}), 500

# Create database tables
def init_db():
    with app.app_context():
        db.create_all()
        sync_default_datasets_to_sql()

@app.route('/<path:path>')
def frontend_fallback(path):
    if path.startswith("api/"):
        raise NotFound()
    return serve_frontend()

# run the app
if __name__ == "__main__":
    init_db()  # Create tables before running the app
    app.run(debug=True)  # this starts the app and it ld
