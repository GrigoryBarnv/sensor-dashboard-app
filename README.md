# Sensor Dashboard WebApp (Flask + Plotly)

Ein interaktives Dashboard zur Visualisierung von Sensordaten mit **Flask**, **Plotly** und **modernem UI-Styling**.  
Sie können verschiedene Sensoren auswählen, deren Werte als Live-Plots anzeigt werden.

---

## Schnellstart (unter Linux)

### 1. Python und pip installieren

```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

### 2. MongoDB installieren und starten

```bash
# MongoDB installieren
sudo apt install mongodb

# MongoDB Service starten
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 3. Ins Projektverzeichnis wechseln

```bash
cd /pfad/zu/sensor-dashboard-app
```

### 4. Virtuelles Environment erstellen und aktivieren

```bash
python3 -m venv venv
source venv/bin/activate
```

### 5. Abhängigkeiten installieren

```bash
pip install -r requirements.txt
```

### 6. Arduino-Berechtigungen einrichten

```bash
# Benutzer zur dialout-Gruppe hinzufügen (für Arduino-Zugriff)
sudo usermod -a -G dialout $USER

# Neue Gruppe aktivieren (Neuanmeldung erforderlich)
newgrp dialout
```

### 7. .env Datei erstellen

```bash
echo "MONGODB_URI=mongodb://localhost:27017/
SECRET_KEY=your-secret-key-here" > .env
```

### 8. Flask-Webserver starten

```bash
python app.py
```

Öffne im Browser:
```
http://127.0.0.1:5000
```

---

## Voraussetzungen

- Linux (Ubuntu/Debian empfohlen)
- Python 3.8+
- MongoDB
- Arduino mit Sensoren
- USB-Port für Arduino (/dev/ttyACM0)
- Internetzugang (für Paketinstallationen)

## Fehlerbehebung

### Arduino-Port nicht verfügbar
1. Überprüfen Sie die Arduino-Verbindung
2. Prüfen Sie den Port-Namen:
```bash
ls /dev/ttyACM*
```
3. Berechtigungen prüfen:
```bash
sudo chmod 666 /dev/ttyACM0
```

### MongoDB-Verbindungsprobleme
1. Status prüfen:
```bash
sudo systemctl status mongodb
```
2. Logs anzeigen:
```bash
sudo journalctl -u mongodb
```

![image](https://github.com/user-attachments/assets/7242700e-8f03-41a6-bade-ebde9f125cb9).