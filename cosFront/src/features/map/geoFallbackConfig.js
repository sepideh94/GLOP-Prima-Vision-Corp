const DEFAULT_LAT = 50.604457;
const DEFAULT_LNG = 3.136702;

function parseCoord(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Position utilisée quand le GPS est indisponible (Docker, navigateur sans géoloc, etc.) */
export const GEO_FALLBACK_POSITION = {
  lat: parseCoord(import.meta.env.VITE_GEO_FALLBACK_LAT, DEFAULT_LAT),
  lng: parseCoord(import.meta.env.VITE_GEO_FALLBACK_LNG, DEFAULT_LNG),
};

/**
 * Dev local : toujours autorisé.
 * Build (Docker, démo) : activer avec VITE_GEO_FALLBACK=true au moment du build Vite.
 */
export function isGeoFallbackEnabled() {
  if (import.meta.env.DEV) return true;
  return String(import.meta.env.VITE_GEO_FALLBACK || "").toLowerCase() === "true";
}
