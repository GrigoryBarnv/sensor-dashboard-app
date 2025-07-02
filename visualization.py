

import pandas as pd
import matplotlib.pyplot as plt
import os

def get_sensor_data(sensor_id, filename):
    try:
        # Load CSV file with ',' separator
        df = pd.read_csv(os.path.join("data", filename), sep=",")
        df.columns = df.columns.str.strip().str.lower()  # Normalize columns

        if "time" not in df.columns:
            return {"error": "Column 'time' not found"}

        df["time"] = pd.to_datetime(df["time"], format="%H:%M:%S", errors="coerce")
        df = df.dropna(subset=["time"])

        sensor_col = sensor_id.lower()
        if sensor_col not in df.columns:
            return {"error": f"{sensor_id} not found in file"}

        return {
            "sensor_id": sensor_id,
            "time": df["time"].dt.strftime("%H:%M:%S").tolist(),
            "values": df[sensor_col].tolist()
        }

    except Exception as e:
        return {"error": str(e)}


