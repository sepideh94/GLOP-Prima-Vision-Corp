import api from "../../../common/api/axiosInstance";

const trialService = {

  getTrialsByCompetition: async (competitionId) => {
    const res = await api.get(`/api/trials?competitionId=${competitionId}`);
    return res.data;
  },

  getTrialsByCompetitionCommissioner: async (competitionId) => {
    const res = await api.get(`/api/commissioner/competitions/${competitionId}/trials`);
    return res.data;
  },

  createTrial: async (data) => {
    const res = await api.post("/api/trials", data);
    return res.data;
  },

  updateTrial: async (id, data) => {
    const res = await api.put(`/api/trials/${id}`, data);
    return res.data;
  },

  updateTrialCommissioner: async (id, data) => {
    const res = await api.put(`/api/commissioner/trials/${id}`, data);
    return res.data;
  },

  cancelTrialAdmin: async (id) => {
    const res = await api.patch(`/api/admin/trials/${id}/cancel`);
    return res.data;
  },

  cancelTrialCommissioner: async (id) => {
    const res = await api.patch(`/api/commissioner/trials/${id}/cancel`);
    return res.data;
  },

  getCompetitionAthletes: async (competitionId) => {
    const res = await api.get(`/api/commissioner/competitions/${competitionId}/athletes`);
    return res.data;
  },

  getTrialAthletes: async (trialId) => {
    const res = await api.get(`/api/commissioner/trials/${trialId}/athletes`);
    return res.data;
  },

  getParticipants: async (trialId) => {
    const res = await api.get(`/api/trials/${trialId}/participants`);
    return res.data;
  },

  assignAthletes: async (trialId, athleteIds) => {
    const res = await api.post(`/api/commissioner/trials/${trialId}/athletes`, { athleteIds });
    return res.data;
  },

  removeAthlete: async (trialId, athleteId) => {
    await api.delete(`/api/commissioner/trials/${trialId}/athletes/${athleteId}`);
  },

  getEligibleAthletes: async (trialId) => {
    const res = await api.get(`/api/commissioner/trials/${trialId}/eligible-athletes`);
    return res.data;
  },
};

export default trialService;
