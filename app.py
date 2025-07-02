from flask import Flask, jsonify, render_template, request
from visualization import get_sensor_data  # deine bestehende Funktion
import time

app = Flask(__name__)

latest_data_log = [] # simple list to keep logs (timestamp + 12 x sensor values)

@app.route("/")
def home():
    return render_template("index.html")  # templates/index.html muss existieren

@app.route("/live")
def live():
    return render_template("live.html")

@app.route("/api/sensor/<sensor_id>")
def api_sensor(sensor_id):
    filename = request.args.get("file")
    if not filename:
        return jsonify({"error": "No filename provided"}), 400

    result = get_sensor_data(sensor_id, filename)
    return jsonify(result)



@app.route("/test")
def test_page():
    return render_template("test.html")

# # POST endpoint to receive data from Jetson or simulator
# @app.route("/api/data", methods=["POST"])
# def receive_data():
#     global latest_data_log
#     data = request.get_json()
#     data["received_at"] = time.strftime("%H:%M:%S")  # add readable timestamp
#     latest_data_log.insert(0, data)
#     latest_data_log = latest_data_log[:20]  # only keep latest 20
#     return jsonify({"status": "received"})


# # GET endpoint for frontend polling
# @app.route("/api/data", methods=["GET"])
# def get_latest_data():
#     return jsonify(latest_data_log)




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



if __name__ == "__main__":
    app.run(debug=True)

