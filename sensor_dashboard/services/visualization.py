import pandas as pd

from sensor_dashboard.models.dataset import ImportedDataset
from sensor_dashboard.paths import DATA_DIR, MEASUREMENTS_DIR, ROOT_DIR


# Function to extract sensor data from a CSV file
def _build_sensor_result(df, sensor_id):
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


def get_sensor_data(sensor_id, filename):
    try:
        print(f"DEBUG: Looking for file: {filename}")
        print(f"DEBUG: Data directory: {DATA_DIR}")
        print(f"DEBUG: Measurements directory: {MEASUREMENTS_DIR}")
        
        # Define all possible paths
        paths = [
            MEASUREMENTS_DIR / filename,
            DATA_DIR / filename,
            ROOT_DIR / filename,
            filename  # Finally try direct path
        ]
        
        # Try each path
        df = None
        for path in paths:
            print(f"DEBUG: Trying path: {path}")
            if hasattr(path, "exists"):
                exists = path.exists()
            else:
                from os.path import exists as path_exists
                exists = path_exists(path)

            if exists:
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

        return _build_sensor_result(df, sensor_id)

    except Exception as e:
        return {"error": str(e)}


def get_sensor_data_from_sql(sensor_id, filename):
    try:
        dataset = ImportedDataset.query.filter_by(filename=filename).first()
        if not dataset:
            return {"error": "Dataset not found in SQL storage"}

        rows = dataset.get_rows()
        if not rows:
            return {"error": "Dataset is empty"}

        df = pd.DataFrame(rows)
        return _build_sensor_result(df, sensor_id)
    except Exception as e:
        return {"error": str(e)}
