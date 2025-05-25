
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

  // Immer LIVE anzeigen
  liveBtn.classList.add("blinking", "live-active");
  liveBtn.innerHTML = '<span class="dot"></span> Live';

  // Klick auf Button → zurück zur normalen Seite
  liveBtn.addEventListener("click", () => {
    window.location.href = "/";
  });

  const buttons = document.querySelectorAll(".sensor-button");
  const activeSensors = new Map();
  const savedLang = localStorage.getItem("lang") || "de";
  setLanguage(savedLang);
  updateSensorTooltips(savedLang);


  // 2. Tooltips aktivieren
  const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(el => {
    new bootstrap.Tooltip(el, {
      placement: 'top',
      trigger: 'hover',
      delay: { show: 100, hide: 100 },
      customClass: 'custom-tooltip'
    });
  });

  // 3. Klickverhalten
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      
      const sensorId = button.getAttribute("data-sensor-id");




      // 4. Klickverhalten verarbeiten und Plot aktualisieren 
      if (activeSensors.has(sensorId)) {
        // Sensor ist schon aktiv → entferne ihn
        activeSensors.delete(sensorId);
        button.classList.remove("active");
        button.classList.remove("active");
        button.style.backgroundColor = '';
        button.style.color = '';
        button.dataset.active = "false";


        redrawPlot(activeSensors);
    

      } else {
        // Sensor neu hinzufügen
        fetch(`/api/sensor/${sensorId}`)
          .then(res => res.json())
          .then(data => {
            if (data.error) {
              alert("Fehler: " + data.error);
              return;
            }

            activeSensors.set(sensorId, data);
            const color = sensorColors[sensorId] || 'black';
            button.style.backgroundColor = color;
            button.style.color = 'white';  // Textfarbe auf Weiß setzen
            button.dataset.active = "true";  // zum Zureucksetzen spaeter

            redrawPlot(activeSensors);
          });
      }
    });
    setLanguage(savedLang);
    updateSensorTooltips(savedLang);
   

  });
});




 // Plot aktualisieren wenn neue Sensordaten geladen wurden
function redrawPlot(sensorMap) {
  const traces = [];

  for (const [sensorId, data] of sensorMap.entries()) {
    const trace = {
      x: data.time,
      y: data.values,
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: sensorColors[sensorId] || 'black' },
      name: sensorId
    };
    traces.push(trace);
  }

  const layout = {
    title: "Sensorverlauf",
    xaxis: { title: 'Zeit' },
    yaxis: { title: 'Sensorwert (Ohm)' },
    margin: { t: 40 }
  };

  Plotly.newPlot('plot', traces, layout);
}


//  Funktion zum Laden der Sensordaten aus der API mittels fetch
function fetchSensorData(sensorId) {
  const url = `/api/sensor/${sensorId}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("Fehler: " + data.error);
        return;
      }

      renderPlot(data.time, data.values, data.sensor_id);
      updateSensorTitle(data.sensor_id);
    });
}


 // Funktion zum Zeichnen des Plots mit Plotly
function renderPlot(timeArray, valueArray, sensorId) {
  const trace = {
    x: timeArray,
    y: valueArray,
    type: 'scatter',
    mode: 'lines+markers',
    marker: { color: sensorColors[sensorId] || 'black' },
    name: sensorId
  };

  // Initialisiere Plot, wenn leer
  const plotDiv = document.getElementById('plot');
  if (plotDiv.data === undefined || plotDiv.data.length === 0) {
    const layout = {
      title: 'Sensorverlauf',
      xaxis: { title: 'Zeit' },
      yaxis: { title: 'Sensorwert (Ohm)' },
      margin: { t: 40 }
    };

    Plotly.newPlot('plot', [trace], layout);
  } else {
    // Prüfen ob Sensor schon geplottet ist
    const exists = plotDiv.data.some(d => d.name === sensorId);
    if (!exists) {
      Plotly.addTraces('plot', trace);
    }
  }

}


 // Funktion zum Aktualisieren des Sensor-Titels im HTML
function updateSensorTitle(sensorId) {
  const badge = document.getElementById("active-sensor-badge");
  const title = document.getElementById("visualization-title");

  if (badge && title) {
    badge.classList.remove("d-none");
    badge.textContent = sensorId;
    title.textContent = `Ausgewählter Sensor: ${sensorId}`;
  }
}


