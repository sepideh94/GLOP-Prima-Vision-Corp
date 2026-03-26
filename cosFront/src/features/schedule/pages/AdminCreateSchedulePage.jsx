import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Grid,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import appTheme from "../../../common/theme/appTheme";
import WysiwygEditor from "../../../common/components/WysiwygEditor";
import scheduleService from "../services/scheduleService";
import competitionService from "../../competition/services/competitionService";
import volunteerService from "../../volunteer/services/volunteerService";
import api from "../../../common/api/axiosInstance";

/** Parse une valeur datetime-local (YYYY-MM-DDTHH:mm) ; retourne null si invalide. */
function parseDateTimeLocal(value) {
  if (!value || typeof value !== "string") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function AdminCreateSchedulePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Données pour les formulaires
  const [events, setEvents] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [sites, setSites] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [dateValidationMessage, setDateValidationMessage] = useState("");

  // État du formulaire
  const [form, setForm] = useState({
    task: null,
    description: "",
    startTime: "",
    endTime: "",
    type: "VOLONTEER",
    siteId: null,
    competitionId: null,
    assignedUserIds: [],
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [eventsData, tasksData, sitesData] = await Promise.all([
        competitionService.getEvents(),
        scheduleService.getTasks(),
        api.get("/api/admin/sites").then((res) => res.data),
      ]);

      setEvents(eventsData || []);
      setTasks(tasksData || []);
      setSites(sitesData || []);
      // Les volontaires seront chargés dynamiquement selon la compétition sélectionnée
      setVolunteers([]);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError("Erreur lors du chargement des données");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const loadVolunteersForCompetition = async (competitionId) => {
    if (!competitionId) {
      setVolunteers([]);
      return;
    }

    try {
      setLoading(true);
      const volunteersData = await volunteerService.getVolunteersByCompetition(competitionId);
      setVolunteers(volunteersData || []);
      
      if (!volunteersData || volunteersData.length === 0) {
        console.warn(`Aucun volontaire trouvé pour la compétition ${competitionId}`);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des volontaires:", err);
      setError("Erreur lors du chargement des volontaires pour cette compétition");
      setOpenSnackbar(true);
      setVolunteers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = async (event) => {
    if (!event) {
      setSelectedEvent(null);
      setCompetitions([]);
      setShowForm(false);
      return;
    }

    setSelectedEvent(event);
    setShowForm(false);
    
    // Charger les compétitions de l'événement sélectionné
    try {
      const competitionsData = await competitionService.getCompetitionsByEvent(event.id || event.idEvent);
      setCompetitions(competitionsData || []);
      
      if (competitionsData && competitionsData.length > 0) {
        setShowForm(true);
      } else {
        setError("Aucune compétition disponible pour cet événement");
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des compétitions:", err);
      setError("Erreur lors du chargement des compétitions");
      setOpenSnackbar(true);
      setCompetitions([]);
    }
  };

  const handleOpenForm = () => {
    if (!selectedEvent) {
      setError("Veuillez d'abord sélectionner un événement");
      setOpenSnackbar(true);
      return;
    }
    setForm({
      task: null,
      description: "",
      startTime: "",
      endTime: "",
      type: "VOLONTEER",
      siteId: null,
      competitionId: null,
      assignedUserIds: [],
    });
    setDateValidationMessage("");
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setDateValidationMessage("");
    setOpenForm(false);
    setForm({
      task: null,
      description: "",
      startTime: "",
      endTime: "",
      type: "VOLONTEER",
      siteId: null,
      competitionId: null,
      assignedUserIds: [],
    });
  };

  const handleBackToEventSelection = () => {
    setSelectedEvent(null);
    setCompetitions([]);
    setShowForm(false);
    handleCloseForm();
  };

  const handleSave = async () => {
    try {
      setDateValidationMessage("");

      // Validation
      if (!form.task || !form.startTime || !form.endTime || !form.siteId || !form.competitionId || form.assignedUserIds.length === 0) {
        setError("Veuillez remplir tous les champs obligatoires");
        setOpenSnackbar(true);
        return;
      }

      const planStartDate = parseDateTimeLocal(form.startTime);
      const planEndDate = parseDateTimeLocal(form.endTime);

      if (!planStartDate || !planEndDate) {
        setDateValidationMessage(
          "Les dates et heures saisies ne sont pas valides. Vérifiez le format (date et heure complètes)."
        );
        return;
      }

      if (planStartDate.getTime() >= planEndDate.getTime()) {
        setDateValidationMessage(
          "La date et l'heure de fin doivent être strictement postérieures à la date et l'heure de début."
        );
        return;
      }

      // Vérifier que les dates sont dans les dates de la compétition
      try {
        const competitionData = await competitionService.getCompetition(form.competitionId);
        if (competitionData) {
          const compStartDate = new Date(competitionData.startDate);
          const compEndDate = new Date(competitionData.endDate);

          if (Number.isNaN(compStartDate.getTime()) || Number.isNaN(compEndDate.getTime())) {
            setDateValidationMessage(
              "Les dates de la compétition sont invalides côté serveur. Contactez un administrateur ou réessayez plus tard."
            );
            return;
          }

          if (planStartDate < compStartDate || planEndDate > compEndDate) {
            const fmt = (d) =>
              d.toLocaleString("fr-FR", {
                dateStyle: "short",
                timeStyle: "short",
              });
            setDateValidationMessage(
              `Les horaires du planning doivent être entièrement compris dans la période de la compétition : du ${fmt(compStartDate)} au ${fmt(compEndDate)} (fuseau local).`
            );
            return;
          }
        }
      } catch (compErr) {
        console.warn("Impossible de vérifier les dates de la compétition:", compErr);
        // On continue : le backend refusera un créneau hors période avec un message explicite
      }

      // Convertir les dates au format ISO pour le backend (LocalDateTime)
      // datetime-local retourne "YYYY-MM-DDTHH:mm", on doit ajouter ":00" pour les secondes
      const formatDateTimeForBackend = (dateTimeString) => {
        if (!dateTimeString) return null;
        // Si déjà au format ISO complet, retourner tel quel
        if (dateTimeString.includes('T') && dateTimeString.length > 16) {
          return dateTimeString;
        }
        // Sinon, ajouter les secondes si nécessaire (format: YYYY-MM-DDTHH:mm -> YYYY-MM-DDTHH:mm:00)
        return dateTimeString.length === 16 ? `${dateTimeString}:00` : dateTimeString;
      };

      // Préparer le payload pour le backend
      const taskValue = form.task?.name || form.task;
      const selectedTaskObj = tasks.find(t => t.name === taskValue);
      
      const payload = {
        task: taskValue, // Le backend attend l'enum VolunteerTask (string sera désérialisé en enum)
        title: selectedTaskObj?.label || taskValue || null, // Fallback si task est null
        description: form.description || null,
        startTime: formatDateTimeForBackend(form.startTime),
        endTime: formatDateTimeForBackend(form.endTime),
        type: form.type, // "VOLONTEER" - le backend attend ScheduleType enum
        siteId: form.siteId,
        competitionId: form.competitionId,
        assignedUserIds: form.assignedUserIds,
      };

      console.log("Payload envoyé au backend:", JSON.stringify(payload, null, 2));

      await scheduleService.createSchedule(payload);
      setSuccessMessage("Planning créé avec succès");
      setOpenSnackbar(true);
      handleCloseForm();
    } catch (err) {
      console.error("Erreur lors de la création:", err);
      console.error("Status:", err.response?.status);
      console.error("Response data:", err.response?.data);
      
      // Afficher un message d'erreur plus détaillé
      let errorMessage = "Erreur lors de la création du planning";
      
      if (err.response?.status === 500) {
        const backendMessage = err.response?.data?.message;
        
        // Messages d'erreur possibles du backend
        if (backendMessage?.includes("Compétition non trouvée")) {
          errorMessage = "La compétition sélectionnée n'existe plus.";
        } else if (backendMessage?.includes("horaires du planning doivent être compris")) {
          errorMessage = backendMessage;
        } else if (backendMessage?.includes("non trouvé") || backendMessage?.includes("introuvable")) {
          errorMessage = "Un ou plusieurs volontaires sélectionnés n'existent pas ou ne sont pas des volontaires valides.";
        } else if (backendMessage) {
          errorMessage = backendMessage;
        } else {
          errorMessage = "Erreur serveur (500). Causes possibles :\n" +
                        "- Les dates ne sont pas dans les dates de la compétition\n" +
                        "- Un volontaire sélectionné n'existe pas\n" +
                        "- Vérifiez les logs du backend pour plus de détails";
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      const isDateRelatedError =
        typeof errorMessage === "string" &&
        (errorMessage.includes("horaires du planning") ||
          errorMessage.includes("dates de la compétition") ||
          errorMessage.includes("compris dans"));

      if (isDateRelatedError) {
        setDateValidationMessage(errorMessage);
      } else {
        setError(errorMessage);
        setOpenSnackbar(true);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <Box
      sx={{
        p: 4,
        background: appTheme.gradients.page,
        minHeight: "100vh",
      }}
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/admin")}
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

      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography sx={{ fontSize: 32, fontWeight: 900 }}>
          Planning des volontaires
        </Typography>

        {selectedEvent && (
          <Button
            startIcon={<AddIcon />}
            onClick={handleOpenForm}
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
Créer un planning
          </Button>
        )}
      </Box>

      <Card
        sx={{
          mb: 4,
          p: 3,
          borderRadius: appTheme.radius.lg,
          background: appTheme.gradients.card,
          boxShadow: appTheme.shadows.card,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <EventIcon sx={{ color: appTheme.colors.cyan }} />

        <Autocomplete
          options={events}
          value={selectedEvent || null}
          getOptionLabel={(option) => option.name || ""}
          onChange={(_, newValue) => handleEventSelect(newValue)}
          loading={loading}
          sx={{
            minWidth: 320,
            backgroundColor: "rgba(34,211,238,0.15)",
            borderRadius: 2,
            "& .MuiInputBase-root": {
              color: "#e0f7fa",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#22D3EE",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#67e8f9",
            },
            "& .MuiSvgIcon-root": {
              color: "#22D3EE",
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Événement"
              InputLabelProps={{
                sx: { color: "#67e8f9" },
              }}
            />
          )}
        />
      </Card>

      {selectedEvent && competitions.length > 0 && (
        <Card
          sx={{
            p: 3,
            borderRadius: appTheme.radius.lg,
            background: appTheme.gradients.card,
            boxShadow: appTheme.shadows.card,
          }}
        >
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 700,
              color: appTheme.colors.textSecondary,
              mb: 3,
            }}
          >
            Compétitions disponibles ({competitions.length})
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {competitions.map((competition) => (
              <Chip
                key={competition.id}
                label={competition.name}
                sx={{
                  background: "rgba(34,211,238,0.15)",
                  color: "#e0f7fa",
                  fontWeight: 500,
                }}
              />
            ))}
          </Box>
        </Card>
      )}

      {/* Dialog de création */}
      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Créer un planning
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Tâche</InputLabel>
              <Select
                value={form.task?.name || form.task || ""}
                label="Tâche"
                onChange={(e) => {
                  const selectedTask = tasks.find((t) => t.name === e.target.value);
                  setForm({ ...form, task: selectedTask || e.target.value });
                }}
              >
                {tasks.map((task) => (
                  <MenuItem key={task.name} value={task.name}>
                    {task.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <WysiwygEditor
              label="Description"
              value={form.description}
              onChange={(html) => setForm({ ...form, description: html })}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Date et heure de début"
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => {
                    setDateValidationMessage("");
                    setForm({ ...form, startTime: e.target.value });
                  }}
                  fullWidth
                  required
                  error={Boolean(dateValidationMessage)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Date et heure de fin"
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) => {
                    setDateValidationMessage("");
                    setForm({ ...form, endTime: e.target.value });
                  }}
                  fullWidth
                  required
                  error={Boolean(dateValidationMessage)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>

            {dateValidationMessage ? (
              <Alert
                severity="error"
                onClose={() => setDateValidationMessage("")}
                sx={{ mt: -1 }}
              >
                {dateValidationMessage}
              </Alert>
            ) : null}

            <Autocomplete
              options={competitions}
              getOptionLabel={(option) => option.name || ""}
              value={competitions.find((c) => c.id === form.competitionId) || null}
              onChange={async (event, newValue) => {
                const newCompetitionId = newValue ? newValue.id : null;
                setForm({
                  ...form,
                  competitionId: newCompetitionId,
                  assignedUserIds: [], // Réinitialiser les volontaires assignés quand on change de compétition
                });
                // Charger les volontaires de la compétition sélectionnée
                await loadVolunteersForCompetition(newCompetitionId);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Compétition *"
                  placeholder="Sélectionner une compétition"
                  helperText={
                    competitions.length === 0
                      ? "Aucune compétition disponible"
                      : `${competitions.length} compétition(s) disponible(s)`
                  }
                />
              )}
            />

            <Autocomplete
              options={sites}
              getOptionLabel={(option) => option.adress || ""}
              value={sites.find((s) => s.id === form.siteId) || null}
              onChange={(event, newValue) => {
                setForm({
                  ...form,
                  siteId: newValue ? newValue.id : null,
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Site *"
                  placeholder="Sélectionner un site"
                />
              )}
            />

            <Autocomplete
              multiple
              options={volunteers}
              getOptionLabel={(option) =>
                `${option.firstName || ""} ${option.lastName || ""} (${option.email || ""})`
              }
              value={volunteers.filter((v) =>
                form.assignedUserIds.includes(v.id)
              )}
              onChange={(event, newValue) => {
                setForm({
                  ...form,
                  assignedUserIds: newValue.map((v) => v.id),
                });
              }}
              noOptionsText={
                volunteers.length === 0
                  ? "Aucun volontaire disponible. Créez d'abord des volontaires."
                  : "Aucun résultat"
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Volontaires assignés *"
                  placeholder={form.competitionId ? "Sélectionner un ou plusieurs volontaires" : "Sélectionnez d'abord une compétition"}
                  disabled={!form.competitionId}
                  helperText={
                    !form.competitionId
                      ? "Sélectionnez d'abord une compétition pour voir les volontaires disponibles"
                      : volunteers.length === 0
                      ? "Aucun volontaire disponible pour cette compétition. Importez des volontaires depuis la page de gestion des volontaires."
                      : `${volunteers.length} volontaire(s) disponible(s) pour cette compétition`
                  }
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={`${option.firstName || ""} ${option.lastName || ""}`}
                  />
                ))
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCloseForm}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1,
              borderRadius: appTheme.radius.pill,
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1,
              borderRadius: appTheme.radius.pill,
              background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
              color: appTheme.colors.dark,
            }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour erreurs/succès */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
