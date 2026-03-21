import api from "../../../common/api/axiosInstance";

const fanZoneService = {
  getNearby: async (lat, lng, radiusKm = 5) => {
    const res = await api.get(`/api/fan-zones/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post("/api/admin/fan-zones", data);
    return res.data;
  },

  importFromGoogle: async (data) => {
    const res = await api.post("/api/admin/fan-zones/import", data);
    return res.data;
  },
};

export default fanZoneService;
