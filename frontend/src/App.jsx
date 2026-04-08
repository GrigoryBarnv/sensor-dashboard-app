import { useEffect, useRef, useState } from "react";

const SENSOR_IDS = [
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
];

const SENSOR_COLORS = {
  MQ2: "red",
  MQ3_1: "orange",
  MQ3_10: "gold",
  MQ4: "green",
  MQ5: "blue",
  MQ6: "purple",
  MQ8: "teal",
  MQ9: "pink",
  MQ135: "brown",
  MQ136: "cyan",
  MQ137: "gray",
  MQ138: "magenta",
};

const TRANSLATIONS = {
  de: {
    mainTitle: "Sensor Daten Dashboard",
    subtitle: "Interaktive Visualisierung von CSV-Sensordaten",
    offline: "Offline",
    live: "Live",
    login: "Login",
    register: "Register",
    logout: "Logout",
    myMeasurements: "My Measurements",
    selectSensor: "Sensor auswählen",
    selectedSensor: "Ausgewählte Sensoren",
    selectDataset: "Datensatz auswählen",
    dataSource: "Datenquelle",
    sourceCsv: "Aus CSV",
    sourceSql: "Aus SQL",
    liveSensorValues: "Live-Sensorwerte",
    resetInfo: "Setzt den Plot zurück und entfernt alle aktiven Sensoren.",
    reset: "Reset",
    loading: "Lade...",
    noMeasurement: "Noch keine Messung ausgewählt.",
    measurementPlot: "Measurement Plot",
    selectMeasurementSensors: "Sensoren für Messung",
    connectArduino: "Mit Arduino verbinden",
    stopArduino: "Arduino stoppen",
    terminal: "Arduino-Ausgabe",
    parameters: "Eingabeparameter",
    startMeasurement: "Messung starten",
    aboutSensors: "Über die MQ-Gassensoren",
    clickSensor: "Klicken Sie auf einen Sensor, um dessen Daten anzuzeigen.",
    sensorHint:
      "Niedrigere Werte deuten in dieser Darstellung auf eine höhere Gaskonzentration hin.",
    loginTitle: "Login",
    registerTitle: "Register",
    matrikelnummer: "Matrikelnummer",
    password: "Passwort",
    close: "Schließen",
    productName: "Produktname",
    productNumber: "Produktnummer",
    day: "Tag",
    month: "Monat",
    cleanDuration: "CLEAN Dauer (Min)",
    enrichDuration: "ENRICH Dauer (Min)",
    measureDuration: "MEASURE Dauer (Min)",
    startPrompt: "Starten?",
    yes: "Ja",
    no: "Nein",
    productNameHelp: "Ein Buchstabe",
    activeSensorsLabel: "Aktive Sensoren",
    measurementData: "Gespeicherte Messungen",
    downloadCsv: "Download CSV",
    show: "Show",
    delete: "Delete",
    file: "Datei",
    date: "Datum",
    product: "Produkt",
    number: "Nummer",
    actions: "Aktionen",
    connected: "Verbunden",
    disconnected: "Nicht verbunden",
    measurementDeleted: "Messung gelöscht",
    registrationSuccess: "Registrierung erfolgreich",
    measurementStarted: "Messung gestartet",
  },
  en: {
    mainTitle: "Sensor Data Dashboard",
    subtitle: "Interactive visualization of CSV sensor data",
    offline: "Offline",
    live: "Live",
    login: "Login",
    register: "Register",
    logout: "Logout",
    myMeasurements: "My Measurements",
    selectSensor: "Select sensor",
    selectedSensor: "Selected sensors",
    selectDataset: "Select dataset",
    dataSource: "Data source",
    sourceCsv: "From CSV",
    sourceSql: "From SQL",
    liveSensorValues: "Live sensor values",
    resetInfo: "Reset the plot and remove all active sensors.",
    reset: "Reset",
    loading: "Loading...",
    noMeasurement: "No measurement selected yet.",
    measurementPlot: "Measurement Plot",
    selectMeasurementSensors: "Measurement sensors",
    connectArduino: "Connect to Arduino",
    stopArduino: "Stop Arduino",
    terminal: "Arduino output",
    parameters: "Input parameters",
    startMeasurement: "Start measurement",
    aboutSensors: "About MQ gas sensors",
    clickSensor: "Click a sensor to display its data.",
    sensorHint:
      "Lower values indicate a higher gas concentration in this dashboard.",
    loginTitle: "Login",
    registerTitle: "Register",
    matrikelnummer: "Matrikelnummer",
    password: "Password",
    close: "Close",
    productName: "Product name",
    productNumber: "Product number",
    day: "Day",
    month: "Month",
    cleanDuration: "CLEAN duration (min)",
    enrichDuration: "ENRICH duration (min)",
    measureDuration: "MEASURE duration (min)",
    startPrompt: "Start?",
    yes: "Yes",
    no: "No",
    productNameHelp: "One letter",
    activeSensorsLabel: "Active sensors",
    measurementData: "Saved measurements",
    downloadCsv: "Download CSV",
    show: "Show",
    delete: "Delete",
    file: "File",
    date: "Date",
    product: "Product",
    number: "Number",
    actions: "Actions",
    connected: "Connected",
    disconnected: "Disconnected",
    measurementDeleted: "Measurement deleted",
    registrationSuccess: "Registration successful",
    measurementStarted: "Measurement started",
  },
};

const SENSOR_GASES = {
  MQ2: { de: "Methan, Butan, LPG", en: "Methane, Butane, LPG" },
  MQ3_1: { de: "Ethanol", en: "Ethanol" },
  MQ3_10: { de: "Ethanol", en: "Ethanol" },
  MQ4: { de: "Methan, CNG", en: "Methane, CNG" },
  MQ5: { de: "Natürliche Gase, LPG", en: "Natural gases, LPG" },
  MQ6: { de: "LPG, Butan", en: "LPG, Butane" },
  MQ8: { de: "Wasserstoff", en: "Hydrogen" },
  MQ9: { de: "Kohlenstoffmonoxid", en: "Carbon monoxide" },
  MQ135: { de: "Ammoniak, Stickoxide, Benzol, CO2", en: "Ammonia, nitrogen oxides, benzene, CO2" },
  MQ136: { de: "Schwefelwasserstoff", en: "Hydrogen sulfide" },
  MQ137: { de: "Ammoniak", en: "Ammonia" },
  MQ138: { de: "Toluol, Alkohol, Aceton, Wasserstoff", en: "Toluene, alcohol, acetone, hydrogen" },
};

const MONTHS = {
  de: [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? data.message
        : typeof data === "object" && data && "error" in data
          ? data.error
          : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

function usePlotlyChart(containerRef, traces, layout) {
  useEffect(() => {
    if (!containerRef.current || !window.Plotly) {
      return;
    }

    window.Plotly.react(containerRef.current, traces, layout, {
      responsive: true,
      displaylogo: false,
    });
  }, [containerRef, traces, layout]);
}

function Modal({ open, title, onClose, children, footer }) {
  if (!open) {
    return null;
  }

  return (
    <>
      <div className="modal fade show d-block app-modal" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
            {footer ? <div className="modal-footer">{footer}</div> : null}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  );
}

function SensorGrid({ activeSensors, onToggle, language }) {
  return (
    <div className="sensor-panel">
      <h4 className="mb-3">{TRANSLATIONS[language].selectSensor}</h4>
      <div className="sensor-buttons">
        {SENSOR_IDS.map((sensorId) => {
          const active = activeSensors.includes(sensorId);
          return (
            <button
              key={sensorId}
              type="button"
              className={classNames("btn btn-outline-primary sensor-button", active && "active")}
              style={active ? { backgroundColor: SENSOR_COLORS[sensorId], color: "white" } : undefined}
              title={SENSOR_GASES[sensorId][language]}
              onClick={() => onToggle(sensorId)}
            >
              <span className="sensor-name">{sensorId}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlotCard({ title, badgeText, traces, layout }) {
  const plotRef = useRef(null);
  usePlotlyChart(plotRef, traces, layout);

  return (
    <div className="card section-card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0">{title}</h4>
        {badgeText ? <span className="badge bg-primary">{badgeText}</span> : null}
      </div>
      <div className="card-body">
        <div ref={plotRef} className="plot-frame" />
      </div>
    </div>
  );
}

function SensorInfo({ language }) {
  const t = TRANSLATIONS[language];
  return (
    <div className="card section-card">
      <div className="card-body">
        <h5>{t.aboutSensors}</h5>
        <p>{t.clickSensor}</p>
        <div className="row">
          <div className="col-md-6">
            <ul className="sensor-info-list">
              {SENSOR_IDS.slice(0, 6).map((sensorId) => (
                <li key={sensorId}>
                  <strong>{sensorId}:</strong> {SENSOR_GASES[sensorId][language]}
                </li>
              ))}
            </ul>
          </div>
          <div className="col-md-6">
            <ul className="sensor-info-list">
              {SENSOR_IDS.slice(6).map((sensorId) => (
                <li key={sensorId}>
                  <strong>{sensorId}:</strong> {SENSOR_GASES[sensorId][language]}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-3 mb-0">
          <small>{t.sensorHint}</small>
        </p>
      </div>
    </div>
  );
}

function OfflineDashboard({ language, selectedMeasurementId, onClearSelectedMeasurement }) {
  const t = TRANSLATIONS[language];
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("Avocado_Enrich2_Measure.CSV");
  const [dataSource, setDataSource] = useState("csv");
  const [activeSensors, setActiveSensors] = useState({});
  const [measurementData, setMeasurementData] = useState(null);
  const [activeMeasurementSensors, setActiveMeasurementSensors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJson(`/api/available-files?source=${encodeURIComponent(dataSource)}`)
      .then((files) => {
        setAvailableFiles(files);
        setSelectedFile((current) => (files.includes(current) ? current : files[0] || ""));
        setActiveSensors({});
      })
      .catch((error) => setErrorMessage(error.message));
  }, [dataSource]);

  useEffect(() => {
    if (!selectedMeasurementId) {
      setMeasurementData(null);
      setActiveMeasurementSensors({});
      return;
    }

    fetchJson(`/api/measurements/${selectedMeasurementId}/data`)
      .then((data) => {
        setMeasurementData(data);
        setActiveMeasurementSensors({});
      })
      .catch((error) => setErrorMessage(error.message));
  }, [selectedMeasurementId]);

  async function toggleSensor(sensorId) {
    if (activeSensors[sensorId]) {
      const next = { ...activeSensors };
      delete next[sensorId];
      setActiveSensors(next);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      const data = await fetchJson(
        `/api/sensor/${sensorId}?file=${encodeURIComponent(selectedFile)}&source=${encodeURIComponent(dataSource)}`,
      );
      setActiveSensors((current) => ({
        ...current,
        [sensorId]: data,
      }));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleMeasurementSensor(sensorId) {
    if (!measurementData || !measurementData[sensorId]) {
      return;
    }

    setActiveMeasurementSensors((current) => {
      if (current[sensorId]) {
        const next = { ...current };
        delete next[sensorId];
        return next;
      }

      return {
        ...current,
        [sensorId]: measurementData[sensorId],
      };
    });
  }

  const offlineTraces = Object.entries(activeSensors).map(([sensorId, data]) => ({
    x: data.time,
    y: data.values,
    type: "scatter",
    mode: "lines+markers",
    name: sensorId,
    marker: { color: SENSOR_COLORS[sensorId] || "black" },
    line: { color: SENSOR_COLORS[sensorId] || "black" },
  }));

  const measurementTraces = Object.entries(activeMeasurementSensors).map(([sensorId, data]) => ({
    x: data.time,
    y: data.values,
    type: "scatter",
    mode: "lines+markers",
    name: sensorId,
    marker: { color: SENSOR_COLORS[sensorId] || "black" },
    line: { color: SENSOR_COLORS[sensorId] || "black" },
  }));

  const latestValues = Object.entries(activeSensors).map(([sensorId, data]) => ({
    sensorId,
    value: Array.isArray(data.values) && data.values.length > 0 ? data.values[data.values.length - 1] : null,
  }));

  const activeSensorIds = Object.keys(activeSensors);
  const activeMeasurementSensorIds = Object.keys(activeMeasurementSensors);

  return (
    <div className="dashboard-main dashboard-main-centered">
      <div className="card section-card selector-card">
        <div className="card-body">
          <SensorGrid activeSensors={activeSensorIds} onToggle={toggleSensor} language={language} />
        </div>
      </div>
      <div className="dashboard-main">
        <div className="card section-card control-card">
          <div className="card-body">
            <div className="dataset-controls">
              <div className="source-switcher">
                <label className="form-label d-block">{t.dataSource}</label>
                <div className="btn-group" role="group" aria-label={t.dataSource}>
                  <button
                    type="button"
                    className={classNames("btn", dataSource === "csv" ? "btn-primary" : "btn-outline-primary")}
                    onClick={() => setDataSource("csv")}
                  >
                    {t.sourceCsv}
                  </button>
                  <button
                    type="button"
                    className={classNames("btn", dataSource === "sql" ? "btn-primary" : "btn-outline-primary")}
                    onClick={() => setDataSource("sql")}
                  >
                    {t.sourceSql}
                  </button>
                </div>
              </div>
              <div className="dataset-picker">
                <label htmlFor="csv-selector" className="form-label d-block">
                  {t.selectDataset}
                </label>
                <select
                  id="csv-selector"
                  className="form-select"
                  value={selectedFile}
                  onChange={(event) => {
                    setSelectedFile(event.target.value);
                    setActiveSensors({});
                  }}
                >
                  {availableFiles.map((file) => (
                    <option key={file} value={file}>
                      {file.replace("_Measure.CSV", "").replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <PlotCard
          title={t.selectedSensor}
          badgeText={activeSensorIds.length > 0 ? activeSensorIds.join(", ") : ""}
          traces={offlineTraces}
          layout={{
            title: t.selectedSensor,
            xaxis: { title: "Zeit" },
            yaxis: { title: "Sensorwert (Ohm)" },
            margin: { t: 48 },
          }}
        />

        {loading ? <div className="alert alert-info mb-0">{t.loading}</div> : null}
        {errorMessage ? <div className="alert alert-danger mb-0">{errorMessage}</div> : null}

        <div className="card section-card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
              <p className="mb-0">{t.resetInfo}</p>
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => {
                  setActiveSensors({});
                  setErrorMessage("");
                }}
              >
                {t.reset}
              </button>
            </div>
          </div>
        </div>

        <div className="card section-card">
          <div className="card-body">
            <h5 className="mb-3">{t.liveSensorValues}</h5>
            <div className="d-flex flex-wrap gap-3">
              {latestValues.length === 0 ? (
                <div className="text-secondary">{t.noMeasurement}</div>
              ) : (
                latestValues.map(({ sensorId, value }) => (
                  <div key={sensorId} className="sensor-box-modern">
                    <div className="sensor-label">{sensorId}</div>
                    <div className="sensor-value" style={{ color: SENSOR_COLORS[sensorId] || "black" }}>
                      {typeof value === "number" ? value.toFixed(2) : "-"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {measurementData ? (
          <>
            <PlotCard
              title={t.measurementPlot}
              badgeText={activeMeasurementSensorIds.length > 0 ? activeMeasurementSensorIds.join(", ") : ""}
              traces={measurementTraces}
              layout={{
                title: t.measurementPlot,
                xaxis: { title: "Time" },
                yaxis: { title: "Sensorwert (Ohm)" },
                margin: { t: 48 },
              }}
            />

            <div className="card section-card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t.selectMeasurementSensors}</h5>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClearSelectedMeasurement}>
                  {t.close}
                </button>
              </div>
              <div className="card-body">
                <div className="sensor-buttons">
                  {SENSOR_IDS.map((sensorId) => {
                    const active = Boolean(activeMeasurementSensors[sensorId]);
                    return (
                      <button
                        key={sensorId}
                        type="button"
                        className={classNames("btn btn-outline-primary sensor-button", active && "active")}
                        style={active ? { backgroundColor: SENSOR_COLORS[sensorId], color: "white" } : undefined}
                        onClick={() => toggleMeasurementSensor(sensorId)}
                      >
                        {sensorId}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : null}

        <SensorInfo language={language} />
      </div>
    </div>
  );
}

function LiveDashboard({ language, onToast }) {
  const t = TRANSLATIONS[language];
  const [activeSensors, setActiveSensors] = useState([]);
  const [dataStore, setDataStore] = useState(() =>
    Object.fromEntries(SENSOR_IDS.map((sensorId) => [sensorId, { x: [], y: [] }])),
  );
  const [terminalOutput, setTerminalOutput] = useState("");
  const [connectStatus, setConnectStatus] = useState({ connected: false, port: "" });
  const [formState, setFormState] = useState({
    produktname: "A",
    produktnummer: "01",
    tag: "01",
    monat: "01",
    clean: "0",
    enrich: "0",
    measure: "0",
    starten: "yes",
  });
  const seenTimesRef = useRef(new Set());

  useEffect(() => {
    const timer = window.setInterval(async () => {
      try {
        const data = await fetchJson("/api/live-stream-data");
        if (!Array.isArray(data)) {
          return;
        }

        setTerminalOutput(JSON.stringify(data.slice(0, 5), null, 2));
        const rows = data.slice().reverse();
        setDataStore((current) => {
          const next = Object.fromEntries(
            Object.entries(current).map(([sensorId, values]) => [
              sensorId,
              { x: values.x.slice(), y: values.y.slice() },
            ]),
          );

          let changed = false;
          for (const row of rows) {
            const timestamp = row.time || row.received_at;
            if (!timestamp || seenTimesRef.current.has(timestamp)) {
              continue;
            }

            seenTimesRef.current.add(timestamp);
            changed = true;
            for (const sensorId of SENSOR_IDS) {
              if (row[sensorId] !== undefined && row[sensorId] !== null) {
                next[sensorId].x.push(timestamp);
                next[sensorId].y.push(row[sensorId]);
              }
            }
          }

          return changed ? next : current;
        });
      } catch {
        setTerminalOutput("Error fetching data.");
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const liveTraces = activeSensors.map((sensorId) => ({
    x: dataStore[sensorId].x,
    y: dataStore[sensorId].y,
    type: "scatter",
    mode: "lines",
    name: sensorId,
    line: { color: SENSOR_COLORS[sensorId] || "black" },
  }));

  const latestValues = activeSensors.map((sensorId) => {
    const values = dataStore[sensorId].y;
    return {
      sensorId,
      value: values.length > 0 ? values[values.length - 1] : null,
    };
  });

  async function connectArduino() {
    try {
      const result = await fetchJson("/api/connect_arduino_terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setConnectStatus({ connected: true, port: result.port || "" });
      onToast(
        `${t.connected}${result.port ? ` ${result.port}` : ""}`,
      );
    } catch (error) {
      setConnectStatus({ connected: false, port: "" });
      onToast(error.message, "danger");
    }
  }

  async function stopArduino() {
    try {
      const result = await fetchJson("/api/stop_arduino", { method: "POST" });
      onToast(result.status || "Arduino stopped");
    } catch (error) {
      onToast(error.message, "danger");
    }
  }

  async function startMeasurement() {
    try {
      await fetchJson("/api/start_measurement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      seenTimesRef.current = new Set();
      setDataStore(Object.fromEntries(SENSOR_IDS.map((sensorId) => [sensorId, { x: [], y: [] }])));
      setActiveSensors([]);
      setTerminalOutput("Measurement started...");
      onToast(t.measurementStarted);
    } catch (error) {
      onToast(error.message, "danger");
    }
  }

  return (
    <div className="dashboard-grid">
      <div>
        <SensorGrid
          activeSensors={activeSensors}
          onToggle={(sensorId) =>
            setActiveSensors((current) =>
              current.includes(sensorId)
                ? current.filter((item) => item !== sensorId)
                : [...current, sensorId],
            )
          }
          language={language}
        />
      </div>
      <div className="dashboard-main">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span className="status-chip">
            <span className={classNames("status-chip-dot", connectStatus.connected && "online")} />
            {connectStatus.connected
              ? `${t.connected}${connectStatus.port ? ` (${connectStatus.port})` : ""}`
              : t.disconnected}
          </span>
          <button type="button" className="btn btn-outline-success" onClick={connectArduino}>
            {t.connectArduino}
          </button>
          <button type="button" className="btn btn-outline-danger" onClick={stopArduino}>
            {t.stopArduino}
          </button>
        </div>

        <PlotCard
          title={`${t.live} ${t.activeSensorsLabel}`}
          badgeText={activeSensors.length > 0 ? activeSensors.join(", ") : ""}
          traces={liveTraces}
          layout={{
            title: `${t.live} ${t.activeSensorsLabel}`,
            xaxis: { title: "Zeit" },
            yaxis: { title: "Sensorwert (Ohm)" },
            margin: { t: 48 },
            legend: { x: 1.02, y: 1 },
          }}
        />

        <div className="card section-card">
          <div className="card-body">
            <h5 className="mb-3">{t.liveSensorValues}</h5>
            <div className="d-flex flex-wrap gap-3">
              {latestValues.length === 0 ? (
                <div className="text-secondary">{t.noMeasurement}</div>
              ) : (
                latestValues.map(({ sensorId, value }) => (
                  <div key={sensorId} className="sensor-box-modern">
                    <div className="sensor-label">{sensorId}</div>
                    <div className="sensor-value" style={{ color: SENSOR_COLORS[sensorId] || "black" }}>
                      {typeof value === "number" ? value.toFixed(2) : "-"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="card section-card">
          <div className="card-body">
            <h5 className="mb-3">{t.parameters}</h5>
            <div className="live-form-grid">
              <label className="form-label">
                {t.productName} ({t.productNameHelp})
                <select
                  className="form-select mt-1"
                  value={formState.produktname}
                  onChange={(event) => setFormState((current) => ({ ...current, produktname: event.target.value }))}
                >
                  {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                    <option key={letter} value={letter}>
                      {letter}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-label">
                {t.productNumber}
                <select
                  className="form-select mt-1"
                  value={formState.produktnummer}
                  onChange={(event) => setFormState((current) => ({ ...current, produktnummer: event.target.value }))}
                >
                  {Array.from({ length: 99 }, (_, index) => String(index + 1).padStart(2, "0")).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-label">
                {t.day}
                <select
                  className="form-select mt-1"
                  value={formState.tag}
                  onChange={(event) => setFormState((current) => ({ ...current, tag: event.target.value }))}
                >
                  {Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0")).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-label">
                {t.month}
                <select
                  className="form-select mt-1"
                  value={formState.monat}
                  onChange={(event) => setFormState((current) => ({ ...current, monat: event.target.value }))}
                >
                  {MONTHS[language].map((monthName, index) => {
                    const value = String(index + 1).padStart(2, "0");
                    return (
                      <option key={value} value={value}>
                        {monthName}
                      </option>
                    );
                  })}
                </select>
              </label>
              {[
                ["clean", t.cleanDuration],
                ["enrich", t.enrichDuration],
                ["measure", t.measureDuration],
              ].map(([field, label]) => (
                <label key={field} className="form-label">
                  {label}
                  <select
                    className="form-select mt-1"
                    value={formState[field]}
                    onChange={(event) => setFormState((current) => ({ ...current, [field]: event.target.value }))}
                  >
                    {Array.from({ length: 61 }, (_, index) => String(index)).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <label className="form-label">
                {t.startPrompt}
                <select
                  className="form-select mt-1"
                  value={formState.starten}
                  onChange={(event) => setFormState((current) => ({ ...current, starten: event.target.value }))}
                >
                  <option value="yes">{t.yes}</option>
                  <option value="no">{t.no}</option>
                </select>
              </label>
            </div>
            <button type="button" className="btn btn-primary mt-3" onClick={startMeasurement}>
              {t.startMeasurement}
            </button>
          </div>
        </div>

        <div className="card section-card">
          <div className="card-body">
            <h5 className="mb-3">{t.terminal}</h5>
            <div className="terminal-box">{terminalOutput || "[]"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MeasurementsModal({ open, onClose, onSelectMeasurement, onRefreshMeasurements, measurements, onDelete, language }) {
  const t = TRANSLATIONS[language];

  return (
    <Modal open={open} title={t.measurementData} onClose={onClose}>
      <div className="table-responsive">
        <table className="table measurement-table">
          <thead>
            <tr>
              <th>{t.date}</th>
              <th>{t.product}</th>
              <th>{t.number}</th>
              <th>{t.file}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {measurements.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-secondary">
                  {t.loading}
                </td>
              </tr>
            ) : (
              measurements.map((measurement) => (
                <tr key={measurement.id}>
                  <td>{measurement.created_at}</td>
                  <td>{measurement.product_name}</td>
                  <td>{measurement.product_number}</td>
                  <td>{measurement.filename}</td>
                  <td>
                    <div className="d-flex gap-2 flex-wrap">
                      <a
                        href={`/api/measurements/${measurement.id}/download`}
                        className="btn btn-sm btn-primary"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t.downloadCsv}
                      </a>
                      <button
                        type="button"
                        className="btn btn-sm btn-success"
                        onClick={() => onSelectMeasurement(measurement.id)}
                      >
                        {t.show}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={async () => {
                          await onDelete(measurement.id);
                          await onRefreshMeasurements();
                        }}
                      >
                        {t.delete}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

export default function App() {
  const initialPath = window.location.pathname === "/live" ? "live" : "offline";
  const [view, setView] = useState(initialPath);
  const [language, setLanguage] = useState(localStorage.getItem("lang") || "de");
  const [session, setSession] = useState({ authenticated: false, user: null });
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [measurementsOpen, setMeasurementsOpen] = useState(false);
  const [selectedMeasurementId, setSelectedMeasurementId] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [loginForm, setLoginForm] = useState({ matrikelnummer: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ matrikelnummer: "", password: "" });
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState(null);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  useEffect(() => {
    fetchJson("/api/session")
      .then((data) => setSession(data))
      .catch(() => setSession({ authenticated: false, user: null }));
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function navigate(nextView) {
    const nextPath = nextView === "live" ? "/live" : "/";
    window.history.pushState({}, "", nextPath);
    setView(nextView);
  }

  async function refreshMeasurements() {
    try {
      const data = await fetchJson("/api/measurements");
      setMeasurements(data);
    } catch (error) {
      setToast({ message: error.message, type: "danger" });
    }
  }

  async function submitLogin() {
    try {
      const formData = new FormData();
      formData.append("matrikelnummer", loginForm.matrikelnummer);
      formData.append("password", loginForm.password);
      await fetchJson("/login", { method: "POST", body: formData });
      const sessionData = await fetchJson("/api/session");
      setSession(sessionData);
      setLoginOpen(false);
      setLoginForm({ matrikelnummer: "", password: "" });
      setFormError("");
    } catch (error) {
      setFormError(error.message);
    }
  }

  async function submitRegister() {
    try {
      await fetchJson("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      setRegisterOpen(false);
      setRegisterForm({ matrikelnummer: "", password: "" });
      setFormError("");
      setToast({ message: t.registrationSuccess, type: "success" });
    } catch (error) {
      setFormError(error.message);
    }
  }

  async function logout() {
    try {
      await fetchJson("/api/logout", { method: "POST" });
      setSession({ authenticated: false, user: null });
      setMeasurementsOpen(false);
      setSelectedMeasurementId(null);
    } catch (error) {
      setToast({ message: error.message, type: "danger" });
    }
  }

  return (
    <div className="app-shell container py-4">
      <header className="app-header">
        <div className="app-header-bar">
          <div>
            <h1 className="display-5 fw-bold mb-1">{t.mainTitle}</h1>
            <p className="lead mb-0">{t.subtitle}</p>
          </div>
          <div className="app-actions">
            <button
              type="button"
              className={classNames("btn btn-sm", view === "offline" ? "btn-light" : "btn-outline-light")}
              onClick={() => navigate("offline")}
            >
              {t.offline}
            </button>
            <button
              type="button"
              className={classNames("btn btn-sm", view === "live" ? "btn-danger" : "btn-outline-danger")}
              onClick={() => navigate("live")}
            >
              <span className="dot" /> {t.live}
            </button>
            <button
              type="button"
              className={classNames("btn btn-sm", language === "de" ? "btn-light" : "btn-outline-light")}
              onClick={() => setLanguage("de")}
            >
              DE
            </button>
            <button
              type="button"
              className={classNames("btn btn-sm", language === "en" ? "btn-light" : "btn-outline-light")}
              onClick={() => setLanguage("en")}
            >
              EN
            </button>
            {session.authenticated ? (
              <>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light"
                  onClick={async () => {
                    await refreshMeasurements();
                    setMeasurementsOpen(true);
                  }}
                >
                  {t.myMeasurements}
                </button>
                <button type="button" className="btn btn-sm btn-outline-light" onClick={logout}>
                  {t.logout}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light"
                  onClick={() => {
                    setFormError("");
                    setLoginOpen(true);
                  }}
                >
                  {t.login}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light"
                  onClick={() => {
                    setFormError("");
                    setRegisterOpen(true);
                  }}
                >
                  {t.register}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {view === "live" ? (
          <LiveDashboard
            language={language}
            onToast={(message, type = "success") => setToast({ message, type })}
          />
        ) : (
          <OfflineDashboard
            language={language}
            selectedMeasurementId={selectedMeasurementId}
            onClearSelectedMeasurement={() => setSelectedMeasurementId(null)}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <img
            src="/static/images/RZ_UniHohenheim_Logo_1C_Weiss_EN.png"
            alt="Universität Hohenheim"
            className="footer-logo"
          />
          <div className="footer-text">
            <p className="mb-0">&copy; {new Date().getFullYear()} Sensor Dashboard</p>
            <p className="mb-0">Universität Hohenheim</p>
          </div>
        </div>
      </footer>

      <Modal
        open={loginOpen}
        title={t.loginTitle}
        onClose={() => setLoginOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setLoginOpen(false)}>
              {t.close}
            </button>
            <button type="button" className="btn btn-primary" onClick={submitLogin}>
              {t.login}
            </button>
          </>
        }
      >
        <div className="mb-3">
          <label className="form-label">{t.matrikelnummer}</label>
          <input
            className="form-control"
            value={loginForm.matrikelnummer}
            onChange={(event) => setLoginForm((current) => ({ ...current, matrikelnummer: event.target.value }))}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">{t.password}</label>
          <input
            type="password"
            className="form-control"
            value={loginForm.password}
            onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
          />
        </div>
        {formError ? <div className="alert alert-danger mb-0">{formError}</div> : null}
      </Modal>

      <Modal
        open={registerOpen}
        title={t.registerTitle}
        onClose={() => setRegisterOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setRegisterOpen(false)}>
              {t.close}
            </button>
            <button type="button" className="btn btn-primary" onClick={submitRegister}>
              {t.register}
            </button>
          </>
        }
      >
        <div className="mb-3">
          <label className="form-label">{t.matrikelnummer}</label>
          <input
            className="form-control"
            value={registerForm.matrikelnummer}
            onChange={(event) => setRegisterForm((current) => ({ ...current, matrikelnummer: event.target.value }))}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">{t.password}</label>
          <input
            type="password"
            className="form-control"
            value={registerForm.password}
            onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
          />
        </div>
        {formError ? <div className="alert alert-danger mb-0">{formError}</div> : null}
      </Modal>

      <MeasurementsModal
        open={measurementsOpen}
        onClose={() => setMeasurementsOpen(false)}
        measurements={measurements}
        onRefreshMeasurements={refreshMeasurements}
        onSelectMeasurement={(measurementId) => {
          setSelectedMeasurementId(measurementId);
          setMeasurementsOpen(false);
          navigate("offline");
        }}
        onDelete={async (measurementId) => {
          try {
            await fetchJson(`/api/measurements/${measurementId}/delete`, { method: "POST" });
            if (selectedMeasurementId === measurementId) {
              setSelectedMeasurementId(null);
            }
            setToast({ message: t.measurementDeleted, type: "success" });
          } catch (error) {
            setToast({ message: error.message, type: "danger" });
          }
        }}
        language={language}
      />

      {toast ? (
        <div className="toast-container position-fixed bottom-0 end-0 p-3">
          <div className={classNames("toast show align-items-center text-white border-0", `bg-${toast.type}`)}>
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast(null)} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
