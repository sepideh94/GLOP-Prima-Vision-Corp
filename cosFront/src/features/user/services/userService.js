import api from "../../../common/api/axiosInstance";

const userService = {
  async getUsers(params = {}) {
    // L'endpoint dans develop retourne une liste simple sans pagination
    const res = await api.get("/api/admin/users");
    return res.data; // Retourne directement la liste
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

  async downloadCommissionerAccreditation(id) {
    const res = await api.get(`/api/admin/commissioners/${id}/accreditation`, {
      responseType: "blob",
    });
    return res.data;
  },

  async validateCommissionerAccreditation(id) {
    const res = await api.post(`/api/admin/commissioners/${id}/accreditation/validate`);
    return res.data;
  },

  async refuseCommissionerAccreditation(id, reason) {
    const res = await api.post(`/api/admin/commissioners/${id}/accreditation/refuse`, {
      reason,
    });
    return res.data;
  },
};

export default userService;
