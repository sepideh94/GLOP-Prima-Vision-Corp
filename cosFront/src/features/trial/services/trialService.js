import api from "../../../common/api/axiosInstance";

const trialService = {
  getTrialsByCompetition: async (competitionId) => {
    const res = await api.get(`/api/trials?competitionId=${competitionId}`);
    return res.data;
  },

  getTrial: async (id) => {
    const res = await api.get(`/api/trials/${id}`);
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

  cancelTrial: async (id) => {
    const res = await api.patch(`/api/admin/trials/${id}/cancel`);
    return res.data;
  },
};

export default trialService;
