from flask import Flask, jsonify, render_template
from visualization import get_sensor_data  # deine bestehende Funktion

app = Flask(__name__)

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


if __name__ == "__main__":
    app.run(debug=True)


id