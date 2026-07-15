import patchesData from '../../data/patches.json' with { type: 'json' };
import { API_BASE, getDetectedPatchDate, getRiotVersion } from '../../services/api.js';
import { getSplashUrl, loadSplashWithFallback } from '../../services/images.js';
import { refreshVersionDisplay } from '../../services/version-sync.js';

export function updateHeroStats(champions, version) {
  const total = champions.length;
  document.getElementById("stat-total").textContent = total;
  updateVersionDisplay(version);

  const updateEl = document.getElementById("stat-update");
  if (updateEl) {
    updateEl.textContent = patchesData[version] || getDetectedPatchDate(version) || "—";
  }

  refreshVersionDisplay();

  const splash = document.getElementById("hero-splash");
  if (splash && champions.length) {
    const pick = champions[Math.floor(Math.random() * champions.length)];
    const primaryUrl = getSplashUrl(pick.id, 0, { variant: "centered", prefer: "cd" });
    const fallbackUrl = `${API_BASE}/cdn/img/champion/splash/${pick.id}_0.jpg`;
    loadSplashWithFallback({
      primaryUrl,
      fallbackUrl,
      onLoaded: (resolvedUrl) => {
        splash.style.backgroundImage = `url(${resolvedUrl})`;
        splash.classList.add("loaded");
        const credit = document.getElementById("hero-credit");
        if (credit) {
          credit.textContent = `${pick.name} — ${pick.title}`;
          credit.classList.add("visible");
        }
      },
      onAllFailed: () => splash.classList.add("loaded")
    });
  }
}

export function updateVersionDisplay(version) {
  const el = document.getElementById("stat-version");
  if (el) el.textContent = getRiotVersion(version) || version || "—";
}
