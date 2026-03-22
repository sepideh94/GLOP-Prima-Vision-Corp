import api from "./axiosInstance";

const siteService = {
  getAll: async () => {
    const res = await api.get("/api/sites");
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/api/sites/${id}`);
    return res.data;
  },
};

export default siteService;
