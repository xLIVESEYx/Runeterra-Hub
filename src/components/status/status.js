import { checkApiStatus, isOnline } from '../../services/api.js';

const STATE_LABELS = {
  online: "APIs online",
  degraded: "API instável",
  offline: "APIs offline",
  cached: "Modo cache",
};

const STATE_CLASSES = {
  online: "is-online",
  degraded: "is-degraded",
  offline: "is-offline",
  cached: "is-cached",
};

let statusEl = null;
let labelEl = null;
let monitorTimer = null;

function setStatus(state) {
  if (!statusEl) return;
  statusEl.classList.remove("is-online", "is-degraded", "is-offline", "is-cached");
  statusEl.classList.add(STATE_CLASSES[state] || "is-cached");
  if (labelEl) labelEl.textContent = STATE_LABELS[state] || "—";
}

async function refresh() {
  if (!statusEl) return;
  if (!isOnline()) {
    setStatus("cached");
    return;
  }
  setStatus("degraded");
  const { state } = await checkApiStatus();
  setStatus(state);
}

export function initStatusMonitor() {
  statusEl = document.getElementById("api-status");
  labelEl = document.getElementById("api-status-label");
  if (!statusEl) return;

  setStatus("cached");
  refresh();
  monitorTimer = setInterval(refresh, 60000);

  window.addEventListener("online", refresh);
  window.addEventListener("offline", () => setStatus("cached"));
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refresh();
  });
}
