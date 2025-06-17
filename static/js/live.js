
const sensorColors = {
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
  MQ138: "magenta"
};




// Sprachdaten in einem Objekt speichern
const translations = {
  de: {
    refreshInfo: "Klicken Sie auf den Button, um den Graphen zurückzusetzen und alle Sensoren zu entfernen.",

    pageTitle: "Sensor-Daten-Dashboard",
    mainTitle: "Sensor Daten Dashboard",
    subtitle: "Interaktive Visualisierung von CSV-Sensordaten",
    selectSensor: "Sensor auswählen",
    selectedSensor: "Ausgewählter Sensor",
    sensor: "Sensor",
    loading: "Lade...",
    selectSensorHint: "Bitte wählen Sie einen Sensor aus der linken Liste",
    aboutSensors: "Über die MQ-Gassensoren",
    clickSensor: "Klicken Sie auf einen Sensor, um dessen Datenvisualisierung anzuzeigen.",
    supportedTypes: "Unterstützte Sensor-Typen:",
    sensorHint: "Die Sensorwerte repräsentieren Daten. Niedrigere Werte deuten auf eine höhere Gaskonzentration hin.",
    footer: "&copy; 2025 Sensor-Daten-Dashboard",
    // Sensor Gase
    MQ2: "Methan, Butan, LPG",
    MQ3_1: "Ethanol",
    MQ3_10: "Ethanol",
    MQ4: "Methan, CNG",
    MQ5: "Natürliche Gase, LPG",
    MQ6: "LPG, Butan",
    MQ8: "Wasserstoff",
    MQ9: "Kohlenstoffmonoxid",
    MQ135: "Ammoniak, Stickoxide, Benzol, CO2",
    MQ136: "Schwefelwasserstoff",
    MQ137: "Ammoniak",
    MQ138: "Toluol, Alkohol, Aceton, Wasserstoff",
    sensorGases: {
      MQ2: "Methan, Butan, LPG",
      MQ3_1: "Ethanol",
      MQ3_10: "Ethanol",
      MQ4: "Methan, CNG",
      MQ5: "Natürliche Gase, LPG",
      MQ6: "LPG, Butan",
      MQ8: "Wasserstoff",
      MQ9: "Kohlenstoffmonoxid",
      MQ135: "Ammoniak, Stickoxide, Benzol, CO2",
      MQ136: "Schwefelwasserstoff",
      MQ137: "Ammoniak",
      MQ138: "Toluol, Alkohol, Aceton, Wasserstoff"
    }

  },

  en: {
    refreshInfo: "Push the button to refresh the plot and remove all active sensors.",

    pageTitle: "Sensor Data Dashboard",
    mainTitle: "Sensor Data Dashboard",
    subtitle: "Interactive visualization of CSV sensor data",
    selectSensor: "Select sensor",
    selectedSensor: "Selected Sensor",
    sensor: "Sensor",
    loading: "Loading...",
    selectSensorHint: "Please select a sensor from the list on the left",
    aboutSensors: "About MQ Gas Sensors",
    clickSensor: "Click on a sensor to display its data visualization.",
    supportedTypes: "Supported sensor types:",
    sensorHint: "The sensor values represent data. Lower values indicate a higher gas concentration.",
    footer: "&copy; 2025 Sensor Data Dashboard",
    // Sensor gases
    MQ2: "Methane, Butane, LPG",
    MQ3_1: "Ethanol",
    MQ3_10: "Ethanol",
    MQ4: "Methane, CNG",
    MQ5: "Natural gases, LPG",
    MQ6: "LPG, Butane",
    MQ8: "Hydrogen",
    MQ9: "Carbon monoxide",
    MQ135: "Ammonia, Nitrogen oxides, Benzene, CO2",
    MQ136: "Hydrogen sulfide",
    MQ137: "Ammonia",
    MQ138: "Toluene, Alcohol, Acetone, Hydrogen",
    sensorGases: {
      MQ2: "Methane, Butane, LPG",
      MQ3_1: "Ethanol",
      MQ3_10: "Ethanol",
      MQ4: "Methane, CNG",
      MQ5: "Natural gases, LPG",
      MQ6: "LPG, Butane",
      MQ8: "Hydrogen",
      MQ9: "Carbon monoxide",
      MQ135: "Ammonia, Nitrogen oxides, Benzene, CO2",
      MQ136: "Hydrogen sulfide",
      MQ137: "Ammonia",
      MQ138: "Toluene, Alcohol, Acetone, Hydrogen"
    }
  }
};


const buttons = document.querySelectorAll(".sensor-button");

const liveSimulations = new Map();



//die Funktion zum aktualisieren der Tooltips, damit die Sprache passend ist ohne neu laden
function updateSensorTooltips(lang) {
  const gases = translations[lang].sensorGases;

  document.querySelectorAll(".sensor-button").forEach(button => {
    const sensorId = button.getAttribute("data-sensor-id");
    const newTitle = gases[sensorId] || "-";

    //  Zuerst alten Tooltip zerstören
    const oldTooltip = bootstrap.Tooltip.getInstance(button);
    if (oldTooltip) oldTooltip.dispose();

    //  Alles Bereinigen, inkl. Bootstrap-internem Cache
    button.removeAttribute("data-bs-original-title");
    button.removeAttribute("aria-describedby");
    button.setAttribute("title", newTitle);

    //  Tooltip neu erzeugen
    new bootstrap.Tooltip(button, {
      placement: 'top',
      trigger: 'hover',
      delay: { show: 100, hide: 100 },
      customClass: 'custom-tooltip'
    });
  });
}





// Funktion zum setzen der Sprache
function setLanguage(lang) {
  // Spracheinstellungen aktualisieren
  localStorage.setItem("lang", lang);

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  // Sprachbutton-Styling aktualisieren
  const btnDe = document.getElementById("btn-de");
  const btnEn = document.getElementById("btn-en");

  if (lang === "de") {
    btnDe.classList.add("active-language");
    btnEn.classList.remove("active-language");
  } else {
    btnEn.classList.add("active-language");
    btnDe.classList.remove("active-language");
  }
  updateSensorTooltips(lang);
}

document.addEventListener("DOMContentLoaded", () => {
  const liveBtn = document.getElementById("btn-live");

  liveBtn.classList.add("blinking", "live-active");
  liveBtn.innerHTML = '<span class="dot"></span> Live';

  liveBtn.addEventListener("click", () => {
    window.location.href = "/";
  });

  const savedLang = localStorage.getItem("lang") || "de";
  setLanguage(savedLang);
  updateSensorTooltips(savedLang);

  const refreshBtn = document.getElementById("refresh-button");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", resetGraph);
  }

  Plotly.newPlot("plot", [], {
  title: "Sensorverlauf (Live)",
  xaxis: { title: "Zeit" },
  yaxis: { title: "Sensorwert (Ohm)" },
  margin: { t: 40 },
  showlegend: true, // 👈 always show legend
  legend: {
    x: 1.05,          // move to right side
    y: 1,
    orientation: 'v'
  }
});

});




function startSensorLive(sensorId) {
  if (liveSimulations.has(sensorId)) return; // already active

  fetch(`/api/sensor/${sensorId}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("Fehler: " + data.error);
        return;
      }
      simulateLivePlot(sensorId, data.time, data.values);
      updateSensorTitle();
    });
}

function simulateLivePlot(sensorId, timeArray, valueArray) {
  const existingTraceIndex = getTraceIndex(sensorId);
  let i = 0;

  if (existingTraceIndex === -1) {
    const newTrace = {
      x: [],
      y: [],
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: sensorColors[sensorId] || 'black' },
      name: sensorId
    };
    Plotly.addTraces('plot', newTrace);
  }

  const intervalId = setInterval(() => {
    if (i >= timeArray.length) {
      clearInterval(intervalId);
      liveSimulations.delete(sensorId);
      updateSensorTitle();
      return;
    }

    const traceIndex = getTraceIndex(sensorId);
    if (traceIndex !== -1) {
      Plotly.extendTraces('plot', {
        x: [[timeArray[i]]],
        y: [[valueArray[i]]]
      }, [traceIndex]);
    }

    i++;
  }, 1000);

  liveSimulations.set(sensorId, intervalId);
}



function getTraceIndex(sensorId) {
  const plotDiv = document.getElementById("plot");
  if (!plotDiv.data) return -1;
  return plotDiv.data.findIndex(trace => trace.name === sensorId);
}


// funktion  zum aktualisieren des Sensor-Titels
function updateSensorTitle() {
  const title = document.getElementById("visualization-title");
  const active = Array.from(liveSimulations.keys()).join(", ");

  if (title) {
    title.textContent = `Aktive Sensoren: ${active || "-"}`;
  }
}



function resetGraph() {
  liveSimulations.forEach(intervalId => clearInterval(intervalId));
  liveSimulations.clear();

  Plotly.newPlot('plot', [], {
    title: 'Sensorverlauf (Live)',
    xaxis: { title: 'Zeit' },
    yaxis: { title: 'Sensorwert (Ohm)' },
    margin: { t: 40 }
  });

  document.getElementById("visualization-title").textContent = "Ausgewählter Sensor: -";
  document.getElementById("active-sensor-badge").textContent = "";

    // Remove sensor value boxes
  const sensorValueContainer = document.getElementById("sensor-value-output");
  if (sensorValueContainer) {
    sensorValueContainer.innerHTML = "";
  }

  // Reset button styles
  const buttons = document.querySelectorAll(".sensor-button");
  buttons.forEach(button => {
    button.classList.remove("btn-active");
    button.style.backgroundColor = '';
    button.style.color = '';
  });



};

// 1. Aktuelle Sensorwerte UNTER dem Plot anzeigen (mit Farbe, max. 4)
// Ergänze in simulateLivePlot()
function simulateLivePlot(sensorId, timeArray, valueArray) {
  const existingTraceIndex = getTraceIndex(sensorId);
  let i = 0;

  if (existingTraceIndex === -1) {
    const newTrace = {
      x: [],
      y: [],
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: sensorColors[sensorId] || 'black' },
      name: sensorId
    };
    Plotly.addTraces('plot', newTrace);
  }

  const intervalId = setInterval(() => {
    if (i >= timeArray.length) {
      clearInterval(intervalId);
      liveSimulations.delete(sensorId);
      updateSensorTitle();
      return;
    }

    const traceIndex = getTraceIndex(sensorId);
    if (traceIndex !== -1) {
      Plotly.extendTraces('plot', {
        x: [[timeArray[i]]],
        y: [[valueArray[i]]]
      }, [traceIndex]);

      // ➕ UPDATE DOM-Bereich "sensor-values"
      updateSensorValues(sensorId, valueArray[i]);
    }

    i++;
  }, 1000);

  liveSimulations.set(sensorId, intervalId);
}
function updateSensorValues(sensorId, latestValue) {
  const container = document.getElementById("sensor-value-output");
  let sensorBox = document.querySelector(`[data-sensor-box='${sensorId}']`);

  if (!sensorBox) {
    sensorBox = document.createElement("div");
    sensorBox.className = "sensor-box-modern";
    sensorBox.dataset.sensorBox = sensorId;
    container.appendChild(sensorBox);
  }

  // Format the box content
  sensorBox.innerHTML = `
    <div class="sensor-label">Sensor ${sensorId.replace("MQ", "")}</div>
    <div class="sensor-value" style="color: ${sensorColors[sensorId] || 'black'};">
      ${latestValue.toFixed(2)}
    </div>
  `;
}


buttons.forEach(button => {
  button.addEventListener("click", () => {
    const sensorId = button.getAttribute("data-sensor-id");

    // SENSOR DEAKTIVIEREN, falls bereits aktiv
    if (liveSimulations.has(sensorId)) {
      // Stoppe Intervall
      clearInterval(liveSimulations.get(sensorId));
      liveSimulations.delete(sensorId);

      // Entferne Plot-Linie
      const traceIndex = getTraceIndex(sensorId);
      if (traceIndex !== -1) {
        Plotly.deleteTraces('plot', traceIndex);
      }

      // Entferne Sensorwert-Box
      const box = document.querySelector(`[data-sensor-box='${sensorId}']`);
      if (box) box.remove();

      // Button zurücksetzen
      button.classList.remove("btn-active");
      button.style.backgroundColor = '';
      button.style.color = '';

      // Aktive Sensoren aktualisieren
      updateSensorTitle();

      return; // Fertig!
    }

    // SENSOR AKTIVIEREN
    startSensorLive(sensorId);

    // Button einfärben
    button.classList.add("btn-active");
    button.style.backgroundColor = sensorColors[sensorId] || 'gray';
    button.style.color = 'white';
  });
});


// Fetch and display log data in life box for future live data 
function fetchLogData() {
  fetch("/api/data")
    .then(res => res.json())
    .then(logs => {
      const box = document.getElementById("json-log-box");
      box.innerHTML = logs.map(entry => {
        return `<div>${entry.received_at || "??"} → ${JSON.stringify(entry)}</div>`;
      }).join("");
    });
}

// repeat every 2 seconds
setInterval(fetchLogData, 2000);
