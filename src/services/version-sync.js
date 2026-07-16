import { getRiotVersion, recordPatchDate, getDetectedPatchDate, fetchVersions } from './api.js';
import patchesData from '../data/patches.json' with { type: 'json' };

export async function refreshVersionDisplay() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  try {
    const versions = await fetchVersions();
    const latest = versions && versions[0];
    if (!latest) return;

    const versionEl = document.getElementById('stat-version');
    if (versionEl) {
      versionEl.textContent = getRiotVersion(latest) || latest;
    }

    const updateEl = document.getElementById('stat-update');
    if (updateEl && !patchesData[latest]) {
      recordPatchDate(latest);
      updateEl.textContent = getDetectedPatchDate(latest) || '—';
    } else if (updateEl && patchesData[latest]) {
      updateEl.textContent = patchesData[latest];
    }
  } catch {
    // Falha silenciosa: fluxo principal do loadChampions ainda roda em paralelo
  }
}
