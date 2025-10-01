

import pandas as pd
import matplotlib.pyplot as plt
import os


# Function to extract sensor data from a CSV file
def get_sensor_data(sensor_id, filename):
    try:
        print(f"DEBUG: Looking for file: {filename}")
        
        # Define all possible paths
        paths = [
            filename,  # Try direct path
            os.path.join('data', filename),  # Try in data directory
            os.path.join('persistent_data', 'measurements', filename),  # Try in user measurements
            os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', filename),  # Try absolute data path
            os.path.join(os.path.dirname(os.path.abspath(__file__)), 'persistent_data', 'measurements', filename)  # Try absolute measurements path
        ]
        
        # Try each path
        df = None
        for path in paths:
            print(f"DEBUG: Trying path: {path}")
            if os.path.exists(path):
                print(f"DEBUG: Found file at: {path}")
                try:
                    df = pd.read_csv(path, sep=",")
                    break  # Found and loaded the file successfully
                except Exception as e:
                    print(f"DEBUG: Error reading file at {path}: {str(e)}")
                    continue
        
        if df is None:
            print("DEBUG: File not found in any location")
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


