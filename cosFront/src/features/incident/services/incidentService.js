import axios from "axios";

const API_URL = "/api/incidents";

const incidentService = {

  getAll: async () => {
    const res = await axios.get(API_URL);
    return res.data;
  },

  getById: async (id) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await axios.post(API_URL, data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
  },

  changeStatus: async (id, status) => {
    const res = await axios.patch(`${API_URL}/${id}/status`, { status });
    return res.data;
  },

  delete: async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  }

};

export default incidentService;