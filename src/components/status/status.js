import { checkApiStatus, isOnline } from '../../services/api.js';

const STATE_LABELS = {
  online: "online",
  degraded: "instável",
  offline: "offline",
  cached: "cache",
};

const STATE_CLASSES = {
  online: "is-online",
  degraded: "is-degraded",
  offline: "is-offline",
  cached: "is-cached",
};

const SOURCES = [
  { key: "ddragon", elId: "api-status-dd", labelId: "api-status-label-dd" },
  { key: "cdragon", elId: "api-status-cd", labelId: "api-status-label-cd" },
];

let monitors = [];
let monitorTimer = null;

function setStatus(stateEl, labelEl, state) {
  if (!stateEl) return;
  stateEl.classList.remove("is-online", "is-degraded", "is-offline", "is-cached");
  stateEl.classList.add(STATE_CLASSES[state] || "is-cached");
  if (labelEl) labelEl.textContent = STATE_LABELS[state] || "—";
}

async function refresh() {
  if (!isOnline()) {
    monitors.forEach(m => setStatus(m.statusEl, m.labelEl, "cached"));
    return;
  }
  monitors.forEach(m => setStatus(m.statusEl, m.labelEl, "degraded"));

  const { sources } = await checkApiStatus();
  monitors.forEach(m => {
    const ok = sources && sources[m.key];
    setStatus(m.statusEl, m.labelEl, ok ? "online" : "offline");
  });
}

export function initStatusMonitor() {
  monitors = SOURCES.map(s => ({
    key: s.key,
    statusEl: document.getElementById(s.elId),
    labelEl: document.getElementById(s.labelId),
  })).filter(m => m.statusEl);

  if (!monitors.length) return;

  monitors.forEach(m => setStatus(m.statusEl, m.labelEl, "cached"));
  refresh();
  monitorTimer = setInterval(refresh, 60000);

  window.addEventListener("online", refresh);
  window.addEventListener("offline", () => {
    monitors.forEach(m => setStatus(m.statusEl, m.labelEl, "cached"));
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refresh();
  });
}
