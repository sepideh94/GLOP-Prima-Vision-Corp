import api from "../../../common/api/axiosInstance";

const publicResultsService = {
  async getCompetitionResults(competitionId) {
    const res = await api.get(`/api/public/competitions/${competitionId}/results`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async getTrialResults(trialId) {
    const res = await api.get(`/api/public/trials/${trialId}/results`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async getCompetitionsWithResults() {
    const res = await api.get("/api/public/competitions/with-results");
    return Array.isArray(res.data) ? res.data : [];
  },
};

export default publicResultsService;
