import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATCHES_FILE = resolve(__dirname, "..", "src", "data", "patches.json");
const RIOT_NEWS_URL = "https://www.leagueoflegends.com/en-us/news/tags/patch-notes/";
const DDRAGON_VERSIONS_URL = "https://ddragon.leagueoflegends.com/api/versions.json";

// Patches da Riot seguem "ano.patch" desde 2024 (ex: "26.13" = 2026, patch 13).
// O Data Dragon usa "(ano-10).patch.1" para 2024-2026 (ex: "16.13.1").
function riotToDdragon(riotVersion) {
  const [yearStr, patchStr] = riotVersion.split(".");
  const year = parseInt(yearStr, 10);
  if (!year || year < 24) return null;
  return `${year - 10}.${patchStr}.1`;
}

function formatDate(iso) {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Runeterra-PatchSync/1.0; +https://github.com/)",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Runeterra-PatchSync/1.0" },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function scrapeRiotPatchDates() {
  const html = await fetchText(RIOT_NEWS_URL);
  const pattern = /(\d{4}-\d{2}-\d{2})T[\d:.]+Z[\s\S]{0,400}?Patch (\d+\.\d+)/g;
  const seen = new Map();
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const iso = match[1];
    const riotVersion = match[2];
    if (!seen.has(riotVersion)) {
      seen.set(riotVersion, iso);
    }
  }
  return seen;
}

async function fetchDdragonVersions() {
  const versions = await fetchJSON(DDRAGON_VERSIONS_URL);
  return versions.filter((v) => /^\d+\.\d+\.\d+$/.test(v));
}

function mergePatches(existing, scrapedMap, ddragonVersions) {
  const merged = { ...existing };

  for (const [riotVersion, iso] of scrapedMap.entries()) {
    const ddragonVersion = riotToDdragon(riotVersion);
    if (ddragonVersion && !merged[ddragonVersion]) {
      merged[ddragonVersion] = formatDate(iso);
    }
  }

  for (const version of ddragonVersions) {
    if (!merged[version]) {
      const today = new Date();
      merged[version] = formatDate(today.toISOString());
    }
  }

  return merged;
}

function sortDescending(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort((a, b) => {
    const [aMaj, aMin] = a.split(".").map(Number);
    const [bMaj, bMin] = b.split(".").map(Number);
    if (aMaj !== bMaj) return bMaj - aMaj;
    return bMin - aMin;
  });
  for (const k of keys) sorted[k] = obj[k];
  return sorted;
}

async function main() {
  console.log("→ Lendo patches.json atual...");
  let existing = {};
  if (existsSync(PATCHES_FILE)) {
    existing = JSON.parse(readFileSync(PATCHES_FILE, "utf8"));
  }
  const beforeCount = Object.keys(existing).length;

  console.log("→ Buscando datas no site oficial da Riot...");
  const scraped = await scrapeRiotPatchDates();
  console.log(`  ${scraped.size} patches encontrados.`);

  console.log("→ Buscando versões do Data Dragon...");
  const versions = await fetchDdragonVersions();
  console.log(`  ${versions.length} versõesDD.`);

  const merged = mergePatches(existing, scraped, versions);
  const sorted = sortDescending(merged);
  const afterCount = Object.keys(sorted).length;
  const added = afterCount - beforeCount;

  const output = JSON.stringify(sorted, null, 2) + "\n";

  if (existsSync(PATCHES_FILE)) {
    const current = readFileSync(PATCHES_FILE, "utf8");
    if (current === output) {
      console.log("✓ Nenhuma alteração — patches.json já está atualizado.");
      return;
    }
  }

  writeFileSync(PATCHES_FILE, output, "utf8");
  console.log(`✓ patches.json atualizado (${added} novas entradas).`);
}

main().catch((err) => {
  console.error("✗ Erro:", err.message);
  process.exit(1);
});
