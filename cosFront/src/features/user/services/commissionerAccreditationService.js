import api from "../../../common/api/axiosInstance";

const commissionerAccreditationService = {
  async uploadMyAccreditation(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/api/commissioner/me/accreditation", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async downloadMyAccreditation() {
    const res = await api.get("/api/commissioner/me/accreditation", {
      responseType: "blob",
    });
    return res.data;
  },
};

export default commissionerAccreditationService;
