import serial
import time



ser = serial.Serial('/dev/ttyACM0', 115200, timeout=2)
time.sleep(2)  # kurz warten, bis Arduino bereit


def prompt_and_send(prompt_text):
    value = input(prompt_text)
    ser.write((value + '\n').encode())
    time.sleep(0.2)  # kleine Pause nach Senden
    # Lies alle Antworten, bis wieder eine Eingabe verlangt wird:
    while ser.in_waiting:
        print(ser.readline().decode('utf-8', errors='replace').strip())
    return value

# Schritt für Schritt die 7 Eingaben:
prompt_and_send("1. Buchstabe Produktname (z.B. T): ")
prompt_and_send("2. Produktnummer (z.B. 01): ")
prompt_and_send("3. Datum (mmdd, z.B. 0804): ")
prompt_and_send("4. CLEAN Dauer (Minuten, z.B. 0): ")
prompt_and_send("5. ENRICH Dauer (Minuten, z.B. 0): ")
prompt_and_send("6. MEASURE Dauer (Minuten, z.B. 5): ")
prompt_and_send("7. Starten? (yes): ")

print("\nAlle Eingaben gesendet. Die Messung läuft!\n")

# Zeigt fortlaufend die Arduino-Ausgaben (Messwerte etc.)
try:
    while True:
        if ser.in_waiting:
            print(ser.readline().decode('utf-8', errors='replace').strip())
        time.sleep(0.1)
except KeyboardInterrupt:
    print("\nMessung beendet (KeyboardInterrupt).")
    ser.close()



