import api from "../../../common/api/axiosInstance";

const athleteCompetitionService = {
  getMyCompetitions() {
    return api.get("/api/athlete/competitions").then((res) => res.data);
  },

  confirmParticipation(participationId) {
    return api.post(`/api/athlete/competitions/${participationId}/confirm`);
  },
};

export default athleteCompetitionService;
