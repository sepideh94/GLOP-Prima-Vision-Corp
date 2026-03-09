export function isValidEmail(email) {
  if (!email) return false;

  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const [local, domain] = parts;

  if (!local || !domain) return false;
  if (!domain.includes(".")) return false;

  return true;
}