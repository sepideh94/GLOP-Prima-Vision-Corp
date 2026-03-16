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

const getEligibleTeams = async (trialId) => {
  const res = await api.get(
    `/api/commissioner/trials/${trialId}/eligible-teams`
  );
  return res.data;
};

const assignTeamsToTrial = async (trialId, teamIds) => {
  const res = await api.post(
    `/api/commissioner/trials/${trialId}/assign-teams`,
    {
      teamIds,
    }
  );
  return res.data;
};

const removeTeamFromTrial = async (trialId, teamId) => {
  await api.delete(
    `/api/commissioner/trials/${trialId}/teams/${teamId}`
  );
};

export default {
  importTeams,
  getEligibleTeams,
  assignTeamsToTrial,
  removeTeamFromTrial,
};