import { setupFilterUI } from '../filters/filters.js';
import { closeModal } from '../modal/modal.js';
import { setupPatchNotes } from '../patchnotes/patchnotes.js';

export function setupKeybindings() {
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeModal();
    }
  });
}

export function setupScrollEvents() {
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

  window.addEventListener("scroll", () => onScroll(), { passive: true });
  onScroll();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

export function setupNavMenu() {
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("open");
      navLinks.classList.toggle("open");
    });
  }
}

export function setupSmoothScroll() {
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
}

export function initUI() {
  setupFilterUI();
  setupKeybindings();
  setupScrollEvents();
  setupNavMenu();
  setupSmoothScroll();
  setupPatchNotes();
}
