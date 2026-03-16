import api from "../../../common/api/axiosInstance";

const incidentService = {

  async getAll(eventId) {

    const res = await api.get("/api/incidents", {
      params: { eventId }
    });

    return res.data || [];

  },

  async getById(id) {

    const res = await api.get(`/api/incidents/${id}`);
    return res.data;

  },

  async create(data) {

    const res = await api.post("/api/incidents", data);
    return res.data;

  },

  async update(id, data) {

    const res = await api.put(`/api/incidents/${id}`, data);
    return res.data;

  },

  async changeStatus(id, status) {

    const res = await api.patch(`/api/incidents/${id}/status`, { status });
    return res.data;

  },

  async delete(id) {

    const res = await api.delete(`/api/incidents/${id}`);
    return res.data;

  }

};

export default incidentService;