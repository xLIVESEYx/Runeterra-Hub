import { initParticles } from './components/particles/particles.js';
import { initUI } from './components/ui/ui.js';
import { loadChampions } from './data/data.js';
import { initStatusMonitor } from './components/status/status.js';

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initUI();
  loadChampions();
  initStatusMonitor();
});

window.addEventListener('online', loadChampions);
