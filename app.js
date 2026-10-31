/* =====================================================
 * CONFIG SUPABASE (TODO)
 * ===================================================== */
// TODO: Initialize Supabase client here
// const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
// const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
// const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* =====================================================
 * MINI CALENDARIO (simulado)
 * ===================================================== */
const calTitle = document.getElementById('cal-title');
const calGrid = document.getElementById('cal-grid');
const today = new Date();
let calYear = today.getFullYear();
let calMonth = today.getMonth();
// TODO: Fetch watering event dates from Supabase and fill this set (format 'YYYY-M-D', mes base 0)
const wateringDays = new Set([
  `${today.getFullYear()}-${today.getMonth()}-${today.getDate() + 2}`
]);

function renderCalendar() {
  const first = new Date(calYear, calMonth, 1);
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const monthLabel = first.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  calTitle.textContent = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  calGrid.innerHTML = '';

  for (let i = 0; i < first.getDay(); i++) {
    calGrid.appendChild(document.createElement('span'));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('span');
    cell.textContent = d;
    cell.className = 'py-1 rounded-md hover:bg-green-100 cursor-pointer';
    const isToday = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
    if (isToday) cell.className += ' bg-green-900 text-white font-semibold hover:bg-green-900';
    else if (wateringDays.has(`${calYear}-${calMonth}-${d}`)) cell.className += ' bg-blue-100 text-blue-700 font-semibold';
    calGrid.appendChild(cell);
  }
}
document.getElementById('cal-prev').addEventListener('click', () => {
  calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderCalendar();
});
document.getElementById('cal-next').addEventListener('click', () => {
  calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } renderCalendar();
});
renderCalendar();

/* =====================================================
 * GRÁFICOS DONUT (Datos en Tiempo Real)
 * ===================================================== */
function createDonut(canvasId, value, max, color) {
  return new Chart(document.getElementById(canvasId), {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [value, Math.max(max - value, 0)],
        backgroundColor: [color, '#E5E7EB'],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '75%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } }
    }
  });
}

// Humedad: 0-100 %   |   Temperatura: escala visual 0-40 °C
const humidityDonut = createDonut('humidityDonut', 82, 100, '#3B82F6');
const temperatureDonut = createDonut('temperatureDonut', 21.5, 40, '#F97316');

function updateDonuts(humidity, temperature) {
  humidityDonut.data.datasets[0].data = [humidity, Math.max(100 - humidity, 0)];
  temperatureDonut.data.datasets[0].data = [temperature, Math.max(40 - temperature, 0)];
  humidityDonut.update();
  temperatureDonut.update();
  document.getElementById('humidity-value').textContent = `${humidity}%`;
  document.getElementById('temperature-value').textContent = `${temperature}°C`;
}

// TODO: Fetch Realtime Supabase Data here (RF4, RF8) to update the donut charts
// Ejemplo:
// supabase
//   .channel('sensor-readings')
//   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
//     (payload) => updateDonuts(payload.new.humidity, payload.new.temperature))
//   .subscribe();

/* =====================================================
 * GRÁFICO DE LÍNEAS (Historial de Condiciones Ambientales)
 * ===================================================== */
const historyChart = new Chart(document.getElementById('historyChart'), {
  type: 'line',
  data: {
    labels: ['04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00'],
    datasets: [
      {
        label: 'Humedad (%)',
        data: [78, 79, 81, 82, 80, 81, 82],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59,130,246,0.15)',
        tension: 0.35,
        yAxisID: 'yHumidity'
      },
      {
        label: 'Temperatura (°C)',
        data: [19.8, 20.2, 20.9, 21.3, 21.5, 22.0, 21.7],
        borderColor: '#F97316',
        backgroundColor: 'rgba(249,115,22,0.15)',
        tension: 0.35,
        yAxisID: 'yTemperature'
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { position: 'bottom' } },
    scales: {
      yHumidity: { type: 'linear', position: 'left', title: { display: true, text: '%' }, min: 60, max: 100 },
      yTemperature: { type: 'linear', position: 'right', title: { display: true, text: '°C' }, min: 10, max: 30, grid: { drawOnChartArea: false } }
    }
  }
});

// TODO: Fetch historical Supabase data here (RF5, RF6) and update the line chart
// Debe respetar el intervalo seleccionado en #log-interval (en horas).
async function loadHistory(intervalHours) {
  // const { data, error } = await supabase
  //   .from('sensor_readings')
  //   .select('created_at, humidity, temperature')
  //   .order('created_at', { ascending: true });
  // historyChart.data.labels = data.map(r => r.created_at);
  // historyChart.data.datasets[0].data = data.map(r => r.humidity);
  // historyChart.data.datasets[1].data = data.map(r => r.temperature);
  // historyChart.update();
}
document.getElementById('log-interval').addEventListener('change', (e) => {
  loadHistory(Number(e.target.value));
});

/* =====================================================
 * TABLA DE LOGS (Registros Recientes de la Base de Datos)
 * ===================================================== */
function renderLogs(rows) {
  const tbody = document.getElementById('logs-body');
  tbody.innerHTML = rows.map(r =>
    `<tr><td class="py-2">${r.time}</td><td class="py-2">${r.humidity}%</td><td class="py-2">${r.temperature}°C</td></tr>`
  ).join('');
}

// TODO: Fetch Supabase logs here (RF6) and call renderLogs(rows)
// Ejemplo:
// const { data } = await supabase
//   .from('sensor_readings')
//   .select('created_at, humidity, temperature')
//   .order('created_at', { ascending: false })
//   .limit(3);
// renderLogs(data.map(r => ({
//   time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//   humidity: r.humidity,
//   temperature: r.temperature
// })));


/* =====================================================
 * NAVEGACIÓN POR PESTAÑAS (SPA)
 * ===================================================== */
const navLinks = document.querySelectorAll('nav a[data-target]');
const views = document.querySelectorAll('[id^="vista-"]');

function showView(targetId) {
  views.forEach((view) => view.classList.add('hidden'));
  const target = document.getElementById(targetId);
  if (target) target.classList.remove('hidden');

  navLinks.forEach((link) => {
    const isActive = link.dataset.target === targetId;
    link.classList.remove('font-semibold', 'border-b-2', 'border-white', 'pb-1', 'opacity-80', 'hover:opacity-100');
    if (isActive) {
      link.classList.add('font-semibold', 'border-b-2', 'border-white', 'pb-1');
    } else {
      link.classList.add('opacity-80', 'hover:opacity-100');
    }
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    showView(link.dataset.target);
  });
});

// Vista inicial
showView('vista-panel');



/* =====================================================
 * FORMULARIO DE RIEGO (RF1)
 * ===================================================== */
const formRiego = document.getElementById('form-riego');
if (formRiego) {
  formRiego.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(formRiego);
    const dias = formData.getAll('dias');
    const hora = formData.get('hora');
    const notas = formData.get('notas');
    console.log({ dias, hora, notas });
    // TODO: Insertar programación en Supabase (tabla calendario_riego)
    formRiego.reset();
  });
}



/* =====================================================
 * HISTÓRICO (RF5)
 * ===================================================== */
function renderHistoricalChart() {
  const canvas = document.getElementById('historicalChartTab');
  if (!canvas) return;

  new Chart(canvas, {
    type: 'line',
    data: {
      labels: ['14/10 00:00', '14/10 06:00', '14/10 12:00', '14/10 18:00', '15/10 00:00', '15/10 06:00', '15/10 12:00', '15/10 18:00', '16/10 00:00'],
      datasets: [
        {
          label: 'Humedad (%)',
          data: [82, 80, 78, 79, 81, 83, 82, 80, 81],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59,130,246,0.15)',
          tension: 0.35,
          yAxisID: 'yHumidity'
        },
        {
          label: 'Temperatura (°C)',
          data: [20.5, 21.2, 22.8, 21.9, 20.8, 20.1, 22.3, 21.6, 20.9],
          borderColor: '#F97316',
          backgroundColor: 'rgba(249,115,22,0.15)',
          tension: 0.35,
          yAxisID: 'yTemperature'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'bottom' } },
      scales: {
        yHumidity: { type: 'linear', position: 'left', title: { display: true, text: '%' }, min: 60, max: 100 },
        yTemperature: { type: 'linear', position: 'right', title: { display: true, text: '°C' }, min: 10, max: 30, grid: { drawOnChartArea: false } }
      }
    }
  });
}
renderHistoricalChart();

const formFiltrosHistoricos = document.getElementById('form-filtros-historicos');
if (formFiltrosHistoricos) {
  formFiltrosHistoricos.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(formFiltrosHistoricos);
    console.log({
      fechaInicio: formData.get('fechaInicio'),
      fechaFin: formData.get('fechaFin'),
      frecuencia: formData.get('frecuencia')
    });
    // TODO: Consultar registros en Supabase filtrados por fecha
  });
}



/* =====================================================
 * SENSORES (RF3)
 * ===================================================== */
const formSensor = document.getElementById('form-sensor');
if (formSensor) {
  formSensor.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(formSensor);
    console.log({
      nombre: formData.get('nombre'),
      tipo: formData.get('tipo'),
      mac: formData.get('mac')
    });
    // TODO: Insertar dispositivo en Supabase (tabla dispositivos_sensores)
    formSensor.reset();
  });
}



/* =====================================================
 * CONFIGURACIÓN (Perfil y Seguridad)
 * ===================================================== */
const formPerfil = document.getElementById('form-perfil');
if (formPerfil) {
  formPerfil.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(formPerfil);
    console.log({
      nombre: formData.get('nombre'),
      correo: formData.get('correo')
    });
    // TODO: Actualizar datos de usuario en Supabase
  });
}

const formSeguridad = document.getElementById('form-seguridad');
if (formSeguridad) {
  formSeguridad.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(formSeguridad);
    const passwordNueva = formData.get('passwordNueva');
    const passwordConfirmar = formData.get('passwordConfirmar');

    if (passwordNueva !== passwordConfirmar) {
      alert('La nueva contraseña y la confirmación no coinciden.');
      return;
    }

    console.log({
      passwordActual: formData.get('passwordActual'),
      passwordNueva
    });
    // TODO: Actualizar contraseña en Supabase Auth
    formSeguridad.reset();
  });
}


/* =====================================================
 * EXPORTAR CSV (Historial)
 * ===================================================== */
const btnExportarCsv = document.getElementById('btn-exportar-csv');
if (btnExportarCsv) {
  btnExportarCsv.addEventListener('click', () => {
    // Esta función exporta los datos actualmente visibles. Luego se adaptará para exportar el array de Supabase.
    const tabla = document.querySelector('#vista-historicos table');
    if (!tabla) return;

    const headers = Array.from(tabla.querySelectorAll('thead th')).map((th) => th.textContent.trim());
    const rows = Array.from(tabla.querySelectorAll('tbody tr')).map((tr) =>
      Array.from(tr.querySelectorAll('td')).map((td) => td.textContent.trim())
    );

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'historial_condiciones.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}


