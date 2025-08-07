import serial
import time



#1.Open the seriol port for Arduino Windows port is different
ser = serial.Serial('COM10', 115200, timeout=2)  # COM-Port anpassen!

# 2.Open the serial port for Jetson/Linux port is different 
# ser = serial.Serial('/dev/ttyACM0', 115200, timeout=2)
time.sleep(2)  # Wait briefly until Arduino is ready

def prompt_and_send(prompt_text):
    value = input(prompt_text)
    ser.write((value + '\n').encode())
    time.sleep(0.2)  # Short pause after sending
    # Read all responses from Arduino until it is ready for the next input
    while ser.in_waiting:
        print(ser.readline().decode('utf-8', errors='replace').strip())
    return value

# Step by step: send all 7 required inputs
prompt_and_send("1. Product name letter (e.g. T): ")
prompt_and_send("2. Product number (e.g. 01): ")
prompt_and_send("3. Date (mmdd, e.g. 0804): ")
prompt_and_send("4. CLEAN duration (minutes, e.g. 0): ")
prompt_and_send("5. ENRICH duration (minutes, e.g. 0): ")
prompt_and_send("6. MEASURE duration (minutes, e.g. 5): ")
prompt_and_send("7. Start? (yes): ")

print("\nAll inputs sent. Measurement running!\n")

# Continuously display Arduino output (measurement values etc.)
try:
    while True:
        if ser.in_waiting:
            print(ser.readline().decode('utf-8', errors='replace').strip())
        time.sleep(0.1)
except KeyboardInterrupt:
    print("\nMeasurement stopped (KeyboardInterrupt).")
    ser.close()
