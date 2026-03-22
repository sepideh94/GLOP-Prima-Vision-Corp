/** Libellé carte / liste à partir de la réponse admin (prénom + nom ou repli). */
export function formatAthleteMapLabel(a) {
  const fn = (a?.firstName ?? "").trim();
  const ln = (a?.lastName ?? "").trim();
  const name = [fn, ln].filter(Boolean).join(" ").trim();
  if (name) return name;
  return `Athlète #${a?.athleteId ?? "?"}`;
}
