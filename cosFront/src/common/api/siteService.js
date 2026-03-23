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

  /**
   * Crée ou réutilise un site à partir d'une adresse Google (géocodage) + coordonnées.
   */
  resolveOrCreate: async ({ adress, latitude, longitude }) => {
    const res = await api.post("/api/sites/resolve", {
      adress,
      latitude: Number(latitude),
      longitude: Number(longitude),
    });
    return res.data;
  },
};

export default siteService;
