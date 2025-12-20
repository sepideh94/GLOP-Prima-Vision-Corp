import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import appTheme from "../../../common/theme/appTheme";

import trialService from "../services/trialService";
import competitionService from "../../competition/services/competitionService";
import TrialFormDialog from "./TrialFormDialog";


const getLabelFromEnum = (value, options) => {
  const found = options.find((opt) => opt.value === value);
  return found ? found.label : value || "-";
};

const MODE_OPTIONS = [
  { value: "INDIVIDUAL", label: "Individuel" },
  { value: "TEAM", label: "Équipe" },
];

const CATEGORY_OPTIONS = [
  { value: "MALE", label: "Homme" },
  { value: "FEMALE", label: "Femme" },
  { value: "MIXTE", label: "Mixte" },
];

const formatTime = (time) => {
  if (!time) return "";
  return time.length >= 5 ? time.substring(0, 5) : time;
};

const formatDateTime = (date, time) => {
  if (!date) return "";
  if (!time) return date;
  return `${date} à ${formatTime(time)}`;
};

/*  STATUT */

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


export default function TrialListPage() {
  const { competitionId } = useParams();
  const navigate = useNavigate();

  const [competition, setCompetition] = useState(null);
  const [eventInfo, setEventInfo] = useState(null);
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editingTrial, setEditingTrial] = useState(null);

  useEffect(() => {
    competitionService
      .getCompetition(competitionId)
      .then((res) => {
        setCompetition(res);
        if (res.parentEventId) {
          competitionService.getEvent(res.parentEventId).then(setEventInfo);
        }
      });
  }, [competitionId]);

  useEffect(() => {
    trialService
      .getTrialsByCompetition(competitionId)
      .then(setTrials)
      .finally(() => setLoading(false));
  }, [competitionId]);

  const handleSave = async (form) => {
    const payload = {
      trialName: form.trialName,
      roundNumber: form.roundNumber ? Number(form.roundNumber) : null,
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
      roundId: Number(form.roundId),
    };

    try {
      if (editingTrial) {
        const updated = await trialService.updateTrial(editingTrial.id, payload);
        setTrials((prev) =>
          prev.map((t) => (t.id === editingTrial.id ? updated : t))
        );
      } else {
        const created = await trialService.createTrial(payload);
        setTrials((prev) => [...prev, created]);
      }

      setOpenForm(false);
      setEditingTrial(null);
    } catch (error) {
      // Return the error message from backend to the dialog
      const errorMessage = error.response?.data?.message || error.message || "Une erreur s'est produite";
      throw new Error(errorMessage);
    }
  };

  const handleCancelTrial = async (trialId) => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir annuler cette épreuve ? Cette action est irréversible."
    );

    if (!confirmed) return;

    try {
      const cancelled = await trialService.cancelTrial(trialId);
      setTrials((prev) =>
        prev.map((t) => (t.id === trialId ? cancelled : t))
      );
    } catch (err) {
      console.error("Erreur lors de l'annulation de l'épreuve :", err);
      alert(err.response?.data?.message || "Une erreur s'est produite lors de l'annulation");
    }
  };

  if (loading) return <p>Chargement...</p>;

  const filteredTrials = trials.filter((t) =>
    (t.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 4, background: appTheme.gradients.page, minHeight: "100vh" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/admin/competitions")}
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

      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {eventInfo?.name} / {competition?.name} / Épreuves
      </Typography>

      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: 32, fontWeight: 900 }}>
          Gestion des épreuves
        </Typography>

        <Button
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1.1,
            borderRadius: appTheme.radius.pill,
            background: appTheme.gradients.navbar,
            color: appTheme.colors.dark,
          }}
        >
          Ajouter une épreuve
        </Button>
      </Box>

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

      <div className="card" style={{ borderRadius: 22, overflow: "hidden" }}>
        <div className="card-header d-flex justify-content-between align-items-center">
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
                <td style={{ width: "32%" }}><strong>Nom</strong></td>
                <td style={{ width: "14%" }}><strong>Début</strong></td>
                <td style={{ width: "14%" }}><strong>Fin</strong></td>
                <td style={{ width: "10%" }}><strong>Mode</strong></td>
                <td style={{ width: "10%" }}><strong>Catégorie</strong></td>
                <td style={{ width: "10%" }}><strong>Statut</strong></td>
                <td style={{ width: "10%" }}><strong>Actions</strong></td>
              </tr>
            </thead>

            <tbody>
              {filteredTrials.map((t) => {
                return (
                  <tr key={t.id}>
                    <td className="fw-bold">{t.name}</td>
                    <td>{formatDateTime(t.startDate, t.startHour)}</td>
                    <td>{formatDateTime(t.endDate, t.endHour)}</td>
                    <td>{getLabelFromEnum(t.mode, MODE_OPTIONS)}</td>
                    <td>{getLabelFromEnum(t.categoryGender, CATEGORY_OPTIONS)}</td>
                    <td>
                      <span style={getStatusStyle(t.statusLabel)}>
                        {t.statusLabel}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn d-flex align-items-center gap-1"
                          style={{
                            borderRadius: appTheme.radius.pill,
                            background: appTheme.gradients.navbar,
                            color: appTheme.colors.dark,
                            fontWeight: 700,
                            padding: "4px 12px",
                            fontSize: 13,
                          }}
                          onClick={() => {
                            setEditingTrial(t);
                            setOpenForm(true);
                          }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                          Modifier
                        </button>

                        {!t.cancelled && t.status !== "COMPLETED" && (
                          <button
                            className="btn d-flex align-items-center gap-1"
                            style={{
                              borderRadius: appTheme.radius.pill,
                              background: "linear-gradient(135deg, #EF4444, #DC2626)",
                              color: "#fff",
                              fontWeight: 700,
                              padding: "4px 12px",
                              fontSize: 13,
                            }}
                            onClick={() => handleCancelTrial(t.id)}
                          >
                            <CancelIcon sx={{ fontSize: 16 }} />
                            Annuler
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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
      />
    </Box>
  );
}
