
# arduino_read.py

import serial
import time

#ser = None
# live_log = []
# def start_measurement(inputs):
#     global ser, live_log

#     try:
#         # Open serial if not already open
#         if ser is None or not getattr(ser, 'is_open', False):
#             ser = serial.Serial('COM10', 115200, timeout=2)  # Windows
#             # ser = serial.Serial('/dev/ttyACM0', 115200, timeout=2)  # Linux/Jetson
#             time.sleep(2)  # Wait for Arduino to initialize

#         # Send the 7 input values
#         prompts = [
#             inputs['produktname'],
#             inputs['produktnummer'],
#             inputs['datum'],
#             inputs['clean'],
#             inputs['enrich'],
#             inputs['measure'],
#             inputs['starten']
#         ]

#         for val in prompts:
#             if not ser.is_open:
#                 print("Serial port closed before sending all prompts.")
#                 return
#             ser.write((val + '\n').encode())
#             time.sleep(0.2)
#             while ser.is_open and ser.in_waiting:
#                 out = ser.readline().decode('utf-8', errors='replace').strip()
#                 live_log.append(out)

#         # Continuous reading loop
#         while ser and ser.is_open:
#             if ser.in_waiting:
#                 out = ser.readline().decode('utf-8', errors='replace').strip()
#                 live_log.append(out)
#             time.sleep(0.1)

#     except Exception as e:
#         print(f"\nMeasurement stopped: {e}")

#     finally:
#         # Always close and reset the port
#         if ser and getattr(ser, 'is_open', False):
#             ser.close()
#         ser = None


ser = None

def start_measurement(inputs):
    global ser

    # Open the COM port
    ser = serial.Serial('COM10', 115200, timeout=2)  # Adjust for your OS
    time.sleep(2)  # Allow Arduino to reset and send initial messages

    # Read any initial Arduino output
    while ser.in_waiting:
        print(ser.readline().decode('utf-8', errors='replace').strip())

    # Prepare your inputs (like entering them manually in Serial Monitor)
    prompts = [
        inputs['produktname'],
        inputs['produktnummer'],
        inputs['datum'],
        inputs['clean'],
        inputs['enrich'],
        inputs['measure'],
        inputs['starten']
    ]

    # Send each value with 0.5s delay and print Arduino’s response
    for val in prompts:
        ser.write((val + '\n').encode())
        time.sleep(0.5)  # Give Arduino time to respond
        while ser.in_waiting:
            print(ser.readline().decode('utf-8', errors='replace').strip())

    print("✅ All values sent. Arduino is now running.")

    # Keep listening like Serial Monitor
    try:
        while True:
            if ser.in_waiting:
                print(ser.readline().decode('utf-8', errors='replace').strip())
    except KeyboardInterrupt:
        print("🔴 Stopping and closing serial port.")
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





# ######################## BLOCK OF THE CODE WHERE I DONT SEE ANYTHING BESIDES THE MEASUREMENTS 
# ##################(SUPPOSED TO BE BUT STILL RUNS SOMTH ELSE AND ARDUINO STARTS AAAAAHAH)
# # arduino_read.py
# import time
# import threading
# import re
# import serial

# # ---------- config ----------
# DEFAULT_PORT = "COM10"          # change to '/dev/ttyACM0' on Jetson/Linux if needed
# BAUD = 115200
# READ_TIMEOUT = 2
# MAX_LOG_ENTRIES = 300
# # ----------------------------

# ser = None
# _reader_thread = None
# _stop_reader = threading.Event()
# _measuring = threading.Event()
# _lock = threading.Lock()
# _live_log: list[str] = []

# # Regex: "number, float, float, ... (12 floats total)"
# # Your sketch prints: elapsedSeconds,<Rs1>,...,<Rs12>
# _MEAS_RE = re.compile(
#     r'^\s*\d+\s*(?:,\s*-?\d+(?:\.\d+)?){12}\s*$'
# )

# def _append(line: str):
#     with _lock:
#         _live_log.append(line)
#         if len(_live_log) > MAX_LOG_ENTRIES:
#             del _live_log[:-MAX_LOG_ENTRIES]

# def _reader():
#     """Background serial reader; keeps only measurement CSV lines while measuring."""
#     global ser
#     while not _stop_reader.is_set():
#         try:
#             if ser and ser.is_open and ser.in_waiting:
#                 line = ser.readline().decode('utf-8', errors='replace').strip()
#                 if not line:
#                     continue
#                 # Only keep measurement rows when measuring is active
#                 if _measuring.is_set():
#                     if _MEAS_RE.match(line):
#                         _append(line)
#                     # else ignore chatter like "Phase...", "Logdauer...", prompts, etc.
#             else:
#                 time.sleep(0.05)
#         except Exception as e:
#             _append(f"[reader error] {e}")
#             time.sleep(0.2)

# def _ensure_connected(port: str | None = None):
#     """Open serial and start reader once."""
#     global ser, _reader_thread
#     if ser is None or not ser.is_open:
#         ser = serial.Serial(port or DEFAULT_PORT, baudrate=BAUD, timeout=READ_TIMEOUT)
#         time.sleep(2)  # let Arduino reset after opening
#     if _reader_thread is None or not _reader_thread.is_alive():
#         _stop_reader.clear()
#         _reader_thread = threading.Thread(target=_reader, daemon=True)
#         _reader_thread.start()

# def start_measurement(inputs: dict):
#     """
#     Send the 7 inputs to Arduino and start capturing only measurement lines.
#     inputs keys: produktname, produktnummer, datum, clean, enrich, measure, starten
#     """
#     _ensure_connected()
#     clear_log()  # start fresh

#     prompts = [
#         inputs.get('produktname', ''),
#         inputs.get('produktnummer', ''),
#         inputs.get('datum', ''),
#         inputs.get('clean', ''),
#         inputs.get('enrich', ''),
#         inputs.get('measure', ''),
#         inputs.get('starten', ''),
#     ]

#     # Send each value (your sketch expects each on its own line)
#     for val in prompts:
#         ser.write((str(val) + '\n').encode())
#         time.sleep(0.25)  # small pause so the sketch can advance its state machine
#         # flush any prompt lines without storing them
#         t0 = time.time()
#         while ser.in_waiting and (time.time() - t0) < 0.5:
#             _ = ser.readline()  # discard

#     # From now on, only keep measurement CSV lines
#     _measuring.set()

# def get_log():
#     """Return the last measurement lines (array of strings)."""
#     with _lock:
#         return list(_live_log[-60:])  # keep response small for the UI

# def clear_log():
#     global _live_log
#     with _lock:
#         _live_log = []

# def stop_capture():
#     """Stop capturing (does not close serial)."""
#     _measuring.clear()

# def close():
#     """Optional: close everything."""
#     stop_capture()
#     _stop_reader.set()
#     time.sleep(0.1)
#     try:
#         if ser and ser.is_open:
#             ser.close()
#     except Exception:
#         pass
