export const TAG_LABELS = {
  Fighter: "Lutador",
  Tank: "Tanque",
  Mage: "Mago",
  Assassin: "Assassino",
  Support: "Suporte",
  Marksman: "Atirador",
};

export function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}
