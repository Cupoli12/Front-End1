// ---------- Utilidades ----------
const $ = (s, ctx = document) => ctx.querySelector(s);

function parseISO(v) {
  const [y, m, d] = (v || '').split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); } // m: 0..11
function startWeekday(y, m) { return new Date(y, m, 1).getDay(); }     // 0=Dom..6=Sab
function between(d, a, b) {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const s = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const e = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return t >= s && t <= e;
}

// ---------- Calendario simple (mes de llegada) ----------
function buildCalendar(year, monthIndex, startDate, endDate) {
  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const total = daysInMonth(year, monthIndex);
  const offset = startWeekday(year, monthIndex);

  const wrap = document.createElement('div');
  wrap.className = 'calendar';

  const header = document.createElement('div');
  header.className = 'calendar-header';
  header.innerHTML = `<strong>${meses[monthIndex]} ${year}</strong>`;
  wrap.appendChild(header);

  const weekdays = document.createElement('div');
  weekdays.className = 'calendar-weekdays';
  ['D','L','M','M','J','V','S'].forEach(l => {
    const s = document.createElement('span'); s.textContent = l; weekdays.appendChild(s);
  });
  wrap.appendChild(weekdays);

  const grid = document.createElement('div');
  grid.className = 'calendar-days';

  // vacíos
  for (let i = 0; i < offset; i++) {
    const e = document.createElement('div');
    e.className = 'calendar-day is-empty';
    grid.appendChild(e);
  }

  // días
  for (let d = 1; d <= total; d++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    cell.textContent = d;

    const cur = new Date(year, monthIndex, d);
    if (between(cur, startDate, endDate)) cell.classList.add('is-selected'); // rojo

    grid.appendChild(cell);
  }

  wrap.appendChild(grid);
  return wrap;
}

// ---------- Render principal ----------
function renderAvailability() {
  const out = $('#availability-result');
  if (!out) return;

  // Limpia (destruir lo anterior)
  out.innerHTML = '';

  const llegadaStr = $('#pr-llegada')?.value;
  const salidaStr  = $('#pr-salida')?.value;

  if (!llegadaStr || !salidaStr) {
    out.innerHTML = `
      <div class="alert alert-warning" role="alert">
        Por favor selecciona la fecha de <strong>llegada</strong> y <strong>salida</strong>.
      </div>
    `;
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  let start = parseISO(llegadaStr);
  let end   = parseISO(salidaStr);
  if (!start || !end) return;

  // Corrige si vienen al revés
  if (start > end) [start, end] = [end, start];

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
          <p><strong>${start.toLocaleDateString()} — ${end.toLocaleDateString()}</strong></p>
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

  // Cerrar (eliminar DOM creado)
  $('#btn-cerrar', panel).addEventListener('click', () => {
    out.innerHTML = '';
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  out.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


window.addEventListener('DOMContentLoaded', () => {
  //  Consultar disponibilidad (calendario)
  const btnConsultar = $('#btn-consultar');
  if (btnConsultar) {
    btnConsultar.addEventListener('click', renderAvailability);
  } else {
    console.warn('No se encontró #btn-consultar');
  }

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
    });
  } else {
    console.warn('No se encontró #btn-reservas o #reservas-panel');
  }

  if (btnCerrarReservas && reservasPanel && btnReservas) {
    btnCerrarReservas.addEventListener('click', () => {
      reservasPanel.classList.remove('is-open');
      btnReservas.setAttribute('aria-expanded', 'false');
      reservasPanel.setAttribute('aria-hidden', 'true');
    });
  }
});
