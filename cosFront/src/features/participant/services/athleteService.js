import api from "../../../common/api/axiosInstance";

const athleteService = {
  async getAllAthletes() {
    const res = await api.get("/api/commissioner/athletes");
    return res.data;
  },

  async getAthletesByCompetition(competitionId) {
    const res = await api.get(`/api/commissioner/competitions/${competitionId}/athletes`);
    return res.data;
  },

  async getAthleteParticipations(athleteId) {
    const res = await api.get(`/api/commissioner/athletes/${athleteId}/participations`);
    return res.data;
  },

  async getAthleteResults() {
    const res = await api.get("/api/athlete/results");
    return res.data;
  },
};

export default athleteService;
