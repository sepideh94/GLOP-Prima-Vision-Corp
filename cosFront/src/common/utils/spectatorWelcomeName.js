/** Stockage temporaire après inscription spectateur → fusion à la première connexion (sans API). */
const FIRST_KEY = "glop_spectator_welcome_first";
const EMAIL_KEY = "glop_spectator_welcome_email";

export function saveSpectatorSignupWelcomeName(firstName, email) {
  const f = firstName?.trim();
  const e = email?.trim().toLowerCase();
  if (f) localStorage.setItem(FIRST_KEY, f);
  if (e) localStorage.setItem(EMAIL_KEY, e);
}

/** Si l’email correspond à l’inscription récente, retourne le prénom et efface les clés. */
export function consumeSpectatorSignupWelcomeName(email) {
  const e = email?.trim().toLowerCase();
  if (!e) return null;
  const storedEmail = localStorage.getItem(EMAIL_KEY);
  const storedFirst = localStorage.getItem(FIRST_KEY);
  if (!storedFirst || storedEmail !== e) return null;
  localStorage.removeItem(FIRST_KEY);
  localStorage.removeItem(EMAIL_KEY);
  return storedFirst.trim();
}

/** Prénom affiché : user.firstName (contexte), sinon 1re partie de l’email (ex. marie.dupont@… → Marie). */
export function getSpectatorDisplayFirstName(user) {
  const fromProfile = user?.firstName?.trim();
  if (fromProfile) return fromProfile;
  const em = user?.email?.trim();
  if (!em) return "";
  const local = em.split("@")[0] || "";
  const chunk = local.split(/[._-]/)[0] || "";
  if (!chunk) return "";
  return chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase();
}
