
import pandas as pd
import matplotlib.pyplot as plt

def get_sensor_data(sensor_id):
    try:
        df = pd.read_csv("data/Example_Data.csv", sep=';')
        df.columns = df.columns.str.strip()
        df["Time"] = pd.to_datetime(df["Time"], format="%H:%M:%S")

        column = f"{sensor_id}_RS"
        if column not in df.columns:
            return {"error": f"{column} not found"}

        return {
            "time": df["Time"].dt.strftime("%H:%M:%S").tolist(),  # ✅ bereits korrekt
            "values": df[column].tolist(),  # ✅ fix hier
            "sensor_id": sensor_id
        }


    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    # Liste anzeigen
    df = pd.read_csv("data/Example_Data.csv", sep=';')
    df.columns = df.columns.str.strip()
    sensor_columns = [col for col in df.columns if col.endswith("_RS")]
    sensor_ids = [col.replace("_RS", "") for col in sensor_columns]

    print("🔎 Verfügbare Sensoren:")
    print(", ".join(sensor_ids))

    # Eingabe
    sensor_input = input("Gib den Sensornamen ein (z. B. MQ2): ").strip()
    result = get_sensor_data(sensor_input)



