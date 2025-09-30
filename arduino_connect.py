# arduino_connect.py
import time
import serial
import serial.tools.list_ports
import platform
import os

def find_arduino_port():
    """Try to find the Arduino port automatically."""
    # List of common Arduino port patterns
    linux_patterns = ['/dev/ttyACM', '/dev/ttyUSB']
    windows_patterns = ['COM']
    
    # Get all available ports
    ports = list(serial.tools.list_ports.comports())
    
    # Check if we're on Linux or Windows
    system = platform.system().lower()
    
    # Try Linux ports first, then Windows ports
    patterns = linux_patterns + windows_patterns
    
    # Look for Arduino ports
    for pattern in patterns:
        for port in ports:
            if pattern in str(port.device):
                return port.device
    
    # If no Arduino port found, return default based on OS
    if system == 'linux':
        return '/dev/ttyACM0'
    else:
        return 'COM10'

def connect(port: str = None, baud: int = 115200, timeout: int = 2):
    """
    Try to open the Arduino serial port.
    Returns {"status": "connected", "port": "..."} on success,
    otherwise {"status": "error", "error": "...", "port": "..."}.
    """
    if port is None:
        port = find_arduino_port()
    
    try:
        ser = serial.Serial(port, baudrate=baud, timeout=timeout)
        time.sleep(2)  # small delay so Arduino can reset
        if ser.is_open:
            ser.close()  # we only check connectivity here, close directly after checking
            return {"status": "connected", "port": port}
        return {"status": "error", "error": "Port did not open", "port": port}
    except Exception as e:
        error_msg = str(e)
        if "No such file or directory" in error_msg:
            error_msg = f"Could not find Arduino on port {port}. Please check the connection and try again."
        return {"status": "error", "error": error_msg, "port": port}
