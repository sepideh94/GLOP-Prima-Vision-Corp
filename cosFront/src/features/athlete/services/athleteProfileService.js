import api from "../../../common/api/axiosInstance";

const athleteProfileService = {
  async getMyProfile() {
    const res = await api.get("/api/athlete/profile");
    return res.data;
  },

  async updateProfile(profileData) {
    const formData = new FormData();
    
    // Ajouter les champs texte
    if (profileData.nationality) formData.append("nationality", profileData.nationality);
    if (profileData.dateOfBirth) formData.append("dateOfBirth", profileData.dateOfBirth);
    if (profileData.gender) formData.append("gender", profileData.gender);
    if (profileData.passportNumber) formData.append("passportNumber", profileData.passportNumber);
    
    // Ajouter les fichiers
    if (profileData.passportFile) formData.append("passportFile", profileData.passportFile);
    if (profileData.medicalCertificateFile) formData.append("medicalCertificateFile", profileData.medicalCertificateFile);
    
    const res = await api.put("/api/athlete/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};

export default athleteProfileService;
