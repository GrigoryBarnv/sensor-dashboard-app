import serial

# Passe den COM-Port und Baudrate an!
ser = serial.Serial('COM10', 115200, timeout=2)

print("Live-Empfang von Arduino:")
while True:
    line = ser.readline().decode('utf-8', errors='replace').strip()
    if not line or line.startswith("Logdauer") or line.startswith("Measurement") or line.startswith("Cleaning") or line.startswith("Enrichment"):
        continue
    print("Empfangen:", line)
    # Du kannst hier die Werte weiterverarbeiten:
    werte = line.split(",")
    print("Zeit:", werte[0], "Sensorwerte:", werte[1:])


# nothing to commit 