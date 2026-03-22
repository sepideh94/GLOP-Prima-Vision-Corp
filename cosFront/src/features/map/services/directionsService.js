import api from "../../../common/api/axiosInstance";
import { DEV_DIRECTIONS } from "../devMocks";

const directionsService = {
  getDirections: async (params) => {
    try {
      const res = await api.post("/api/directions", params);
      return res.data;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("[dev] Backend inaccessible — itinéraire simulé.");
        const destLat = params.destinationLat ?? params.lat ?? 48.86;
        const destLng = params.destinationLng ?? params.lng ?? 2.34;
        return DEV_DIRECTIONS(params.originLat, params.originLng, destLat, destLng);
      }
      throw err;
    }
  },
};

export default directionsService;
