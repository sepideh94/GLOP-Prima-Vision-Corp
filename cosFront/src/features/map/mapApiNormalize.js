/** Nombre fini ou null (marqueur ignoré). */
export function toFiniteNumber(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function formatTimeShort(t) {
  if (t == null || t === "") return "—";
  const s = String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
}

/** Normalise une ligne d’épreuve renvoyée par GET /api/trials/nearby. */
export function normalizeNearbyTrial(row) {
  const lat = toFiniteNumber(row.latitude ?? row.siteLatitude);
  const lng = toFiniteNumber(row.longitude ?? row.siteLongitude);
  return {
    id: row.trialId ?? row.id,
    name: row.trialName ?? row.name ?? "Épreuve",
    siteLatitude: lat,
    siteLongitude: lng,
    startDate: row.startDate ?? "",
    startHour: formatTimeShort(row.startHour),
  };
}

/** Normalise une fan zone (persistée ou suggestion Google). */
export function normalizeFanZoneMarker(fz) {
  const lat = toFiniteNumber(fz.latitude);
  const lng = toFiniteNumber(fz.longitude);
  return {
    id: fz.id,
    name: fz.name?.trim() || "Fan zone",
    address: (fz.address ?? fz.adress ?? "").trim(),
    latitude: lat,
    longitude: lng,
  };
}
