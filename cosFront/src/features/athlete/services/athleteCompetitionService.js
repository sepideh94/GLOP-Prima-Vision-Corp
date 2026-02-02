import api from "../../../common/api/axiosInstance";

const athleteCompetitionService = {
  getMyCompetitions() {
    return api
      .get("/api/athlete/competitions")
      .then((res) => res.data);
  },

  confirmParticipation(competitionId) {
    return api.post(
      `/api/athlete/competitions/${competitionId}/confirm`
    );
  },
};

export default athleteCompetitionService;
