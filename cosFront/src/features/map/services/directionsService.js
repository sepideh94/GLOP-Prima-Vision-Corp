import api from "../../../common/api/axiosInstance";

const directionsService = {
  getDirections: async (params) => {
    const res = await api.post("/api/directions", params);
    return res.data;
  },
};

export default directionsService;
