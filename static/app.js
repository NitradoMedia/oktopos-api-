// =====================================================================
// OktoPOS API Tester – Frontend
// =====================================================================

// ---------- Endpoint catalogue ----------
const ENDPOINTS = [
  {
    id: "add-customer",
    name: "Kunden anlegen",
    method: "POST",
    path: "/v1/customers",
    description: "Legt einen neuen Kunden mit Personen-, Gruppen- und Karten-Daten an.",
    inputType: "json",
    sample: {
      person: {
        name: {
          honorificPrefix: "",
          honorificSuffix: "",
          givenName: "John",
          familyNamePrefix: "",
          familyName: "Doe"
        },
        gender: "male",
        birthDate: "1990-01-01",
        email: "john.doe@example.com",
        vatRegNo: "",
        phone: [
          { type: "home", value: "+49 123 456789" }
        ],
        address: {
          addressCountry: "DE",
          addressLocality: "Berlin",
          postalCode: "10115",
          streetAddress: "Musterstrasse",
          houseNumber: "1"
        }
      },
      groups: [
        { id: 0, name: "Student" }
      ],
      externalIdentifier: "EXT-0001",
      cards: [
        { type: "rfid", value: "123456" }
      ],
      comments: [
        { type: "INTERNAL", value: "Neuer Kunde" }
      ]
    }
  },
  {
    id: "find-by-external",
    name: "Kunde suchen (External ID)",
    method: "GET",
    path: "/v1/customers/findByExternalIdentifier/{externalIdentifier}",
    description: "Sucht einen Kunden anhand seines externen Identifiers (z.B. aus dem Quellsystem).",
    inputType: "form",
    pathParams: [
      { name: "externalIdentifier", label: "External Identifier", required: true, placeholder: "EXT-0001" }
    ]
  },
  {
    id: "find-by-phone",
    name: "Kunde suchen (Telefon)",
    method: "GET",
    path: "/v1/customers/findByPhoneNumber",
    description: "Sucht einen Kunden anhand der Telefonnummer.",
    inputType: "form",
    queryParams: [
      { name: "number", label: "Telefonnummer", required: true, placeholder: "+49 123 456789" },
      { name: "type", label: "Typ", type: "select", options: ["home", "mobile"], default: "home" }
    ]
  },
  {
    id: "create-voucher",
    name: "Gutschein-Konto anlegen",
    method: "POST",
    path: "/v1/customers/createVoucherAccount",
    description: "Erstellt ein Kontopaar (Kunde + Debit-Konto) und zahlt Geld darauf ein.",
    inputType: "form",
    bodyFields: [
      { name: "order_id", label: "Order ID", required: true, placeholder: "ORDER-001" },
      { name: "currency_token", label: "Currency Token", required: true, placeholder: "EUR" },
      { name: "amount", label: "Betrag", required: true, placeholder: "25.00" },
      { name: "voucher_code", label: "Voucher Code", required: true, placeholder: "GUTSCHEIN-XYZ" }
    ]
  },
  {
    id: "check-balance",
    name: "Guthaben abfragen",
    method: "GET",
    path: "/v1/customers/check-balance/{cardNumber}",
    description: "Liefert das Guthaben eines Kundenkontos zu einer Kartennummer.",
    inputType: "form",
    pathParams: [
      { name: "cardNumber", label: "Card Number", required: true, placeholder: "B1S2D" }
    ]
  },
  {
    id: "recharge",
    name: "Guthaben aufladen",
    method: "POST",
    path: "/v1/customers/recharge-balance",
    description: "Lädt das Guthaben eines Kundenkontos auf.",
    inputType: "form",
    bodyFields: [
      { name: "cardNumber", label: "Card Number", required: true, placeholder: "B1S2D" },
      { name: "balance", label: "Betrag", required: true, placeholder: "10.00" },
      { name: "currencyToken", label: "Currency Token", required: true, placeholder: "EUR" },
      { name: "paymentMethod", label: "Payment Method", type: "select",
        options: ["PAYPAL", "CREDIT_CARD", "ONLINE_BANK_TRANSFER"], default: "PAYPAL" }
    ]
  }
];

// ---------- State ----------
const state = {
  selectedId: null,
  settings: loadSettings()
};

// ---------- Settings ----------
function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem("oktopos.settings") || "{}");
    return {
      baseUrl: s.baseUrl || "",
      apiKey: s.apiKey || "",
      authStyle: s.authStyle || "header",
      authHeader: s.authHeader || "X-API-Key"
    };
  } catch (e) {
    return { baseUrl: "", apiKey: "", authStyle: "header", authHeader: "X-API-Key" };
  }
}
function saveSettings(s) {
  localStorage.setItem("oktopos.settings", JSON.stringify(s));
  state.settings = s;
  refreshConnectionPill();
}

function refreshConnectionPill() {
  const pill = document.getElementById("connection-pill");
  const sendBtn = document.getElementById("send-btn");
  if (state.settings.apiKey && state.settings.baseUrl) {
    pill.textContent = "Bereit · " + truncate(state.settings.baseUrl, 30);
    pill.className = "pill pill-ok";
    if (state.selectedId) sendBtn.disabled = false;
  } else if (state.settings.apiKey) {
    pill.textContent = "Base-URL fehlt";
    pill.className = "pill pill-warn";
    sendBtn.disabled = true;
  } else {
    pill.textContent = "Kein API-Key gesetzt";
    pill.className = "pill pill-warn";
    sendBtn.disabled = true;
  }
}

function truncate(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }

// ---------- Sidebar ----------
function renderSidebar() {
  const ul = document.getElementById("endpoint-list");
  ul.innerHTML = "";
  for (const ep of ENDPOINTS) {
    const div = document.createElement("div");
    div.className = "endpoint-item";
    div.dataset.id = ep.id;
    div.innerHTML = `
      <div class="row1">
        <span class="method method-${ep.method.toLowerCase()}">${ep.method}</span>
        <span class="name">${ep.name}</span>
      </div>
      <div class="row2">${ep.path}</div>
    `;
    div.addEventListener("click", () => selectEndpoint(ep.id));
    ul.appendChild(div);
  }
}

function selectEndpoint(id) {
  state.selectedId = id;
  const ep = ENDPOINTS.find(e => e.id === id);
  document.querySelectorAll(".endpoint-item").forEach(el => {
    el.classList.toggle("active", el.dataset.id === id);
  });

  document.getElementById("endpoint-method").textContent = ep.method;
  document.getElementById("endpoint-method").className = "method method-" + ep.method.toLowerCase();
  document.getElementById("endpoint-path").textContent = ep.path;
  document.getElementById("endpoint-title").textContent = ep.name;
  document.getElementById("endpoint-description").textContent = ep.description;

  renderForm(ep);
  refreshConnectionPill();
}

function renderForm(ep) {
  const c = document.getElementById("form-container");
  c.innerHTML = "";

  // Path params
  if (ep.pathParams) {
    for (const p of ep.pathParams) {
      c.appendChild(buildField(p, "path"));
    }
  }
  // Query params
  if (ep.queryParams) {
    if (ep.pathParams) c.appendChild(divider());
    const title = document.createElement("div");
    title.className = "field-group-title";
    title.textContent = "Query Parameter";
    c.appendChild(title);
    for (const p of ep.queryParams) {
      c.appendChild(buildField(p, "query"));
    }
  }
  // Body fields
  if (ep.bodyFields) {
    if (ep.pathParams || ep.queryParams) c.appendChild(divider());
    const title = document.createElement("div");
    title.className = "field-group-title";
    title.textContent = "Body";
    c.appendChild(title);
    for (const p of ep.bodyFields) {
      c.appendChild(buildField(p, "body"));
    }
  }
  // JSON body
  if (ep.inputType === "json") {
    const wrap = document.createElement("label");
    wrap.className = "field";
    wrap.innerHTML = `<span>Request Body (JSON)</span>`;
    const ta = document.createElement("textarea");
    ta.id = "json-body";
    ta.spellcheck = false;
    ta.value = JSON.stringify(ep.sample, null, 2);
    wrap.appendChild(ta);
    const helper = document.createElement("small");
    helper.className = "muted";
    helper.innerHTML = "Du kannst das JSON frei editieren. Wenn das JSON ungültig ist, wird es als Plaintext gesendet.";
    wrap.appendChild(helper);
    c.appendChild(wrap);
  }

  if (!ep.pathParams && !ep.queryParams && !ep.bodyFields && ep.inputType !== "json") {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "Keine Parameter erforderlich.";
    c.appendChild(p);
  }
}

function buildField(p, kind) {
  const lbl = document.createElement("label");
  lbl.className = "field";
  const labelText = p.label || p.name;
  const requiredMark = p.required ? ' <span style="color: var(--error)">*</span>' : "";
  lbl.innerHTML = `<span>${labelText}${requiredMark}</span>`;
  let input;
  if (p.type === "select") {
    input = document.createElement("select");
    for (const opt of p.options) {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      if (p.default === opt) o.selected = true;
      input.appendChild(o);
    }
  } else {
    input = document.createElement("input");
    input.type = "text";
    if (p.placeholder) input.placeholder = p.placeholder;
  }
  input.dataset.kind = kind;
  input.dataset.name = p.name;
  input.dataset.required = !!p.required;
  lbl.appendChild(input);
  return lbl;
}

function divider() {
  const d = document.createElement("div");
  d.className = "section-divider";
  return d;
}

// ---------- Send ----------
async function send() {
  const ep = ENDPOINTS.find(e => e.id === state.selectedId);
  if (!ep) return;
  if (!state.settings.apiKey || !state.settings.baseUrl) {
    alert("Bitte API-Key und Base URL in den Einstellungen setzen.");
    return;
  }

  let path = ep.path;
  const query = {};
  let body = undefined;
  let missing = [];

  // Path params
  if (ep.pathParams) {
    for (const p of ep.pathParams) {
      const el = document.querySelector(`input[data-name="${p.name}"][data-kind="path"]`);
      const val = (el?.value || "").trim();
      if (!val && p.required) missing.push(p.label || p.name);
      path = path.replace("{" + p.name + "}", encodeURIComponent(val));
    }
  }
  // Query params
  if (ep.queryParams) {
    for (const p of ep.queryParams) {
      const el = document.querySelector(`[data-name="${p.name}"][data-kind="query"]`);
      const val = (el?.value || "").trim();
      if (!val && p.required) missing.push(p.label || p.name);
      if (val) query[p.name] = val;
    }
  }
  // Body form
  if (ep.bodyFields) {
    body = {};
    for (const p of ep.bodyFields) {
      const el = document.querySelector(`[data-name="${p.name}"][data-kind="body"]`);
      const val = (el?.value || "").trim();
      if (!val && p.required) missing.push(p.label || p.name);
      if (val) body[p.name] = val;
    }
  }
  // JSON body
  if (ep.inputType === "json") {
    const txt = document.getElementById("json-body").value;
    try {
      body = JSON.parse(txt);
    } catch (e) {
      const proceed = confirm("Das JSON ist ungültig. Trotzdem als Plaintext senden?");
      if (!proceed) return;
      body = txt;
    }
  }

  if (missing.length) {
    alert("Bitte fülle die folgenden Pflichtfelder aus:\n- " + missing.join("\n- "));
    return;
  }

  const out = document.getElementById("response-output");
  const statusPill = document.getElementById("response-status");
  const timeEl = document.getElementById("response-time");
  const infoPanel = document.getElementById("response-request-info");
  const urlEl = document.getElementById("response-url");
  const methodEl = document.getElementById("response-method");
  const bodyEl = document.getElementById("response-request-body");
  const bodyRow = document.getElementById("request-body-row");
  const durEl = document.getElementById("response-duration");

  // Build the "preview" URL (with query string) for display
  const previewUrl = buildPreviewUrl(state.settings.baseUrl, path, query);

  // Fill the request info panel immediately, so user sees what is going out
  methodEl.textContent = ep.method;
  urlEl.textContent = previewUrl;
  if (body !== undefined) {
    bodyRow.style.display = "";
    bodyEl.textContent = (typeof body === "string")
      ? body
      : JSON.stringify(body, null, 2);
  } else {
    bodyRow.style.display = "none";
    bodyEl.textContent = "";
  }
  durEl.textContent = "…";
  infoPanel.classList.remove("hidden");

  out.innerHTML = "<code>Anfrage wird gesendet…</code>";
  statusPill.textContent = "…";
  statusPill.className = "pill pill-neutral";
  timeEl.textContent = "";

  const startedAt = performance.now();
  let resp;
  try {
    resp = await fetch("/api/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseUrl: state.settings.baseUrl,
        apiKey: state.settings.apiKey,
        authHeader: state.settings.authHeader,
        authStyle: state.settings.authStyle,
        method: ep.method,
        path: path,
        query: query,
        body: body
      })
    });
  } catch (e) {
    out.innerHTML = `<code>Netzwerkfehler: ${escapeHtml(e.message)}</code>`;
    statusPill.textContent = "ERR";
    statusPill.className = "pill pill-error";
    durEl.textContent = "—";
    return;
  }
  const dur = (performance.now() - startedAt).toFixed(0);
  const data = await resp.json();

  // If the proxy returned the real final URL (e.g. with query string), prefer it
  if (data.url) urlEl.textContent = data.url;

  // Status pill reflects upstream status code if proxy succeeded
  const upstream = data.status;
  if (typeof upstream === "number") {
    statusPill.textContent = String(upstream);
    if (upstream >= 200 && upstream < 300) statusPill.className = "pill pill-ok";
    else if (upstream >= 400) statusPill.className = "pill pill-error";
    else statusPill.className = "pill pill-warn";
  } else {
    statusPill.textContent = "ERR";
    statusPill.className = "pill pill-error";
  }
  timeEl.textContent = dur + " ms";
  durEl.textContent = dur + " ms";

  let display;
  if (data.json !== undefined) {
    display = highlightJson(JSON.stringify(data.json, null, 2));
  } else if (data.text !== undefined) {
    display = escapeHtml(data.text);
  } else {
    display = highlightJson(JSON.stringify(data, null, 2));
  }
  out.innerHTML = `<code>${display}</code>`;
}

function buildPreviewUrl(baseUrl, path, query) {
  let url = (baseUrl || "").replace(/\/+$/, "") + path;
  const entries = Object.entries(query || {}).filter(([, v]) => v !== "" && v != null);
  if (entries.length) {
    const qs = entries
      .map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v))
      .join("&");
    url += (url.includes("?") ? "&" : "?") + qs;
  }
  return url;
}

// ---------- Helpers ----------
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightJson(json) {
  json = escapeHtml(json);
  return json.replace(
    /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match, key, str, bool, num) => {
      if (key) return `<span class="tok-key">${key}</span>`;
      if (str) return `<span class="tok-str">${str}</span>`;
      if (bool) return `<span class="tok-${bool === "null" ? "null" : "bool"}">${bool}</span>`;
      if (num) return `<span class="tok-num">${num}</span>`;
      return match;
    }
  );
}

// ---------- Settings modal ----------
function openModal() {
  document.getElementById("cfg-baseUrl").value = state.settings.baseUrl;
  document.getElementById("cfg-apiKey").value = state.settings.apiKey;
  document.getElementById("cfg-authStyle").value = state.settings.authStyle;
  document.getElementById("cfg-authHeader").value = state.settings.authHeader;
  toggleAuthHeaderField();
  document.getElementById("cfg-test-result").textContent = "";
  document.getElementById("settings-modal").classList.remove("hidden");
}
function closeModal() {
  document.getElementById("settings-modal").classList.add("hidden");
}

function toggleAuthHeaderField() {
  const style = document.getElementById("cfg-authStyle").value;
  document.getElementById("auth-header-field").style.display = style === "header" ? "" : "none";
}

async function testConnection() {
  const baseUrl = document.getElementById("cfg-baseUrl").value.trim();
  const apiKey = document.getElementById("cfg-apiKey").value.trim();
  const authStyle = document.getElementById("cfg-authStyle").value;
  const authHeader = document.getElementById("cfg-authHeader").value.trim() || "X-API-Key";
  const result = document.getElementById("cfg-test-result");
  result.textContent = "Teste…";
  result.className = "muted small";

  if (!baseUrl) {
    result.textContent = "Bitte Base URL angeben.";
    return;
  }
  try {
    // We use the balance endpoint with a non-existent card as ping.
    // If reachable, we should get a 4xx response (auth/validation) rather than network error.
    const resp = await fetch("/api/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseUrl, apiKey, authStyle, authHeader,
        method: "GET",
        path: "/v1/customers/check-balance/__PING__"
      })
    });
    const data = await resp.json();
    if (typeof data.status === "number") {
      result.textContent = `OK · Server antwortete mit HTTP ${data.status}`;
      result.style.color = (data.status >= 200 && data.status < 500) ? "var(--success)" : "var(--warning)";
    } else if (data.error) {
      result.textContent = `Fehler: ${data.error}`;
      result.style.color = "var(--error)";
    }
  } catch (e) {
    result.textContent = "Netzwerkfehler: " + e.message;
    result.style.color = "var(--error)";
  }
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  renderSidebar();
  refreshConnectionPill();

  document.getElementById("open-settings").addEventListener("click", openModal);
  document.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", closeModal));

  document.getElementById("cfg-authStyle").addEventListener("change", toggleAuthHeaderField);
  document.getElementById("cfg-save").addEventListener("click", () => {
    const s = {
      baseUrl: document.getElementById("cfg-baseUrl").value.trim(),
      apiKey: document.getElementById("cfg-apiKey").value.trim(),
      authStyle: document.getElementById("cfg-authStyle").value,
      authHeader: document.getElementById("cfg-authHeader").value.trim() || "X-API-Key"
    };
    saveSettings(s);
    closeModal();
  });
  document.getElementById("cfg-test").addEventListener("click", testConnection);
  document.getElementById("toggle-key").addEventListener("click", () => {
    const i = document.getElementById("cfg-apiKey");
    i.type = i.type === "password" ? "text" : "password";
  });
  document.getElementById("send-btn").addEventListener("click", send);
  document.getElementById("copy-response").addEventListener("click", async () => {
    const text = document.getElementById("response-output").innerText;
    try {
      await navigator.clipboard.writeText(text);
      const pill = document.getElementById("response-status");
      const old = pill.textContent;
      pill.textContent = "kopiert!";
      setTimeout(() => (pill.textContent = old), 1200);
    } catch (e) {}
  });

  // Select the first endpoint by default
  if (ENDPOINTS.length) selectEndpoint(ENDPOINTS[0].id);

  // If no api key yet, open settings modal automatically
  if (!state.settings.apiKey) {
    setTimeout(openModal, 300);
  }
});
