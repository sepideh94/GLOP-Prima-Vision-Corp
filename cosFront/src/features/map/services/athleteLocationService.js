import api from "../../../common/api/axiosInstance";

const athleteLocationService = {
  updateLocation: async (athleteId, lat, lng) => {
    const res = await api.put(`/api/athletes/${athleteId}/location`, { latitude: lat, longitude: lng });
    return res.data;
  },

  getMeetingInfo: async (athleteId, competitionId = null) => {
    const params = competitionId ? { competitionId } : {};
    const res = await api.get(`/api/athletes/${athleteId}/meeting-info`, { params });
    return res.data;
  },
};

export default athleteLocationService;
