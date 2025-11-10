// Simule une API d'authentification (mock)
export async function loginApi({ email, password }) {
  const roles = {
    "admin@cos.com": "ADMIN",
    "commissaire@cos.com": "COMMISSAIRE",
    "athlete@cos.com": "ATHLETE",
    "spectateur@cos.com": "SPECTATEUR",
    "volontaire@cos.com": "VOLONTAIRE",
  };

  const role = roles[email?.toLowerCase()] || "SPECTATEUR";

  // Simule une réponse réussie avec un faux token
  return Promise.resolve({
    token: "fake-token-123",
    user: { email, role },
  });
}
