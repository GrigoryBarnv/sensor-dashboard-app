# GitHub Pages Version (ohne Flask/Python)

Diese App kann als reine statische Version auf GitHub Pages laufen.

## Was funktioniert

- Offline Dashboard
- CSV-Datei Auswahl
- Sensor anklicken und Plot anzeigen
- Sprache DE/EN umschalten

## Was nicht funktioniert (ohne Backend)

- Login / Register
- Live-Arduino Funktionen
- SQL-Quelle uber Backend
- Gespeicherte Messungen aus der DB

## Deployment

1. Anderungen nach `main` pushen.
2. GitHub Workflow `.github/workflows/pages.yml` baut automatisch `frontend/dist`.
3. In GitHub unter `Settings -> Pages` als Quelle `GitHub Actions` wahlen.

## Lokal testen

```powershell
cd frontend
npm.cmd install
npm.cmd run build
npm.cmd run preview
```

Dann im Browser offnen, was `vite preview` ausgibt.
