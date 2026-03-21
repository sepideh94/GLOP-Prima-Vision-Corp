import api from "../../../common/api/axiosInstance";

const mapService = {
  getMapData: async (includeAthletes = false) => {
    const res = await api.get(`/map/data?includeAthletes=${includeAthletes}`);
    return res.data;
  },

  getNearbyTrials: async (lat, lng, radiusKm = 10) => {
    const res = await api.get(`/api/trials/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
    return res.data;
  },
};

export default mapService;
