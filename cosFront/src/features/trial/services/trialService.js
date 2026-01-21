import api from "../../../common/api/axiosInstance";

const trialService = {

  getTrialsByCompetition: async (competitionId) => {
    const res = await api.get(`/api/trials?competitionId=${competitionId}`);
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
};

export default trialService;
