import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Add,
  Edit,
  CalendarToday,
} from "@mui/icons-material";
import eventService from "../../../common/api/eventService";
import { useAuth } from "../../../common/contexts/AuthContext";

export default function EventsList() {
  const { user, role } = useAuth();
  const isAdmin = role === "ADMIN" || role === "ROLE_ADMIN";
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "#f9fafb", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Events List
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: "#1976d2" }}
          >
            Créer un événement
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        {events.length === 0 ? (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ p: 3, textAlign: "center" }}
          >
            Aucun événement disponible.
          </Typography>
        ) : (
          <List>
            {events.map((event) => (
              <ListItem
                key={event.idEvent}
                sx={{
                  borderBottom: "1px solid #e0e0e0",
                  "&:last-child": { borderBottom: "none" },
                  py: 2,
                }}
                secondaryAction={
                  isAdmin && (
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleOpenDialog(event)}
                    >
                      Modifier
                    </Button>
                  )
                }
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      navigate(`/admin/competitions?eventId=${event.idEvent}`)
                    }
                  >
                    <CalendarToday sx={{ color: "#1976d2", fontSize: 32 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {event.name}
                    </Typography>
                    {event.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {event.description}
                      </Typography>
                    )}
                    <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        <strong>Début:</strong>{" "}
                        {event.startDate
                          ? new Date(event.startDate).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Non définie"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <strong>Fin:</strong>{" "}
                        {event.endDate
                          ? new Date(event.endDate).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Non définie"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEvent ? "Modifier l'événement" : "Créer un événement"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Nom de l'événement"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (formErrors.name) {
                  setFormErrors({ ...formErrors, name: "" });
                }
              }}
              error={Boolean(formErrors.name)}
              helperText={formErrors.name}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <TextField
              label="Date de début"
              type="date"
              fullWidth
              required
              value={formData.startDate}
              onChange={(e) => {
                setFormData({ ...formData, startDate: e.target.value });
                // Réinitialiser l'erreur de endDate si on change startDate
                if (formErrors.endDate) {
                  setFormErrors({ ...formErrors, endDate: "" });
                }
              }}
              InputLabelProps={{
                shrink: true,
              }}
              error={Boolean(formErrors.startDate)}
              helperText={formErrors.startDate}
            />
            <TextField
              label="Date de fin"
              type="date"
              fullWidth
              required
              value={formData.endDate}
              onChange={(e) => {
                setFormData({ ...formData, endDate: e.target.value });
                // Réinitialiser l'erreur si on change endDate
                if (formErrors.endDate) {
                  setFormErrors({ ...formErrors, endDate: "" });
                }
              }}
              InputLabelProps={{
                shrink: true,
              }}
              error={Boolean(formErrors.endDate)}
              helperText={formErrors.endDate}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.name || !formData.startDate || !formData.endDate
            }
          >
            {editingEvent ? "Modifier" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

