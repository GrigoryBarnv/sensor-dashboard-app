
# arduino_read.py

import serial
import time

ser = None
live_log = []

def start_measurement(inputs):
    global ser, live_log
    if ser is None:
        ser = serial.Serial('COM10', 115200, timeout=2)  # Adjust COM-Port for Windows
        # ser = serial.Serial('/dev/ttyACM0', 115200, timeout=2)  # Adjust for Linux/Jetson
        time.sleep(2) # Wait for Arduino to initialize


    # list containing the 7 values from the webbrowser
    prompts = [
        inputs['produktname'],
        inputs['produktnummer'],
        inputs['datum'],
        inputs['clean'],
        inputs['enrich'],
        inputs['measure'],
        inputs['starten']
    ]


    # Send each value to the Arduino with 0.2 seconds delay
    for val in prompts:
        ser.write((val + '\n').encode())
        time.sleep(0.2) # Short pause after sending to allow Arduino to process
        while ser.in_waiting:
            out = ser.readline().decode('utf-8', errors = 'replace').strip()
            live_log.append(out)

    try: 
        while True:
            if ser.in_waiting:
                out = ser.readline().decode('utf-8', errors='replace').strip()
                live_log.append(out)
            time.sleep(0.1)
    except Exception:
        print("\nMeasurement stopped due to an error in arduino_read.py")
        ser.close()


# Function to get the last 60 lines from arduino 
def get_log():
    global live_log
    if live_log:
        return [live_log[-1]]
    else:
        return []
def clear_log():
    global live_log
    live_log = []
