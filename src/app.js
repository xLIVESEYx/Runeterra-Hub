/* app.js – Modern cinematic League of Legends Champion Hub */
const API_BASE = "https://ddragon.leagueoflegends.com";

// Store globally for quick access
let latestVersion = "13.24.1"; // Fallback latest, will be fetched dynamically
let allChampions = [];
let currentSkinsList = [];
let currentSkinIndex = 0;

/** Fetch JSON utility with error handling */
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
}

/** Debounce utility */
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/** Particles background animation (Premium golden/violet embers) */
function initParticles() {
  const canvas = document.getElementById("particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let particles = [];
  const COUNT = window.innerWidth < 768 ? 30 : 75;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function makeParticles() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: Math.random() * -0.4 - 0.1, // Float upward
      r: Math.random() * 2 + 0.4,
      a: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.4 ? "200, 155, 60" : "130, 90, 240", // Gold or Violet
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.a -= 0.0005; // slow fade

      // Recycle particles
      if (p.y < 0 || p.a <= 0) {
        p.y = canvas.height;
        p.x = Math.random() * canvas.width;
        p.a = Math.random() * 0.4 + 0.1;
      }
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.a})`;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); makeParticles(); }, 200);
  });

  resize();
  makeParticles();
  tick();
}

/** Create a champion card element with premium hover layouts */
function createChampionCard(champ) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = champ.id;
  card.dataset.tags = (champ.tags || []).join(",");

  // Champion card container
  const imgWrapper = document.createElement("div");
  imgWrapper.className = "card-img-wrapper";

  const img = document.createElement("img");
  img.src = `${API_BASE}/cdn/img/champion/loading/${champ.id}_0.jpg`; // Vertical card art
  img.alt = champ.name;
  img.loading = "lazy";
  imgWrapper.appendChild(img);

  // Magic overlay gradient
  const overlay = document.createElement("div");
  overlay.className = "card-overlay";

  // Content
  const content = document.createElement("div");
  content.className = "card-content";

  const tagText = (champ.tags || []).map(t => TAG_LABELS[t] || t).join(" · ");
  const roleSpan = document.createElement("span");
  roleSpan.className = "card-role";
  roleSpan.textContent = tagText;

  const name = document.createElement("h2");
  name.className = "card-name";
  name.textContent = champ.name;

  const title = document.createElement("p");
  title.className = "card-title";
  title.textContent = champ.title;

  const footer = document.createElement("div");
  footer.className = "card-footer";
  footer.innerHTML = `<span>Ver Detalhes</span><span class="card-footer-arrow">→</span>`;

  content.append(roleSpan, name, title, footer);
  card.append(imgWrapper, overlay, content);

  card.addEventListener("click", () => openModal(champ.id));
  return card;
}

/** Populate hero stats with a random splash */
function updateHeroStats(champions) {
  const total = champions.length;
  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-version").textContent = latestVersion;

  // Show the last-update date stored in localStorage (written during loadChampions)
  const storedDate = localStorage.getItem("lol_update_date");
  const updateEl = document.getElementById("stat-update");
  if (updateEl) {
    updateEl.textContent = storedDate || "—";
  }

  const splash = document.getElementById("hero-splash");
  if (splash && champions.length) {
    const pick = champions[Math.floor(Math.random() * champions.length)];
    // Pre-load the splash image so it fades in cleanly (no white flash)
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
    // Fallback: if the image fails, still reveal a faded state so the bg isn't blank
    preload.onerror = () => splash.classList.add("loaded");
    preload.src = url;
  }
}

/** Load all champions from DDragon */
async function loadChampions() {
  const grid = document.querySelector(".grid");
  grid.innerHTML = `
    <div class="loader">
      <div class="loader-spinner"></div>
      <p>Conectando-se ao Nexus...</p>
    </div>
  `;
  try {
    const versions = await fetchJSON(`${API_BASE}/api/versions.json`);
    latestVersion = versions[0];

    // Save the date this update was detected (DD/MM/AAAA) for the hero stats
    const today = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    localStorage.setItem("lol_update_date", today);

    const champList = await fetchJSON(`${API_BASE}/cdn/${latestVersion}/data/pt_BR/champion.json`);
    allChampions = Object.values(champList.data);

    updateHeroStats(allChampions);

    grid.innerHTML = "";
    allChampions.forEach(champ => grid.appendChild(createChampionCard(champ)));
  } catch (e) {
    console.error(e);
    grid.innerHTML = `
      <p class="error-msg">Nossos batedores falharam. Erro ao convocar campeões do servidor.</p>
    `;
  }
}

/** Fetch detailed data for a specific champion */
async function loadChampionDetail(id) {
  const data = await fetchJSON(`${API_BASE}/cdn/${latestVersion}/data/pt_BR/champion/${id}.json`);
  return data.data[id];
}

/** Portuguese label mappings */
const TAG_LABELS = {
  Fighter: "Lutador",
  Tank: "Tanque",
  Mage: "Mago",
  Assassin: "Assassino",
  Support: "Suporte",
  Marksman: "Atirador",
};

/** Close modal */
function closeModal() {
  const modal = document.querySelector(".modal");
  if (modal) {
    modal.classList.add("fade-out");
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = "";
    }, 250);
  }
}

/** Close lightbox and clean up */
function closeLightbox() {
  const lb = document.querySelector(".lightbox-modal");
  if (lb) {
    lb.remove();
    document.body.style.overflow = "";
  }
}

/** Open full widescreen Skin Lightbox */
function openSkinLightbox(skins, startIndex) {
  currentSkinsList = skins;
  currentSkinIndex = startIndex;

  // Build lightbox markup
  const lb = document.createElement("div");
  lb.className = "lightbox-modal";

  lb.innerHTML = `
    <div class="lightbox-overlay"></div>
    <div class="lightbox-vignette"></div>
    <button class="lightbox-close" aria-label="Fechar Lightbox">
      <svg viewBox="-1 -1 26 26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
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
  document.body.style.overflow = "hidden"; // Prevent scrolling behind

  const img = lb.querySelector(".lightbox-img");
  const loader = lb.querySelector(".lightbox-loader");
  const title = lb.querySelector(".lightbox-title");
  const counter = lb.querySelector(".lightbox-counter");

  function updateLightbox() {
    const skin = currentSkinsList[currentSkinIndex];
    if (!skin) return;

    loader.style.display = "block";
    img.style.opacity = "0";

    // Set widescreen splash URL
    img.src = `${API_BASE}/cdn/img/champion/splash/${skin.champId}_${skin.num}.jpg`;
    img.alt = skin.name;

    img.onload = () => {
      loader.style.display = "none";
      img.style.opacity = "1";
    };

    title.textContent = skin.name;
    counter.textContent = `${currentSkinIndex + 1} de ${currentSkinsList.length}`;
  }

  // Next / Prev actions
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

  // Keyboard navigation
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

/** Open champion details premium modal */
async function openModal(id) {
  // Spawn premium clean loading state immediately
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

  try {
    const detail = await loadChampionDetail(id);
    loadingModal.remove();

    // Spawn full screen modal structure
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

    // Close Button (Hextech Style)
    const closeBtn = document.createElement("button");
    closeBtn.className = "modal-close-btn";
    closeBtn.innerHTML = '<svg viewBox="-1 -1 26 26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    closeBtn.addEventListener("click", closeModal);

    // Dynamic Header (Panoramic Splash art with perfect fit)
    const header = document.createElement("div");
    header.className = "modal-header";
    header.style.backgroundImage = `url(${API_BASE}/cdn/img/champion/splash/${detail.id}_0.jpg)`;

    const headerOverlay = document.createElement("div");
    headerOverlay.className = "modal-header-overlay";

    const headerContent = document.createElement("div");
    headerContent.className = "modal-header-content";

    // Rounded profile picture
    const profileImg = document.createElement("img");
    profileImg.className = "modal-profile-img";
    profileImg.src = `${API_BASE}/cdn/${latestVersion}/img/champion/${detail.id}.png`;
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

    // Difficulty meter
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

    // Classes/Tags
    (detail.tags || []).forEach(tag => {
      const b = document.createElement("span");
      b.className = "modal-tag-badge";
      b.textContent = TAG_LABELS[tag] || tag;
      badgesContainer.appendChild(b);
    });

    headerMeta.append(name, title, diffContainer, badgesContainer);
    headerContent.append(profileImg, headerMeta);
    header.append(headerOverlay, headerContent);

    // Modal Grid Layout: 2-column detail grid
    const mainBody = document.createElement("div");
    mainBody.className = "modal-body";

    // Tabs container with classic Riot underline indicators
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

    // Populate Lore Tab
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

    // Populate Abilities Tab (rendering direct assets from DDragon)
    const abPanel = tabPanels["abilities"];
    abPanel.innerHTML = `<h2>Habilidades de Combate</h2>`;
    const abilitiesGrid = document.createElement("div");
    abilitiesGrid.className = "abilities-detail-grid";

    // Render Passive
    if (detail.passive) {
      const pass = detail.passive;
      const passCard = document.createElement("div");
      passCard.className = "ability-detail-card";
      passCard.innerHTML = `
        <div class="ability-img-wrap">
          <img src="${API_BASE}/cdn/${latestVersion}/img/passive/${pass.image.full}" alt="${pass.name}">
          <span class="ability-letter passive">P</span>
        </div>
        <div class="ability-desc-wrap">
          <h4>${pass.name}</h4>
          <p class="ability-description-txt">${pass.description}</p>
        </div>
      `;
      abilitiesGrid.appendChild(passCard);
    }

    // Render Spells Q W E R
    const spellKeys = ["Q", "W", "E", "R"];
    (detail.spells || []).forEach((spell, i) => {
      const spellCard = document.createElement("div");
      spellCard.className = "ability-detail-card";

      const costText = spell.costBurn ? `${spell.costBurn} ${detail.partype || "Mana"}` : "Sem custo";
      const cdText = spell.cooldownBurn ? `${spell.cooldownBurn}s Cooldown` : "Sem tempo de recarga";

      spellCard.innerHTML = `
        <div class="ability-img-wrap">
          <img src="${API_BASE}/cdn/${latestVersion}/img/spell/${spell.image.full}" alt="${spell.name}">
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

    // Populate Skins Tab (Render widescreen card and link directly to full screen uncropped Lightbox!)
    const skinsPanel = tabPanels["skins"];
    skinsPanel.innerHTML = `
      <div class="skins-tab-header">
        <h2>Skins Disponíveis</h2>
        <p>Clique em qualquer skin para abrir a ilustração oficial em tela cheia (alta resolução).</p>
      </div>
    `;

    const skinsWrapper = document.createElement("div");
    skinsWrapper.className = "modal-skins-container";

    const filteredSkins = (detail.skins || []).filter(s => typeof s.num === 'number' && s.num >= 0);
    const validLightboxSkins = [];

    filteredSkins.forEach(skin => {
      const skinName = skin.name === "default" ? "Clássica" : skin.name;
      const card = document.createElement("div");
      card.className = "modal-skin-card skeleton";

      // Register index for Lightbox navigation
      const currentIdx = validLightboxSkins.length;
      validLightboxSkins.push({
        name: `${detail.name} - ${skinName}`,
        num: skin.num,
        champId: detail.id
      });

      const cardInner = document.createElement("div");
      cardInner.className = "modal-skin-card-inner";

      // Retrato / Loading image format works perfectly here
      const img = document.createElement("img");
      img.src = `${API_BASE}/cdn/img/champion/loading/${detail.id}_${skin.num}.jpg`;
      img.alt = skinName;
      img.loading = "lazy";

      img.onload = () => {
        card.classList.remove("skeleton");
      };

      img.onerror = () => {
        // Remove from lightbox and DOM if image fails (chromas, etc)
        card.remove();
        const index = validLightboxSkins.findIndex(v => v.num === skin.num);
        if (index > -1) validLightboxSkins.splice(index, 1);
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

      // Open Lightbox on Click
      card.addEventListener("click", () => {
        // Adjust dynamic index based on loaded/remaining cards
        const realIdx = validLightboxSkins.findIndex(v => v.num === skin.num);
        if (realIdx > -1) {
          openSkinLightbox(validLightboxSkins, realIdx);
        }
      });
    });

    skinsPanel.appendChild(skinsWrapper);

    // Assemble all components
    tabs.append(tabsHeader, tContent);
    mainBody.appendChild(tabs);
    wrapper.append(closeBtn, header, mainBody);
    modal.append(backdrop, wrapper);
    document.body.appendChild(modal);

  } catch (err) {
    console.error(err);
    loadingModal.remove();
    document.body.style.overflow = "";
    alert("Erro nas conexões de Runeterra. Tente invocar o campeão novamente.");
  }
}

/** Filter logic based on Search and Selected Role Tag */
function filterChampions() {
  const searchTerm = document.getElementById("search").value.trim().toLowerCase();
  const activeTagBtn = document.querySelector(".filter-tag.active");
  const activeTag = activeTagBtn ? activeTagBtn.dataset.tag : "all";

  const cards = document.querySelectorAll(".card");
  let anyVisible = false;
  let count = 0;

  cards.forEach(card => {
    const name = card.querySelector(".card-name").textContent.toLowerCase();
    const title = card.querySelector(".card-title").textContent.toLowerCase();
    const tags = (card.dataset.tags || "").split(",");

    const matchesName = name.includes(searchTerm) || title.includes(searchTerm);
    const matchesTag = activeTag === "all" || tags.includes(activeTag);
    const visible = matchesName && matchesTag;

    card.style.display = visible ? "" : "none";
    if (visible) {
      anyVisible = true;
      count++;
    }
  });

  const resultCount = document.getElementById("result-count");
  if (!searchTerm && activeTag === "all") {
    resultCount.textContent = "";
  } else {
    resultCount.textContent = `Encontrado${count !== 1 ? "s" : ""} ${count} campeão${count !== 1 ? "es" : ""}`;
  }

  document.getElementById("no-results").style.display = anyVisible ? "none" : "block";
}

/** Setup UI interactions */
function initUI() {
  // Search
  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(filterChampions, 150));
  }

  // Filter tag buttons
  document.querySelectorAll(".filter-tag").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-tag.active").forEach(active => active.classList.remove("active"));
      btn.classList.add("active");
      filterChampions();
    });
  });

  // Smooth scroll links & close mobile nav
  const navLinks = document.querySelector(".nav-links");
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
      if (navLinks) navLinks.classList.remove("open");
      const toggle = document.getElementById("nav-toggle");
      if (toggle) toggle.classList.remove("open");
    });
  });

  // Responsive Hamburger Nav Menu
  const navToggle = document.getElementById("nav-toggle");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("open");
      if (navLinks) navLinks.classList.toggle("open");
    });
  }

  // Scroll events
  const navbar = document.getElementById("navbar");
  const scrollTopBtn = document.getElementById("scroll-top");
  const sections = ["hero", "champions", "about"]
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navLinkEls = Array.from(document.querySelectorAll(".nav-links a"));

  function onScroll() {
    const y = window.scrollY;
    if (navbar) navbar.classList.toggle("scrolled", y > 40);
    if (scrollTopBtn) scrollTopBtn.classList.toggle("visible", y > 400);

    // Dynamic active class in menu
    let currentId = "hero";
    for (const sec of sections) {
      if (y + 160 >= sec.offsetTop) {
        currentId = sec.id;
      }
    }
    navLinkEls.forEach(a => {
      const href = a.getAttribute("href");
      a.classList.toggle("active", href === `#${currentId}`);
    });
  }

  window.addEventListener("scroll", debounce(onScroll, 20), { passive: true });
  onScroll();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Keybindings
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeModal();
    }
  });
}

// Spark on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  initParticles();
  initUI();
  loadChampions();
});
