import api from "../../../common/api/axiosInstance";

const BASE_URL = "/api/admin/competitions";

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
      `${BASE_URL}/${competitionId}/import-volonteers`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  getVolunteersByCompetition: async (competitionId) => {
    const response = await api.get(
      `${BASE_URL}/${competitionId}/volonteers`
    );

    return response.data;
  },

  getVolunteersByEvent: async (eventId) => {
    const response = await api.get(
      `/api/admin/events/${eventId}/volonteers`
    );

    return response.data;
  },

};

export default volunteerService;