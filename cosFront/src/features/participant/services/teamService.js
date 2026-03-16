import api from "../../../common/api/axiosInstance";

const importTeams = (file, competitionId) => {

  const formData = new FormData();
  formData.append("file", file);

  return api.post(
    `/api/commissioner/competitions/${competitionId}/import-teams`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

const getEligibleTeams = (trialId) => {

  return api.get(
    `/api/commissioner/trials/${trialId}/eligible-teams`
  );
};

const assignTeamsToTrial = (trialId, teamIds) => {

  return api.post(
    `/api/commissioner/trials/${trialId}/teams`,
    {
      teamIds,
    }
  );
};

const removeTeamFromTrial = (trialId, teamId) => {

  return api.delete(
    `/api/commissioner/trials/${trialId}/teams/${teamId}`
  );
};

export default {
  importTeams,
  getEligibleTeams,
  assignTeamsToTrial,
  removeTeamFromTrial,
};