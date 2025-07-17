
import random
import time
import json
from datetime import timedelta
import requests



# Sensor-Namen wie im Beispiel
sensors = [
    "MQ136", "MQ138", "MQ137", "MQ4", "MQ9", "MQ8",
    "MQ3_10", "MQ5", "MQ2", "MQ135", "MQ6", "MQ3_1"
]

def random_value(sensor):
    # Optional: Je Sensor anderer Wertebereich, hier Beispiel
    return round(random.uniform(20, 350), 2)


def simulate_sensor_data():
    sec = 0
    while True:
        # Zeitformat wie "00:00:02"
        time_str = str(timedelta(seconds=sec))
        data = {"time": time_str}
        for sensor in sensors:
            data[sensor] = random_value(sensor)
        print(json.dumps(data, ensure_ascii=False))
        requests.post("http://web:5000/api/data", json=data)
        time.sleep(2)
        sec += 2

if __name__ == "__main__":
    simulate_sensor_data()
