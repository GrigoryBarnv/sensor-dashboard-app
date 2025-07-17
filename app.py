from flask import Flask, jsonify, render_template, request
from visualization import get_sensor_data  
import time
import requests

# create the Flask app and global variables
app = Flask(__name__)
latest_data_log = [] # simple list to keep logs (timestamp + 12 x sensor values)


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


#FOR THE SIMULATION OF REAL TIME DATA SENDING TO THE FRONTEND

# POST endpoint for simulator.py to send data
@app.route("/api/live-stream-data", methods=["POST"])
def receive_live_data():
    global latest_data_log
    data = request.get_json()
    print("RECIEVED from simulatir:", data)
    data["received_at"] = time.strftime("%H:%M:%S")
    latest_data_log.insert(0, data)
    latest_data_log = latest_data_log[:1]
    return jsonify({"status": "received"})

# GET endpoint for frontend to fetch latest live data
@app.route("/api/live-stream-data", methods=["GET"])
def get_latest_live_data():
    return jsonify(latest_data_log)



#run the app
if __name__ == "__main__":
    app.run(debug=True) # this starts the app and it ld