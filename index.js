// ...existing code...

// ---------- Utilidad para reservas ----------
// ...existing code...

// Selector utilitario tipo jQuery
function $(selector, parent = document) {
  return parent.querySelector(selector);
}

// ...existing code...
function getReservas() {
  try {
    return JSON.parse(localStorage.getItem('reservas')) || [];
  } catch {
    return [];
  }
}
function setReservas(arr) {
  localStorage.setItem('reservas', JSON.stringify(arr));
}
function renderReservasPanel() {
  const panel = $('#reservas-panel');
  if (!panel) return;
  const reservas = getReservas();
  const body = document.createElement('div');
  body.className = 'p-3 small text-body-secondary';

  if (reservas.length === 0) {
    body.innerHTML = 'Aún no tienes reservas. Cuando confirmes una, aparecerá aquí.';
  } else {
    body.innerHTML = reservas.map((r, idx) => `
      <div class="d-flex align-items-center justify-content-between mb-2 border rounded px-2 py-1 bg-white text-dark">
        <span>
          <strong>${r.llegada}</strong> — <strong>${r.salida}</strong>
        </span>
        <button type="button" class="btn btn-sm btn-outline-danger ms-2 btn-eliminar-reserva" data-idx="${idx}" title="Eliminar reserva">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    `).join('');
  }
  // Reemplaza el contenido del panel (excepto el header)
  const header = panel.querySelector('.reservas-header');
  panel.innerHTML = '';
  panel.appendChild(header);
  panel.appendChild(body);

  // Eliminar reserva
  body.querySelectorAll('.btn-eliminar-reserva').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = Number(btn.dataset.idx);
      const arr = getReservas();
      arr.splice(idx, 1);
      setReservas(arr);
      renderReservasPanel();
    });
  });
}

// ---------- Render principal ----------
// ...existing code...
// ...existing code...

function buildCalendar(year, month, start, end) {
  // Crea el contenedor principal
  const cal = document.createElement('div');
  cal.className = 'calendar';

  // Encabezado con mes y año
  const header = document.createElement('div');
  header.className = 'calendar-header mb-2';
  header.innerHTML = `
    <span class="fw-semibold">${start.toLocaleString('es-CO', { month: 'long', year: 'numeric' })}</span>
  `;
  cal.appendChild(header);

  // Días de la semana
  const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const weekRow = document.createElement('div');
  weekRow.className = 'calendar-weekdays mb-1';
  weekRow.innerHTML = weekdays.map(d => `<span>${d}</span>`).join('');
  cal.appendChild(weekRow);

  // Días del mes
  const daysGrid = document.createElement('div');
  daysGrid.className = 'calendar-days';

  // Primer día del mes
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Lunes = 0

  // Celdas vacías antes del primer día
  for (let i = 0; i < startDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day is-empty';
    daysGrid.appendChild(emptyCell);
  }

  // Días del mes
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const cell = document.createElement('div');
    cell.className = 'calendar-day';

    // Día actual
    if (
      date.toDateString() === new Date().toDateString()
    ) {
      cell.classList.add('is-today');
    }

    // Día seleccionado (rango)
    if (
  start && end &&
  date >= start && date <= end
    ) {
  cell.classList.add('is-selected');
    }

    cell.textContent = d;
    daysGrid.appendChild(cell);
  }

  cal.appendChild(daysGrid);
  return cal;
}

// ...existing code...

function renderAvailability() {
  // ...existing code...

  // Panel con calendario + lateral
  const panel = document.createElement('div');
  panel.className = 'availability-panel';
  panel.innerHTML = `
    <div class="row g-4 align-items-start">
      <div class="col-12 col-lg-8">
        <div id="calendar-hook"></div>
        <p class="small text-body-secondary mt-2 mb-0">Fechas en rojo: rango seleccionado.</p>
      </div>
      <div class="col-12 col-lg-4">
        <div class="side-card">
          <h3 class="h6 fw-semibold mb-2">Estado de reserva</h3>
          <p class="mb-2"><span class="badge text-bg-success">Glamping disponible</span></p>
          <p class="small text-body-secondary mb-2">Fechas:</p>
          <p><strong>${start.toISOString().split("T")[0]} — ${end.toISOString().split("T")[0]}</strong></p>
          <button type="button" class="btn btn-primary w-100 btn-confirm mb-2">Confirmar reserva</button>
          <button type="button" class="btn btn-outline-secondary w-100" id="btn-cerrar">Cambiar fechas</button>
        </div>
      </div>
    </div>
  `;

  out.appendChild(panel);

  // Monta calendario del mes de llegada
  const calMount = $('#calendar-hook', panel);
  const cal = buildCalendar(start.getFullYear(), start.getMonth(), start, end);
  calMount.appendChild(cal);

  // Confirmar reserva
  $('.btn-confirm', panel).addEventListener('click', () => {
    // Guarda la reserva en localStorage
    const reservas = getReservas();
    reservas.push({
      llegada: start.toLocaleDateString(),
      salida: end.toLocaleDateString()
    });
    setReservas(reservas);
    renderReservasPanel();
    // Muestra el pop-up de confirmación
    const popup = document.getElementById('reserva-confirmada-popup');
    if (popup) {
      popup.style.display = 'flex';
      setTimeout(() => {
        popup.style.display = 'none';
      }, 2500); // Oculta después de 2.5 segundos
    }
    // Cierra el panel de disponibilidad
    out.innerHTML = '';
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Cerrar (eliminar DOM creado)
  $('#btn-cerrar', panel).addEventListener('click', () => {
    out.innerHTML = '';
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  out.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ...existing code...

// ...existing code...

// Evento para el botón "Consultar disponibilidad"
document.addEventListener('DOMContentLoaded', () => {
  const btnConsultar = document.getElementById('btn-consultar');
  const resultDiv = document.getElementById('availability-result');
  btnConsultar.addEventListener('click', () => {
    const llegada = document.getElementById('pr-llegada').value;
    const salida = document.getElementById('pr-salida').value;
    if (!llegada || !salida) {
      resultDiv.innerHTML = '<div class="alert alert-warning">Por favor selecciona las fechas de llegada y salida.</div>';
      return;
    }
    const start = new Date(llegada);
    const end = new Date(salida);
    if (isNaN(start) || isNaN(end) || start >= end) {
      resultDiv.innerHTML = '<div class="alert alert-warning">La fecha de salida debe ser posterior a la de llegada.</div>';
      return;
    }
    // Renderiza el calendario y panel de disponibilidad
    resultDiv.innerHTML = '';
    // Variables globales para renderAvailability
    window.start = start;
    window.end = end;
    window.out = resultDiv;
    renderAvailability();
  });
});

// ...existing code...

window.addEventListener('DOMContentLoaded', () => {
  // ...existing code...

  // Mis reservas: abrir/cerrar panel
  const btnReservas       = $('#btn-reservas');
  const reservasPanel     = $('#reservas-panel');
  const btnCerrarReservas = $('#reservas-close');

  if (btnReservas && reservasPanel) {
    btnReservas.addEventListener('click', (e) => {
      e.preventDefault();
      reservasPanel.classList.toggle('is-open');
      const abierto = reservasPanel.classList.contains('is-open');
      btnReservas.setAttribute('aria-expanded', String(abierto));
      reservasPanel.setAttribute('aria-hidden', String(!abierto));
      if (abierto) renderReservasPanel();
    });
  }

  if (btnCerrarReservas && reservasPanel && btnReservas) {
    btnCerrarReservas.addEventListener('click', () => {
      reservasPanel.classList.remove('is-open');
      btnReservas.setAttribute('aria-expanded', 'false');
      reservasPanel.setAttribute('aria-hidden', 'true');
    });
  }

  // Renderiza reservas al cargar (si el panel está abierto)
  if (reservasPanel.classList.contains('is-open')) {
    renderReservasPanel();
  }
});

// ...existing code...