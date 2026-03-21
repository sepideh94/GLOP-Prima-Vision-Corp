import api from "../../../common/api/axiosInstance";

const athleteTrialService = {
  declareForfeit(trialParticipantId) {
    return api
      .post(`/api/athlete/trials/${trialParticipantId}/forfeit`)
      .then((res) => res.data);
  },
};

export default athleteTrialService;