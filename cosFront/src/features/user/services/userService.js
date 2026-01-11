import api from "../../../common/api/axiosInstance";

const userService = {
  async getUsers(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append("page", params.page);
    if (params.size) queryParams.append("size", params.size);
    if (params.role) queryParams.append("role", params.role);
    if (params.status) queryParams.append("status", params.status);
    if (params.search) queryParams.append("search", params.search);

    const res = await api.get(`/api/admin/users?${queryParams.toString()}`);
    return res.data;
  },

  async getUserDetails(id) {
    const res = await api.get(`/api/admin/users/${id}`);
    return res.data;
  },

  async createCommissioner(data) {
    try {
      const res = await api.post("/api/admin/create-commissaire", data);
      return res.data;
    } catch (error) {
      console.error("Erreur API createCommissioner:", error);
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      console.error("Headers:", error.response?.headers);
      throw error;
    }
  },

  // Activer/Désactiver un utilisateur
  async toggleUserStatus(id, enabled) {
    const res = await api.patch(`/api/admin/users/${id}/status`, { enabled });
    return res.data;
  },

  // Réinitialiser le mot de passe d'un utilisateur
  async resetPassword(id) {
    const res = await api.post(`/api/admin/users/${id}/reset-password`);
    return res.data;
  },
};

export default userService;
