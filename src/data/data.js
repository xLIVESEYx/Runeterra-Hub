import { loadChampionsData, getCachedChampions, cacheChampions, getLatestVersion, isOnline } from '../services/api.js';
import { updateHeroStats } from '../components/stats/stats.js';
import { createChampionCard } from '../components/card/card.js';

function renderChampions(grid, champions, version) {
  updateHeroStats(champions, version);
  grid.innerHTML = "";
  champions.forEach(champ => {
    grid.appendChild(createChampionCard(champ));
  });
}

function showLoader(grid, message) {
  grid.innerHTML = `
    <div class="loader">
      <div class="loader-spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

function showError(grid, message) {
  grid.innerHTML = `
    <p class="error-msg">${message}</p>
  `;
}

export async function loadChampions() {
  const grid = document.querySelector(".grid");
  if (!grid) return;

  const cached = getCachedChampions();
  let rendered = false;

  if (cached && cached.champions && cached.champions.length) {
    renderChampions(grid, cached.champions, cached.version);
    rendered = true;
  } else {
    showLoader(grid, "Conectando-se ao Nexus...");
  }

  if (!isOnline()) {
    if (!rendered) {
      showError(grid, "Você está offline. Conecte-se à internet para convocar os campeões.");
    }
    return;
  }

  try {
    const latestVersion = await getLatestVersion();
    if (cached && cached.version === latestVersion) return;

    const { champions, version } = await loadChampionsData(latestVersion);
    cacheChampions(version, champions);
    renderChampions(grid, champions, version);
  } catch (e) {
    console.error(e);
    if (!rendered) {
      showError(grid, "Nossos batedores falharam. Erro ao convocar campeões do servidor.");
    }
  }
}
