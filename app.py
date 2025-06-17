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
    result = get_sensor_data(sensor_id)
    return jsonify(result)

@app.route("/test")
def test_page():
    return render_template("test.html")

# POST endpoint to receive data from Jetson or simulator
@app.route("/api/data", methods=["POST"])
def receive_data():
    global latest_data_log
    data = request.get_json()
    data["received_at"] = time.strftime("%H:%M:%S")  # add readable timestamp
    latest_data_log.insert(0, data)
    latest_data_log = latest_data_log[:20]  # only keep latest 20
    return jsonify({"status": "received"})


# GET endpoint for frontend polling
@app.route("/api/data", methods=["GET"])
def get_latest_data():
    return jsonify(latest_data_log)


if __name__ == "__main__":
    app.run(debug=True)

