# arduino_read.py
import serial
import time
import threading
import re

DEFAULT_PORT = "COM10"   # adjust for your OS
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

# --- synthetic timer state ---
_tick_seconds = None  # None until first measurement line arrives



##TEST
# ✅ Add the sensor names list here
SENSORS = [
    "MQ2","MQ3_1","MQ3_10","MQ4","MQ5","MQ6",
    "MQ8","MQ9","MQ135","MQ136","MQ137","MQ138"
]

def _reset_timer():
    """Restart synthetic timer at next measurement line."""
    global _tick_seconds
    _tick_seconds = None


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


def _append_entry(entry: dict):
    """Store an entry and keep the buffer bounded."""
    with _lock:
        live_log.append(entry)
        if len(live_log) > MAX_LOG_ENTRIES:
            del live_log[:-MAX_LOG_ENTRIES]


def _reader():
    """Background thread to read serial lines and attach time to measurements."""
    global ser
    while not _stop_flag.is_set():
        try:
            if ser and ser.is_open and ser.in_waiting:
                line = ser.readline().decode('utf-8', errors='replace').strip()
                if not line:
                    continue

                if MEAS_RE.match(line):
                    # Example line: "123, v1, v2, ... v12"
                    parts = [p.strip() for p in line.split(',')]
                    if len(parts) >= 13:
                        # parts[0] = index, parts[1:13] = 12 sensor values
                        try:
                            values = [float(v) for v in parts[1:13]]
                        except ValueError:
                            _append_entry({"raw": line})
                            continue

                        t = _next_time_str()
                        entry = {"time": t}
                        for i, s in enumerate(SENSORS):
                            entry[s] = values[i]
                        # optional raw for debugging
                        entry["raw"] = line

                        print(f"{t} -> {entry}")  # console debug
                        _append_entry(entry)
                    else:
                        _append_entry({"raw": line})
                else:
                    # non-measurement chatter (phases, prompts, etc.)
                    print(line)
                    _append_entry({"raw": line})
            else:
                time.sleep(0.05)
        except Exception as e:
            msg = f"[reader error] {e}"
            print(msg)
            _append_entry({"raw": msg})
            time.sleep(0.2)



def start_measurement(inputs: dict):
    """Start Arduino measurement with prompts and reset timer."""
    global ser, _reader_thread
    stop()         # ensure no previous session
    clear_log()
    _reset_timer() # <<< restart synthetic timer
    _stop_flag.clear()

    try:
        ser = serial.Serial(DEFAULT_PORT, baudrate=BAUD, timeout=READ_TIMEOUT)
        time.sleep(2)  # let Arduino reset

        # Drain any initial output
        while ser.in_waiting:
            line = ser.readline().decode('utf-8', errors='replace').strip()
            print(line)
            _append_entry({"raw": line})

        # Send the 7 prompts
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
                line = ser.readline().decode('utf-8', errors='replace').strip()
                print(line)
                _append_entry({"raw": line})

        msg = "✅ All values sent. Arduino is now running."
        print(msg)
        _append_entry({"raw": msg})

        # Start reader thread
        _reader_thread = threading.Thread(target=_reader, daemon=True)
        _reader_thread.start()

    except Exception as e:
        err = f"[start error] {e}"
        print(err)
        _append_entry({"raw": err})
        stop()


def stop():
    """Stop reading and close serial."""
    global ser
    _stop_flag.set()
    time.sleep(0.1)
    try:
        if ser and ser.is_open:
            try:
                ser.write(b"stop\n")
                time.sleep(0.2)
            except Exception:
                pass
            ser.close()
    except Exception as e:
        return {"status": "error", "error": str(e)}
    finally:
        ser = None
    return {"status": "stopped"}


def get_log():
    """Return last entries (includes {'time': ...} for measurement rows)."""
    with _lock:
        return list(live_log[-60:])


def clear_log():
    """Clear stored lines."""
    global live_log
    with _lock:
        live_log = []
