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



document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".sensor-button");
  const activeSensors = new Map(); // Merkt sich aktive Sensoren + Daten

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const sensorId = button.getAttribute("data-sensor-id");

      if (activeSensors.has(sensorId)) {
        // Sensor ist schon aktiv → entferne ihn
        activeSensors.delete(sensorId);
        button.classList.remove("active");
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
            button.classList.add("active");
            redrawPlot(activeSensors);
          });
      }
    });
  });
});


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

function updateSensorTitle(sensorId) {
  const badge = document.getElementById("active-sensor-badge");
  const title = document.getElementById("visualization-title");

  if (badge && title) {
    badge.classList.remove("d-none");
    badge.textContent = sensorId;
    title.textContent = `Ausgewählter Sensor: ${sensorId}`;
  }
}
