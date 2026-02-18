import api from "../../../common/api/axiosInstance";

const BASE_URL = "/api/commissioner/competitions"; 

const volunteerService = {

  createVolunteer: async (competitionId, data) => {
    const response = await api.post(
      `${BASE_URL}/${competitionId}/create-volonteer`,
      data
    );
    return response.data;
  },

  importVolunteers: async (competitionId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `/api/commissioner/competitions/${competitionId}/import-volonteers`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
},
};

export default volunteerService;
