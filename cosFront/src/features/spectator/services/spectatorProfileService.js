import api from "../../../common/api/axiosInstance";

const TICKET_PATH = "/api/spectator/profile/ticket";

function fileExtensionFromContentType(contentType) {
  const ct = String(contentType || "").toLowerCase();
  if (ct.includes("pdf")) return ".pdf";
  if (ct.includes("png")) return ".png";
  if (ct.includes("jpeg") || ct.includes("jpg")) return ".jpg";
  if (ct.includes("webp")) return ".webp";
  return "";
}

function parseFilenameFromContentDisposition(disposition) {
  if (!disposition) return null;
  const utf8 = /filename\*=UTF-8''([^;\s]+)/i.exec(disposition);
  if (utf8) {
    try {
      return decodeURIComponent(utf8[1]);
    } catch {
      return utf8[1];
    }
  }
  const ascii = /filename="([^"]+)"/i.exec(disposition);
  if (ascii) return ascii[1];
  const loose = /filename=([^;\s]+)/i.exec(disposition);
  if (loose) return loose[1].replaceAll('"', "");
  return null;
}

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

  // Gestion des compétitions suivies (localStorage)
  getCompetitionFavorites() {
    const favorites = localStorage.getItem("spectator_competition_favorites");
    return favorites ? JSON.parse(favorites) : [];
  },

  addCompetitionFavorite(competitionId) {
    const favorites = this.getCompetitionFavorites();
    const id = String(competitionId);
    if (!favorites.includes(id)) {
      favorites.push(id);
      localStorage.setItem("spectator_competition_favorites", JSON.stringify(favorites));
    }
  },

  removeCompetitionFavorite(competitionId) {
    const favorites = this.getCompetitionFavorites();
    const id = String(competitionId);
    const updated = favorites.filter((cId) => String(cId) !== id);
    localStorage.setItem("spectator_competition_favorites", JSON.stringify(updated));
  },

  isCompetitionFavorite(competitionId) {
    const favorites = this.getCompetitionFavorites();
    return favorites.includes(String(competitionId));
  },

  /**
   * Indique si un billet est stocké (évite de télécharger tout le fichier : statut HTTP uniquement).
   */
  async hasStoredTicket() {
    const res = await api.get(TICKET_PATH, {
      responseType: "blob",
      validateStatus: (status) => status === 200 || status === 404,
    });
    return res.status === 200;
  },

  /** Upload multipart : champ `file` (ne pas définir Content-Type manuellement). */
  async uploadTicket(file) {
    const formData = new FormData();
    formData.append("file", file);
    await api.post(TICKET_PATH, formData);
  },

  /** Télécharge le billet (déclenche le téléchargement navigateur). */
  async downloadTicketToDevice() {
    const res = await api.get(TICKET_PATH, { responseType: "blob" });
    const blob = res.data;
    const contentType = res.headers["content-type"] || blob.type || "application/octet-stream";
    const disposition = res.headers["content-disposition"];
    const parsedName = parseFilenameFromContentDisposition(disposition);
    const ext = fileExtensionFromContentType(contentType);
    const filename =
      parsedName && parsedName !== "ticket"
        ? parsedName
        : `billet${ext || ""}`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  /** Récupère le billet en blob pour visualisation. */
  async getTicketBlob() {
    const res = await api.get(TICKET_PATH, { responseType: "blob" });
    const contentType = res.headers["content-type"] || res.data?.type || "application/octet-stream";
    const disposition = res.headers["content-disposition"];
    const parsedName = parseFilenameFromContentDisposition(disposition);
    const ext = fileExtensionFromContentType(contentType);
    const filename =
      parsedName && parsedName !== "ticket"
        ? parsedName
        : `billet${ext || ""}`;
    return { blob: res.data, contentType, filename };
  },

  async deleteTicket() {
    await api.delete(TICKET_PATH);
  },

  async listTickets() {
    const res = await api.get("/api/spectator/profile/tickets");
    return Array.isArray(res.data) ? res.data : [];
  },

  async getTicketBlobById(ticketId) {
    const res = await api.get(`/api/spectator/profile/tickets/${ticketId}`, {
      responseType: "blob",
    });
    const contentType = res.headers["content-type"] || res.data?.type || "application/octet-stream";
    return {
      blob: res.data,
      contentType,
      filename: `billet-${ticketId}${fileExtensionFromContentType(contentType) || ""}`,
    };
  },

  async deleteTicketById(ticketId) {
    await api.delete(`/api/spectator/profile/tickets/${ticketId}`);
  },
};

export default spectatorProfileService;
