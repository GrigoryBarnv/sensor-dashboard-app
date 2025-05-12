document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".sensor-button");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const sensorId = button.getAttribute("data-sensor-id");
      fetchSensorData(sensorId);
    });
  });
});

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
    marker: { color: 'blue' },
    name: sensorId
  };

  const layout = {
    title: `Sensorverlauf: ${sensorId}`,
    xaxis: { title: 'Zeit' },
    yaxis: { title: 'Sensorwert (Ohm)' },
    margin: { t: 40 }
  };

  Plotly.newPlot('plot', [trace], layout);

  // Optional: Beispielbild entfernen
  const placeholder = document.getElementById("placeholder");
  if (placeholder) placeholder.remove();
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
