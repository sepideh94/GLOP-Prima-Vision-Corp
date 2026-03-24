import api from "../../../common/api/axiosInstance";

const mapService = {
  getMapData: async () => {
    const res = await api.get("/map/data");
    return res.data;
  },

  /** Positions de suivi avec prénom/nom (admin uniquement). */
  getAdminAthleteLocations: async () => {
    const res = await api.get("/api/admin/map/athlete-locations");
    return res.data;
  },

  getNearbyTrials: async (lat, lng, radiusKm = 10) => {
    const res = await api.get(
      `/api/trials/nearby?latitude=${lat}&longitude=${lng}&radiusKm=${radiusKm}`
    );
    return res.data;
  },
};

export default mapService;
