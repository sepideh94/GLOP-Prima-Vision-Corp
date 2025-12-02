import axiosInstance from "./axiosInstance";

//Vérifie l'état de santé de l'API (endpoint /health)
export async function pingHealth() {
  try {
    // Envoie une requête GET vers /health pour tester la disponibilité du backend
    const res = await axiosInstance.get("/health");
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
