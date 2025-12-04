import api from "../../../common/api/axiosInstance";

const competitionService = {
  // Récupère tous les événements 
  async getEvents() {
    const res = await api.get("/api/events");
    return res.data;
  },

  // Récupère toutes les compétitions d’un événement
  async getCompetitionsByEvent(eventId) {
    const res = await api.get(`/api/competitions?eventId=${eventId}`);
    return res.data;
  },

  // Créer une compétition
  async createCompetition(data) {
    const res = await api.post("/api/admin/competitions", data);
    return res.data;
  },

  // Modifier une compétition
  async updateCompetition(id, data) {
    const res = await api.put(`/api/admin/competitions/${id}`, data);
    return res.data;
  }
};

export default competitionService;
