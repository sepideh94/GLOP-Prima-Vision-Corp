import api from "../../../common/api/axiosInstance";

const BASE = "/api/spectateur/competitions";

/**
 * Abonnements compétition (spectateur) — notifications incidents & résultats.
 * @see POST/DELETE/GET .../follow, GET .../followed
 */
const competitionFollowService = {
  async follow(competitionId) {
    await api.post(`${BASE}/${competitionId}/follow`);
  },

  async unfollow(competitionId) {
    await api.delete(`${BASE}/${competitionId}/follow`);
  },

  /** @returns {Promise<{ competitionId: number, following: boolean }>} */
  async getStatus(competitionId) {
    const res = await api.get(`${BASE}/${competitionId}/follow`);
    return res.data;
  },

  /** @returns {Promise<Array<{ competitionId: number, competitionName: string, eventId: number|null, eventName: string|null, followedAt: string }>>} */
  async listFollowed() {
    const res = await api.get(`${BASE}/followed`);
    return Array.isArray(res.data) ? res.data : [];
  },
};

export default competitionFollowService;
