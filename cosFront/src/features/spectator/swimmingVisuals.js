/**
 * Visuels natation : SVG locaux + quelques photos Unsplash (piscine / nageur uniquement).
 * Pas de Pexels : les IDs peuvent renvoyer n’importe quel sujet (ex. animaux).
 */

function publicSpectatorUrl(filename) {
  const base = import.meta.env.BASE_URL ?? "/";
  const normalized = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${normalized}/spectator/${filename}`;
}

export const SPECTATOR_PAGE_BACKGROUND =
  "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=2560&q=82&v=cos5";

export const SPECTATOR_PAGE_BACKGROUND_SVG = publicSpectatorUrl("pool-hero.svg");

/** Décor filigrane pour le panneau « verre » de l’espace spectateur */
export const SPECTATOR_MENU_GLASS_DECOR = publicSpectatorUrl("spectator-glass-mandala.svg");

const SWIM_FILES = [
  "swim-0.svg",
  "swim-1.svg",
  "swim-2.svg",
  "swim-3.svg",
  "swim-4.svg",
  "swim-5.svg",
  "swim-6.svg",
  "swim-7.svg",
];

export const SWIMMING_COMPETITION_IMAGES = SWIM_FILES.map((f) => publicSpectatorUrl(f));

/** `v` force le rechargement côté navigateur après changement de liste de photos. */
const unsplash = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80&v=cos5`;

/**
 * Uniquement des clichés piscine / eau / nage (Unsplash).
 * Fallback visuel : dégradé dans CompetitionSwimImage si toutes les URLs échouent.
 */
export const SWIMMING_PHOTO_URLS = [
  unsplash("1530549387789-4c1017266635"),
  unsplash("1572565408388-cdd3afe23e82"),
  unsplash("1560088971-123158b94b34"),
  unsplash("1576610616656-d3aa5d1f4534"),
];

function hashString(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) + h + str.charCodeAt(i);
  }
  return Math.abs(h);
}

function scrambleUint32(n) {
  let x = Math.abs(Math.floor(Number(n))) | 0;
  if (x === 0) return 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return x >>> 0;
}

export function swimmingImageForCompetitionId(competitionId) {
  const key = String(competitionId ?? "");
  const index = hashString(key) % SWIMMING_COMPETITION_IMAGES.length;
  return SWIMMING_COMPETITION_IMAGES[index];
}

export function swimmingMediaUrlsForCompetitionId(competitionId) {
  const key = String(competitionId ?? "");
  const h = hashString(key);
  const num = Number(key);
  const nP = SWIMMING_PHOTO_URLS.length;

  const primary =
    Number.isFinite(num) && num > 0
      ? scrambleUint32(num) % nP
      : h % nP;

  const step = 1 + (h % 7);
  const orderedPhotos = [];
  for (let k = 0; k < nP; k += 1) {
    orderedPhotos.push(SWIMMING_PHOTO_URLS[(primary + k * step) % nP]);
  }

  const seen = new Set();
  const uniquePhotos = orderedPhotos.filter((url) => {
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });

  /* Pas de fichiers swim-*.svg dans public/spectator/ : éviter 8× 404 et retomber vite sur le dégradé. */
  return uniquePhotos;
}
