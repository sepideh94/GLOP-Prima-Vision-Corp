import axios from "axios";
import { AUTH_LOGOUT_EVENT } from "../contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8083";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData && config.headers) {
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Content-Type");
      } else {
        delete config.headers["Content-Type"];
      }
    }

    // Ne pas ajouter le token pour les routes publiques
    const publicRoutes = ["/api/auth/signin", "/api/auth/signup", "/api/auth/forgot-password", "/api/auth/forgot-password/complete", "/api/countries"];
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
    
    if (!isPublicRoute) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Supprimer le token du localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Déclencher l'événement personnalisé pour mettre à jour le contexte
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
      
      // Utiliser un délai pour permettre au contexte de se mettre à jour
      // avant de rediriger
      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
    }
    return Promise.reject(error);
  }
);

export default api;
