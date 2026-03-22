import api from "../../../common/api/axiosInstance";

const fanZoneService = {
  getAll: async () => {
    const res = await api.get("/api/admin/fan-zones");
    return res.data;
  },

  getNearby: async (lat, lng, radiusKm = 5) => {
    const res = await api.get(
      `/api/fan-zones/nearby?latitude=${lat}&longitude=${lng}&radiusKm=${radiusKm}`
    );
    const body = res.data;
    const saved = body?.savedFanZones ?? [];
    const rawSuggest = body?.googleSuggestions ?? [];
    const mappedSuggest = rawSuggest.map((s, i) => ({
      id: s.googlePlaceId ? `g-${s.googlePlaceId}` : `g-${i}`,
      name: s.name,
      address: s.address,
      latitude: s.latitude,
      longitude: s.longitude,
    }));
    return [...saved, ...mappedSuggest];
  },

  create: async (data) => {
    const res = await api.post("/api/admin/fan-zones", data);
    return res.data;
  },

  delete: async (id) => {
    await api.delete(`/api/admin/fan-zones/${id}`);
  },

  importFromGoogle: async (data) => {
    const res = await api.post("/api/admin/fan-zones/import", data);
    return res.data;
  },
};

export default fanZoneService;
