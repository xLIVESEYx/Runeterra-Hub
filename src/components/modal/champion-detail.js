import { API_BASE, loadChampionDetail, getCachedVersion, getLatestVersion } from '../../services/api.js';
import { TAG_LABELS } from '../shared/utils.js';
import { getSplashUrl, loadSplashWithFallback, getProfileIconUrl, getPassiveUrl, getSpellUrl, getLoadingUrl } from '../../services/images.js';
import { closeModal } from './modal.js';
import { openSkinLightbox } from './lightbox.js';
import { getCloseToken } from './modal-state.js';

let activeRequestId = 0;

export async function openModal(id) {
  if (document.querySelector(".modal")) {
    closeModal();
  }

  const myRequestId = ++activeRequestId;
  const startCloseToken = getCloseToken();

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

    if (myRequestId !== activeRequestId || startCloseToken !== getCloseToken()) return;

    const version = getCachedVersion() || await getLatestVersion();

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

    const headerPrimaryUrl = getSplashUrl(detail.id, 0, { variant: "centered", prefer: "cd" });
    const headerFallbackUrl = `${API_BASE}/cdn/img/champion/splash/${detail.id}_0.jpg`;
    loadSplashWithFallback({
      primaryUrl: headerPrimaryUrl,
      fallbackUrl: headerFallbackUrl,
      onLoaded: (resolvedUrl) => {
        header.style.backgroundImage = `url(${resolvedUrl})`;
      }
    });

    const headerOverlay = document.createElement("div");
    headerOverlay.className = "modal-header-overlay";

    const headerContent = document.createElement("div");
    headerContent.className = "modal-header-content";

    const profileImg = document.createElement("img");
    profileImg.className = "modal-profile-img";
    profileImg.src = getProfileIconUrl(version, detail.id);
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
          <img src="${getPassiveUrl(version, pass.image.full)}" alt="${pass.name}">
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
          <img src="${getSpellUrl(version, spell.image.full)}" alt="${spell.name}">
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
      img.src = getLoadingUrl(detail.id, skin.num);
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
    if (myRequestId !== activeRequestId || startCloseToken !== getCloseToken()) return;
    console.error(err);
    const lm = document.querySelector(".modal");
    if (lm) lm.remove();
    document.body.style.overflow = "";
    alert("Erro nas conexões de Runeterra Hub. Tente invocar o campeão novamente.");
  }
}
