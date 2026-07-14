import { filterChampions } from './filter-logic.js';
import { debounce } from '../shared/utils.js';

export function setupFilterUI() {
  const searchInput = document.getElementById("search");
  if (searchInput) {
    const debouncedFilter = debounce(filterChampions, 150);
    searchInput.addEventListener("input", debouncedFilter);
  }

  document.querySelectorAll(".filter-tag").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-tag.active").forEach(active => active.classList.remove("active"));
      btn.classList.add("active");
      filterChampions();
    });
  });
}
