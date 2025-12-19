import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import appTheme from "../../../common/theme/appTheme";

import trialService from "../services/trialService";
import competitionService from "../../competition/services/competitionService";
import TrialFormDialog from "./TrialFormDialog";

const getLabelFromEnum = (value, options) => {
  const found = options.find((opt) => opt.value === value);
  return found ? found.label : value || "-";
};

const TRIAL_NAME_OPTIONS = [
  { value: "FIFTY_M_FREESTYLE", label: "50m nage libre" },
  { value: "HUNDRED_M_FREESTYLE", label: "100m nage libre" },
  { value: "TWO_HUNDRED_M_FREESTYLE", label: "200m nage libre" },
  { value: "FOUR_HUNDRED_M_FREESTYLE", label: "400m nage libre" },
  { value: "FIVE_HUNDRED_M_FREESTYLE", label: "500m nage libre" },
  { value: "EIGHT_HUNDRED_M_FREESTYLE", label: "800m nage libre" },
  { value: "FIFTEEN_HUNDRED_M_FREESTYLE", label: "1500m nage libre" },
  { value: "HUNDRED_M_BACKSTROKE", label: "100m dos" },
  { value: "TWO_HUNDRED_M_BACKSTROKE", label: "200m dos" },
  { value: "HUNDRED_M_BREASTSTROKE", label: "100m brasse" },
  { value: "TWO_HUNDRED_M_BREASTSTROKE", label: "200m brasse" },
  { value: "HUNDRED_M_BUTTERFLY", label: "100m papillon" },
  { value: "TWO_HUNDRED_M_BUTTERFLY", label: "200m papillon" },
  { value: "TWO_HUNDRED_M_INDIVIDUAL_MEDLEY", label: "200m 4 nages" },
  { value: "FOUR_HUNDRED_M_INDIVIDUAL_MEDLEY", label: "400m 4 nages" },
  { value: "RELAY_4X100M_FREESTYLE", label: "Relais 4×100m nage libre" },
  { value: "RELAY_4X200M_FREESTYLE", label: "Relais 4×200m nage libre" },
  { value: "RELAY_4X100M_MEDLEY", label: "Relais 4×100m 4 nages" },
];

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
  // "09:00:00" -> "09:00"
  return time.length >= 5 ? time.substring(0, 5) : time;
};

const formatDateTime = (date, time) => {
  if (!date) return "";
  if (!time) return date;
  return `${date} à ${formatTime(time)}`;
};

export default function TrialListPage() {
  const { competitionId } = useParams();

  const [competition, setCompetition] = useState(null);
  const [eventInfo, setEventInfo] = useState(null);
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [openForm, setOpenForm] = useState(false);
  const [editingTrial, setEditingTrial] = useState(null);

  // Charger la compétition et son événement
  useEffect(() => {
    competitionService
      .getCompetition(competitionId)
      .then((res) => {
        setCompetition(res);

        if (res.parentEventId) {
          competitionService.getEvent(res.parentEventId).then((event) => {
            setEventInfo(event);
          });
        }
      })
      .catch((err) => console.error("Erreur getCompetition :", err));
  }, [competitionId]);

  // Charger les trials
  useEffect(() => {
    trialService
      .getTrialsByCompetition(competitionId)
      .then((res) => setTrials(res))
      .catch((err) => console.error("Erreur getTrials :", err))
      .finally(() => setLoading(false));
  }, [competitionId]);

  const handleOpenCreate = () => {
    setEditingTrial(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (trial) => {
    setEditingTrial(trial);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingTrial(null);
  };

  const handleSave = async (form) => {
    try {
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
    } catch (err) {
      console.error("Erreur sauvegarde épreuve :", err);
      if (err.response) {
        alert(
          `Erreur lors de la sauvegarde (status ${err.response.status})`
        );
      } else {
        alert("Erreur réseau lors de la sauvegarde de l'épreuve");
      }
    }
  };

  if (loading) return <p>Chargement...</p>;

  // Filtrage
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredTrials = trials.filter((t) => {
    if (!normalizedSearch) return true;

    const name = (t.name || "").toLowerCase();
    const description = (t.description || "").toLowerCase();
    const typeLabel = getLabelFromEnum(t.trialName, TRIAL_NAME_OPTIONS).toLowerCase();
    const modeLabel = getLabelFromEnum(t.mode, MODE_OPTIONS).toLowerCase();
    const categoryLabel = getLabelFromEnum(
      t.categoryGender,
      CATEGORY_OPTIONS
    ).toLowerCase();

    const start = formatDateTime(t.startDate, t.startHour).toLowerCase();
    const end = formatDateTime(t.endDate, t.endHour).toLowerCase();

    return (
      name.includes(normalizedSearch) ||
      description.includes(normalizedSearch) ||
      typeLabel.includes(normalizedSearch) ||
      modeLabel.includes(normalizedSearch) ||
      categoryLabel.includes(normalizedSearch) ||
      start.includes(normalizedSearch) ||
      end.includes(normalizedSearch)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredTrials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTrials = filteredTrials.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  
 return (
    <Box sx={{ p: 4, background: appTheme.gradients.page, minHeight: "100vh" }}>
      
      {/* ===== Breadcrumbs ===== */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {eventInfo?.name} / {competition?.name} / Épreuves
      </Typography>

      {/* ===== Titre + bouton ===== */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: 32,
            fontWeight: 900,
            color: appTheme.colors.dark,
          }}
        >
          Gestion des épreuves
        </Typography>

        <Button
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1.2,
            borderRadius: appTheme.radius.pill,
            background: appTheme.gradients.navbar,
            color: appTheme.colors.dark,
          }}
        >
          Ajouter une épreuve
        </Button>
      </Box>

      {/* ===== BARRE COMPÉTITION (GRISE) ===== */}
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
        <EmojiEventsIcon sx={{ color: appTheme.colors.green, fontSize: 28 }} />

        <Typography
          sx={{
            fontWeight: 800,
            fontSize: 20,
            color: "#fff",
          }}
        >
          {competition?.name}
        </Typography>
      </Box>

      {/* ===== TABLE ===== */}
      <Card sx={{ borderRadius: 4 }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography fontWeight={800}>Liste des épreuves</Typography>

          <TextField
            size="small"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        <table className="table align-middle">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Type</th>
              <th>Début</th>
              <th>Fin</th>
              <th>Mode</th>
              <th>Catégorie</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {trials.map((t) => (
              <tr key={t.id}>
                <td className="fw-bold">{t.name}</td>
                <td>{getLabelFromEnum(t.trialName, TRIAL_NAME_OPTIONS)}</td>
                <td>{formatDateTime(t.startDate, t.startHour)}</td>
                <td>{formatDateTime(t.endDate, t.endHour)}</td>
                <td>{getLabelFromEnum(t.mode, MODE_OPTIONS)}</td>
                <td>{getLabelFromEnum(t.categoryGender, CATEGORY_OPTIONS)}</td>
                <td>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setEditingTrial(t);
                      setOpenForm(true);
                    }}
                  >
                    Modifier
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* ===== POPUP ===== */}
      <TrialFormDialog
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditingTrial(null);
        }}
        onSave={handleSave}
        initialData={editingTrial}
      />
    </Box>
  );
}
