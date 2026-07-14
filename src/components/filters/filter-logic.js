export function filterChampions() {
  const searchInput = document.getElementById("search");
  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const activeTagBtn = document.querySelector(".filter-tag.active");
  const activeTag = activeTagBtn ? activeTagBtn.dataset.tag : "all";

  const cards = document.querySelectorAll(".card");
  let anyVisible = false;
  let count = 0;

  cards.forEach(card => {
    const name = card.querySelector(".card-name")?.textContent.toLowerCase() || "";
    const title = card.querySelector(".card-title")?.textContent.toLowerCase() || "";
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
    if (resultCount) resultCount.textContent = "";
  } else if (resultCount) {
    resultCount.textContent = `Encontrado${count !== 1 ? "s" : ""} ${count} campeão${count !== 1 ? "es" : ""}`;
  }

  const noResults = document.getElementById("no-results");
  if (noResults) {
    noResults.style.display = anyVisible ? "none" : "block";
  }
}
