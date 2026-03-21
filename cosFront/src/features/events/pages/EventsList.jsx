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
import WysiwygEditor from "../../../common/components/WysiwygEditor";

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
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (event = null) => {
    if (event) {
      setEditingEvent(event);
      const date = new Date(event.startDate);
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
    setFormErrors({});
  };

  const handleSubmit = async () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Le nom est obligatoire";
    if (!formData.startDate) errors.startDate = "La date de début est obligatoire";
    if (!formData.endDate) errors.endDate = "La date de fin est obligatoire";

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        errors.endDate = "La date de fin doit être après la date de début";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (editingEvent) {
        const id = editingEvent.id ?? editingEvent.idEvent;
        await eventService.updateEvent(id, payload);
      } else {
        await eventService.createEvent(payload);
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
        Retour
      </Button>

      <Box sx={{ mb: 5, display: "flex", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: 32, fontWeight: 900 }}>
          Gestion des Événements
        </Typography>

        {isAdmin && (
          <Button
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
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
            Ajouter un événement
          </Button>
        )}
      </Box>

      <Box sx={{ display: "grid", gap: 3 }}>
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
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
        <DialogTitle>
          {editingEvent ? "Modifier l’événement" : "Créer un événement"}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Nom"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
            />

            <WysiwygEditor
              label="Description"
              value={formData.description}
              onChange={(html) => setFormData({ ...formData, description: html })}
            />

            <DatePickerForm
              label="Date de début"
              name="startDate"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              error={!!formErrors.startDate}
              helperText={formErrors.startDate}
              disablePast
            />

            <DatePickerForm
              label="Date de fin"
              name="endDate"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              error={!!formErrors.endDate}
              helperText={formErrors.endDate}
              minDate={formData.startDate}
              disablePast={!formData.startDate}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            sx={{
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
              "&:hover": {
                background: "linear-gradient(135deg, #4ade80, #22c55e)",
              },
            }}
          >
            Annuler
          </Button>

          <Button
            onClick={handleSubmit}
            sx={{
              mb: 2,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1.1,
              minWidth: 130,
              borderRadius: appTheme.radius.pill,
              background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
              color: appTheme.colors.dark,
            }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
