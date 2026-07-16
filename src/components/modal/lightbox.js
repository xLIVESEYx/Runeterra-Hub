import { API_BASE } from '../../services/api.js';
import { getSplashUrl } from '../../services/images.js';

let currentSkinsList = [];
let currentSkinIndex = 0;
let activeKeyHandler = null;

export function closeLightbox() {
  const lb = document.querySelector(".lightbox-modal");
  if (lb) {
    lb.remove();
  }
  document.body.style.overflow = "";
  if (activeKeyHandler) {
    document.removeEventListener("keydown", activeKeyHandler);
    activeKeyHandler = null;
  }
}

export function openSkinLightbox(skins, startIndex) {
  if (document.querySelector(".lightbox-modal")) {
    closeLightbox();
  }

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
    img.decoding = "async";
    delete img.dataset.usingFallback;

    const primaryUrl = getSplashUrl(skin.champId, skin.num, { variant: "uncentered", prefer: "cd" });
    const fallbackUrl = `${API_BASE}/cdn/img/champion/splash/${skin.champId}_${skin.num}.jpg`;

    img.onload = () => {
      loader.style.display = "none";
      img.style.opacity = "1";
    };

    img.onerror = () => {
      if (img.dataset.usingFallback === "1" || img.src === fallbackUrl) return;
      img.dataset.usingFallback = "1";
      img.src = fallbackUrl;
    };

    img.alt = skin.name;
    img.src = primaryUrl;

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

  if (activeKeyHandler) {
    document.removeEventListener("keydown", activeKeyHandler);
  }
  activeKeyHandler = (e) => {
    if (!document.body.contains(lb)) {
      document.removeEventListener("keydown", activeKeyHandler);
      activeKeyHandler = null;
      return;
    }
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape") closeLightbox();
  };
  document.addEventListener("keydown", activeKeyHandler);

  updateLightbox();
}
