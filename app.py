from flask import Flask, jsonify, render_template, request, redirect, url_for, flash, send_file
from datetime import datetime
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from visualization import get_sensor_data
import time
import threading
import os
import arduino_read  # Import the Arduino reading module
from arduino_connect import connect  # Import the Arduino connection module
from models import db
from models.user import User, Measurement  # Import both User and Measurement models

# create the Flask app and global variables
app = Flask(__name__)

# Configure Flask app
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-please-change')
# Create persistent directories for database and measurements
persistent_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'persistent_data')
db_dir = os.path.join(persistent_dir, 'db')
measurements_dir = os.path.join(persistent_dir, 'measurements')

# Create directories if they don't exist
os.makedirs(db_dir, exist_ok=True)
os.makedirs(measurements_dir, exist_ok=True)

# Configure database URI with absolute path
db_path = os.path.join(db_dir, 'sensor_dashboard.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

latest_data_log = []  # simple list to keep logs (timestamp + 12 x sensor values)


# route to show the homepage
@app.route("/")
def home():
    """
    Render the home page of the Sensor Dashboard application.

    This route serves the main index page of the application, which provides
    an interactive dashboard for visualizing sensor data. The HTML template
    for this page is located at 'templates/index.html'.
    """
    return render_template("index.html")  # templates/index.html must exist


# route to show the live page
@app.route("/live")
def live():
    return render_template("live.html")


# Get list of all available CSV files (default + user measurements)
@app.route("/api/available-files")
def get_available_files():
    print("DEBUG: Getting available files")
    
    # Default test files
    default_files = [
        "Avocado_Enrich2_Measure.CSV",
        "Banane_Enrich2_Measure.CSV",
        "Erdbeere_Enrich5_Measure.CSV",
        "Tomate_Enrich2_Measure.CSV"
    ]
    
    # Add user's measurements if logged in
    user_files = []
    if current_user.is_authenticated:
        print(f"DEBUG: User is authenticated, getting measurements")
        user_files = [m.filename for m in current_user.measurements]
        print(f"DEBUG: User measurements: {user_files}")
    
    # Combine files and check existence
    all_files = []
    
    # Get absolute paths
    app_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(app_dir, 'data')
    measurements_dir = os.path.join(app_dir, 'persistent_data', 'measurements')
    print(f"DEBUG: Data directory: {data_dir}")
    print(f"DEBUG: Measurements directory: {measurements_dir}")
    
    # Check default files in data directory
    for file in default_files:
        path = os.path.join(data_dir, file)
        if os.path.exists(path):
            print(f"DEBUG: Found default file: {path}")
            all_files.append(file)
    
    # Check user files in measurements directory
    if os.path.exists(measurements_dir):
        for file in user_files:
            path = os.path.join(measurements_dir, file)
            if os.path.exists(path):
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
    if not filename:
        return jsonify({"error": "No filename provided"}), 400

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
    
    return render_template('login.html')

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
        temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp_measurements')
        print(f"DEBUG: Looking for temp directory at: {temp_dir}")
        print(f"DEBUG: Directory exists: {os.path.exists(temp_dir)}")
        
        if not os.path.exists(temp_dir):
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
        temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp_measurements')
        if os.path.exists(temp_dir):
            for filename in os.listdir(temp_dir):
                if filename.endswith('.CSV') or filename.endswith('.csv'):
                    filepath = os.path.join(temp_dir, filename)
                    os.remove(filepath)
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
    filepath = os.path.join('persistent_data', 'measurements', measurement.filename)
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
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
    measurements_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'persistent_data', 'measurements')
    print(f"DEBUG: Looking in directory: {measurements_dir}")
    if os.path.exists(measurements_dir):
        print("DEBUG: Files in measurements directory:")
        for file in os.listdir(measurements_dir):
            print(f"DEBUG: Found file: {file}")
    else:
        print("DEBUG: Measurements directory does not exist!")
    
    filepath = os.path.join(measurements_dir, measurement.filename)
    print(f"DEBUG: Full file path: {filepath}")
    
    if not os.path.exists(filepath):
        print(f"DEBUG: File not found at: {filepath}")
        return jsonify({'error': 'File not found'}), 404
    
    return send_file(
        filepath,
        mimetype='text/csv',
        as_attachment=True
    )

# Create database tables
def init_db():
    with app.app_context():
        db.create_all()

# run the app
if __name__ == "__main__":
    init_db()  # Create tables before running the app
    app.run(debug=True)  # this starts the app and it ld
