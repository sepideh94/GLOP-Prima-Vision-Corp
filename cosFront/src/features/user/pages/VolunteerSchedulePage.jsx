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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import appTheme from "../../../common/theme/appTheme";
import userService from "../services/userService";
import trialService from "../../trial/services/trialService";
import competitionService from "../../competition/services/competitionService";

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function VolunteerSchedulePage() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [volunteers, setVolunteers] = useState([]);
  const [trials, setTrials] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [schedules, setSchedules] = useState([]);

  // Form state
  const [form, setForm] = useState({
    volunteer: null,
    event: null,
    competition: null,
    trial: null,
  });

  // Form-specific competitions and trials
  const [formCompetitions, setFormCompetitions] = useState([]);
  const [formTrials, setFormTrials] = useState([]);

  // Filters
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [volunteerSearch, setVolunteerSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      loadCompetitions(selectedEvent.id);
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedCompetition) {
      loadTrials(selectedCompetition.id);
    }
  }, [selectedCompetition]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, eventsData] = await Promise.all([
        userService.getUsers(),
        competitionService.getEvents(),
      ]);

      // Filtrer uniquement les volontaires
      const volunteersList = usersData.filter(
        (user) =>
          user.role === "VOLUNTEER" ||
          user.role === "ROLE_VOLUNTEER" ||
          user.role?.toUpperCase() === "VOLUNTEER"
      );
      setVolunteers(volunteersList);
      setEvents(eventsData || []);
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      setError("Erreur lors du chargement des données");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const loadCompetitions = async (eventId) => {
    try {
      const competitionsData = await competitionService.getCompetitionsByEvent(
        eventId
      );
      setCompetitions(competitionsData || []);
      setSelectedCompetition(null);
      setTrials([]);
    } catch (err) {
      console.error("Erreur lors du chargement des compétitions:", err);
    }
  };

  const loadTrials = async (competitionId) => {
    try {
      const trialsData = await trialService.getTrialsByCompetition(
        competitionId
      );
      setTrials(trialsData || []);
    } catch (err) {
      console.error("Erreur lors du chargement des épreuves:", err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenForm = () => {
    setForm({
      volunteer: null,
      event: null,
      competition: null,
      trial: null,
    });
    setFormCompetitions([]);
    setFormTrials([]);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setForm({
      volunteer: null,
      event: null,
      competition: null,
      trial: null,
    });
    setFormCompetitions([]);
    setFormTrials([]);
  };

  // Load competitions when event is selected in form
  useEffect(() => {
    if (form.event && openForm) {
      loadCompetitionsForForm(form.event.id);
    } else if (!form.event && openForm) {
      setFormCompetitions([]);
      setFormTrials([]);
    }
  }, [form.event, openForm]);

  // Load trials when competition is selected in form
  useEffect(() => {
    if (form.competition && openForm) {
      loadTrialsForForm(form.competition.id);
    } else if (!form.competition && openForm) {
      setFormTrials([]);
    }
  }, [form.competition, openForm]);

  const loadCompetitionsForForm = async (eventId) => {
    try {
      const competitionsData = await competitionService.getCompetitionsByEvent(
        eventId
      );
      setFormCompetitions(competitionsData || []);
      setForm((prev) => ({ ...prev, competition: null, trial: null }));
      setFormTrials([]);
    } catch (err) {
      console.error("Erreur lors du chargement des compétitions:", err);
      setFormCompetitions([]);
    }
  };

  const loadTrialsForForm = async (competitionId) => {
    try {
      const trialsData = await trialService.getTrialsByCompetition(
        competitionId
      );
      setFormTrials(trialsData || []);
      setForm((prev) => ({ ...prev, trial: null }));
    } catch (err) {
      console.error("Erreur lors du chargement des épreuves:", err);
      setFormTrials([]);
    }
  };

  const handleSave = async () => {
    try {
      if (!form.volunteer || !form.event || !form.competition || !form.trial) {
        setError("Veuillez remplir tous les champs obligatoires");
        setOpenSnackbar(true);
        return;
      }

      // TODO: Implémenter l'appel API pour sauvegarder le planning
      // const payload = {
      //   volunteerId: form.volunteer.id,
      //   eventId: form.event.id,
      //   competitionId: form.competition.id,
      //   trialId: form.trial.id,
      // };
      // await volunteerScheduleService.createSchedule(payload);

      setSuccessMessage("Planning créé avec succès");
      setOpenSnackbar(true);
      handleCloseForm();
      // Recharger les données
      // loadSchedules();
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors de la création du planning"
      );
      setOpenSnackbar(true);
    }
  };

  const handleDelete = async (scheduleId) => {
    try {
      // TODO: Implémenter l'appel API pour supprimer
      // await volunteerScheduleService.deleteSchedule(scheduleId);
      setSuccessMessage("Planning supprimé avec succès");
      setOpenSnackbar(true);
      // loadSchedules();
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors de la suppression"
      );
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError(null);
    setSuccessMessage(null);
  };

  // Filtrer les volontaires pour l'autocomplete
  const filteredVolunteers = volunteers.filter((volunteer) => {
    if (!volunteerSearch) return true;
    const search = volunteerSearch.toLowerCase();
    const name = `${volunteer.firstName || ""} ${volunteer.lastName || ""}`.toLowerCase();
    const email = (volunteer.email || "").toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  return (
    <Box sx={{ p: 4, background: appTheme.gradients.page, minHeight: "100vh" }}>
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

      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 32,
            fontWeight: 900,
            color: appTheme.colors.dark,
            letterSpacing: "-0.5px",
          }}
        >
          Gestion du planning des volontaires
        </Typography>

        <Button
          startIcon={<AddIcon />}
          onClick={handleOpenForm}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1.1,
            borderRadius: appTheme.radius.pill,
            background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
            color: appTheme.colors.dark,
          }}
        >
          Ajouter un planning
        </Button>
      </Box>

      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: 16,
            },
          }}
        >
          <Tab label="Planning" />
          <Tab label="Épreuve" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: appTheme.radius.lg,
              overflow: "hidden",
              boxShadow: appTheme.shadows.card,
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ background: appTheme.gradients.card }}>
                  <TableCell sx={{ color: appTheme.colors.textPrimary, fontWeight: 700 }}>
                    Volontaire
                  </TableCell>
                  <TableCell sx={{ color: appTheme.colors.textPrimary, fontWeight: 700 }}>
                    Épreuve
                  </TableCell>
                  <TableCell sx={{ color: appTheme.colors.textPrimary, fontWeight: 700 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                      <Typography color={appTheme.colors.textMuted}>
                        Aucun planning enregistré
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.map((schedule) => (
                    <TableRow key={schedule.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>
                          {schedule.volunteerName}
                        </Typography>
                      </TableCell>
                      <TableCell>{schedule.trialName}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(schedule.id)}
                          sx={{ color: "#ef4444" }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={events}
                getOptionLabel={(option) => option.name || ""}
                value={selectedEvent}
                onChange={(event, newValue) => {
                  setSelectedEvent(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Événement"
                    placeholder="Sélectionner un événement"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={competitions}
                getOptionLabel={(option) => option.name || ""}
                value={selectedCompetition}
                onChange={(event, newValue) => {
                  setSelectedCompetition(newValue);
                }}
                disabled={!selectedEvent}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Compétition"
                    placeholder="Sélectionner une compétition"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        {trials.length > 0 && (
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: appTheme.radius.lg,
              overflow: "hidden",
              boxShadow: appTheme.shadows.card,
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ background: appTheme.gradients.card }}>
                  <TableCell sx={{ color: appTheme.colors.textPrimary, fontWeight: 700 }}>
                    Nom
                  </TableCell>
                  <TableCell sx={{ color: appTheme.colors.textPrimary, fontWeight: 700 }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ color: appTheme.colors.textPrimary, fontWeight: 700 }}>
                    Heure de fin
                  </TableCell>
                  <TableCell sx={{ color: appTheme.colors.textPrimary, fontWeight: 700 }}>
                    Statut
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trials.map((trial) => (
                  <TableRow key={trial.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{trial.name}</Typography>
                    </TableCell>
                    <TableCell>
                      {trial.endDate
                        ? new Date(trial.endDate).toLocaleDateString("fr-FR")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {trial.endHour
                        ? trial.endHour.substring(0, 5)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={trial.statusLabel || "À venir"}
                        size="small"
                        sx={{
                          background:
                            trial.statusLabel === "À venir"
                              ? "rgba(250,204,21,0.25)"
                              : trial.statusLabel === "En cours"
                              ? "rgba(34,211,238,0.25)"
                              : trial.statusLabel === "Annulée"
                              ? "rgba(239,68,68,0.25)"
                              : "rgba(34,197,94,0.25)",
                          color: appTheme.colors.dark,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {selectedCompetition && trials.length === 0 && (
          <Box
            sx={{
              p: 3,
              borderRadius: appTheme.radius.lg,
              background: appTheme.colors.darkSoft,
              textAlign: "center",
            }}
          >
            <Typography color={appTheme.colors.textMuted}>
              Aucune épreuve trouvée pour cette compétition
            </Typography>
          </Box>
        )}

        {!selectedCompetition && (
          <Box
            sx={{
              p: 3,
              borderRadius: appTheme.radius.lg,
              background: appTheme.colors.darkSoft,
              textAlign: "center",
            }}
          >
            <Typography color={appTheme.colors.textMuted}>
              Veuillez sélectionner un événement et une compétition
            </Typography>
          </Box>
        )}
      </TabPanel>

      {/* Dialog de création/édition */}
      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Ajouter un planning
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            <Autocomplete
              options={filteredVolunteers}
              getOptionLabel={(option) =>
                `${option.firstName} ${option.lastName} (${option.email})`
              }
              value={form.volunteer}
              onChange={(event, newValue) => {
                setForm({ ...form, volunteer: newValue });
              }}
              onInputChange={(event, newInputValue) => {
                setVolunteerSearch(newInputValue);
              }}
              inputValue={volunteerSearch}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Volontaire *"
                  placeholder="Rechercher un volontaire..."
                />
              )}
              noOptionsText="Aucun volontaire trouvé"
            />

            <Autocomplete
              options={events}
              getOptionLabel={(option) => option.name || ""}
              value={form.event}
              onChange={(event, newValue) => {
                setForm({ ...form, event: newValue, competition: null, trial: null });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Événement *"
                  placeholder="Sélectionner un événement"
                />
              )}
            />

            <Autocomplete
              options={formCompetitions}
              getOptionLabel={(option) => option.name || ""}
              value={form.competition}
              onChange={(event, newValue) => {
                setForm({ ...form, competition: newValue, trial: null });
              }}
              disabled={!form.event || formCompetitions.length === 0}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Compétition *"
                  placeholder="Sélectionner une compétition"
                  helperText={
                    !form.event
                      ? "Veuillez d'abord sélectionner un événement"
                      : formCompetitions.length === 0
                      ? "Aucune compétition disponible pour cet événement"
                      : ""
                  }
                />
              )}
            />

            <Autocomplete
              options={formTrials}
              getOptionLabel={(option) => option.name || ""}
              value={form.trial}
              onChange={(event, newValue) => {
                setForm({ ...form, trial: newValue });
              }}
              disabled={!form.competition || formTrials.length === 0}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Épreuve *"
                  placeholder="Sélectionner une épreuve"
                  helperText={
                    !form.competition
                      ? "Veuillez d'abord sélectionner une compétition"
                      : formTrials.length === 0
                      ? "Aucune épreuve disponible pour cette compétition"
                      : ""
                  }
                />
              )}
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
