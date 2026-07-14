import patchesData from '../../data/patches.json' with { type: 'json' };
import { API_BASE, getDetectedPatchDate, getRiotVersion } from '../../services/api.js';

export function updateHeroStats(champions, version) {
  const total = champions.length;
  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-version").textContent = getRiotVersion(version) || version;

  const updateEl = document.getElementById("stat-update");
  if (updateEl) {
    updateEl.textContent = patchesData[version] || getDetectedPatchDate(version) || "—";
  }

  const splash = document.getElementById("hero-splash");
  if (splash && champions.length) {
    const pick = champions[Math.floor(Math.random() * champions.length)];
    const preload = new Image();
    const url = `${API_BASE}/cdn/img/champion/splash/${pick.id}_0.jpg`;
    preload.onload = () => {
      splash.style.backgroundImage = `url(${url})`;
      splash.classList.add("loaded");
      const credit = document.getElementById("hero-credit");
      if (credit) {
        credit.textContent = `${pick.name} — ${pick.title}`;
        credit.classList.add("visible");
      }
    };
    preload.onerror = () => splash.classList.add("loaded");
    preload.src = url;
  }
}
