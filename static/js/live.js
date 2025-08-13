88 8888////////////////////////////////////////////////8
////////////////////////////////////////////////
//START OF THE BLOCK 1 FOR LANGUAGE TRANSLATIONS AND SENSOR COLORS
////////////////////////////////////////////////
////////////////////////////////////////////////

// set the color for each sensor
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

////////////////////////////////////////////////
////////////////////////////////////////////////
//END OF THE BLOCK 1 FOR LANGUAGE TRANSLATIONS
////////////////////////////////////////////////
////////////////////////////////////////////////

// ###################################################
// make a list of all buttons with the class "sensor-button"
const buttons = document.querySelectorAll(".sensor-button");
// save the life simulation intervals in a Map for easy access
const liveSimulations = new Map();



//1. Funktion to update the language of the Tooltips of sensorbuttons(when hovering over the sensor buttons)
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

// 2. Function to set the language
function setLanguage(lang) {
  // Change the language to the selected language
  localStorage.setItem("lang", lang);
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    //look up the translation key in the translations object
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  }); // language buttons content updated 

  //change the language buttons inside html
  const btnDe = document.getElementById("btn-de");
  const btnEn = document.getElementById("btn-en");
  //make the look active button 
  if (lang === "de") {
    btnDe.classList.add("active-language");
    btnEn.classList.remove("active-language");
  } else {
    btnEn.classList.add("active-language");
    btnDe.classList.remove("active-language");
  }
  // Update tooltips language for sensors
  updateSensorTooltips(lang);

}

// 3. Function to make the button blincking and set lang and update plot
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



//// // 4. Function to start the live simulation
function startSensorLive(sensorId) {
  if (liveSimulations.has(sensorId)) return; // already active -> quit
  fetch('/api/sensor_data', { // POST request to fetch sensor data
    method: 'POST',
    headers: { // sending the content type as JSON
      'Content-Type': 'application/json' // Set the content type to JSON
    },
    body: JSON.stringify({ // send the request body with sensorId and selectedFile
      sensorId: sensorId, // wich sensor to get data for
      selectedFile: selectedFile //from which file to get the data
    })
  })
    // then parse the response
    .then(res => res.json())
    .then(data => { // now there is a data to upload the plot})
      if (data.error) {
        alert("Fehler: " + data.error);
        return;
      }

      // Call the function to simulate the live plot with the fetched data
      simulateLivePlot(sensorId, data.time, data.values); // changes the plot
      updateSensorTitle();
    }); // close then block
} // close function


// 5. Function to simulate the live plot and update the plot points before the timestemps are gone
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
// 5.1 Function to get the index of a trace in the plot, checks if the plot has data pltted
function getTraceIndex(sensorId) {
  const plotDiv = document.getElementById("plot");
  if (!plotDiv.data) return -1;
  return plotDiv.data.findIndex(trace => trace.name === sensorId);
}
//5.2function to update the sensor title above the plot to show wich are active 
function updateSensorTitle() {
  const title = document.getElementById("visualization-title");
  const active = Array.from(activeSensors).join(", ");
  if (title) title.textContent = `Aktive Sensoren: ${active || "-"}`;
}


 
//6. Function to reset the graph and clean all the fields and boxes! 
// stop timers , clear data , empty UI, mae empty frsh plot
function resetGraph() {
  // 1) Stop any legacy per-sensor timers
  if (liveSimulations && liveSimulations.forEach) {
    liveSimulations.forEach(id => clearInterval(id));
    liveSimulations.clear();
  }
  // 2) Clear session state so the next stream starts at 00 again
  activeSensors.clear();
  lastSeenTime.clear();
  sensors.forEach(s => { dataStore[s] = { x: [], y: [] }; });
  // 3) Reset UI bits
  const valueBox = document.getElementById("sensor-value-output");
  if (valueBox) valueBox.innerHTML = "";
  document.querySelectorAll(".sensor-button").forEach(btn => {
    btn.classList.remove("btn-active");
    btn.style.backgroundColor = "";
    btn.style.color = "";
  });
  // Title/badge
  const badge = document.getElementById("active-sensor-badge");
  if (badge) badge.textContent = "";
  updateSensorTitle(); // will show "Aktive Sensoren: -"
  // 4) Recreate an empty plot
  try { Plotly.purge('plot'); } catch (_) {}
  Plotly.newPlot('plot', [], {
    title: 'Sensorverlauf (Live)',
    xaxis: { title: 'Zeit' },
    yaxis: { title: 'Sensorwert (Ohm)' },
    margin: { t: 40 },
    showlegend: true,
    legend: { x: 1.05, y: 1, orientation: 'v' }
  });
  // (optional) clear live-history mini plot/output if you use them
  const hist = document.getElementById('live-history-plot');
  if (hist) Plotly.newPlot('live-history-plot', [], { title: 'Simulationverlauf' });
  const out = document.getElementById('live-output');
  if (out) out.textContent = '';
}



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

    // --- Deactivate if already active ---
    // --- Deactivate if already active ---
    if (activeSensors.has(sensorId)) {
      // Stop any legacy interval if you still use simulateLivePlot
      if (liveSimulations.has(sensorId)) {
        clearInterval(liveSimulations.get(sensorId));
        liveSimulations.delete(sensorId);
      }

      // delete trace from plot
      const traceIndex = getTraceIndex(sensorId);
      if (traceIndex !== -1) {
        Plotly.deleteTraces('plot', traceIndex);
      }

      // delete sensor value box  
      const box = document.querySelector(`[data-sensor-box='${sensorId}']`);
      if (box) box.remove();

      // ✅ remove from activeSensors here
      activeSensors.delete(sensorId);

      // reset button styles
      button.classList.remove("btn-active");
      button.style.backgroundColor = '';
      button.style.color = '';

      updateSensorTitle();
      return;
    }


    // --- Activate ---
    if (!activeSensors.has(sensorId)) {
      activeSensors.add(sensorId);

      const trace = {
        x: dataStore[sensorId].x.slice(),
        y: dataStore[sensorId].y.slice(),
        type: 'scatter',
        mode: 'lines',
        name: sensorId,
        line: { color: sensorColors[sensorId] || 'black' }
      };
      Plotly.addTraces('plot', trace);

      // make sure a box exists right away
      updateSensorValues(sensorId,
        dataStore[sensorId].y.length ? dataStore[sensorId].y.at(-1) : 0
      );

      // style button
      button.classList.add("btn-active");
      button.style.backgroundColor = sensorColors[sensorId] || 'gray';
      button.style.color = 'white';

      updateSensorTitle();
      return;
    }

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






// ##############EVERYTHING BELOW IS FOR THE LIFE SIMULATION############################
// FUNCTION THAT ARE SUPPORTING THE LIFE SIMULATION
//
//
// List your sensors (same order as Python)
const sensors = [
  "MQ2", "MQ3_1", "MQ3_10", "MQ4", "MQ5", "MQ6",
  "MQ8", "MQ9", "MQ135", "MQ136", "MQ137", "MQ138"
];

// ✅ Persistent store of all points since measurement start
const dataStore = {};   // { MQ2: { x:[], y:[] }, ... }
const activeSensors = new Set(); // sensors currently plotted
const lastSeenTime = new Set();  // optional: to skip duplicate ticks

// init store for all sensors
sensors.forEach(s => { dataStore[s] = { x: [], y: [] }; });

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






//###################################################
//###################################################
// START OF THE BLOCK FOR MANAGING THE 7 DIFFERENT INPUTS TO SEND DATA TO THE BACKEND
//###################################################
//###################################################
//###################################################

function startMessung() {

  // Get the 7 values from the input fields 
  const data = {
    produktname: document.getElementById('name').value,
    produktnummer: document.getElementById('nummer').value,
    datum: document.getElementById('datum').value,
    clean: document.getElementById('clean').value,
    enrich: document.getElementById('enrich').value,
    measure: document.getElementById('measure').value,
    starten: document.getElementById('starten').value

  };

  //validate the input fields before sending the data
  if (!data.produktname || !data.produktnummer || !data.datum || !data.clean || !data.enrich || !data.measure || !data.starten) {
    alert("Please fill in all fields");
    return;
  }

  // POST the data to the backend
  fetch('/api/start_measurement', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(response => {
      if (response.status === "started") {
        // reset the local session so new stream begins at 00:00:01
        resetGraph();
        document.getElementById('live-output').textContent = "Measurement started...";
      } else {
        document.getElementById('live-output').textContent =
          "Error:" + (response.error || "Unknown error");
      }
    });

}

// fuc
function fetchAndDisplayLiveSimulation() {
  fetch('/api/live-stream-data')
    .then(response => response.json())
    .then(data => {
      // Show raw JSON (your existing UI)
      const out = document.getElementById('live-output');
      if (out) out.textContent = JSON.stringify(data.slice(0, 5), null, 2); // preview top rows

      if (!Array.isArray(data) || data.length === 0) return;

      // We assume newest is FIRST (your insert at index 0). Reverse to oldest -> newest.
      const rows = data.slice().reverse();

      for (const row of rows) {
        const t = row.time || row.received_at;
        if (!t) continue;
        // prevent double-adding if this tick was already processed
        if (lastSeenTime.has(t)) continue;
        lastSeenTime.add(t);

        // push one point per sensor into the store
        sensors.forEach(s => {
          if (row[s] !== undefined && row[s] !== null) {
            dataStore[s].x.push(t);
            dataStore[s].y.push(row[s]);

            // If this sensor is currently active, extend its trace
            const idx = getTraceIndex(s);
            if (idx !== -1) {
              Plotly.extendTraces('plot', {
                x: [[t]],
                y: [[row[s]]]
              }, [idx]);
            }

            // Update the sensor value box if it exists
            if (activeSensors.has(s)) {
              updateSensorValues(s, row[s]);
            }
          }
        });
      }
    })
    .catch(() => {
      const el = document.getElementById('live-output');
      if (el) el.textContent = "Error fetching data.";
    });
}

// Start polling every second
setInterval(fetchAndDisplayLiveSimulation, 1000);
fetchAndDisplayLiveSimulation();






//###################################################
//###################################################
//###################################################
//END OF THE BLOCK FOR MANAGING THE 7 DIFFERENT INPUTS TO SEND DATA TO THE BACKEND
//###################################################
//###################################################
//###################################################






//###################################################
//###################################################
// START OF THE BLOCK FOR CONNECTING TO ARDUINO TERMINAL
//###################################################
//###################################################


// --- helpers (you already have this) ---
function setConnectBtnState(connected, portText) {
  const btn = document.getElementById('btn-connect-arduino');
  if (!btn) return;
  btn.classList.remove('btn-success', 'btn-danger', 'btn-secondary');
  btn.classList.add(connected ? 'btn-success' : 'btn-danger');
  btn.textContent = connected ? `Connected ${portText ? `(${portText})` : ''}` : 'Connect to Arduino Terminal';
}

// --- connect button + optional status polling ---
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-connect-arduino');
  if (!btn) return;

  const defaultLabel = btn.textContent;

  // Click handler to connect on demand
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Connecting...';

    try {
      const res = await fetch('/api/connect_arduino_terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // if you want to force a COM port: body: JSON.stringify({ port: "COM10" })
        body: JSON.stringify({})
      });
      const data = await res.json();

      if (res.ok && data.status === 'connected') {
        document.getElementById('live-output').textContent =
          `✅ Connected to Arduino${data.port ? ' on ' + data.port : ''}.`;
        setConnectBtnState(true, data.port);
        // if you want to start live polling once connected:
        // startLivePolling?.();
      } else {
        document.getElementById('live-output').textContent =
          `❌ Error: ${data.error || data.status || 'Unknown error'}`;
        setConnectBtnState(false);
      }
    } catch (e) {
      console.error(e);
      document.getElementById('live-output').textContent = '❌ Connection failed.';
      setConnectBtnState(false);
    } finally {
      btn.disabled = false;
      if (!btn.classList.contains('btn-success') && !btn.classList.contains('btn-danger')) {
        btn.textContent = defaultLabel;
      }
    }
  });

  // OPTIONAL: poll /api/arduino_status only if the route exists
  // (prevents console spam if you haven't implemented the backend route)
  let statusTimer = null;

  async function pollArduinoStatus() {
    try {
      const res = await fetch('/api/arduino_status', { cache: 'no-store' });
      if (!res.ok) return;                 // quietly skip 404/500
      const data = await res.json();
      setConnectBtnState(Boolean(data.connected), data.port || '');
    } catch {
      // network error -> just show as disconnected
      setConnectBtnState(false);
    }
  }

  // enable this block only if you implemented the Flask route /api/arduino_status
  // statusTimer = setInterval(pollArduinoStatus, 5000);
  // pollArduinoStatus();

  // tidy up on page unload
  window.addEventListener('beforeunload', () => {
    if (statusTimer) clearInterval(statusTimer);
  });
});

//###################################################
//###################################################
// END OF THE BLOCK FOR CONNECTING TO ARDUINO TERMINAL
//###################################################
//###################################################




///// START BUTTON STOP ARDUINO ////////////
document.getElementById("btn-stop-arduino").addEventListener("click", () => {
  fetch('/api/stop_arduino', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(response => {
      if (response.status === "stopped") {
        document.getElementById('live-output').textContent = "Arduino stopped.";
      } else {
        document.getElementById('live-output').textContent = "Error: " + (response.error || response.status);
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById('live-output').textContent = "Stop request failed.";
    });
});
//////////////// END BUTTON STOP ARDUINO ////////////