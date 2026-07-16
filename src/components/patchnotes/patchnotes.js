import { getRecentVersions, getRiotVersion, isOnline, getCachedChampions } from '../../services/api.js';
import patchesData from '../../data/patches.json' with { type: 'json' };

const PATCH_NOTES_LIMIT = 12;
const PATCH_LANG = 'pt-BR';
const PATCH_LANG_URL = 'pt-br';
const PATCH_INDEX_URL = `https://www.leagueoflegends.com/${PATCH_LANG_URL}/news/tags/patch-notes/`;

let patchModal = null;

function buildUrl(version) {
  const riotVer = getRiotVersion(version) || version;
  const [major, minor] = riotVer.split('.');
  return `https://www.leagueoflegends.com/${PATCH_LANG_URL}/news/game-updates/league-of-legends-patch-${major}-${minor}-notes/`;
}

function closePatchModal() {
  if (!patchModal) return;
  patchModal.classList.add('fade-out');
  setTimeout(() => {
    if (patchModal) {
      patchModal.remove();
      patchModal = null;
    }
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
  }, 250);
}

function onKey(e) {
  if (e.key === 'Escape') closePatchModal();
}

function renderError(body, message) {
  body.innerHTML = `
    <p class="patchnotes-error">
      <span class="patchnotes-error-icon">⚠</span>
      ${message}
    </p>
  `;
}

function renderList(body, versions, currentVersion) {
  body.innerHTML = `
    <div class="patchnotes-intro">
      <h2 class="patchnotes-title">Notas das Atualizações</h2>
      <p class="patchnotes-subtitle">Mudanças detalhadas de cada patch no site oficial da Riot Games. Datas sincronizadas via CI.</p>
    </div>
    <ul class="patchnotes-list" id="patchnotes-list"></ul>
  `;

  const list = body.querySelector('#patchnotes-list');
  versions.forEach((version) => {
    const isCurrent = version === currentVersion;
    const riotVer = getRiotVersion(version) || version;
    const date = patchesData[version];
    const item = document.createElement('li');
    item.className = 'patchnotes-item' + (isCurrent ? ' patchnotes-item-current' : '');
    item.innerHTML = `
      <div class="patchnotes-item-info">
        <span class="patchnotes-item-version">Notas da Atualização ${riotVer}</span>
        ${date ? `<span class="patchnotes-item-date">${date}</span>` : ''}
        ${isCurrent ? '<span class="patchnotes-item-badge">Atual</span>' : ''}
      </div>
      <a class="patchnotes-item-link" href="${buildUrl(version)}" target="_blank" rel="noopener noreferrer">
        <span>Abrir página oficial</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 17L17 7M9 7h8v8"/>
        </svg>
      </a>
    `;
    list.appendChild(item);
  });
}

export function openPatchNotesModal() {
  if (patchModal) {
    patchModal.remove();
    patchModal = null;
  }

  const modal = document.createElement('div');
  patchModal = modal;
  modal.className = 'modal patchnotes-modal';
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
      closePatchModal();
    }
  });

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const wrapper = document.createElement('div');
  wrapper.className = 'modal-wrapper patchnotes-wrapper';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Fechar patch notes');
  closeBtn.title = 'Fechar (Esc)';
  closeBtn.innerHTML = `
    <svg viewBox="0 0 22 22" aria-hidden="true">
      <line x1="4" y1="4" x2="18" y2="18"/>
      <line x1="18" y1="4" x2="4" y2="18"/>
    </svg>
  `;
  closeBtn.addEventListener('click', closePatchModal);

  const header = document.createElement('div');
  header.className = 'patchnotes-header';
  header.innerHTML = `
    <span class="patchnotes-header-mark">◆</span>
    <div class="patchnotes-header-info">
      <h2 class="patchnotes-header-title">Patch Notes</h2>
      <p class="patchnotes-header-lang">League of Legends · ${PATCH_LANG}</p>
    </div>
    <a class="patchnotes-index-link" href="${PATCH_INDEX_URL}" target="_blank" rel="noopener noreferrer" title="Abrir índice oficial completo">
      <span>Índice completo</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M7 17L17 7M9 7h8v8"/>
      </svg>
    </a>
  `;

  const body = document.createElement('div');
  body.className = 'modal-body patchnotes-body';

  if (!isOnline()) {
    renderError(body, 'Você está offline. Conecte-se à internet para acessar as notas de atualização.');
  } else {
    body.innerHTML = `
      <div class="loader">
        <div class="loader-spinner"></div>
        <p>Consultando arquivos de Runeterra…</p>
      </div>
    `;
    getRecentVersions(PATCH_NOTES_LIMIT)
      .then((versions) => {
        const cached = getCachedChampions();
        const current = cached ? cached.version : null;
        renderList(body, versions, current);
      })
      .catch((err) => {
        console.error(err);
        renderError(body, 'Não foi possível carregar a lista de versões. Tente novamente em instantes.');
      });
  }

  wrapper.append(header, body);
  modal.append(backdrop, wrapper, closeBtn);
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', onKey);
}

export function setupPatchNotes() {
  document.querySelectorAll('[data-patchnotes-trigger]').forEach((el) => {
    el.addEventListener('click', openPatchNotesModal);
  });
}

