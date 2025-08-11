# arduino_connect.py
import time
import serial

# Minimal: try to open the port and report status
def connect(port: str = "COM10", baud: int = 115200, timeout: int = 2):
    """
    Try to open the Arduino serial port. 
    Returns {"status": "connected", "port": "..."} on success,
    otherwise {"status": "error", "error": "...", "port": "..."}.
    """
    try:
        ser = serial.Serial(port, baudrate=baud, timeout=timeout)
        time.sleep(2)  # small delay so Arduino can reset
        if ser.is_open:
            ser.close()  # we only check connectivity here
            return {"status": "connected", "port": port}
        return {"status": "error", "error": "Port did not open", "port": port}
    except Exception as e:
        return {"status": "error", "error": str(e), "port": port}
