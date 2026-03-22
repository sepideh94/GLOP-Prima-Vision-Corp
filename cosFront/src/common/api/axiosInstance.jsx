import axios from "axios";
import { AUTH_LOGOUT_EVENT } from "../contexts/AuthContext";

/** Émis lors d’un 403 sur planning / épreuves athlète (voir doc workflow validation). */
export const ATHLETE_PLANNING_ACCESS_DENIED_EVENT = "ciblorgasport:athlete-planning-access-denied";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8083";

const DEFAULT_ATHLETE_ACCESS_DENIED =
  "Votre participation est en attente de validation par le commissaire. Vous ne pouvez pas encore consulter votre planning.";

function isAthletePlanningRestrictedUrl(url) {
  if (!url || typeof url !== "string") return false;
  return url.includes("/api/schedule/athlete/competition/");
}

let lastAthlete403NotifyAt = 0;
const ATHLETE_403_DEBOUNCE_MS = 1200;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
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

    if (error.response?.status === 403) {
      const reqUrl = error.config?.url || "";
      if (isAthletePlanningRestrictedUrl(reqUrl)) {
        const msg =
          (typeof error.response?.data?.message === "string" && error.response.data.message) ||
          DEFAULT_ATHLETE_ACCESS_DENIED;
        const now = Date.now();
        if (now - lastAthlete403NotifyAt >= ATHLETE_403_DEBOUNCE_MS) {
          lastAthlete403NotifyAt = now;
          window.dispatchEvent(
            new CustomEvent(ATHLETE_PLANNING_ACCESS_DENIED_EVENT, { detail: { message: msg } })
          );
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
