import { API_BASE } from './api.js';

const CDRAGON_BASE = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function champIdLower(champId) {
  return String(champId || "").toLowerCase();
}

function skinFolder(skinNum) {
  const n = Number(skinNum);
  return n === 0 ? "base" : `skin${pad2(n)}`;
}

export function getSplashUrl(champId, skinNum = 0, { variant = "centered", prefer = "cd" } = {}) {
  const id = champIdLower(champId);
  const folder = skinFolder(skinNum);

  if (prefer === "dd") {
    return ddSplashUrl(champId, skinNum);
  }

  const cdVariant = variant === "tile" ? "tile" : variant === "uncentered" ? "uncentered" : "centered";
  return `${CDRAGON_BASE}/${id}/skins/${folder}/images/${id}_splash_${cdVariant}_${skinNum}.jpg`;
}

function ddSplashUrl(champId, skinNum = 0) {
  return `${API_BASE}/cdn/img/champion/splash/${champId}_${skinNum}.jpg`;
}

function ddLoadingUrl(champId, skinNum = 0) {
  return `${API_BASE}/cdn/img/champion/loading/${champId}_${skinNum}.jpg`;
}

export function getLoadingUrl(champId, skinNum = 0) {
  return ddLoadingUrl(champId, skinNum);
}

export function getTileUrl(champId, skinNum = 0) {
  const id = champIdLower(champId);
  const folder = skinFolder(skinNum);
  return `${CDRAGON_BASE}/${id}/skins/${folder}/images/${id}_splash_tile_${skinNum}.jpg`;
}

export function getProfileIconUrl(version, champId) {
  return `${API_BASE}/cdn/${version}/img/champion/${champId}.png`;
}

export function getPassiveUrl(version, imageFull) {
  return `${API_BASE}/cdn/${version}/img/passive/${imageFull}`;
}

export function getSpellUrl(version, imageFull) {
  return `${API_BASE}/cdn/${version}/img/spell/${imageFull}`;
}

export function loadSplashWithFallback(opts) {
  const { primaryUrl, fallbackUrl, onLoaded, onAllFailed } = opts;
  const probe = new Image();
  let settled = false;
  probe.onload = () => {
    if (settled) return;
    settled = true;
    onLoaded && onLoaded(primaryUrl);
  };
  probe.onerror = () => {
    if (settled) return;
    const probe2 = new Image();
    probe2.onload = () => {
      if (settled) return;
      settled = true;
      onLoaded && onLoaded(fallbackUrl);
    };
    probe2.onerror = () => {
      if (settled) return;
      settled = true;
      onAllFailed && onAllFailed();
    };
    probe2.src = fallbackUrl;
  };
  probe.src = primaryUrl;
}
