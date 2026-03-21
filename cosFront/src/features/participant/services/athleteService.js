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

  async downloadMedicalCertificate(athleteId) {
    const res = await api.get(
      `/api/commissioner/athletes/${athleteId}/medical-certificate`,
      { responseType: "blob" }
    );
    return res.data;
  },

  async downloadPassport(athleteId) {
    const res = await api.get(`/api/commissioner/athletes/${athleteId}/passport`, {
      responseType: "blob",
    });
    return res.data;
  },

  async validateParticipation(participationId) {
    const res = await api.post(
      `/api/commissioner/participations/${participationId}/validate`
    );
    return res.data;
  },

  async refuseParticipation(participationId, payload) {
    const res = await api.post(
      `/api/commissioner/participations/${participationId}/refuse`,
      payload
    );
    return res.data;
  },
};

export default athleteService;
