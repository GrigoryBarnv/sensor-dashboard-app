# arduino_read.py
import serial
import time
import threading
import re

from .arduino_connect import find_arduino_port

# Port will be detected automatically
DEFAULT_PORT = None  # Will be set by find_arduino_port()
BAUD = 115200  # how fast the Arduino sends data
READ_TIMEOUT = 2  # seconds to wait for a line
MAX_LOG_ENTRIES = 300  # max number of entries in live_log

ser = None
live_log = []
measurement_buffer = []  # Buffer for storing complete measurement data
measurement_info = {
    'product_name': None,
    'product_number': None,
    'date': None,
    'is_measuring': False
}
_stop_flag = threading.Event()
_lock = threading.Lock()
_reader_thread = None

# Matches a line with index + 12 numeric values
MEAS_RE = re.compile(r"^\s*\d+\s*(?:,\s*-?\d+(?:\.\d+)?){12}\s*$")

# --- synthetic timer state ---
_tick_seconds = None  # None until first measurement line arrives


##TEST
# ✅ Add the sensor names list here
SENSORS = [
    "MQ2",
    "MQ3_1", 
    "MQ3_10",
    "MQ4",
    "MQ5",
    "MQ6",
    "MQ8",
    "MQ9",
    "MQ135",
    "MQ136",
    "MQ137",
    "MQ138",
]


# keep track of the fake mesusurement time for plotting
def _reset_timer():
    """Restart synthetic timer at next measurement line."""
    global _tick_seconds
    _tick_seconds = None


# every call it gives synthetic time, starting at 00:00:01 every 2 seconds
def _next_time_str():
    """First measurement => 00:00:01, then +2 seconds each row."""
    global _tick_seconds
    if _tick_seconds is None:
        _tick_seconds = 1
    else:
        _tick_seconds += 2
    h = _tick_seconds // 3600
    m = (_tick_seconds % 3600) // 60
    s = _tick_seconds % 60
    return f"{h:02d}:{m:02d}:{s:02d}"


# add a line to the live log
def _append_entry(entry: dict):
    """Store an entry and keep the buffer bounded."""
    global measurement_info
    with _lock:  # lock to prevent concurrent access (e.g. from same reader thread)
        live_log.append(entry)
        if (
            len(live_log) > MAX_LOG_ENTRIES
        ):  # make sure only keep the last MAX_LOG_ENTRIES
            del live_log[:-MAX_LOG_ENTRIES]
        
        # If this is a measurement entry (has time and sensor values), add to measurement buffer
        if measurement_info['is_measuring'] and 'time' in entry and all(
            sensor in entry for sensor in SENSORS
        ):
            measurement_buffer.append(entry)
            print(f"DEBUG: Added entry to measurement buffer. Buffer size: {len(measurement_buffer)}")
        
        # Check for measurement end AFTER adding the last data point
        if isinstance(entry, dict) and 'raw' in entry and 'Measurement ended.' in entry['raw']:
            print("DEBUG: Found measurement end marker")
            measurement_info['is_measuring'] = False
            # Don't clear buffer here - let app.py handle it after saving


# read from the serial port and transform from bytes to strings
def _reader():
    """Background thread to read serial lines and attach time to measurements."""
    global ser
    while not _stop_flag.is_set():
        try:
            if ser and ser.is_open and ser.in_waiting:
                line = ser.readline().decode("utf-8", errors="replace").strip()
                if not line:
                    continue

                # Check if the line matches the measurement format
                if MEAS_RE.match(line):
                    # Example line: "123, v1, v2, ... v12"
                    parts = [p.strip() for p in line.split(",")]
                    if len(parts) >= 13:
                        # parts[0] = index, parts[1:13] = 12 sensor values
                        try:
                            values = [float(v) for v in parts[1:13]]
                        except ValueError:
                            _append_entry({"raw": line})
                            continue

                        # get the next fake time and build the dictionary {time: "00:00:05", MQ2: 123.4, MQ3_1: 456.7, ...}
                        t = _next_time_str()
                        entry = {"time": t}
                        for i, s in enumerate(SENSORS):
                            entry[s] = values[i]
                        # optional raw for debugging
                        entry["raw"] = line

                        print(f"{t} -> {entry}")  # console debug
                        _append_entry(entry)  # and save in the console
                    else:
                        _append_entry({"raw": line})
                else:
                    # non-measurement chatter (phases, prompts, etc.)
                    print(line)
                    _append_entry({"raw": line})
            else:
                time.sleep(0.05)
        except Exception as e:  # if something goes wrong
            msg = f"[reader error] {e}"
            print(msg)
            _append_entry({"raw": msg})
            time.sleep(0.2)


# backend function to start the Arduino measurement
def start_measurement(inputs: dict):
    """Start Arduino measurement with prompts and reset timer."""
    global ser, _reader_thread, measurement_info, measurement_buffer, live_log
    stop()  # stop anything running before
    
    # Clear all buffers and logs
    with _lock:
        measurement_buffer.clear()
        live_log.clear()
    _reset_timer()  # restart synthetic timer
    _stop_flag.clear()  # make sure the stop flag is off so reader will run
    
    # Reset measurement info
    measurement_info.update({
        'product_name': inputs.get('produktname', ''),
        'product_number': inputs.get('produktnummer', ''),
        'date': inputs.get('monat', '') + inputs.get('tag', ''),
        'is_measuring': True
    })
    print(f"DEBUG: Starting new measurement with info: {measurement_info}")
    print("DEBUG: All buffers and logs cleared")

    # Find and open serial port, wait 2 seconds for Arduino to reset
    try:
        port = find_arduino_port() if DEFAULT_PORT is None else DEFAULT_PORT
        ser = serial.Serial(port, baudrate=BAUD, timeout=READ_TIMEOUT)
        time.sleep(2)  # let Arduino reset

        # Drain any leftover lines from the serial buffer
        while ser.in_waiting:
            line = ser.readline().decode("utf-8", errors="replace").strip()
            print(line)
            _append_entry({"raw": line})

        # extra to concetrate the mounth and day strings
        # Get month and day separately
        monat = inputs.get("monat", "")  # e.g. "08"
        tag = inputs.get("tag", "")  # e.g. "04"

        # Combine to mmdd
        datum = f"{monat}{tag}"  # "0804"

        # Send the 7 prompts
        prompts = [
            inputs.get("produktname", ""),
            inputs.get("produktnummer", ""),
            datum,
            inputs.get("clean", ""),
            inputs.get("enrich", ""),
            inputs.get("measure", ""),
            inputs.get("starten", ""),
        ]
        # read and store any replies from arduino
        for val in prompts:
            ser.write((str(val) + "\n").encode())
            time.sleep(0.5)
            while ser.in_waiting:
                line = ser.readline().decode("utf-8", errors="replace").strip()
                print(line)
                _append_entry({"raw": line})

        # report that arduino is running
        msg = "✅ All values sent. Arduino is now running."
        print(msg)
        _append_entry({"raw": msg})

        # Start reader background thread that will read the serial port and data
        _reader_thread = threading.Thread(target=_reader, daemon=True)
        _reader_thread.start()

    # log the error if something goes wrong
    except Exception as e:
        err = f"[start error] {e}"
        print(err)
        _append_entry({"raw": err})
        stop()


# set the please stop signal
def stop():
    """Stop reading and close serial."""
    global ser
    _stop_flag.set()
    time.sleep(0.1)  # give the reader 0.1 sec to exit
    try:
        if ser and ser.is_open:
            try:
                ser.write(b"stop\n")
                time.sleep(0.2)
            except Exception:
                pass
            try:
                ser.close()
            except Exception as e:
                return {"status": "error", "error": str(e)}
    finally:
        ser = None
    return {"status": "stopped"}


# get the last 60 entries from the live log
def get_log():
    """Return last entries (includes {'time': ...} for measurement rows)."""
    with _lock:
        return list(live_log[-60:])


# empty the live log
def clear_log():
    """Clear stored lines."""
    global live_log
    with _lock:
        live_log = []

def get_measurement_data():
    """Get the current measurement buffer and info."""
    with _lock:
        print(f"DEBUG: Getting measurement data. Buffer size: {len(measurement_buffer)}")
        print(f"DEBUG: Measurement info: {measurement_info}")
        return {
            'buffer': measurement_buffer.copy(),
            'info': measurement_info.copy()
        }

def clear_measurement_data():
    """Clear the measurement buffer and reset info."""
    global measurement_buffer, measurement_info
    with _lock:
        measurement_buffer.clear()
        measurement_info.update({
            'product_name': None,
            'product_number': None,
            'date': None,
            'is_measuring': False
        })
        print("DEBUG: Cleared measurement buffer and reset info")
