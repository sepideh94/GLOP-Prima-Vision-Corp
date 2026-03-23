/**
 * En production, HashRouter par défaut : au F5 le navigateur ne demande que "/" au serveur
 * (Apache sans rewrite). En dev, Vite gère le fallback → BrowserRouter.
 * Build avec VITE_USE_HASH_ROUTER=false pour forcer des URLs sans # (ex. nginx try_files).
 */
export const USE_HASH_ROUTER =
  !import.meta.env.DEV && import.meta.env.VITE_USE_HASH_ROUTER !== "false";

export function spaFullUrl(pathWithOptionalQuery) {
  const path = pathWithOptionalQuery.startsWith("/")
    ? pathWithOptionalQuery
    : `/${pathWithOptionalQuery}`;
  if (typeof window === "undefined") return path;
  const { origin } = window.location;
  return USE_HASH_ROUTER ? `${origin}/#${path}` : `${origin}${path}`;
}
