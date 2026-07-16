import { openSkinLightbox, closeLightbox } from './lightbox.js';
import { openModal } from './champion-detail.js';
import { bumpCloseToken } from './modal-state.js';

export { openSkinLightbox, openModal };

export function closeModal() {
  const modal = document.querySelector(".modal");
  if (modal) {
    modal.classList.add("fade-out");
    bumpCloseToken();
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = "";
    }, 250);
  }
  closeLightbox();
}
