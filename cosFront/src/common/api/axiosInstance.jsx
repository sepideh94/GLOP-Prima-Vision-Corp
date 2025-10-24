//L'instance des axios pour les appels API 
import axios from "axios";

// Création d'une instance Axios partagée pour tout le projet
// La base URL est définie dans le fichier .env (VITE_API_URL)
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

// Ajoute le token dans le header (même si pour l'instant on n'a pas de vrai token)
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
