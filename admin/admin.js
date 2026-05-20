const API =
  "https://gtqmrcabckvuu7kilhzweat6za0chbyz.lambda-url.us-east-1.on.aws/";

let passkeyInMemory = "";
let lastRecords = [];

const els = {
  loginPanel: document.getElementById("loginPanel"),
  dashboardPanel: document.getElementById("dashboardPanel"),
  loginForm: document.getElementById("loginForm"),
  passkeyInput: document.getElementById("passkeyInput"),
  loginError: document.getElementById("loginError"),
  loginSubmit: document.getElementById("loginSubmit"),
  logoutBtn: document.getElementById("logoutBtn"),
  refreshBtn: document.getElementById("refreshBtn"),
  csvBtn: document.getElementById("csvBtn"),
  totalCount: document.getElementById("totalCount"),
  dataTableBody: document.getElementById("dataTableBody"),
  emptyHint: document.getElementById("emptyHint"),
  statusLine: document.getElementById("statusLine"),
};

function showLogin() {
  passkeyInMemory = "";
  lastRecords = [];
  els.dashboardPanel.hidden = true;
  els.loginPanel.hidden = false;
  els.passkeyInput.value = "";
  els.loginError.hidden = true;
  els.passkeyInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showDashboard() {
  els.dashboardPanel.hidden = false;
  els.loginError.hidden = true;
}

function setLoading(isLoading, labelIdle, labelBusy) {
  els.loginSubmit.disabled = isLoading;
  els.loginSubmit.textContent = isLoading ? labelBusy : labelIdle;
}

function val(row, keys) {
  if (row == null) return "—";

  for (const k of keys) {
    const v = row[k];

    if (
      v !== undefined &&
      v !== null &&
      String(v).trim() !== ""
    ) {
      return String(v);
    }
  }

  return "—";
}

function extractRecords(payload) {
  if (Array.isArray(payload)) return payload;

  const candidates = [
    payload.records,
    payload.data,
    payload.items,
    payload.rows,
    payload.inscripciones,
    payload.registros,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }

  return [];
}

function extractTotal(payload, records) {
  if (typeof payload.total === "number") return payload.total;
  if (typeof payload.count === "number") return payload.count;

  return records.length;
}

function vehiculoObservacionesText(row) {
  const veh = val(row, [
    "vehiculo",
    "vehículo",
    "Vehiculo",
    "Vehículo",
    "auto",
    "car",
  ]);

  const obs = val(row, [
    "observaciones",
    "observación",
    "Observaciones",
    "notas",
    "nota",
    "comentario",
    "comentarios",
    "comments",
    "notes",
    "mensaje",
    "extra",
    "detalle",
  ]);

  if (veh === "—" && obs === "—") return "—";
  if (obs === "—") return veh;
  if (veh === "—") return obs;

  return `${veh} · ${obs}`;
}

function renderRows(records) {
  els.dataTableBody.replaceChildren();

  const frag = document.createDocumentFragment();

  for (const row of records) {
    const tr = document.createElement("tr");

    const vo = vehiculoObservacionesText(row);

    tr.innerHTML = `
      <td>${escapeHtml(
        val(row, [
          "fecha",
          "Fecha",
          "date",
          "createdAt",
          "created_at",
          "timestamp",
        ])
      )}</td>

      <td>${escapeHtml(
        val(row, [
          "nombre",
          "Nombre",
          "name",
          "fullName",
          "full_name",
        ])
      )}</td>

      <td>${escapeHtml(
        val(row, [
          "telefono",
          "Teléfono",
          "phone",
          "tel",
          "celular",
          "movil",
        ])
      )}</td>

      <td>${escapeHtml(
        val(row, [
          "email",
          "Email",
          "correo",
          "mail",
        ])
      )}</td>

      <!-- MENU LEGACY -->
      <td>Combinado</td>

      <!-- MENU SABADO -->
      <td>${escapeHtml(
        val(row, [
          "menuSabado",
          "menu_sabado",
          "MenuSabado",
          "Menu Sabado",
        ])
      )}</td>

      <!-- MENU DOMINGO -->
      <td>${escapeHtml(
        val(row, [
          "menuDomingo",
          "menu_domingo",
          "MenuDomingo",
          "Menu Domingo",
        ])
      )}</td>

      <!-- VEHICULO -->
      <td>${vo === "—" ? "—" : escapeHtml(vo)}</td>
    `;

    frag.appendChild(tr);
  }

  els.dataTableBody.appendChild(frag);
}

function scrollToDashboard() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      els.dashboardPanel.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      try {
        els.dashboardPanel.focus({
          preventScroll: true,
        });
      } catch (_) {
        /* noop */
      }
    });
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function setStatus(msg) {
  els.statusLine.textContent = msg || "";
}

async function fetchList(enteredPasskey) {
  const url =
    `${API}?action=list&passkey=${encodeURIComponent(enteredPasskey)}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "omit",
  });

  const text = await res.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Respuesta no válida del servidor.");
  }

  return data;
}

async function handleLoginSubmit(e) {
  e.preventDefault();

  els.loginError.hidden = true;

  setStatus("");

  const pk = els.passkeyInput.value.trim();

  if (!pk) {
    setStatus("Ingresá la clave.");
    return;
  }

  setLoading(true, "Mostrar datos", "Cargando…");

  try {
    const data = await fetchList(pk);

    if (data && data.success === false) {
      els.loginError.hidden = false;
      return;
    }

    if (data && data.success === true) {
      passkeyInMemory = pk;

      showDashboard();

      applyListPayload(data);

      scrollToDashboard();

      return;
    }

    setStatus("Respuesta inesperada del servidor.");

  } catch (err) {

    setStatus(err.message || "Error de conexión.");

  } finally {

    setLoading(false, "Mostrar datos", "Cargando…");
  }
}

function applyListPayload(data) {
  const records = extractRecords(data);

  lastRecords = records;

  const total = extractTotal(data, records);

  els.totalCount.textContent = String(total);

  renderRows(records);

  const empty = records.length === 0;

  els.emptyHint.hidden = !empty;

  setStatus(empty ? "" : `Actualizado · ${records.length} filas`);
}

async function handleRefresh() {
  if (!passkeyInMemory) return;

  els.refreshBtn.disabled = true;
  els.csvBtn.disabled = true;

  setStatus("Actualizando…");

  try {
    const data = await fetchList(passkeyInMemory);

    if (data && data.success === false) {
      showLogin();

      els.loginError.hidden = false;

      setStatus("");

      return;
    }

    if (data && data.success === true) {
      applyListPayload(data);
      return;
    }

    showLogin();

    setStatus(
      "Sesión expirada o respuesta inválida. Ingresá de nuevo."
    );

  } catch (err) {

    setStatus(err.message || "Error al refrescar.");

  } finally {

    els.refreshBtn.disabled = false;
    els.csvBtn.disabled = false;
  }
}

function buildExcelExportAoA() {
  const headers = [
    "Fecha",
    "Nombre",
    "Teléfono",
    "Email",
    "Menú",
    "Menu Sabado",
    "Menu Domingo",
    "Vehículo y observaciones",
  ];

  const body = lastRecords.map((row) => {
    const cells = [
      val(row, [
        "fecha",
        "Fecha",
        "date",
        "createdAt",
        "created_at",
        "timestamp",
      ]),

      val(row, [
        "nombre",
        "Nombre",
        "name",
        "fullName",
        "full_name",
      ]),

      val(row, [
        "telefono",
        "Teléfono",
        "phone",
        "tel",
        "celular",
        "movil",
      ]),

      val(row, [
        "email",
        "Email",
        "correo",
        "mail",
      ]),

      // MENU LEGACY
      "Combinado",

      // MENU SABADO
      val(row, [
        "menuSabado",
        "menu_sabado",
        "MenuSabado",
        "Menu Sabado",
      ]),

      // MENU DOMINGO
      val(row, [
        "menuDomingo",
        "menu_domingo",
        "MenuDomingo",
        "Menu Domingo",
      ]),

      vehiculoObservacionesText(row),
    ];

    return cells.map((c) => (c === "—" ? "" : c));
  });

  return [headers, ...body];
}

function handleExcelDownload() {
  if (!passkeyInMemory) return;

  if (typeof XLSX === "undefined") {
    setStatus(
      "No se pudo cargar el generador de Excel. Recargá la página."
    );

    return;
  }

  const aoa = buildExcelExportAoA();

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Inscripciones"
  );

  XLSX.writeFile(
    wb,
    "renaser-inscripciones.xlsx"
  );
}

els.loginForm.addEventListener(
  "submit",
  handleLoginSubmit
);

els.logoutBtn.addEventListener(
  "click",
  showLogin
);

els.refreshBtn.addEventListener(
  "click",
  handleRefresh
);

els.csvBtn.addEventListener(
  "click",
  handleExcelDownload
);