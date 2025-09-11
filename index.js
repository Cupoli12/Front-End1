// ---------- Utilidad para reservas ----------

// Selector utilitario tipo jQuery
function $(selector, parent = document) {
  return parent.querySelector(selector);
}

// Parsear YYYY-MM-DD como fecha LOCAL (evita el shift por UTC)
function parseInputDateAsLocal(value) {
  if (!value) return null;
  const parts = value.split('-').map(Number);
  if (parts.length !== 3) return new Date(value); // fallback
  const [y, m, d] = parts;
  return new Date(y, m - 1, d); // monthIndex = m - 1
}

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
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx);
      const arr = getReservas();
      arr.splice(idx, 1);
      setReservas(arr);
      renderReservasPanel();
    });
  });
}

// ---------- Render principal ----------

function buildCalendar(year, month, start, end) {
  const cal = document.createElement('div');
  cal.className = 'calendar';

  const header = document.createElement('div');
  header.className = 'calendar-header mb-2';
  header.innerHTML = `
    <span class="fw-semibold">${start.toLocaleString('es-CO', { month: 'long', year: 'numeric' })}</span>
  `;
  cal.appendChild(header);

  const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const weekRow = document.createElement('div');
  weekRow.className = 'calendar-weekdays mb-1';
  weekRow.innerHTML = weekdays.map(d => `<span>${d}</span>`).join('');
  cal.appendChild(weekRow);

  const daysGrid = document.createElement('div');
  daysGrid.className = 'calendar-days';

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  for (let i = 0; i < startDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day is-empty';
    daysGrid.appendChild(emptyCell);
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const cell = document.createElement('div');
    cell.className = 'calendar-day';

    if (date.toDateString() === new Date().toDateString()) {
      cell.classList.add('is-today');
    }

    // Selección incluyendo salida y resaltando inicio/fin
    if (start && end) {
      if (date >= start && date <= end) {
        cell.classList.add('is-selected');
      }
      if (date.getTime() === start.getTime()) {
        cell.classList.add('is-start');
      }
      if (date.getTime() === end.getTime()) {
        cell.classList.add('is-end');
      }
    }

    cell.textContent = d;
    daysGrid.appendChild(cell);
  }

  cal.appendChild(daysGrid);
  return cal;
}

function renderAvailability() {
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
          <p><strong>${start.toLocaleDateString()} — ${end.toLocaleDateString()}</strong></p>
          <button type="button" class="btn btn-primary w-100 btn-confirm mb-2">Confirmar reserva</button>
          <button type="button" class="btn btn-outline-secondary w-100" id="btn-cerrar">Cambiar fechas</button>
        </div>
      </div>
    </div>
  `;

  out.appendChild(panel);

  const calMount = $('#calendar-hook', panel);
  const cal = buildCalendar(start.getFullYear(), start.getMonth(), start, end);
  calMount.appendChild(cal);

  // Confirmar reserva
  $('.btn-confirm', panel).addEventListener('click', () => {
    const reservas = getReservas();

    if (window.modificarUltima) {
      // Reemplazar última reserva
      reservas[reservas.length - 1] = {
        llegada: start.toLocaleDateString(),
        salida: end.toLocaleDateString()
      };
      window.modificarUltima = false;
    } else {
      reservas.push({
        llegada: start.toLocaleDateString(),
        salida: end.toLocaleDateString()
      });
    }

    setReservas(reservas);
    renderReservasPanel();

    const popup = document.getElementById('reserva-confirmada-popup');
    if (popup) {
      popup.style.display = 'flex';
      setTimeout(() => {
        popup.style.display = 'none';
      }, 2500);
    }

    out.innerHTML = '';

    // --- CAMBIAR SECCIÓN RESERVA RÁPIDA ---
    const reservaRapida = document.getElementById('pre-reserva');
    if (reservaRapida) {
      reservaRapida.innerHTML = `
        <div class="container text-center">
          <div class="row justify-content-center">
            <div class="col-12 col-lg-10">
              <h2 class="h3 fw-semibold mb-2 text-white">¡Te esperamos!</h2>
              <p class="mb-3 opacity-75">Tu reserva se ha realizado con éxito, ¿quieres hacer algo más?</p>
              <button id="btn-nueva-reserva" class="btn btn-light px-4 rounded-pill me-2">Agregar nueva reserva</button>
              <button id="btn-modificar-reserva" class="btn btn-light px-4 rounded-pill">Modificar última reserva</button>
              <p id="countdown" class="mt-3 fw-semibold text-white"></p>
            </div>
          </div>
        </div>
      `;

      // === Contador real hasta la fecha de llegada ===
      const countdown = document.getElementById('countdown');
      function updateCountdown() {
        const now = new Date();
        const diff = start - now;

        if (diff <= 0) {
          countdown.textContent = "¡Hoy es el gran día de tu reserva! 🎉";
          clearInterval(interval);
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);

        countdown.textContent = `Faltan ${days} días, ${hours} horas y ${minutes} minutos para tu estadía.`;
      }
      updateCountdown();
      const interval = setInterval(updateCountdown, 60000);

      // === Botón "Agregar nueva reserva" ===
      document.getElementById('btn-nueva-reserva').addEventListener('click', () => {
        clearInterval(interval);
        reservaRapida.innerHTML = window.reservaRapidaOriginal;

        const form = reservaRapida.querySelector('form');
        if (form) form.reset();

        const btnConsultar = document.getElementById('btn-consultar');
        if (btnConsultar) {
          btnConsultar.addEventListener('click', () => {
            const llegada = document.getElementById('pr-llegada').value;
            const salida = document.getElementById('pr-salida').value;
            if (!llegada || !salida) {
              document.getElementById('availability-result').innerHTML = '<div class="alert alert-warning">Por favor selecciona las fechas de llegada y salida.</div>';
              return;
            }
            const start = parseInputDateAsLocal(llegada);
            const end = parseInputDateAsLocal(salida);
            if (isNaN(start) || isNaN(end) || start >= end) {
              document.getElementById('availability-result').innerHTML = '<div class="alert alert-warning">La fecha de salida debe ser posterior a la de llegada.</div>';
              return;
            }
            document.getElementById('availability-result').innerHTML = '';
            window.start = start;
            window.end = end;
            window.out = document.getElementById('availability-result');
            renderAvailability();
          });
        }
      });

      // === Botón "Modificar última reserva" ===
      document.getElementById('btn-modificar-reserva').addEventListener('click', () => {
        clearInterval(interval);
        reservaRapida.innerHTML = window.reservaRapidaOriginal;

        const form = reservaRapida.querySelector('form');
        if (form) {
          form.reset();
          const reservas = getReservas();
          if (reservas.length > 0) {
            const ultima = reservas[reservas.length - 1];
            // Convertir dd/mm/yyyy -> yyyy-mm-dd
            const [dia1, mes1, año1] = ultima.llegada.split('/');
            const [dia2, mes2, año2] = ultima.salida.split('/');
            document.getElementById('pr-llegada').value = `${año1}-${mes1.padStart(2,'0')}-${dia1.padStart(2,'0')}`;
            document.getElementById('pr-salida').value = `${año2}-${mes2.padStart(2,'0')}-${dia2.padStart(2,'0')}`;
          }
        }

        // Activar modo modificar
        window.modificarUltima = true;

        const btnConsultar = document.getElementById('btn-consultar');
        if (btnConsultar) {
          btnConsultar.addEventListener('click', () => {
            const llegada = document.getElementById('pr-llegada').value;
            const salida = document.getElementById('pr-salida').value;
            if (!llegada || !salida) {
              document.getElementById('availability-result').innerHTML = '<div class="alert alert-warning">Por favor selecciona las fechas de llegada y salida.</div>';
              return;
            }
            const start = parseInputDateAsLocal(llegada);
            const end = parseInputDateAsLocal(salida);
            if (isNaN(start) || isNaN(end) || start >= end) {
              document.getElementById('availability-result').innerHTML = '<div class="alert alert-warning">La fecha de salida debe ser posterior a la de llegada.</div>';
              return;
            }
            document.getElementById('availability-result').innerHTML = '';
            window.start = start;
            window.end = end;
            window.out = document.getElementById('availability-result');
            renderAvailability();
          });
        }
      });
    }
  });

  $('#btn-cerrar', panel).addEventListener('click', () => {
    out.innerHTML = '';
  });
}

// Evento para el botón "Consultar disponibilidad"
document.addEventListener('DOMContentLoaded', () => {
  const reservaRapida = document.getElementById('pre-reserva');
  if (reservaRapida) {
    window.reservaRapidaOriginal = reservaRapida.innerHTML;
  }

  const btnConsultar = document.getElementById('btn-consultar');
  const resultDiv = document.getElementById('availability-result');
  if (btnConsultar) {
    btnConsultar.addEventListener('click', () => {
      const llegada = document.getElementById('pr-llegada').value;
      const salida = document.getElementById('pr-salida').value;
      if (!llegada || !salida) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Por favor selecciona las fechas de llegada y salida.</div>';
        return;
      }
      const start = parseInputDateAsLocal(llegada);
      const end = parseInputDateAsLocal(salida);
      if (isNaN(start) || isNaN(end) || start >= end) {
        resultDiv.innerHTML = '<div class="alert alert-warning">La fecha de salida debe ser posterior a la de llegada.</div>';
        return;
      }
      resultDiv.innerHTML = '';
      window.start = start;
      window.end = end;
      window.out = resultDiv;
      renderAvailability();
    });
  }
});

window.addEventListener('DOMContentLoaded', () => {
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

  if (reservasPanel && reservasPanel.classList.contains('is-open')) {
    renderReservasPanel();
  }
});



