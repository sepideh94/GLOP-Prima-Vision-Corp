import api from "./axiosInstance";

const eventService = {
  async getAllEvents() {
    const res = await api.get("/api/events");
    return res.data;
  },

  async getEventById(id) {
    const res = await api.get(`/api/events/${id}`);
    return res.data;
  },

  async createEvent(eventData) {
    const res = await api.post("/api/events", eventData);
    return res.data;
  },

  async updateEvent(id, eventData) {
    const res = await api.put(`/api/events/${id}`, eventData);
    return res.data;
  },
};

export default eventService;

