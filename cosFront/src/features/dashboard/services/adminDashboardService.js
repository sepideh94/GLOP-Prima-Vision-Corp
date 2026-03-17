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

  async downloadReport(chartImagesBase64 = []) {
    const body =
      chartImagesBase64.length > 0 ? { chartImagesBase64 } : undefined;

    const res = await api.post("/api/admin/report-download", body, {
      responseType: "blob",
    });

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
