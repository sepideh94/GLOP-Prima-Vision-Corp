import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, TextField, Tooltip } from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";

import appTheme from "../../../common/theme/appTheme";

import trialService from "../services/trialService";
import competitionService from "../../competition/services/competitionService";

import ImportParticipantsDialog from "../../participant/pages/ImportParticipantsDialog";
import VolunteerManagementDialog from "../../volunteer/components/VolunteerManagementDialog";
import TrialDetailDialog from "./TrialDetailDialog";


const getStatusStyle = (statusLabel) => ({
  padding: "4px 12px",
  borderRadius: appTheme.radius.pill,
  fontWeight: 600,
  fontSize: 13,
  whiteSpace: "nowrap",
  background:
    statusLabel === "À venir"
      ? "rgba(250,204,21,0.25)"
      : statusLabel === "En cours"
      ? "rgba(34,211,238,0.25)"
      : statusLabel === "Annulée"
      ? "rgba(239,68,68,0.25)"
      : "rgba(34,197,94,0.25)",
  color: appTheme.colors.dark,
});

export default function CommissionerTrialListPage() {
  const { competitionId } = useParams();
  const navigate = useNavigate();

  const [competition, setCompetition] = useState(null);
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [openImport, setOpenImport] = useState(false);
  const [openVolunteerDialog, setOpenVolunteerDialog] = useState(false);

  const [openDetail, setOpenDetail] = useState(false);
  const [viewingTrial, setViewingTrial] = useState(null);

  useEffect(() => {
    competitionService
      .getCompetitionCommissioner(competitionId)
      .then(setCompetition);

    trialService
      .getTrialsByCompetitionCommissioner(competitionId)
      .then(setTrials)
      .finally(() => setLoading(false));
  }, [competitionId]);

  if (loading) return <p>Chargement...</p>;

  const handleSave = async (form) => {
    const payload = {
      trialName: form.trialName,
      description: form.description || null,
      rules: form.rules || null,
      startDate: form.startDate,
      startHour:
        form.startHour && form.startHour.length === 5
          ? `${form.startHour}:00`
          : form.startHour,
      endDate: form.endDate,
      endHour:
        form.endHour && form.endHour.length === 5
          ? `${form.endHour}:00`
          : form.endHour,
      mode: form.mode,
      categoryGender: form.categoryGender,
      siteId: Number(form.siteId),
      competitionId: Number(competitionId),
    };

    const updated = await trialService.updateTrialCommissioner(
      editingTrial.id,
      payload
    );

    setTrials((prev) =>
      prev.map((t) => (t.id === editingTrial.id ? updated : t))
    );

    setOpenForm(false);
    setEditingTrial(null);
  };

  const handleCancelTrial = async () => {
    const cancelled = await trialService.cancelTrialCommissioner(
      trialToCancel.id
    );

    setTrials((prev) =>
      prev.map((t) => (t.id === trialToCancel.id ? cancelled : t))
    );

    setOpenCancelConfirm(false);
    setTrialToCancel(null);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredTrials = trials.filter((t) =>
    (t.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTrials = [...filteredTrials].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (typeof aValue === "string") aValue = aValue.toLowerCase();
    if (typeof bValue === "string") bValue = bValue.toLowerCase();

    return sortConfig.direction === "asc"
      ? aValue > bValue ? 1 : -1
      : aValue < bValue ? 1 : -1;
  });

  return (
    <Box sx={{ p: 4, background: appTheme.gradients.page, minHeight: "100vh" }}>
      
      {/* Retour */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() =>
          navigate(
            `/commissioner/competitions?eventId=${competition?.parentEventId}`
          )
        }
        sx={{
          mb: 2,
          textTransform: "none",
          fontWeight: 700,
          px: 3,
          py: 1.1,
          borderRadius: appTheme.radius.pill,
          background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
          color: appTheme.colors.dark,
        }}
      >
        Retour
      </Button>

      {/* Titre + boutons */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography sx={{ fontSize: 32, fontWeight: 900 }}>
          Gestion des épreuves
        </Typography>

        {/* 🔥 Boutons rapprochés */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip
            title={
              competition?.statusLabel === "Terminée"
                ? "Import impossible pour une compétition terminée"
                : ""
            }
            arrow
          >
            <span>
              <Button
                startIcon={<UploadFileIcon />}
                onClick={() => setOpenImport(true)}
                disabled={competition?.statusLabel === "Terminée"}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  py: 1.1,
                  borderRadius: appTheme.radius.pill,
                  background:
                    competition?.statusLabel === "Terminée"
                      ? "rgba(128,128,128,0.3)"
                      : appTheme.gradients.navbar,
                  color:
                    competition?.statusLabel === "Terminée"
                      ? "rgba(0,0,0,0.4)"
                      : appTheme.colors.dark,
                }}
              >
                Importer les participants
              </Button>
            </span>
          </Tooltip>

          <Button
            startIcon={<VolunteerActivismIcon />}
            onClick={() => setOpenVolunteerDialog(true)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1.1,
              borderRadius: appTheme.radius.pill,
              background: "linear-gradient(135deg, #facc15, #22c55e)",
              color: appTheme.colors.dark,
            }}
          >
            Ajouter des volontaires
          </Button>
        </Box>
      </Box>

      {/* Nom compétition */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: appTheme.radius.lg,
          background: appTheme.colors.darkSoft,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <EmojiEventsIcon sx={{ color: appTheme.colors.green }} />
        <Typography sx={{ fontWeight: 800, color: "#fff" }}>
          {competition?.name}
        </Typography>
      </Box>

      {/* Table */}
      <div className="card" style={{ borderRadius: 22 }}>
        <div className="card-header d-flex justify-content-between">
          <strong>Liste des épreuves</strong>
          <TextField
            size="small"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="card-body">
          <table className="table align-middle">
            <thead>
              <tr>
                <td><strong>Nom</strong></td>
                <td><strong>Début</strong></td>
                <td><strong>Fin</strong></td>
                <td><strong>Mode</strong></td>
                <td><strong>Catégorie</strong></td>
                <td><strong>Statut</strong></td>
                <td><strong>Actions</strong></td>
              </tr>
            </thead>
            <tbody>
              {trials.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.startDate}</td>
                  <td>{t.endDate}</td>
                  <td>{t.mode}</td>
                  <td>{t.categoryGender}</td>
                  <td>
                    <span style={getStatusStyle(t.statusLabel)}>
                      {t.statusLabel}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn d-flex align-items-center"
                      style={{
                        borderRadius: appTheme.radius.pill,
                        background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
                        color: "#fff",
                        padding: "4px 12px",
                      }}
                      onClick={() => {
                        setViewingTrial(t);
                        setOpenDetail(true);
                      }}
                    >
                      <VisibilityIcon sx={{ fontSize: 16 }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TrialFormDialog
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditingTrial(null);
        }}
        onSave={handleSave}
        initialData={editingTrial}
        competition={competition}
        existingTrials={trials}
      />

      <TrialDetailDialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        trial={viewingTrial}
        competition={competition}
      />

      <ImportParticipantsDialog
        open={openImport}
        onClose={() => setOpenImport(false)}
        competitionId={competitionId}
        competitionName={competition?.name}
      />

      <VolunteerManagementDialog
        open={openVolunteerDialog}
        onClose={() => setOpenVolunteerDialog(false)}
        competitionId={competitionId}
        competitionName={competition?.name}
      />
    </Box>
  );
}
