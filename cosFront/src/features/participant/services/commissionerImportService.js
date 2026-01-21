import api from "../../../common/api/axiosInstance";

const commissionerImportService = {
  importAthletes(file) {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/api/commissioner/import-athletes", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default commissionerImportService;
