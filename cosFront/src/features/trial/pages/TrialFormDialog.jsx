import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DatePickerForm from "../../../common/components/DatePickerForm";
import appTheme from "../../../common/theme/appTheme";
import trialService from "../services/trialService";
import teamService from "../../participant/services/teamService";

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

const SITE_OPTIONS = [
  { value: 1, label: "Site 1 - Piscine principale" },
  { value: 2, label: "Site 2 - Piscine secondaire" },
];

const MAX_PARTICIPANTS = 8;

const getMinWidth = (options, label) => {
  const maxOptionLength = Math.max(...options.map((opt) => opt.label.length));
  const labelLength = label.length;
  const maxLength = Math.max(maxOptionLength, labelLength);
  return `${Math.max(maxLength * 8 + 60, 150)}px`;
};

const ROUND_OPTIONS = [
  { value: "QUALIFICATION_HEAT", label: "Qualification / Heat" },
  { value: "DEMI_FINALE", label: "Demi-finale" },
  { value: "FINALE", label: "Finale" },
];

const emptyForm = {
  trialName: "",
  description: "",
  rules: "",
  startDate: "",
  startHour: "",
  endHour: "",
  mode: "",
  categoryGender: "",
  siteId: "",
  roundName: "QUALIFICATION_HEAT",
};

export default function TrialFormDialog({
  open,
  onClose,
  onSave,
  initialData,
  competition,
  existingTrials = [],
  showParticipants = false,
}) {
  const isEdit = Boolean(initialData);
  const showParticipantsTab = showParticipants && isEdit;

  // ── Onglet infos ──────────────────────────────────────
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  // ── Onglets ───────────────────────────────────────────
  const [tab, setTab] = useState(0);

  // ── Onglet participants - athlètes ───────────────────
  const [competitionAthletes, setCompetitionAthletes] = useState([]);
  const [assignedParticipants, setAssignedParticipants] = useState([]);
  const [athleteSearch, setAthleteSearch] = useState("");

  // ── Onglet participants - équipes ────────────────────
  const [competitionTeams, setCompetitionTeams] = useState([]);
  const [assignedTeams, setAssignedTeams] = useState([]);
  const [teamSearch, setTeamSearch] = useState("");

  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState("");
  const getParticipantId = (p) => p.athleteId || p.competitorId;

  // Reset formulaire + état participants à chaque ouverture
  useEffect(() => {
    if (open) {
      setTab(0);
      setError("");
      setAthleteSearch("");
      setTeamSearch("");
      setParticipantsError("");

      setCompetitionAthletes([]);
      setAssignedParticipants([]);

      setCompetitionTeams([]);
      setAssignedTeams([]);

      if (initialData) {
        setForm({
          trialName: initialData.trialName || "",
          description: initialData.description || "",
          rules: initialData.rules || "",
          startDate: initialData.startDate || "",
          startHour: initialData.startHour ? initialData.startHour.substring(0, 5) : "",
          endHour: initialData.endHour ? initialData.endHour.substring(0, 5) : "",
          mode: initialData.mode || "",
          categoryGender: initialData.categoryGender || "",
          siteId: initialData.siteId || "",
          roundName: initialData.roundName || "QUALIFICATION_HEAT",
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, initialData]);

  // ... imports inchangés

// tout le début du fichier reste IDENTIQUE
// je ne modifie rien jusqu'au useEffect participants

useEffect(() => {

  if (!open || !showParticipantsTab || !initialData?.id) return;

  setParticipantsLoading(true);
  setParticipantsError("");

  /* ================= TEAM ================= */

  if (form.mode === "TEAM") {

    Promise.all([
      teamService.getEligibleTeams(initialData.id),
      trialService.getTrialAthletes(initialData.id)
    ])
      .then(([teams, participants]) => {

        setCompetitionTeams(Array.isArray(teams) ? teams : []);

        const assigned = (participants || []).filter(
          (p) => p.competitorType?.toUpperCase() === "TEAM"
        );

        setAssignedTeams(assigned);

      })
      .catch((e) => {
        console.error(e);
        setParticipantsError("Erreur lors du chargement des équipes");
      })
      .finally(() => setParticipantsLoading(false));

  }

  /* ================= INDIVIDUAL ================= */

  else if (form.mode === "INDIVIDUAL") {

    Promise.all([
      trialService.getEligibleAthletes(initialData.id),
      trialService.getTrialAthletes(initialData.id)
    ])
      .then(([athletes, participants]) => {

        setCompetitionAthletes(Array.isArray(athletes) ? athletes : []);

        const assigned = (participants || []).filter(
          (p) => p.competitorType?.toUpperCase() === "ATHLETE"
        );

        setAssignedParticipants(assigned);

      })
      .catch((e) => {
        console.error(e);
        setParticipantsError("Erreur lors du chargement des athlètes");
      })
      .finally(() => setParticipantsLoading(false));

  }

}, [open, showParticipantsTab, initialData?.id, form.mode]);

  // ── Handlers infos ────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (
      !form.trialName ||
      !form.startDate ||
      !form.startHour ||
      !form.endHour ||
      !form.mode ||
      !form.categoryGender ||
      !form.siteId
    ) {
      setError("Merci de remplir tous les champs obligatoires (*)");
      return;
    }

    const isDuplicate = existingTrials.some((trial) => {
      if (initialData && trial.id === initialData.id) return false;
      const trialStartHour = trial.startHour ? trial.startHour.substring(0, 5) : "";
      return (
        trial.startDate === form.startDate &&
        trialStartHour === form.startHour &&
        Number(trial.siteId) === Number(form.siteId)
      );
    });

    if (isDuplicate) {
      setError("Une épreuve existe déjà à cette date, heure et sur ce site.");
      return;
    }

    setError("");
    try {
      await onSave({ ...form, endDate: form.startDate });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Une erreur s'est produite");
    }
  };

  // ── Handlers participants ─────────────────────────────
  const assignedAthleteIds = new Set(
  assignedParticipants.map((p) => getParticipantId(p))
  );
  const assignedTeamIds = new Set(
  assignedTeams.map((t) => t.competitorId || t.id)
  );

  const participantsCount =
    form.mode === "TEAM" ? assignedTeams.length : assignedParticipants.length;

  const isMaxReached = participantsCount >= MAX_PARTICIPANTS;

  const filteredAthletes = competitionAthletes.filter((a) =>
    `${a.firstName} ${a.lastName}`.toLowerCase().includes(athleteSearch.toLowerCase())
  );

  const filteredTeams = competitionTeams.filter((t) =>
    (t.name || "").toLowerCase().includes(teamSearch.toLowerCase())
  );

  const handleToggleAthlete = async (athlete) => {
    setParticipantsError("");

    if (assignedAthleteIds.has(athlete.id)) {
      try {
        await trialService.removeAthlete(initialData.id, athlete.id);
        setAssignedParticipants((prev) =>
        prev.filter((p) => getParticipantId(p) !== athlete.id)
        );
      } catch (e) {
        setParticipantsError(e.response?.data?.message || "Erreur lors du retrait de l'athlète");
      }
    } else {
      if (isMaxReached) return;
      try {
        const added = await trialService.assignAthletes(initialData.id, [athlete.id]);
        setAssignedParticipants((prev) => [...prev, ...added]);
      } catch (e) {
        const errorMessage = e.response?.data?.message || "Erreur lors de l'assignation de l'athlète";
        setParticipantsError(errorMessage);
        // Si l'erreur indique que la participation n'est pas confirmée, donner plus de détails
        if (errorMessage.includes("participation confirmée") || errorMessage.includes("participation valide")) {
          setParticipantsError(
            errorMessage + " L'athlète doit avoir une participation confirmée (statut INVITED ou CONFIRMED) à cette compétition."
          );
        }
      }
    }
  };

  const handleToggleTeam = async (team) => {

  setParticipantsError("");

  const isAssigned = assignedTeams.some(
  (t) => (t.competitorId || t.id) === team.id
  );

  try {

    if (isAssigned) {

      await teamService.removeTeamFromTrial(
        initialData.id,
        team.id
      );

      setAssignedTeams((prev) =>
        prev.filter((t) => t.competitorId !== team.id)
      );

      setCompetitionTeams((prev) => [...prev, team]);

    } else {

      if (assignedTeams.length >= MAX_PARTICIPANTS) return;

      const added = await teamService.assignTeamsToTrial(
        initialData.id,
        [team.id]
      );

      setAssignedTeams((prev) => [...prev, ...added]);

      setCompetitionTeams((prev) =>
        prev.filter((t) => t.id !== team.id)
      );

    }

  } catch (e) {

    console.error(e);

    setParticipantsError(
      e.response?.data?.message ||
      "Erreur lors de l'assignation de l'équipe"
    );

  }

};

  const handleRemoveChip = async (athleteId) => {
    setParticipantsError("");
    try {
      await trialService.removeAthlete(initialData.id, athleteId);
      setAssignedParticipants((prev) =>
      prev.filter((p) => getParticipantId(p) !== athleteId)
      );
    } catch (e) {
      setParticipantsError(e.response?.data?.message || "Erreur lors du retrait de l'athlète");
    }
  };

  const handleRemoveTeamChip = async (teamId) => {

  setParticipantsError("");

  try {

    await teamService.removeTeamFromTrial(initialData.id, teamId);

    const removedTeam = assignedTeams.find(
      (t) => (t.competitorId || t.id) === teamId
    );

    setAssignedTeams((prev) =>
      prev.filter((t) => (t.competitorId || t.id) !== teamId)
    );

    if (removedTeam) {

      setCompetitionTeams((prev) => [
        ...prev,
        {
          id: removedTeam.competitorId || removedTeam.id,
          name: removedTeam.displayName,
          members: removedTeam.members || []
        }
      ]);

    }

  } catch (e) {

    setParticipantsError(
      e.response?.data?.message ||
      "Erreur lors du retrait de l'équipe"
    );

  }

  };

  // ── Utilitaires ───────────────────────────────────────
  const formatCompDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("fr-FR");
  };

  // ── Styles boutons ────────────────────────────────────
  const btnGreen = {
    mb: 2,
    textTransform: "none",
    fontWeight: 700,
    px: 3,
    py: 1.1,
    minWidth: 130,
    borderRadius: appTheme.radius.pill,
    background: "linear-gradient(135deg, #86efac, #4ade80)",
    color: "#064e3b",
    boxShadow: "0 6px 16px rgba(74,222,128,0.35)",
    "&:hover": { background: "linear-gradient(135deg, #4ade80, #22c55e)" },
  };

  const btnBlue = {
    mb: 2,
    textTransform: "none",
    fontWeight: 700,
    minWidth: 130,
    px: 3,
    py: 1.1,
    borderRadius: appTheme.radius.pill,
    background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
    color: appTheme.colors.dark,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      sx={{
        "& .MuiDialog-container": {
          "& .MuiDialog-paper": {
            width: "90%",
            maxWidth: "1200px",
            minHeight: showParticipantsTab ? 580 : "auto",
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: showParticipantsTab ? 0 : undefined }}>
        {isEdit ? "Modifier une épreuve" : "Créer une épreuve"}
      </DialogTitle>

      {showParticipantsTab && (
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Informations épreuve" />
            <Tab label={`Participants (${participantsCount}/${MAX_PARTICIPANTS})`} />
          </Tabs>
        </Box>
      )}

      <DialogContent dividers>
        {/* ── ONGLET 0 : Informations ───────────────────── */}
        {tab === 0 && (
          <Box>
            {error && <p style={{ color: "red", marginBottom: 16 }}>{error}</p>}

            {competition && (
              <Alert
                severity="info"
                icon={<EmojiEventsIcon />}
                sx={{ mb: 3, borderRadius: 2, "& .MuiAlert-message": { width: "100%" } }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Compétition : {competition.name}
                </Typography>
                <Box sx={{ display: "flex", gap: 3 }}>
                  <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                    <strong>Début :</strong> {formatCompDate(competition.startDate)}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                    <strong>Fin :</strong> {formatCompDate(competition.endDate)}
                  </Typography>
                </Box>
              </Alert>
            )}

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Type d'épreuve *"
                  name="trialName"
                  value={form.trialName}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 300 } } } }}
                  sx={{
                    minWidth: getMinWidth(TRIAL_NAME_OPTIONS, "Type d'épreuve *"),
                    "& .MuiInputLabel-root": { whiteSpace: "nowrap", overflow: "visible" },
                    "& .MuiSelect-select": {
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      textOverflow: "clip",
                    },
                  }}
                >
                  {TRIAL_NAME_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Règles"
                  name="rules"
                  value={form.rules}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <DatePickerForm
                  fullWidth
                  label="Date*"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  disablePast
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Heure de début *"
                  type="time"
                  name="startHour"
                  value={form.startHour}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ onKeyDown: (e) => e.preventDefault() }}
                  sx={{ "& .MuiInputLabel-root": { whiteSpace: "nowrap", overflow: "visible" } }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Heure de fin *"
                  type="time"
                  name="endHour"
                  value={form.endHour}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ onKeyDown: (e) => e.preventDefault() }}
                  sx={{ "& .MuiInputLabel-root": { whiteSpace: "nowrap", overflow: "visible" } }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Mode *"
                  name="mode"
                  value={form.mode}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 300 } } } }}
                  sx={{
                    minWidth: getMinWidth(MODE_OPTIONS, "Mode *"),
                    "& .MuiInputLabel-root": { whiteSpace: "nowrap", overflow: "visible" },
                    "& .MuiSelect-select": {
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      textOverflow: "clip",
                    },
                  }}
                >
                  {MODE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Catégorie *"
                  name="categoryGender"
                  value={form.categoryGender}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 300 } } } }}
                  sx={{
                    minWidth: getMinWidth(CATEGORY_OPTIONS, "Catégorie *"),
                    "& .MuiInputLabel-root": { whiteSpace: "nowrap", overflow: "visible" },
                    "& .MuiSelect-select": {
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      textOverflow: "clip",
                    },
                  }}
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Site *"
                  name="siteId"
                  value={form.siteId}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 300 } } } }}
                  sx={{
                    minWidth: getMinWidth(SITE_OPTIONS, "Site *"),
                    "& .MuiInputLabel-root": { whiteSpace: "nowrap", overflow: "visible" },
                    "& .MuiSelect-select": {
                      whiteSpace: "nowrap",
                      overflow: "visible",
                      textOverflow: "clip",
                    },
                  }}
                >
                  {SITE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                {isEdit ? (
                  <TextField
                    fullWidth
                    label="Phase"
                    value={initialData?.roundDisplayName || "—"}
                    InputProps={{ readOnly: true }}
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiInputBase-input": { color: "text.secondary" } }}
                  />
                ) : (
                  <TextField
                    select
                    fullWidth
                    label="Phase *"
                    name="roundName"
                    value={form.roundName}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      minWidth: getMinWidth(ROUND_OPTIONS, "Phase *"),
                      "& .MuiInputLabel-root": { whiteSpace: "nowrap", overflow: "visible" },
                    }}
                  >
                    {ROUND_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ── ONGLET 1 : Participants ───────────────────── */}
        {tab === 1 && showParticipantsTab && (
          <Box>
            {/* Compteur + chips */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#555" }}>
                {participantsCount} / {MAX_PARTICIPANTS} participants assignés
              </Typography>

              {form.mode === "TEAM" ? (
                assignedTeams.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {assignedTeams.map((t) => (
                    <Chip
                      key={t.competitorId || t.id}
                      label={t.displayName || t.name || `Équipe ${t.competitorId}`}
                      onDelete={() => handleRemoveTeamChip(t.competitorId || t.id)}
                      sx={{
                        background: "rgba(34, 211, 238, 0.15)",
                        fontWeight: 600,
                        border: "1px solid rgba(34, 211, 238, 0.4)",
                      }}
                    />
                    ))}
                  </Box>
                )
                ) : (
                assignedParticipants.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {assignedParticipants.map((p) => (
                      <Chip
                        key={getParticipantId(p)}
                        label={p.displayName || `Athlète ${getParticipantId(p)}`}
                        onDelete={() => handleRemoveChip(getParticipantId(p))}
                        sx={{
                          background: "rgba(34, 211, 238, 0.15)",
                          fontWeight: 600,
                          border: "1px solid rgba(34, 211, 238, 0.4)",
                        }}
                      />
                    ))}
                  </Box>
                )
              )}
            </Box>

            {isMaxReached && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Nombre maximum de participants atteint ({MAX_PARTICIPANTS}). Retirez un participant
                pour en ajouter un autre.
              </Alert>
            )}

            {form.mode === "TEAM" ? (
              <>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Rechercher une équipe..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  sx={{ mb: 2 }}
                />

                {participantsLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                    <CircularProgress size={32} />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      maxHeight: 320,
                      overflowY: "auto",
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                    }}
                  >
                    {filteredTeams.length === 0 ? (
                      <Box sx={{ p: 3, textAlign: "center", color: "#888" }}>
                        {competitionTeams.length === 0
                          ? "Aucune équipe éligible pour cette épreuve."
                          : "Aucune équipe ne correspond à la recherche."}
                      </Box>
                    ) : (
                      filteredTeams.map((team) => {
                        const isAssigned = assignedTeamIds.has(team.id);
                        const isDisabled = isMaxReached && !isAssigned;

                        return (
                          <Box
                            key={team.id}
                            onClick={() => !isDisabled && handleToggleTeam(team)}
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              px: 2,
                              py: 1.2,
                              borderBottom: "1px solid #f0f0f0",
                              opacity: isDisabled ? 0.38 : 1,
                              cursor: isDisabled ? "not-allowed" : "pointer",
                              transition: "background 0.15s",
                              "&:last-child": { borderBottom: "none" },
                              "&:hover": isDisabled
                                ? {}
                                : { background: "rgba(34, 211, 238, 0.06)" },
                            }}
                          >
                            <Checkbox
                              checked={isAssigned}
                              disabled={isDisabled}
                              size="small"
                              sx={{ mr: 1, mt: 0.2, pointerEvents: "none" }}
                            />
                            <Box>
                              <Typography sx={{ fontWeight: isAssigned ? 600 : 400, fontSize: "0.95rem" }}>
                                {team.name}
                              </Typography>

                              {team.members?.length > 0 && (
                                <Box sx={{ mt: 0.5 }}>
                                  {team.members.map((member) => (
                                    <Typography
                                      key={member.id}
                                      variant="caption"
                                      sx={{ display: "block", color: "#888" }}
                                    >
                                      {member.firstName} {member.lastName}
                                    </Typography>
                                  ))}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        );
                      })
                    )}
                  </Box>
                )}
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Rechercher un athlète..."
                  value={athleteSearch}
                  onChange={(e) => setAthleteSearch(e.target.value)}
                  sx={{ mb: 2 }}
                />

                {participantsLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                    <CircularProgress size={32} />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      maxHeight: 320,
                      overflowY: "auto",
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                    }}
                  >
                    {filteredAthletes.length === 0 ? (
                      <Box sx={{ p: 3, textAlign: "center", color: "#888" }}>
                        {competitionAthletes.length === 0
                          ? "Aucun athlète importé pour cette compétition."
                          : "Aucun athlète ne correspond à la recherche."}
                      </Box>
                    ) : (
                      filteredAthletes.map((athlete) => {
                        const isAssigned = assignedAthleteIds.has(athlete.id);
                        const isDisabled = isMaxReached && !isAssigned;

                        return (
                          <Box
                            key={athlete.id}
                            onClick={() => !isDisabled && handleToggleAthlete(athlete)}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              px: 2,
                              py: 1.2,
                              borderBottom: "1px solid #f0f0f0",
                              opacity: isDisabled ? 0.38 : 1,
                              cursor: isDisabled ? "not-allowed" : "pointer",
                              transition: "background 0.15s",
                              "&:last-child": { borderBottom: "none" },
                              "&:hover": isDisabled
                                ? {}
                                : { background: "rgba(34, 211, 238, 0.06)" },
                            }}
                          >
                            <Checkbox
                              checked={isAssigned}
                              disabled={isDisabled}
                              size="small"
                              sx={{ mr: 1, pointerEvents: "none" }}
                            />
                            <Box>
                              <Typography
                                sx={{ fontWeight: isAssigned ? 600 : 400, fontSize: "0.95rem" }}
                              >
                                {athlete.firstName} {athlete.lastName}
                              </Typography>
                              {athlete.email && (
                                <Typography variant="caption" sx={{ color: "#888" }}>
                                  {athlete.email}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        );
                      })
                    )}
                  </Box>
                )}
              </>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={btnGreen}>
          {tab === 1 ? "Fermer" : "Annuler"}
        </Button>
        {tab === 0 && (
          <Button onClick={handleSubmit} sx={btnBlue}>
            Enregistrer
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}