import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from "@mui/material";
import {
  Add,
  Edit,
  CalendarToday,
} from "@mui/icons-material";
import eventService from "../../../common/api/eventService";
import { useAuth } from "../../../common/contexts/AuthContext";

const filterOptions = [
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This Week", value: "thisWeek" },
  { label: "Next Week", value: "nextWeek" },
  { label: "This Month", value: "thisMonth" },
  { label: "Next Month", value: "nextMonth" },
];

export default function EventsList() {
  const { user, role } = useAuth();
  const isAdmin = role === "ADMIN" || role === "ROLE_ADMIN";

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState(["today", "thisWeek"]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
  });

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, activeFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      setError("Erreur lors du chargement des événements");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    let filtered = events;

    if (activeFilter.length > 0) {
      filtered = events.filter((event) => {
        const eventDate = new Date(event.startDate);
        return activeFilter.some((filter) => {
          switch (filter) {
            case "today":
              return (
                eventDate >= today && eventDate < tomorrow
              );
            case "tomorrow":
              const tomorrowEnd = new Date(tomorrow);
              tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
              return eventDate >= tomorrow && eventDate < tomorrowEnd;
            case "thisWeek":
              return eventDate >= today && eventDate < nextWeek;
            case "nextWeek":
              const nextWeekEnd = new Date(nextWeek);
              nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
              return eventDate >= nextWeek && eventDate < nextWeekEnd;
            case "thisMonth":
              return eventDate >= today && eventDate <= thisMonthEnd;
            case "nextMonth":
              return eventDate > thisMonthEnd && eventDate <= nextMonthEnd;
            default:
              return true;
          }
        });
      });
    }

    filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    setFilteredEvents(filtered);
  };

  const handleFilterClick = (filterValue) => {
    setActiveFilter((prev) => {
      if (prev.includes(filterValue)) {
        return prev.filter((f) => f !== filterValue);
      } else {
        return [...prev, filterValue];
      }
    });
  };

  const handleOpenDialog = (event = null) => {
    if (event) {
      setEditingEvent(event);
      const date = new Date(event.startDate);
      const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setFormData({
        name: event.name,
        description: event.description || "",
        startDate: localDateTime,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        name: "",
        description: "",
        startDate: "",
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
    });
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        name: formData.name,
        description: formData.description || null,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      };

      if (editingEvent) {
        await eventService.updateEvent(editingEvent.idEvent, submitData);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("fr-FR", { month: "short" }).toUpperCase();
    return `${day} ${month}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
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

      <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {filterOptions.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            onClick={() => handleFilterClick(option.value)}
            color={activeFilter.includes(option.value) ? "primary" : "default"}
            variant={activeFilter.includes(option.value) ? "filled" : "outlined"}
            sx={{
              cursor: "pointer",
              fontWeight: activeFilter.includes(option.value) ? "bold" : "normal",
            }}
          />
        ))}
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        {filteredEvents.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ p: 3, textAlign: "center" }}>
            Aucun événement trouvé pour les filtres sélectionnés.
          </Typography>
        ) : (
          <List>
            {filteredEvents.map((event) => (
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
                  <CalendarToday sx={{ color: "#1976d2", fontSize: 32 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {formatDate(event.startDate)}: {event.name}
                    </Typography>
                    {event.description && (
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(event.startDate)}
                    </Typography>
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              label="Date et heure de début"
              type="datetime-local"
              fullWidth
              required
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.startDate}
          >
            {editingEvent ? "Modifier" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

