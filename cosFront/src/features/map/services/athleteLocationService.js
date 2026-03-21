import api from "../../../common/api/axiosInstance";

const athleteLocationService = {
  updateLocation: async (athleteId, lat, lng) => {
    const res = await api.put(`/api/athletes/${athleteId}/location`, { latitude: lat, longitude: lng });
    return res.data;
  },

  getMeetingInfo: async (athleteId) => {
    const res = await api.get(`/api/athletes/${athleteId}/meeting-info`);
    return res.data;
  },
};

export default athleteLocationService;
