import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import appTheme from "../../../common/theme/appTheme";

import trialService from "../services/trialService";
import competitionService from "../../competition/services/competitionService";

import ImportParticipantsDialog from "../../participant/pages/ImportParticipantsDialog";
import TrialFormDialog from "./TrialFormDialog";
import TrialDetailDialog from "./TrialDetailDialog";


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

const formatTime = (time) =>
  time && time.length >= 5 ? time.substring(0, 5) : "";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

const formatDateTime = (date, time) =>
  date ? `${formatDate(date)} à ${formatTime(time)}` : "";

const truncateText = (text, max) =>
  text && text.length > max ? text.substring(0, max) + "..." : text || "";

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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [openForm, setOpenForm] = useState(false);
  const [editingTrial, setEditingTrial] = useState(null);

  const [openDetail, setOpenDetail] = useState(false);
  const [viewingTrial, setViewingTrial] = useState(null);

  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [trialToCancel, setTrialToCancel] = useState(null);

  const [openImport, setOpenImport] = useState(false);

  useEffect(() => {
    competitionService
      .getCompetitionCommissioner(competitionId)
      .then(setCompetition);

    trialService
      .getTrialsByCompetition(competitionId)
      .then(setTrials)
      .finally(() => setLoading(false));
  }, [competitionId]);

  if (loading) return <p>Chargement...</p>;

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
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() =>
          navigate(`/commissioner/competitions?eventId=${competition?.parentEventId}`)
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

      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: 32, fontWeight: 900 }}>
          Gestion des épreuves
        </Typography>

        <Tooltip
          title={competition?.statusLabel === "Terminée" ? "Import impossible pour une compétition terminée" : ""}
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
                background: competition?.statusLabel === "Terminée"
                  ? "rgba(128, 128, 128, 0.3)"
                  : appTheme.gradients.navbar,
                color: competition?.statusLabel === "Terminée"
                  ? "rgba(0, 0, 0, 0.4)"
                  : appTheme.colors.dark,
              }}
            >
              Importer les participants
            </Button>
          </span>
        </Tooltip>
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
                {["name", "startDate", "endDate", "mode", "categoryGender", "statusLabel"].map(
                  (key, i) => (
                    <td key={i} onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
                      <strong>
                        {["Nom", "Début", "Fin", "Mode", "Catégorie", "Statut"][i]}
                      </strong>
                      <UnfoldMoreIcon sx={{ fontSize: 16, ml: 0.5 }} />
                    </td>
                  )
                )}
                <td><strong>Actions</strong></td>
              </tr>
            </thead>

            <tbody>
              {sortedTrials.map((t) => (
                <tr key={t.id}>
                  <td className="fw-bold">{truncateText(t.name, 30)}</td>
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
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn"
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

                      {t.statusLabel === "À venir" && (
                        <>
                          <button
                            className="btn"
                            style={{
                              borderRadius: appTheme.radius.pill,
                              background: appTheme.gradients.navbar,
                              color: appTheme.colors.dark,
                              padding: "4px 12px",
                            }}
                            onClick={() => {
                              setEditingTrial(t);
                              setOpenForm(true);
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </button>

                          <button
                            className="btn"
                            style={{
                              borderRadius: appTheme.radius.pill,
                              background: "linear-gradient(135deg, #EF4444, #DC2626)",
                              color: "#fff",
                              padding: "4px 12px",
                            }}
                            onClick={() => {
                              setTrialToCancel(t);
                              setOpenCancelConfirm(true);
                            }}
                          >
                            <CancelIcon sx={{ fontSize: 16 }} />
                          </button>
                        </>
                      )}
                    </div>
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

      <Dialog
        open={openCancelConfirm}
        onClose={() => {
          setOpenCancelConfirm(false);
          setTrialToCancel(null);
        }}
        maxWidth="xs"
        fullWidth
       >
       <DialogTitle sx={{ fontWeight: 700 }}>
          Confirmer l'annulation
       </DialogTitle>

       <DialogContent>
       <Typography>
          Êtes-vous sûr de vouloir annuler l'épreuve{" "}
          <strong>{trialToCancel?.name}</strong> ?
        </Typography>

        <Typography
        sx={{
        mt: 1,
        color: "error.main",
        fontSize: "0.9rem",
        }}
        >
        Cette action est irréversible.
        </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={() => {
            setOpenCancelConfirm(false);
            setTrialToCancel(null);
          }}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1,
            minWidth: 120,
            borderRadius: appTheme.radius.pill,
            background: "linear-gradient(135deg, #86efac, #4ade80)",
            color: "#064e3b",
           }}
           >
             Annuler
        </Button>

        <Button
          onClick={handleCancelTrial}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1,
            minWidth: 120,
            borderRadius: appTheme.radius.pill,
            background: "linear-gradient(135deg, #EF4444, #DC2626)",
            color: "#fff",
          }}
          >
           Confirmer
        </Button>
      </DialogActions>
      </Dialog>

      <ImportParticipantsDialog
        open={openImport}
        onClose={() => setOpenImport(false)}
        competitionId={competitionId}
        competitionName={competition?.name}
      />
    </Box>
  );
}
