let cachedVersion = null;

export const API_BASE = "https://ddragon.leagueoflegends.com";

const CACHE_PREFIX = "runeterra_";
const CHAMPIONS_CACHE_KEY = CACHE_PREFIX + "champions";
const PATCH_DATES_KEY = CACHE_PREFIX + "patch_dates";

function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function isOnline() {
  return typeof navigator === "undefined" || navigator.onLine;
}

export function getCachedVersion() {
  if (cachedVersion) return cachedVersion;
  const cached = readCache(CHAMPIONS_CACHE_KEY);
  return cached ? cached.version : null;
}

export function getCachedChampions() {
  return readCache(CHAMPIONS_CACHE_KEY);
}

export function cacheChampions(version, champions) {
  cachedVersion = version;
  writeCache(CHAMPIONS_CACHE_KEY, { version, champions });
  recordPatchDate(version);
}

export function recordPatchDate(version) {
  if (!version) return;
  const dates = readCache(PATCH_DATES_KEY) || {};
  if (!dates[version]) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    dates[version] = `${dd}/${mm}/${yyyy}`;
    writeCache(PATCH_DATES_KEY, dates);
  }
}

export function getDetectedPatchDate(version) {
  if (!version) return null;
  const dates = readCache(PATCH_DATES_KEY);
  return dates && dates[version] ? dates[version] : null;
}

export function getRiotVersion(ddragonVersion) {
  if (!ddragonVersion) return null;
  const [major, minor] = ddragonVersion.split(".");
  const majorNum = parseInt(major, 10);
  const minorNum = parseInt(minor, 10);
  if (isNaN(majorNum) || isNaN(minorNum)) return null;
  if (majorNum >= 14) {
    return `${majorNum + 10}.${minorNum}`;
  }
  return ddragonVersion;
}

export async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
}

export async function getLatestVersion() {
  if (cachedVersion) return cachedVersion;
  const versions = await fetchJSON(`${API_BASE}/api/versions.json`);
  cachedVersion = versions[0];
  return cachedVersion;
}

export async function loadChampionsData(version) {
  const latestVersion = version || await getLatestVersion();
  const champList = await fetchJSON(`${API_BASE}/cdn/${latestVersion}/data/pt_BR/champion.json`);
  return { champions: Object.values(champList.data), version: latestVersion };
}

export async function loadChampionDetail(id) {
  const latestVersion = await getLatestVersion();
  const data = await fetchJSON(`${API_BASE}/cdn/${latestVersion}/data/pt_BR/champion/${id}.json`);
  return data.data[id];
}

async function pingUrl(url, { timeout = 8000, method = "GET", cors = false } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      method,
      mode: cors ? "cors" : "no-cors",
      signal: controller.signal,
      cache: "no-store",
    });
    if (cors) return res.ok;
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function checkApiStatus() {
  if (!isOnline()) {
    return { state: "offline", sources: {} };
  }

  const cached = getCachedChampions();
  const version = cached ? cached.version : null;

  const sources = {
    versions: await pingUrl(`${API_BASE}/api/versions.json`, { cors: true }),
    champions: version
      ? await pingUrl(`${API_BASE}/cdn/${version}/data/pt_BR/champion.json`, { cors: true })
      : false,
    images: version
      ? await pingUrl(`${API_BASE}/cdn/img/champion/Aatrox_0.jpg`, { method: "HEAD" })
      : false,
  };

  const okCount = Object.values(sources).filter(Boolean).length;
  let state;
  if (okCount === 3) state = "online";
  else if (okCount === 0) state = "offline";
  else state = "degraded";

  return { state, sources };
}
