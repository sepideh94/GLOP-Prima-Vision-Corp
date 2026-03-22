import api from "../../../common/api/axiosInstance";
import { DEV_DIRECTIONS } from "../devMocks";

function toBackendBody(params) {
  return {
    fromLatitude: params.fromLatitude ?? params.originLat,
    fromLongitude: params.fromLongitude ?? params.originLng,
    travelMode: params.travelMode,
    siteId: params.siteId,
    fanZoneId: params.fanZoneId,
    toLatitude: params.toLatitude ?? params.lat,
    toLongitude: params.toLongitude ?? params.lng,
  };
}

const directionsService = {
  getDirections: async (params) => {
    try {
      const res = await api.post("/api/directions", toBackendBody(params));
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
