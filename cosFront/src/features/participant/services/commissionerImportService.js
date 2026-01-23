import api from "../../../common/api/axiosInstance";

const commissionerImportService = {
  /**
   * Import des athlètes dans le contexte d'une compétition.
   * Les athlètes seront créés s'ils n'existent pas et automatiquement invités à la compétition.
   *
   * @param {File} file - Le fichier CSV contenant les données des athlètes
   * @param {number} competitionId - L'ID de la compétition
   * @returns {Promise} - Retourne les résultats de l'import (processed, invited, skipped)
   */
  importAthletesForCompetition(file, competitionId) {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`/api/commissioner/competitions/${competitionId}/import-athletes`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * @deprecated Utiliser importAthletesForCompetition à la place
   */
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
