/**
 * Données simulées pour le développement local sans Docker.
 * Utilisées uniquement quand import.meta.env.DEV === true et que le backend est inaccessible.
 */

export const DEV_POSITION = { lat: 50.604457, lng: 3.136702 }; // J43P+VG Villeneuve-d'Ascq

export const DEV_MEETING_POINTS = [
  {
    trialId: 1,
    trialName: "50m nage libre — Qualification/Heat 1",
    startDate: "2026-03-24",
    startHour: "19:35:00",
    competitionId: 1,
    siteId: 1,
    siteAddress: "261 Bd de Tournai, 59650 Villeneuve-d'Ascq, France",
    latitude: 50.604457,
    longitude: 3.136702,
  },
];

/** Itinéraire simulé : ligne droite entre l'origine et la destination. */
export function DEV_DIRECTIONS(originLat, originLng, destLat, destLng) {
  const polylinePoints = [
    { lat: originLat, lng: originLng },
    { lat: (originLat + destLat) / 2, lng: (originLng + destLng) / 2 },
    { lat: destLat, lng: destLng },
  ];
  return {
    summary: "Itinéraire simulé (backend indisponible)",
    distanceText: "3,2 km (simulé)",
    durationText: "8 min (simulé)",
    distanceKm: 3.2,
    durationMinutes: 8,
    polylinePoints,
  };
}
