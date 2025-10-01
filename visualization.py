

import pandas as pd
import matplotlib.pyplot as plt
import os


# Function to extract sensor data from a CSV file
def get_sensor_data(sensor_id, filename):
    try:
        print(f"DEBUG: Looking for file: {filename}")
        
        # Get absolute paths
        app_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(app_dir, 'data')
        measurements_dir = os.path.join(app_dir, 'persistent_data', 'measurements')
        print(f"DEBUG: Data directory: {data_dir}")
        print(f"DEBUG: Measurements directory: {measurements_dir}")
        
        # Define all possible paths
        paths = [
            os.path.join(measurements_dir, filename),  # Try user measurements first
            os.path.join(data_dir, filename),  # Then try default data directory
            os.path.join(app_dir, filename),  # Try app root
            filename  # Finally try direct path
        ]
        
        # Try each path
        df = None
        for path in paths:
            print(f"DEBUG: Trying path: {path}")
            if os.path.exists(path):
                print(f"DEBUG: Found file at: {path}")
                try:
                    df = pd.read_csv(path, sep=",")
                    print(f"DEBUG: Successfully loaded file from: {path}")
                    break  # Found and loaded the file successfully
                except Exception as e:
                    print(f"DEBUG: Error reading file at {path}: {str(e)}")
                    continue
            else:
                print(f"DEBUG: File does not exist at: {path}")
        
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


