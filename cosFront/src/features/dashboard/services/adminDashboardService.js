import api from "../../../common/api/axiosInstance";

const adminDashboardService = {
  async getStats(days = 7) {
    const res = await api.get("/api/admin/stats", { params: { days } });
    return res.data;
  },

  async getReportSummary() {
    const res = await api.get("/api/admin/report-summary", {
      transformResponse: [(data) => data],
    });
    return res.data;
  },

  /**
   * POST /api/admin/report-download — PDF décisionnel généré côté serveur.
   * @param {string[]} chartImagesBase64 — PNG en data URL (ex. data:image/png;base64,...) par graphique capturé.
   */
  async downloadReport(chartImagesBase64 = []) {
    const res = await api.post(
      "/api/admin/report-download",
      { chartImagesBase64 },
      { responseType: "blob" }
    );

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `rapport-admin-${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default adminDashboardService;
