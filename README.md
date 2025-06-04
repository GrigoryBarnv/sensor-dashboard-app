
#  Sensor Dashboard WebApp (Flask + Plotly)

Ein interaktives Dashboard zur Visualisierung von Sensordaten mit **Flask**, **Plotly** und **modernem UI-Styling**.  
Sie können verschiedene Sensoren auswählen, deren Werte als Live-Plots anzeigt werden.

---

##  Schnellstart (unter Windows mit PowerShell)

### 1.  Winget-Quellen aktualisieren

```powershell
winget source update
```

---

### 2.  Python 3.13 installieren

```powershell
winget install --id Python.Python.3.13
```

>  Alternativ: einfach `python` in PowerShell eingeben →  dem Link zum **Microsoft Store** folgen, um Python zu installieren.  


---

### 3.  Ins Projektverzeichnis wechslen

> zum Beispiel

```powershell
cd C:\Users\<dein-benutzername>\projekt_ordner\sensor-dashboard-app
```

---

### 4.  Abhängigkeiten installieren

####  Standard (wenn alles klappt):

```powershell
pip install -r requirements.txt
```

####  Empfohlen (bei Kompilierungsproblemen):

```powershell
pip install --only-binary :all: -r requirements.txt
```

---

### 5.  (Optioal) Einzelne Bibliotheken installieren ( falls Fehler auftreten)

Falls `pandas`, `matplotlib` oder `flask` nicht korrekt installiert werden:

```powershell
pip install --only-binary :all: pandas
pip install --only-binary :all: matplotlib
pip install flask==2.3.3 --only-binary :all:
```

---

### 6.  lokalen Flask-Webserver starten

```powershell
python app.py
```

 Öffne im Browser:
```
http://127.0.0.1:5000
```

---

##  Voraussetzungen

- Windows 10 oder 11
- Python 3.12 oder 3.13
- PowerShell oder Windows Terminal
- Internetzugang (für Paketinstallationen)

