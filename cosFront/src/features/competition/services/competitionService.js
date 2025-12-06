import api from "../../../common/api/axiosInstance";

const competitionService = {

  async getEvents() {
    const res = await api.get("/api/events");
    return res.data;
  },

  async getCompetitionsByEvent(eventId) {
    const res = await api.get(`/api/admin/competitions/by-event/${eventId}`);
    return res.data;
  },

  async createCompetition(data) {
    const res = await api.post("/api/admin/competitions", data);
    return res.data;
  },

  async updateCompetition(id, data) {
    const res = await api.put(`/api/admin/competitions/${id}`, data);
    return res.data;
  },
};

export default competitionService;
