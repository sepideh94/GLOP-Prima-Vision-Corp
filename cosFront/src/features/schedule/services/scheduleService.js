import api from "../../../common/api/axiosInstance";

const scheduleService = {
  /**
   * Récupère le planning d'un athlète pour une compétition donnée
   * @param {number} competitionId - ID de la compétition
   * @returns {Promise<Array>} Liste des épreuves de l'athlète
   */
  async getAthleteSchedule(competitionId) {
    const res = await api.get(`/api/schedule/athlete/competition/${competitionId}`);
    return res.data;
  },

  /**
   * Récupère les missions de planning d'un volontaire
   * @returns {Promise<Array>} Liste des missions assignées au volontaire connecté
   */
  async getVolunteerSchedule() {
    const res = await api.get("/api/schedule/volunteer/mon-planning");
    return res.data;
  },

  /**
   * Crée des entrées de planning (Admin uniquement)
   * @param {Object} scheduleData - Données de création du planning
   * @param {string} scheduleData.task - Type de tâche (TRANSPORT, SECURITY, etc.)
   * @param {string} scheduleData.description - Description de la tâche
   * @param {string} scheduleData.startTime - Date/heure de début (ISO format)
   * @param {string} scheduleData.endTime - Date/heure de fin (ISO format)
   * @param {string} scheduleData.type - Type de planning (VOLONTEER)
   * @param {number} scheduleData.siteId - ID du site
   * @param {number} scheduleData.competitionId - ID de la compétition
   * @param {Array<number>} scheduleData.assignedUserIds - Liste des IDs des utilisateurs assignés
   * @returns {Promise<Array>} Liste des plannings créés
   */
  async createSchedule(scheduleData) {
    const res = await api.post("/api/admin/schedules/create-schedule", scheduleData);
    return res.data;
  },

  /**
   * Récupère la liste des tâches de volontariat disponibles
   * @returns {Promise<Array>} Liste des tâches avec name et label
   */
  async getTasks() {
    const res = await api.get("/api/admin/schedules/volunteer-tasks");
    // Le backend retourne un tableau d'enums VolunteerTask sérialisés comme strings
    // Format : ["ACCUEIL", "ORIENTATION", "TRANSPORT", "SUPPORT_MEDICAL", "SECURITE", "LOGISTIQUE"]
    const taskLabels = {
      ACCUEIL: "Accueil",
      ORIENTATION: "Orientation",
      TRANSPORT: "Transport",
      SUPPORT_MEDICAL: "Support médical",
      SECURITE: "Sécurité",
      LOGISTIQUE: "Logistique"
    };
    
    // Transformer les strings en objets {name, label}
    return (res.data || []).map(taskName => ({
      name: taskName,
      label: taskLabels[taskName] || taskName
    }));
  },

  /**
   * Récupère l'agenda détaillé d'un volontaire (Admin uniquement)
   * @param {number} volunteerId - ID du volontaire
   * @returns {Promise<Array>} Résumé des missions du volontaire avec les épreuves
   */
  async getVolunteerScheduleSummary(volunteerId) {
    const res = await api.get(`/api/admin/schedules/volunteer/${volunteerId}`);
    return res.data;
  },
};

export default scheduleService;
