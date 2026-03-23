import api from "../../../common/api/axiosInstance";

const spectatorProfileService = {
  // Changer le mot de passe
  async changePassword(oldPassword, newPassword) {
    const res = await api.post("/api/user/change-password", {
      oldPassword,
      newPassword,
    });
    return res.data;
  },

  // Note: Pour l'instant, on utilise localStorage pour les préférences
  // Un endpoint backend pourrait être ajouté plus tard pour firstName, lastName, email
  getPreferences() {
    const prefs = localStorage.getItem("spectator_preferences");
    return prefs ? JSON.parse(prefs) : {};
  },

  savePreferences(preferences) {
    localStorage.setItem("spectator_preferences", JSON.stringify(preferences));
  },

  // Gestion des favoris (localStorage pour l'instant)
  getFavorites() {
    const favorites = localStorage.getItem("spectator_favorites");
    return favorites ? JSON.parse(favorites) : [];
  },

  addFavorite(eventId) {
    const favorites = this.getFavorites();
    if (!favorites.includes(eventId)) {
      favorites.push(eventId);
      localStorage.setItem("spectator_favorites", JSON.stringify(favorites));
    }
  },

  removeFavorite(eventId) {
    const favorites = this.getFavorites();
    const updated = favorites.filter((id) => id !== eventId);
    localStorage.setItem("spectator_favorites", JSON.stringify(updated));
  },

  isFavorite(eventId) {
    const favorites = this.getFavorites();
    return favorites.includes(eventId);
  },
};

export default spectatorProfileService;
