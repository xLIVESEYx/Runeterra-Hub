import { TAG_LABELS } from '../shared/utils.js';
import { API_BASE } from '../../services/api.js';
import { openModal } from '../modal/modal.js';

export function createChampionCard(champ) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = champ.id;
  card.dataset.tags = (champ.tags || []).join(",");

  const imgWrapper = document.createElement("div");
  imgWrapper.className = "card-img-wrapper";

  const img = document.createElement("img");
  img.src = `${API_BASE}/cdn/img/champion/loading/${champ.id}_0.jpg`;
  img.alt = champ.name;
  img.loading = "lazy";
  img.onerror = () => {
    imgWrapper.classList.add("card-img-error");
  };
  imgWrapper.appendChild(img);

  const overlay = document.createElement("div");
  overlay.className = "card-overlay";

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
