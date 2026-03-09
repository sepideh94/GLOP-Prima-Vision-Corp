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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import appTheme from "../../../common/theme/appTheme";
import trialService from "../services/trialService";
import competitionService from "../../competition/services/competitionService";
import TrialFormDialog from "./TrialFormDialog";
import TrialDetailDialog from "./TrialDetailDialog";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import VolunteerManagementDialog from "../../volunteer/components/VolunteerManagementDialog";

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

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

const formatDateTime = (date, time) => {
  if (!date) return "";
  if (!time) return formatDate(date);
  return `${formatDate(date)} à ${formatTime(time)}`;
};

const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [openDetail, setOpenDetail] = useState(false);
  const [viewingTrial, setViewingTrial] = useState(null);
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [trialToCancel, setTrialToCancel] = useState(null);
  const [openVolunteerDialog, setOpenVolunteerDialog] = useState(false);

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
      ...(editingTrial ? {} : { roundName: form.roundName || "QUALIFICATION_HEAT" }),
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
      const errorMessage = error.response?.data?.message || error.message || "Une erreur s'est produite";
      throw new Error(errorMessage);
    }
  };

  const handleCancelTrial = async () => {
    if (!trialToCancel) return;
    try {
      const cancelled = await trialService.cancelTrialAdmin(trialToCancel.id);
      setTrials((prev) =>
        prev.map((t) => (t.id === trialToCancel.id ? cancelled : t))
      );
      setOpenCancelConfirm(false);
      setTrialToCancel(null);
    } catch (err) {
      console.error("Erreur lors de l'annulation de l'épreuve :", err);
      setOpenCancelConfirm(false);
      setTrialToCancel(null);
    }
  };

  if (loading) return <p>Chargement...</p>;

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
    if (sortConfig.key === "startDate" || sortConfig.key === "endDate") {
      aValue = new Date(a[sortConfig.key] + " " + (a[sortConfig.key === "startDate" ? "startHour" : "endHour"] || "00:00:00")).getTime();
      bValue = new Date(b[sortConfig.key] + " " + (b[sortConfig.key === "startDate" ? "startHour" : "endHour"] || "00:00:00")).getTime();
    } else if (sortConfig.key === "mode") {
      aValue = getLabelFromEnum(a.mode, MODE_OPTIONS);
      bValue = getLabelFromEnum(b.mode, MODE_OPTIONS);
    } else if (sortConfig.key === "categoryGender") {
      aValue = getLabelFromEnum(a.categoryGender, CATEGORY_OPTIONS);
      bValue = getLabelFromEnum(b.categoryGender, CATEGORY_OPTIONS);
    } else if (sortConfig.key === "statusLabel") {
      aValue = a.statusLabel || "";
      bValue = b.statusLabel || "";
    }
    if (typeof aValue === "string") aValue = aValue.toLowerCase();
    if (typeof bValue === "string") bValue = bValue.toLowerCase();
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <Box sx={{ p: 4, background: appTheme.gradients.page, minHeight: "100vh" }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/admin/competitions?eventId=${competition?.parentEventId || ""}`)} sx={{ mb: 2, textTransform: "none", fontWeight: 700, px: 3, py: 1.1, borderRadius: appTheme.radius.pill, background: "linear-gradient(135deg, #22D3EE, #3B82F6)", color: appTheme.colors.dark }}>
        Retour
      </Button>

      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ fontSize: 32, fontWeight: 900 }}>
            Gestion des épreuves
          </Typography>
          {eventInfo && (
            <Typography variant="subtitle1" sx={{ color: appTheme.colors.cyan, fontWeight: 600 }}>
              {eventInfo.name}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button startIcon={<AddIcon />} onClick={() => setOpenForm(true)} sx={{ textTransform: "none", fontWeight: 700, px: 3, py: 1.1, borderRadius: appTheme.radius.pill, background: appTheme.gradients.navbar, color: appTheme.colors.dark }}>
            Ajouter une épreuve
          </Button>

          <Button startIcon={<VolunteerActivismIcon />} onClick={() => setOpenVolunteerDialog(true)} sx={{ textTransform: "none", fontWeight: 700, px: 3, py: 1.1, borderRadius: appTheme.radius.pill, background: "linear-gradient(135deg, #facc15, #22c55e)", color: appTheme.colors.dark }}>
            Ajouter des volontaires
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 4, p: 3, borderRadius: appTheme.radius.lg, background: appTheme.colors.darkSoft, display: "flex", alignItems: "center", gap: 2 }}>
        <EmojiEventsIcon sx={{ color: appTheme.colors.green }} />
        <Typography sx={{ fontWeight: 800, color: "#fff" }}>
          {competition?.name}
        </Typography>
      </Box>

      <div className="card" style={{ borderRadius: 22, overflow: "hidden" }}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>Liste des épreuves</strong>
          <TextField size="small" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="card-body">
          <table className="table align-middle">
            <thead>
              <tr>
                <td style={{ width: "22%", cursor: "pointer" }} onClick={() => handleSort("name")}><strong>Nom</strong> <UnfoldMoreIcon sx={{ fontSize: 16, verticalAlign: "middle", ml: 0.5 }} /></td>
                <td style={{ width: "13%", cursor: "pointer" }} onClick={() => handleSort("startDate")}><strong>Début</strong> <UnfoldMoreIcon sx={{ fontSize: 16, verticalAlign: "middle", ml: 0.5 }} /></td>
                <td style={{ width: "13%", cursor: "pointer" }} onClick={() => handleSort("endDate")}><strong>Fin</strong> <UnfoldMoreIcon sx={{ fontSize: 16, verticalAlign: "middle", ml: 0.5 }} /></td>
                <td style={{ width: "10%", cursor: "pointer" }} onClick={() => handleSort("mode")}><strong>Mode</strong> <UnfoldMoreIcon sx={{ fontSize: 16, verticalAlign: "middle", ml: 0.5 }} /></td>
                <td style={{ width: "12%", cursor: "pointer" }} onClick={() => handleSort("categoryGender")}><strong>Catégorie</strong> <UnfoldMoreIcon sx={{ fontSize: 16, verticalAlign: "middle", ml: 0.5 }} /></td>
                <td style={{ width: "10%", cursor: "pointer" }} onClick={() => handleSort("statusLabel")}><strong>Statut</strong> <UnfoldMoreIcon sx={{ fontSize: 16, verticalAlign: "middle", ml: 0.5 }} /></td>
                <td style={{ width: "10%" }}><strong>Actions</strong></td>
              </tr>
            </thead>

            <tbody>
              {sortedTrials.map((t) => (
                <tr key={t.id}>
                  <td className="fw-bold" title={t.name}>{truncateText(t.name, 30)}</td>
                  <td>{formatDateTime(t.startDate, t.startHour)}</td>
                  <td>{formatDateTime(t.endDate, t.endHour)}</td>
                  <td>{getLabelFromEnum(t.mode, MODE_OPTIONS)}</td>
                  <td>{getLabelFromEnum(t.categoryGender, CATEGORY_OPTIONS)}</td>
                  <td><span style={getStatusStyle(t.statusLabel)}>{t.statusLabel}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn d-flex align-items-center gap-1" style={{ borderRadius: appTheme.radius.pill, background: "linear-gradient(135deg, #a78bfa, #8b5cf6)", color: "#fff", fontWeight: 700, padding: "4px 12px", fontSize: 13 }} onClick={() => { setViewingTrial(t); setOpenDetail(true); }}>
                        <VisibilityIcon sx={{ fontSize: 16 }} />
                      </button>
                      {t.statusLabel === "À venir" && (
                        <button className="btn d-flex align-items-center gap-1" style={{ borderRadius: appTheme.radius.pill, background: appTheme.gradients.navbar, color: appTheme.colors.dark, fontWeight: 700, padding: "4px 12px", fontSize: 13 }} onClick={() => { setEditingTrial(t); setOpenForm(true); }}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </button>
                      )}
                      {t.statusLabel === "À venir" && (
                        <button className="btn d-flex align-items-center gap-1" style={{ borderRadius: appTheme.radius.pill, background: "linear-gradient(135deg, #EF4444, #DC2626)", color: "#fff", fontWeight: 700, padding: "4px 12px", fontSize: 13 }} onClick={() => { setTrialToCancel(t); setOpenCancelConfirm(true); }}>
                          <CancelIcon sx={{ fontSize: 16 }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TrialFormDialog open={openForm} onClose={() => { setOpenForm(false); setEditingTrial(null); }} onSave={handleSave} initialData={editingTrial} competition={competition} existingTrials={trials} />

      <TrialDetailDialog open={openDetail} onClose={() => setOpenDetail(false)} trial={viewingTrial} competition={competition} />

      <Dialog open={openCancelConfirm} onClose={() => { setOpenCancelConfirm(false); setTrialToCancel(null); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Confirmer l'annulation
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir annuler l'épreuve <strong>{trialToCancel?.name}</strong> ?
          </Typography>
          <Typography sx={{ mt: 1, color: "error.main", fontSize: "0.9rem" }}>
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => { setOpenCancelConfirm(false); setTrialToCancel(null); }} sx={{ textTransform: "none", fontWeight: 700, px: 3, py: 1, borderRadius: appTheme.radius.pill, background: "linear-gradient(135deg, #86efac, #4ade80)", color: "#064e3b" }}>
            Annuler
          </Button>
          <Button onClick={handleCancelTrial} sx={{ textTransform: "none", fontWeight: 700, px: 3, py: 1, borderRadius: appTheme.radius.pill, background: "linear-gradient(135deg, #EF4444, #DC2626)", color: "#fff" }}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <VolunteerManagementDialog open={openVolunteerDialog} onClose={() => setOpenVolunteerDialog(false)} competitionId={competitionId} competitionName={competition?.name} />
    </Box>
  );
}