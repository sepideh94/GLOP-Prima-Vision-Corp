import api from "../../../common/api/axiosInstance";

const athleteProfileService = {
  async getMyProfile() {
    const res = await api.get("/api/athlete/profile");
    return res.data;
  },

  async updateProfile(profileData) {
    // Préparer les données pour le backend (noms de champs correspondants)
    // Tous les champs sont optionnels (partial update)
    const requestData = {};
    
    if (profileData.nationality) requestData.nationality = profileData.nationality;
    if (profileData.birthDate) {
      // Convertir la date en format ISO string (YYYY-MM-DD)
      const date = profileData.birthDate instanceof Date 
        ? profileData.birthDate 
        : new Date(profileData.birthDate);
      requestData.birthDate = date.toISOString().split('T')[0];
    }
    if (profileData.sexe) requestData.sexe = profileData.sexe;
    if (profileData.passportNumber) requestData.passportNumber = profileData.passportNumber;
    if (profileData.hasAcceptedCharte !== undefined) {
      requestData.hasAcceptedCharte = profileData.hasAcceptedCharte;
    }
    
    const res = await api.put("/api/athlete/profile", requestData);
    return res.data;
  },

  async uploadPassport(file) {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await api.post("/api/athlete/profile/passport", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async uploadMedicalCertificate(file) {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await api.post("/api/athlete/profile/medical-certificate", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async getCountries() {
    // API publique, pas besoin d'authentification
    const res = await api.get("/api/countries");
    return res.data;
  },
};

export default athleteProfileService;
