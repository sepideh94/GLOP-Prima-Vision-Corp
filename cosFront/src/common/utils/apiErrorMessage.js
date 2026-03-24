/**
 * Extrait un message lisible depuis une erreur Axios / réponse Spring (ApiError).
 */
export function getApiErrorMessage(error, fallback = "Une erreur est survenue.") {
  const d = error?.response?.data;
  if (!d) return error?.message || fallback;

  if (typeof d.message === "string" && d.message.trim()) {
    return d.message.trim();
  }

  const ve = d.validationErrors;
  if (ve && typeof ve === "object") {
    const parts = Object.values(ve).filter(Boolean);
    if (parts.length) return parts.join(" ");
  }

  if (typeof d.error === "string" && d.error.trim()) {
    return d.error.trim();
  }

  return fallback;
}
