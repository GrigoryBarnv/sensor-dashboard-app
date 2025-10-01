

import pandas as pd
import matplotlib.pyplot as plt
import os


#  is function to extract sensor data from a CSV file
def get_sensor_data(sensor_id, filename):
    try:
        # Check both default and user measurement locations
        default_path = filename
        user_path = os.path.join('persistent_data', 'measurements', filename)
        
        # Try user measurements first, then default files
        if os.path.exists(user_path):
            print(f"DEBUG: Reading user measurement: {user_path}")
            df = pd.read_csv(user_path, sep=",")
        elif os.path.exists(default_path):
            print(f"DEBUG: Reading default file: {default_path}")
            df = pd.read_csv(default_path, sep=",")
        else:
            print(f"DEBUG: File not found in either location: {filename}")
            return {"error": "File not found"}
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


