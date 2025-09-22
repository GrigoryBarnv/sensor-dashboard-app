from flask import Flask, jsonify, render_template, request, session, redirect, url_for
from visualization import get_sensor_data  
import time
import threading
import arduino_read  # Import the Arduino reading module
from models.student import Student
from models.measurement import Measurement
from functools import wraps
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

# create the Flask app and global variables
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key')  # Change this in production
latest_data_log = [] # simple list to keep logs (timestamp + 12 x sensor values)

# Initialize models
student_model = Student()
measurement_model = Measurement()

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


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

# Authentication routes
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        matrikelnummer = request.form.get("matrikelnummer")
        password = request.form.get("password")
        
        success, message = student_model.login(matrikelnummer, password)
        if success:
            session['user_id'] = matrikelnummer
            return redirect(url_for('home'))
        else:
            return render_template("login.html", error=message)
    
    return render_template("login.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        matrikelnummer = request.form.get("matrikelnummer")
        password = request.form.get("password")
        
        success, message = student_model.register(matrikelnummer, password)
        if success:
            return redirect(url_for('login'))
        else:
            return render_template("register.html", error=message)
    
    return render_template("register.html")

@app.route("/logout")
def logout():
    session.pop('user_id', None)
    return redirect(url_for('login'))

# route to show the live page
@app.route("/live")
def live():
    return render_template("live.html")


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
    sensor_id = data.get("sensorId")         # Get the selected sensor ID (e.g., "mq135")
    filename = data.get("selectedFile")      # Get the selected CSV filename (e.g., "Tomate_Enrich2_Measure.CSV")

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
#FOR THE SIMULATION OF REAL TIME DATA SENDING TO THE FRONTEND
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


# already this route is in use later in code ARDUINO BLOCK 
# # GET endpoint for frontend to fetch latest live data
# @app.route("/api/live-stream-data", methods=["GET"])
# def get_latest_live_data():
#     return jsonify(latest_data_log)

######################################################
######################################################
######################################################
#FOR THE SIMULATION OF REAL TIME DATA SENDING TO THE FRONTEND
######################################################
######################################################





##########################################
#START FOR THE ARDUINO MEASUREMENT OUTPUT IN LOG BOX 
##########################################
##########################################


# POST endpoint to start the Arduino measurement and read the data from the Arduino
@app.route('/api/start_measurement', methods=['POST'])
def start_measurement():
    data = request.get_json()
    arduino_read.clear_log()
    t = threading.Thread(target=arduino_read.start_measurement, args=(data,))
    t.daemon = True
    t.start()
    return jsonify({"status": "started"})

# GET endpoint to retrieve the latest live data from the Arduino
@app.route('/api/live-stream-data', methods=['GET'])
def get_latest_live_data():
    return jsonify(arduino_read.get_log())




##########################################
#END FOR THE ARDUINO MEASUREMENT OUTPUT IN LOG BOX 
##########################################
##########################################



#run the app
if __name__ == "__main__":
    app.run(debug=True) # this starts the app and it ld