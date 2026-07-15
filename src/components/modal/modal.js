import { API_BASE, loadChampionDetail, getCachedVersion } from '../../services/api.js';
import { TAG_LABELS } from '../shared/utils.js';

let currentSkinsList = [];
let currentSkinIndex = 0;

export function closeModal() {
  const modal = document.querySelector(".modal");
  if (modal) {
    modal.classList.add("fade-out");
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = "";
    }, 250);
  }
}

export function closeLightbox() {
  const lb = document.querySelector(".lightbox-modal");
  if (lb) {
    lb.remove();
    document.body.style.overflow = "";
  }
}

export function openSkinLightbox(skins, startIndex) {
  currentSkinsList = skins;
  currentSkinIndex = startIndex;

  const lb = document.createElement("div");
  lb.className = "lightbox-modal";

  lb.innerHTML = `
    <div class="lightbox-overlay"></div>
    <div class="lightbox-vignette"></div>
    <button class="lightbox-close" aria-label="Fechar Lightbox" title="Fechar (Esc)">
      <svg viewBox="0 0 22 22" aria-hidden="true">
        <line x1="4" y1="4" x2="18" y2="18"/>
        <line x1="18" y1="4" x2="4" y2="18"/>
      </svg>
    </button>

    <div class="lightbox-container">
      <button class="lightbox-btn lightbox-prev" aria-label="Anterior">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="lightbox-image-wrapper">
        <img class="lightbox-img" src="" alt="Skin Splash">
        <div class="lightbox-loader"></div>
      </div>
      <button class="lightbox-btn lightbox-next" aria-label="Próxima">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>

    <div class="lightbox-caption">
      <h3 class="lightbox-title"></h3>
      <span class="lightbox-counter"></span>
    </div>
  `;

  document.body.appendChild(lb);
  document.body.style.overflow = "hidden";

  const img = lb.querySelector(".lightbox-img");
  const loader = lb.querySelector(".lightbox-loader");
  const title = lb.querySelector(".lightbox-title");
  const counter = lb.querySelector(".lightbox-counter");

  function updateLightbox() {
    const skin = currentSkinsList[currentSkinIndex];
    if (!skin) return;

    loader.style.display = "block";
    img.style.opacity = "0";

    img.src = `${API_BASE}/cdn/img/champion/splash/${skin.champId}_${skin.num}.jpg`;
    img.alt = skin.name;

    img.onload = () => {
      loader.style.display = "none";
      img.style.opacity = "1";
    };

    title.textContent = skin.name;
    counter.textContent = `${currentSkinIndex + 1} de ${currentSkinsList.length}`;
  }

  const prev = () => {
    currentSkinIndex = (currentSkinIndex - 1 + currentSkinsList.length) % currentSkinsList.length;
    updateLightbox();
  };

  const next = () => {
    currentSkinIndex = (currentSkinIndex + 1) % currentSkinsList.length;
    updateLightbox();
  };

  lb.querySelector(".lightbox-prev").addEventListener("click", prev);
  lb.querySelector(".lightbox-next").addEventListener("click", next);
  lb.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lb.querySelector(".lightbox-overlay").addEventListener("click", closeLightbox);

  const lbKeyHandler = (e) => {
    if (!document.body.contains(lb)) {
      document.removeEventListener("keydown", lbKeyHandler);
      return;
    }
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape") closeLightbox();
  };
  document.addEventListener("keydown", lbKeyHandler);

  updateLightbox();
}

export async function openModal(id) {
  try {
    const loadingModal = document.createElement("div");
    loadingModal.className = "modal";
    loadingModal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-wrapper min-load">
        <div class="loader">
          <div class="loader-spinner"></div>
          <p>Invocando runas de ${id}...</p>
        </div>
      </div>
    `;
    document.body.appendChild(loadingModal);
    document.body.style.overflow = "hidden";

    const detail = await loadChampionDetail(id);
    loadingModal.remove();

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal") || e.target.classList.contains("modal-backdrop")) {
        closeModal();
      }
    });

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";

    const wrapper = document.createElement("div");
    wrapper.className = "modal-wrapper";

    const closeBtn = document.createElement("button");
    closeBtn.className = "modal-close";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Fechar detalhes");
    closeBtn.title = "Fechar (Esc)";
    closeBtn.innerHTML = `
      <svg viewBox="0 0 22 22" aria-hidden="true">
        <line x1="4" y1="4" x2="18" y2="18"/>
        <line x1="18" y1="4" x2="4" y2="18"/>
      </svg>
    `;
    closeBtn.addEventListener("click", closeModal);

    const header = document.createElement("div");
    header.className = "modal-header";
    header.style.backgroundImage = `url(${API_BASE}/cdn/img/champion/splash/${detail.id}_0.jpg)`;

    const headerOverlay = document.createElement("div");
    headerOverlay.className = "modal-header-overlay";

    const headerContent = document.createElement("div");
    headerContent.className = "modal-header-content";

    const profileImg = document.createElement("img");
    profileImg.className = "modal-profile-img";
    const version = getCachedVersion();
    profileImg.src = `${API_BASE}/cdn/${version}/img/champion/${detail.id}.png`;
    profileImg.alt = detail.name;

    const headerMeta = document.createElement("div");
    headerMeta.className = "modal-header-meta";

    const name = document.createElement("h1");
    name.className = "modal-champ-name";
    name.textContent = detail.name;

    const title = document.createElement("p");
    title.className = "modal-champ-title";
    title.textContent = detail.title;

    const badgesContainer = document.createElement("div");
    badgesContainer.className = "modal-badges";

    const diffContainer = document.createElement("div");
    diffContainer.className = "modal-diff-container";
    diffContainer.innerHTML = `<span class="meta-label">Dificuldade:</span>`;
    const stars = document.createElement("div");
    stars.className = "difficulty-stars";
    const difficultyValue = (detail.info && detail.info.difficulty) || 0;
    stars.style.setProperty("--diff", difficultyValue);
    stars.textContent = "☆☆☆☆☆";
    stars.setAttribute("aria-label", `Dificuldade: ${difficultyValue}/10`);
    diffContainer.appendChild(stars);

    (detail.tags || []).forEach(tag => {
      const b = document.createElement("span");
      b.className = "modal-tag-badge";
      b.textContent = TAG_LABELS[tag] || tag;
      badgesContainer.appendChild(b);
    });

    headerMeta.append(name, title, diffContainer, badgesContainer);
    headerContent.append(profileImg, headerMeta);
    header.append(headerOverlay, headerContent);

    const mainBody = document.createElement("div");
    mainBody.className = "modal-body";

    const tabs = document.createElement("div");
    tabs.className = "tabs-container";

    const tabsHeader = document.createElement("div");
    tabsHeader.className = "tabs-header";

    const tContent = document.createElement("div");
    tContent.className = "tabs-body-content";

    const tabConfigs = [
      { key: "lore", label: "Lore", icon: "📜" },
      { key: "abilities", label: "Habilidades", icon: "⚡" },
      { key: "skins", label: "Skins & Artes", icon: "🎨" }
    ];

    const tabButtons = {};
    const tabPanels = {};

    tabConfigs.forEach((tab, index) => {
      const btn = document.createElement("button");
      btn.className = `tab-btn ${index === 0 ? "active" : ""}`;
      btn.innerHTML = `<span>${tab.icon}</span> ${tab.label}`;
      tabsHeader.appendChild(btn);
      tabButtons[tab.key] = btn;

      const panel = document.createElement("div");
      panel.className = `tab-panel ${index === 0 ? "active" : ""}`;
      tContent.appendChild(panel);
      tabPanels[tab.key] = panel;

      btn.addEventListener("click", () => {
        Object.values(tabButtons).forEach(b => b.classList.remove("active"));
        Object.values(tabPanels).forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        panel.classList.add("active");
      });
    });

    const lorePanel = tabPanels["lore"];
    lorePanel.innerHTML = `
      <div class="lore-grid">
        <div class="lore-text">
          <h2>A história de ${detail.name}</h2>
          <p>${detail.lore || detail.blurb}</p>
        </div>
        <div class="champion-sidebar-info">
          <h3>Estatísticas Básicas</h3>
          <ul class="stats-list">
            <li><span>Vida:</span> <strong>${detail.stats.hp} (+${detail.stats.hpperlevel}/lvl)</strong></li>
            <li><span>Dano de Ataque:</span> <strong>${detail.stats.attackdamage} (+${detail.stats.attackdamageperlevel}/lvl)</strong></li>
            <li><span>Armadura:</span> <strong>${detail.stats.armor} (+${detail.stats.armorperlevel}/lvl)</strong></li>
            <li><span>Resistência Mágica:</span> <strong>${detail.stats.spellblock} (+${detail.stats.spellblockperlevel}/lvl)</strong></li>
            <li><span>Alcance:</span> <strong>${detail.stats.attackrange}</strong></li>
            <li><span>Velocidade de Mov.:</span> <strong>${detail.stats.movespeed}</strong></li>
          </ul>
        </div>
      </div>
    `;

    const abPanel = tabPanels["abilities"];
    abPanel.innerHTML = `<h2>Habilidades de Combate</h2>`;
    const abilitiesGrid = document.createElement("div");
    abilitiesGrid.className = "abilities-detail-grid";

    if (detail.passive) {
      const pass = detail.passive;
      const passCard = document.createElement("div");
      passCard.className = "ability-detail-card";
      passCard.innerHTML = `
        <div class="ability-img-wrap">
          <img src="${API_BASE}/cdn/${version}/img/passive/${pass.image.full}" alt="${pass.name}">
          <span class="ability-letter passive">P</span>
        </div>
        <div class="ability-desc-wrap">
          <h4>${pass.name}</h4>
          <p class="ability-description-txt">${pass.description}</p>
        </div>
      `;
      abilitiesGrid.appendChild(passCard);
    }

    const spellKeys = ["Q", "W", "E", "R"];
    (detail.spells || []).forEach((spell, i) => {
      const spellCard = document.createElement("div");
      spellCard.className = "ability-detail-card";

      const costText = spell.costBurn ? `${spell.costBurn} ${detail.partype || "Mana"}` : "Sem custo";
      const cdText = spell.cooldownBurn ? `${spell.cooldownBurn}s Cooldown` : "Sem tempo de recarga";

      spellCard.innerHTML = `
        <div class="ability-img-wrap">
          <img src="${API_BASE}/cdn/${version}/img/spell/${spell.image.full}" alt="${spell.name}">
          <span class="ability-letter">${spellKeys[i]}</span>
        </div>
        <div class="ability-desc-wrap">
          <div class="ability-desc-header">
            <h4>${spell.name}</h4>
            <div class="ability-meta-tags">
              <span class="meta-tag cost">${costText}</span>
              <span class="meta-tag cd">⌛ ${cdText}</span>
            </div>
          </div>
          <p class="ability-description-txt">${spell.description}</p>
        </div>
      `;
      abilitiesGrid.appendChild(spellCard);
    });
    abPanel.appendChild(abilitiesGrid);

    const skinsPanel = tabPanels["skins"];
    skinsPanel.innerHTML = `
      <div class="skins-tab-header">
        <h2>Skins Disponíveis</h2>
        <p>Clique em qualquer skin para abrir a ilustração oficial em tela cheia (alta resolução).</p>
      </div>
    `;

    const skinsWrapper = document.createElement("div");
    skinsWrapper.className = "modal-skins-container";

    const filteredSkins = (detail.skins || []).filter(s =>
      typeof s.num === 'number' && s.num >= 0 && !s.parentSkin
    );
    const validLightboxSkins = [];

    filteredSkins.forEach(skin => {
      const skinName = skin.name === "default" ? "Clássica" : skin.name;
      const card = document.createElement("div");
      card.className = "modal-skin-card skeleton";

      const entry = {
        name: `${detail.name} - ${skinName}`,
        num: skin.num,
        champId: detail.id,
        broken: false
      };
      validLightboxSkins.push(entry);

      const cardInner = document.createElement("div");
      cardInner.className = "modal-skin-card-inner";

      const img = document.createElement("img");
      img.src = `${API_BASE}/cdn/img/champion/loading/${detail.id}_${skin.num}.jpg`;
      img.alt = skinName;
      img.loading = "lazy";

      img.onload = () => {
        card.classList.remove("skeleton");
      };

      img.onerror = () => {
        card.remove();
        entry.broken = true;
      };

      const titleEl = document.createElement("p");
      titleEl.className = "modal-skin-card-title";
      titleEl.textContent = skinName;

      const overlay = document.createElement("div");
      overlay.className = "modal-skin-overlay";
      overlay.innerHTML = `
        <span class="zoom-icon">🔍</span>
        <span class="zoom-lbl">Ampliar Arte</span>
      `;

      cardInner.append(img, overlay, titleEl);
      card.appendChild(cardInner);
      skinsWrapper.appendChild(card);

      card.addEventListener("click", () => {
        if (entry.broken) return;
        const realIdx = validLightboxSkins
          .filter(v => !v.broken)
          .findIndex(v => v.num === skin.num);
        if (realIdx > -1) {
          openSkinLightbox(validLightboxSkins.filter(v => !v.broken), realIdx);
        }
      });
    });

    skinsPanel.appendChild(skinsWrapper);

    tabs.append(tabsHeader, tContent);
    mainBody.appendChild(tabs);
    wrapper.append(header, mainBody);
    modal.append(backdrop, wrapper, closeBtn);
    document.body.appendChild(modal);

  } catch (err) {
    console.error(err);
    const loadingModal = document.querySelector(".modal");
    if (loadingModal) loadingModal.remove();
    document.body.style.overflow = "";
    alert("Erro nas conexões de Runeterra Hub. Tente invocar o campeão novamente.");
  }
}
