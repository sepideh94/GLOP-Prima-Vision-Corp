import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Slide,
} from "@mui/material";
import { Add, ArrowBack } from "@mui/icons-material";
import eventService from "../../../common/api/eventService";
import { useAuth } from "../../../common/contexts/AuthContext";
import EventCard from "../components/EventCard";
import DatePickerForm from "../../../common/components/DatePickerForm";
import appTheme from "../../../common/theme/appTheme";

export default function EventsList() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === "ADMIN" || role === "ROLE_ADMIN";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadEvents();
  }, []);

  const SlideTransition = (props) => {
    return <Slide {...props} direction="up" />;
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents();
      const sorted = [...data].sort(
        (a, b) => new Date(a.startDate) - new Date(b.startDate)
      );
      setEvents(sorted);
    } catch (err) {
      setError("Erreur lors du chargement des événements");
      setOpenSnackbar(true);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (event = null) => {
    if (event) {
      setEditingEvent(event);
      const date = new Date(event.startDate);
      // Pour les inputs type="date", on ne garde que la partie yyyy-MM-dd
      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 10);
      let localEndDate = "";
      if (event.endDate) {
        const end = new Date(event.endDate);
        localEndDate = new Date(
          end.getTime() - end.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 10);
      }
      setFormData({
        name: event.name,
        description: event.description || "",
        startDate: localDate,
        endDate: localEndDate,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEvent(null);
    setFormData({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
    });
    setFormErrors({});
  };

  const handleSubmit = async () => {
    // Validation du formulaire
    const errors = {};
    if (!formData.name.trim()) errors.name = "Le nom est obligatoire";
    if (!formData.startDate) errors.startDate = "La date de début est obligatoire";
    if (!formData.endDate) errors.endDate = "La date de fin est obligatoire";

    // Validation : la date de fin doit être après la date de début
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        errors.endDate = "La date de fin doit être après la date de début";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    
    try {

      const submitData = {
        name: formData.name,
        description: formData.description || null,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };

      if (editingEvent) {
        const eventId = editingEvent.id ?? editingEvent.idEvent;
        await eventService.updateEvent(eventId, submitData);
      } else {
        await eventService.createEvent(submitData);
      }
      await loadEvents();
      handleCloseDialog();
    } catch (err) {
      setError(
        editingEvent
          ? "Erreur lors de la modification de l'événement"
          : "Erreur lors de la création de l'événement"
      );
      setOpenSnackbar(true);
      console.error(err);
    }
  };

  if (loading) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
      <CircularProgress />
    </Box>
  );
}

return (
  <Box sx={{ p: 4 }}>
    <Button
      startIcon={<ArrowBack />}
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
      Retour au tableau de bord
    </Button>

    <Box sx={{ mb: 5 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 32,
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: "-0.5px",
              lineHeight: 1.1,
            }}
          >
            Gestion des Événements
          </Typography>
        </Box>

        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1.2,
              borderRadius: "999px",
              background: "linear-gradient(135deg, #22d3ee, #3b82f6)",
              boxShadow: "0 8px 20px rgba(59,130,246,0.35)",
              "&:hover": {
                background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
              },
            }}
          >
            Ajouter un événement
          </Button>
        )}
      </Box>
    </Box>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 3,
      }}
    >
      {events.map((event) => (
        <EventCard
          key={event.idEvent || event.id}
          event={event}
          isAdmin={isAdmin}
          onEdit={handleOpenDialog}
        />
      ))}
    </Box>

    <Snackbar
      open={openSnackbar}
      autoHideDuration={6000}
      onClose={handleCloseSnackbar}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: "100%" }}>
        {error}
      </Alert>
    </Snackbar>

    <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
      <DialogTitle>
        {editingEvent ? "Modifier l’événement" : "Créer un événement"}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Nom"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (formErrors.name) {
                setFormErrors({ ...formErrors, name: undefined });
              }
            }}
            error={!!formErrors.name}
            helperText={formErrors.name}
            required
          />

          <TextField
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              if (formErrors.description) {
                setFormErrors({ ...formErrors, description: undefined });
              }
            }}
            error={!!formErrors.description}
            helperText={formErrors.description}
          />

          <DatePickerForm
            label="Date de début"
            name="startDate"
            value={formData.startDate}
            onChange={(e) => {
              setFormData({ ...formData, startDate: e.target.value });
              if (formErrors.startDate) {
                setFormErrors({ ...formErrors, startDate: undefined });
              }
            }}
            error={!!formErrors.startDate}
            helperText={formErrors.startDate}
            disablePast
            required
          />

          <DatePickerForm
            label="Date de fin"
            name="endDate"
            value={formData.endDate}
            onChange={(e) => {
              setFormData({ ...formData, endDate: e.target.value });
              if (formErrors.endDate) {
                setFormErrors({ ...formErrors, endDate: undefined });
              }
            }}
            error={!!formErrors.endDate}
            helperText={formErrors.endDate}
            minDate={formData.startDate}
            disablePast={!formData.startDate}
            required
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCloseDialog}>Annuler</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
);
}
