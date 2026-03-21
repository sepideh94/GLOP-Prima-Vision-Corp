import api from "../../../common/api/axiosInstance";

const notificationService = {
  async getMyNotifications() {
    const res = await api.get("/api/notifications/me");
    return res.data || [];
  },

  async getUnreadCount() {
    const res = await api.get("/api/notifications/me/unread-count");
    // Backend returns: { "count": number }
    return res.data?.count ?? 0;
  },

  async markAsRead(id) {
    await api.put(`/api/notifications/${id}/read`);
  },
};

export default notificationService;

