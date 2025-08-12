# arduino_read.py
import serial
import time
import threading
import re

DEFAULT_PORT = "COM10"  # adjust for your OS
BAUD = 115200
READ_TIMEOUT = 2
MAX_LOG_ENTRIES = 300

ser = None
live_log = []
_stop_flag = threading.Event()
_lock = threading.Lock()
_reader_thread = None

# Matches a line with index + 12 numeric values
MEAS_RE = re.compile(r'^\s*\d+\s*(?:,\s*-?\d+(?:\.\d+)?){12}\s*$')


def _append(line: str):
    """Store and optionally print a line from Arduino."""
    with _lock:
        live_log.append({"raw": line})
        if len(live_log) > MAX_LOG_ENTRIES:
            live_log.pop(0)
    print(line)  # always print to console


def _reader():
    """Background thread to read serial lines."""
    global ser
    while not _stop_flag.is_set():
        try:
            if ser and ser.is_open and ser.in_waiting:
                line = ser.readline().decode('utf-8', errors='replace').strip()
                if line:
                    _append(line)
            else:
                time.sleep(0.05)
        except Exception as e:
            _append(f"[reader error] {e}")
            time.sleep(0.2)


def start_measurement(inputs: dict):
    """Start Arduino measurement with prompts."""
    global ser, _reader_thread
    stop()  # ensure no previous session
    clear_log()
    _stop_flag.clear()

    try:
        ser = serial.Serial(DEFAULT_PORT, baudrate=BAUD, timeout=READ_TIMEOUT)
        time.sleep(2)  # allow Arduino reset

        # Read any initial startup lines
        while ser.in_waiting:
            _append(ser.readline().decode('utf-8', errors='replace').strip())

        # Send setup prompts
        prompts = [
            inputs.get('produktname', ''),
            inputs.get('produktnummer', ''),
            inputs.get('datum', ''),
            inputs.get('clean', ''),
            inputs.get('enrich', ''),
            inputs.get('measure', ''),
            inputs.get('starten', '')
        ]
        for val in prompts:
            ser.write((str(val) + '\n').encode())
            time.sleep(0.5)
            while ser.in_waiting:
                _append(ser.readline().decode('utf-8', errors='replace').strip())

        _append("✅ All values sent. Arduino is now running.")

        # Start reader thread
        _reader_thread = threading.Thread(target=_reader, daemon=True)
        _reader_thread.start()

    except Exception as e:
        _append(f"[start error] {e}")
        stop()

## FUNKRION FOR CHECKING CONNECTION TO ARDUINO TERMINAL
# def get_status():
#     try:
#         ok = bool(ser and ser.is_open)
#         return {"connected": ok, "port": DEFAULT_PORT if ok else None}
#     except Exception:
#         return {"connected": False, "port": None}



def stop():
    """Stop reading and close serial."""
    global ser
    _stop_flag.set()
    time.sleep(0.1)
    try:
        if ser and ser.is_open:
            ser.write(b"stop\n")
            time.sleep(0.2)
            ser.close()
    except Exception as e:
        return {"status": "error", "error": str(e)}
    finally:
        ser = None
    return {"status": "stopped"}


def get_log():
    """Return last entries."""
    with _lock:
        return list(live_log[-60:])


def clear_log():
    """Clear stored lines."""
    global live_log
    with _lock:
        live_log = []
