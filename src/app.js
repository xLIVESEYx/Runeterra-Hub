import { initParticles } from './components/particles/particles.js';
import { initUI } from './components/ui/ui.js';
import { loadChampions } from './data/data.js';
import { initStatusMonitor } from './components/status/status.js';
import { refreshVersionDisplay } from './services/version-sync.js';

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initUI();
  loadChampions();
  initStatusMonitor();
  refreshVersionDisplay();
});

window.addEventListener('online', loadChampions);
