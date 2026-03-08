import api from "../../../common/api/axiosInstance";

const spectatorService = {
  // Événements (public)
  async getAllEvents() {
    const res = await api.get("/api/events");
    return res.data;
  },

  async getEventById(id) {
    const res = await api.get(`/api/events/${id}`);
    return res.data;
  },

  // Compétitions par événement (nécessite auth mais accessible aux spectateurs)
  async getCompetitionsByEvent(eventId) {
    try {
      // Essayer d'abord l'endpoint admin (accessible si authentifié)
      const res = await api.get(`/api/admin/competitions/by-event/${eventId}`);
      return res.data;
    } catch (error) {
      // Si l'endpoint admin ne fonctionne pas (403 Forbidden), essayer l'endpoint commissioner
      if (error.response?.status === 403) {
        try {
          const res = await api.get(`/api/commissioner/events/${eventId}/competitions`);
          return res.data;
        } catch (err) {
          console.error("Error fetching competitions from commissioner endpoint:", err);
          return [];
        }
      }
      console.error("Error fetching competitions:", error);
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      return [];
    }
  },

  // Détails d'une compétition
  async getCompetitionById(competitionId) {
    try {
      const res = await api.get(`/api/admin/competitions/${competitionId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching competition:", error);
      return null;
    }
  },

  // Épreuves (public)
  async getAllTrials() {
    const res = await api.get("/api/trials");
    return res.data;
  },

  async getTrialsByCompetition(competitionId) {
    const res = await api.get(`/api/trials?competitionId=${competitionId}`);
    return res.data;
  },

  async getTrialById(id) {
    const res = await api.get(`/api/trials/${id}`);
    return res.data;
  },
};

export default spectatorService;
