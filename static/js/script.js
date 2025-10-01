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





const activeSensors = new Map();


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





// function to change the language
function setLanguage(lang) {
  // change the language
  localStorage.setItem("lang", lang);

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  // lang button style change
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









// The content is executed after the Page is fully loaded

//Prepare the buttons and language settings
// Function to update the file list
function updateFileList() {
    fetch('/api/available-files')
        .then(response => response.json())
        .then(files => {
            const selector = document.getElementById("csv-selector");
            const currentValue = selector.value;
            
            // Clear current options
            selector.innerHTML = '';
            
            // Add new options
            files.forEach(file => {
                const option = document.createElement('option');
                option.value = file;
                // Show friendly name without _Measure.CSV
                option.textContent = file.replace('_Measure.CSV', '').replace(/_/g, ' ');
                selector.appendChild(option);
            });
            
            // Try to restore previous selection
            if (files.includes(currentValue)) {
                selector.value = currentValue;
            } else {
                selectedFile = files[0];
                selector.value = files[0];
            }
        });
}

// Function to update my measurements list
function updateMyMeasurementsList() {
    console.log('DEBUG: updateMyMeasurementsList called');
    const loadingDiv = document.getElementById('my-measurements-loading');
    const listDiv = document.getElementById('my-measurements-list');
    const emptyDiv = document.getElementById('my-measurements-empty');
    
    if (!loadingDiv || !listDiv || !emptyDiv) {
        console.log('DEBUG: Required elements not found - not on offline page');
        return; // Not on the offline page
    }

    // Show loading state
    loadingDiv.classList.remove('d-none');
    listDiv.classList.add('d-none');
    emptyDiv.classList.add('d-none');

    console.log('DEBUG: Fetching measurements from /api/temp-measurements');
    
    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    fetch('/api/temp-measurements', { 
        signal: controller.signal 
    })
        .then(response => {
            clearTimeout(timeoutId); // Clear timeout on successful response
            console.log('DEBUG: Response status:', response.status);
            if (!response.ok) {
                console.log('DEBUG: Error response from server');
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(measurements => {
            console.log('DEBUG: Received measurements:', measurements);
            
            // Hide loading
            loadingDiv.classList.add('d-none');
            
            if (!measurements || measurements.length === 0) {
                // Show empty message
                emptyDiv.classList.remove('d-none');
                listDiv.classList.add('d-none');
                return;
            }

            // Clear current list
            const listGroup = listDiv.querySelector('.list-group');
            listGroup.innerHTML = '';

            // Add measurements to list
            console.log('DEBUG: Adding', measurements.length, 'measurements to list');
            measurements.forEach((m, index) => {
                const listItem = document.createElement('div');
                listItem.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
                listItem.style.cursor = 'pointer';
                
                listItem.innerHTML = `
                    <div>
                        <h6 class="mb-1">${m.display_name}</h6>
                        <small class="text-muted">${m.filename}</small>
                    </div>
                    <span class="badge bg-primary rounded-pill">Select</span>
                `;
                
                // Add click handler
                listItem.addEventListener('click', function() {
                    console.log('DEBUG: Selected measurement:', m.filename);
                    window.selectedMyMeasurement = m.filename;
                    
                    // Update visual selection
                    document.querySelectorAll('.list-group-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    this.classList.add('active');
                });
                
                console.log('DEBUG: Adding list item:', m.display_name);
                listGroup.appendChild(listItem);
            });

            // Show the list
            listDiv.classList.remove('d-none');
            emptyDiv.classList.add('d-none');
        })
        .catch(error => {
            clearTimeout(timeoutId); // Clear timeout on error
            console.error('Error fetching measurements:', error);
            console.log('DEBUG: Full error object:', error);
            // Hide loading and show error
            loadingDiv.classList.add('d-none');
            emptyDiv.classList.remove('d-none');
            if (error.name === 'AbortError') {
                emptyDiv.innerHTML = '<p class="text-danger">Request timed out. Please check your connection.</p>';
            } else {
                emptyDiv.innerHTML = `<p class="text-danger">Error loading measurements: ${error.message}</p>`;
            }
        });
}

// Make functions available globally
window.updateFileList = updateFileList;
window.updateMyMeasurementsList = updateMyMeasurementsList;

document.addEventListener("DOMContentLoaded", () => {  // run the code inside when the page is fully loaded 
    console.log('DEBUG: DOMContentLoaded event fired');
    // Update file list on page load
    updateFileList();
    
    // Update my measurements list on page load
    console.log('DEBUG: About to call updateMyMeasurementsList');
    updateMyMeasurementsList();
  const buttons = document.querySelectorAll(".sensor-button"); // assign all html elements with the class "sensor-button" to the variable "buttons"
  const savedLang = localStorage.getItem("lang") || "de"; // get the language setting from local storage or set it to "de" by default
  setLanguage(savedLang);
  updateSensorTooltips(savedLang); // update the tooltips (popup text when hovering over a sensor button)
  const liveBtn = document.getElementById("btn-live"); // get the html el. with the id 

  // Button always offline
  liveBtn.classList.remove("blinking", "live-active");    // remove the blinking and live-active classes from css
  liveBtn.innerHTML = '<span class="dot"></span> Offline'; // set the inner html of the button to "Offline"

  // Klick on live button to go to the live page 
  liveBtn.addEventListener("click", () => {
    window.location.href = "/live";
  });



  // 2. Tooltips activate
  const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(el => {
    new bootstrap.Tooltip(el, {  // initialize the tooltip on the element
      placement: 'top',
      trigger: 'hover',
      delay: { show: 100, hide: 100 },
      customClass: 'custom-tooltip'
    });
  });

  // 3. Klickbehaviour
  buttons.forEach(button => {
    button.addEventListener("click", () => { //go through all buttons 
      
      const sensorId = button.getAttribute("data-sensor-id");




      // 4. change the plot
      if (activeSensors.has(sensorId)) {
        // delete the sensor if already active
        activeSensors.delete(sensorId);
        button.classList.remove("active");
        button.classList.remove("active");
        button.style.backgroundColor = ''; // reset the background color so it looks turned off
        button.style.color = '';
        button.dataset.active = "false";
        redrawPlot(activeSensors);
      

      } else {
        // when sensor is not active take the data from the server
        fetch(`/api/sensor/${sensorId}?file=${encodeURIComponent(selectedFile)}`) // make a request to flask backend
          .then(res => res.json()) //if the server answered make json

          .then(data => {


            if (data.error) { //if data error show the warning and quit
              alert("Fehler: " + data.error);
              return;
            }

            activeSensors.set(sensorId, data); // save the data in the map
            const color = sensorColors[sensorId] || 'black';
            button.style.backgroundColor = color;
            button.style.color = 'white';  // Textcolor
            button.dataset.active = "true";  // to deactivate later = shows that active button is clicked

            redrawPlot(activeSensors);
          });
      }
    });
    setLanguage(savedLang);
    updateSensorTooltips(savedLang);
  });

  // Note: My Measurements list click handlers are added dynamically in updateMyMeasurementsList()
});




// plot new data when the different sensor data is chosen
function redrawPlot(sensorMap) {
  const traces = []; // empty array to store the traces of the plot

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


//  get the data from the server
function fetchSensorData(sensorId) {
  const url = `/api/sensor/${sensorId}?file=${encodeURIComponent(selectedFile)}`;


  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("Fehler: " + data.error);
        return;
      }

      renderPlot(data.time, data.values, data.sensor_id);  // changes the plot
      updateSensorTitle(data.sensor_id);
    });
}


// draw the plot with the data
function renderPlot(timeArray, valueArray, sensorId) {
  const trace = {
    x: timeArray,
    y: valueArray,
    type: 'scatter',
    mode: 'lines+markers', // how to display the points
    marker: { color: sensorColors[sensorId] || 'black' },
    name: sensorId
  };

  // initial plot if empty
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
    // if the senser is already active exit
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




// function that adds an event listener to the dropdown menu to send later to visualization.py
let selectedFile = "Avocado_Enrich2_Measure.CSV"; // default

document.getElementById("csv-selector").addEventListener("change", function () {
  selectedFile = this.value; 
  console.log("Selected file:", selectedFile); //for text purposes 

  resetGraph(); // reset the graph 
});



//
function resetGraph() {
  // Stop live simulations if any
  if (typeof liveSimulations !== "undefined") {
    liveSimulations.forEach(intervalId => clearInterval(intervalId));
    liveSimulations.clear();
  }

  // Clear sensor data map
  activeSensors.clear?.(); // Safe if declared with Map()

  // Fully reset Plotly
  Plotly.purge('plot');

  // Optionally render an empty placeholder chart again
  Plotly.newPlot('plot', [], {
    title: 'Sensorverlauf',
    xaxis: { title: 'Zeit' },
    yaxis: { title: 'Sensorwert (Ohm)' },
    margin: { t: 40 }
  });

  // Clear title and sensor badge
  document.getElementById("visualization-title").textContent = "Ausgewählter Sensor";
  const badge = document.getElementById("active-sensor-badge");
  if (badge) {
    badge.classList.add("d-none");
    badge.textContent = "";
  }

  // Clear sensor value UI (if any)
  const sensorValueContainer = document.getElementById("sensor-value-output");
  if (sensorValueContainer) {
    sensorValueContainer.innerHTML = "";
  }

  // Reset button styles and active state
  const buttons = document.querySelectorAll(".sensor-button");
  buttons.forEach(button => {
    button.classList.remove("active", "btn-active");
    button.style.backgroundColor = '';
    button.style.color = '';
    button.dataset.active = "false";
  });
}); // Close the DOMContentLoaded event listener
