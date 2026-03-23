/**
 * Si le HTML a été sur-échappé (ex. sérialisation qui produit "&lt;p&gt;…"),
 * retrouve une chaîne avec de vraies balises pour affichage ou sanitize.
 * Ne modifie pas les chaînes déjà en HTML normal (pas de "&lt;").
 */
export function decodeEscapedHtmlMarkup(html) {
  if (!html || typeof html !== "string") return html;
  if (!html.includes("&lt;")) return html;
  if (typeof document === "undefined") return html;
  const t = document.createElement("textarea");
  t.innerHTML = html;
  const out = t.value;
  return out && out.length > 0 ? out : html;
}

/**
 * Retire les balises HTML pour aperçus, recherche ou troncature en tableau.
 */
export function stripHtmlTags(html) {
  if (!html || typeof html !== "string") return "";
  const normalized = decodeEscapedHtmlMarkup(html);
  return normalized.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
