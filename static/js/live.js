
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




// Language translations
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
    // Sensor Gases
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




// Function to aktualize the sensor tooltips with the selected language
function updateSensorTooltips(lang) {
  const gases = translations[lang].sensorGases;

  document.querySelectorAll(".sensor-button").forEach(button => {
    const sensorId = button.getAttribute("data-sensor-id");
    const newTitle = gases[sensorId] || "-";

    //  clear all existing tooltips
    const oldTooltip = bootstrap.Tooltip.getInstance(button);
    if (oldTooltip) oldTooltip.dispose();

    //  clear all existing attributes of the button
    button.removeAttribute("data-bs-original-title");
    button.removeAttribute("aria-describedby");
    button.setAttribute("title", newTitle);

    //  create a new tooltip
    new bootstrap.Tooltip(button, {
      placement: 'top',
      trigger: 'hover',
      delay: { show: 100, hide: 100 },
      customClass: 'custom-tooltip'
    });
  });
}



// Funktion to set the language
function setLanguage(lang) {
  // change the language to the selected language
  localStorage.setItem("lang", lang);

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  // change the language buttons inside html 
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




// Event listener for the DOMContentLoaded event
document.addEventListener("DOMContentLoaded", () => {
  const liveBtn = document.getElementById("btn-live");


  // Add the live-active class to the live button
  liveBtn.classList.add("blinking", "live-active");
  liveBtn.innerHTML = '<span class="dot"></span> Live';

  // Event listener for the live button
  liveBtn.addEventListener("click", () => {
    window.location.href = "/";
  });

  // Set the language
  const savedLang = localStorage.getItem("lang") || "de";
  setLanguage(savedLang);
  updateSensorTooltips(savedLang);

  // Event listener for the refresh button
  const refreshBtn = document.getElementById("refresh-button");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", resetGraph);
  }

  // Optionally render an empty placeholder chart
  Plotly.newPlot("plot", [], {
  title: "Sensorverlauf (Live)",
  xaxis: { title: "Zeit" },
  yaxis: { title: "Sensorwert (Ohm)" },
  margin: { t: 40 },
  showlegend: true, //  always show legend
  legend: {
    x: 1.05,          // move to right side
    y: 1,
    orientation: 'v'
  }
});

});



// Function to start the live simulation
function startSensorLive(sensorId) {
  if (liveSimulations.has(sensorId)) return; // already active -> quit


//
fetch('/api/sensor_data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json' // Set the content type to JSON
  },
  body: JSON.stringify({
    sensorId: sensorId,
    selectedFile: selectedFile
  })
})
  // then parse the response
  .then(res => res.json())
  // then update the plot
  .then(data => {
    if (data.error) {
      alert("Fehler: " + data.error);
      return;
    }
    simulateLivePlot(sensorId, data.time, data.values); // changes the plot
    updateSensorTitle();
  });

}

// Function to simulate the live plot
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
  }, 1000); // 1000ms = 1 data point per second 

  liveSimulations.set(sensorId, intervalId);
}


// Function to get the index of a trace in the plot 
function getTraceIndex(sensorId) {
  const plotDiv = document.getElementById("plot");
  if (!plotDiv.data) return -1;
  return plotDiv.data.findIndex(trace => trace.name === sensorId);
}


// function to update the sensor title
function updateSensorTitle() {
  const title = document.getElementById("visualization-title");
  const active = Array.from(liveSimulations.keys()).join(", ");

  if (title) {
    title.textContent = `Aktive Sensoren: ${active || "-"}`;
  }
}


// Function to reset the graph 
function resetGraph() {
  liveSimulations.forEach(intervalId => clearInterval(intervalId));
  liveSimulations.clear();

  Plotly.newPlot('plot', [], {
    title: 'Sensorverlauf (Live)',
    xaxis: { title: 'Zeit' },
    yaxis: { title: 'Sensorwert (Ohm)' },
    margin: { t: 40 }
  });

  // Clear title and sensor badge
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

// show the actual messured sensor value under the plot 
// TODO add into simulateLivePlot()
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



// Function to update the sensor value boxes
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

// Function to handle button clicks
buttons.forEach(button => {
  button.addEventListener("click", () => {
    const sensorId = button.getAttribute("data-sensor-id");

    // sensor deactivate if active
    if (liveSimulations.has(sensorId)) {
      // Stop Interval
      clearInterval(liveSimulations.get(sensorId));
      liveSimulations.delete(sensorId);

      // delete trace from plot
      const traceIndex = getTraceIndex(sensorId);
      if (traceIndex !== -1) {
        Plotly.deleteTraces('plot', traceIndex);
      }

      // delete sensor value box  
      const box = document.querySelector(`[data-sensor-box='${sensorId}']`);
      if (box) box.remove();

      // set buttons to initial state
      button.classList.remove("btn-active");
      button.style.backgroundColor = '';
      button.style.color = '';

      // update new sensors 
      updateSensorTitle();

      return; // exit the function
    }

    // activate the sensors
    startSensorLive(sensorId);

    // color the button
    button.classList.add("btn-active");
    button.style.backgroundColor = sensorColors[sensorId] || 'gray';
    button.style.color = 'white';
  });
});

// // TODO FOR THE LIFE SIMULATION 
// // Fetch and display log data in life box for future live data  Simulation plot
// function fetchLogData() {
//   fetch("/api/data")
//     .then(res => res.json())
//     .then(logs => {
//       const box = document.getElementById("json-log-box");
//       box.innerHTML = logs.map(entry => {
//         return `<div>${entry.received_at || "??"} → ${JSON.stringify(entry)}</div>`;
//       }).join("");
//     });
// }

// // repeat every 2 seconds
// setInterval(fetchLogData, 2000);




// function that adds an event listener to the dropdown menu to send later to visualization.py
let selectedFile = "Avocado_Enrich2_Measure.CSV"; // default

document.getElementById("csv-selector").addEventListener("change", function () {
  selectedFile = this.value;
  console.log("Selected file:", selectedFile); //for text purposes
  resetGraph(); 
});



//FUNCTION THAT ARE SUPPORTING THE LIFE SIMULATION
//
//
// List your sensors (same order as Python)
const sensors = [
    "MQ2", "MQ3_1", "MQ3_10", "MQ4", "MQ5", "MQ6",
    "MQ8", "MQ9", "MQ135", "MQ136", "MQ137", "MQ138"
];

// Function to update the output window with latest sensor data
function updateOutputWindow(data) {
    const el = document.getElementById('live-output');
    if (!el) return;

    if (!data || data.length === 0) {
        el.textContent = "No data received yet.";
        return;
    }

    // Get the newest entry (you might want data[0] or data[data.length-1] depending on your backend)
    const latest = data[0];

    // Build a pretty output string (show only time and sensor values, not as raw JSON if preferred)
    let out = `Time: ${latest.time || latest.received_at || "-"}\n`;
    sensors.forEach(sensor => {
        if (latest[sensor] !== undefined) {
            out += `${sensor}: ${latest[sensor]}\n`;
        }
    });

    el.textContent = out;
}

// Fetch data from the backend and update output window
function fetchAndDisplay() {
    fetch('/api/live-stream-data')
        .then(response => response.json())
        .then(data => updateOutputWindow(data))
        .catch(() => {
            const el = document.getElementById('live-output');
            if (el) el.textContent = "Error fetching data.";
        });
}

// Update every second (1000 ms)
setInterval(fetchAndDisplay, 1000);
//
// Optional: fetch immediately on page load too
fetchAndDisplay();
