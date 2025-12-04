import  { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import CompetitionFormDialog from "./CompetitionFormDialog";
import competitionService from "../services/competitionService";

export default function CompetitionListPage() {

  // Données provenant du backend
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [competitions, setCompetitions] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState(null);

  // Charger les événements 
  useEffect(() => {
  competitionService
    .getEvents()
    .then((data) => {
      const safeData = Array.isArray(data) ? data : [];
      setEvents(safeData);
      if (safeData.length > 0) {
        setSelectedEventId(safeData[0].id);
      }
    })
    .catch((err) => {
      console.error("Erreur lors du chargement des événements", err);
      setEvents([]);
    });
}, []);

  // Charger les compétitions 
  useEffect(() => {
  if (!selectedEventId) return;

  competitionService
    .getCompetitionsByEvent(selectedEventId)
    .then((data) => setCompetitions(data));
  }, [selectedEventId]);

  const currentEvent = events.find((e) => e.id === selectedEventId);

  const filteredCompetitions = competitions;
  const hasEvents = events.length > 0;

  const handleOpenCreate = () => {
    setEditingCompetition(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (competition) => {
    setEditingCompetition(competition);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleFakeSave = () => {
    setOpenForm(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* En-tête */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Gestion des compétitions
        </Typography>
      </Box>

            {/* Sélection d'événement / Contenu principal */}
      {!hasEvents ? (
        <>
          <Card
            sx={{
              mb: 3,
              borderRadius: 3,
              boxShadow: 2,
              p: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <EventIcon color="primary" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Événement sélectionné
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  Aucun événement disponible pour le moment
                </Typography>
              </Box>
            </Box>
          </Card>
        </>
      ) : (
        <>
          {/* Sélection d'événement */}
          <Card
            sx={{
              mb: 3,
              borderRadius: 3,
              boxShadow: 2,
              p: 2,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <EventIcon color="primary" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Événement sélectionné
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {currentEvent?.name}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {events.map((event) => (
                <Chip
                  key={event.id}
                  label={event.name}
                  color={event.id === selectedEventId ? "primary" : "default"}
                  variant={event.id === selectedEventId ? "filled" : "outlined"}
                  onClick={() => setSelectedEventId(event.id)}
                  sx={{ borderRadius: 999 }}
                />
              ))}
            </Box>
          </Card>

          {/* Bouton Ajouter */}
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
            >
              Ajouter une compétition
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Liste des compétitions */}
          {filteredCompetitions.length === 0 ? (
            <Typography color="text.secondary">
              Aucune compétition n’est encore définie pour cet événement.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {filteredCompetitions.map((competition) => (
                <Grid item xs={12} md={6} lg={4} key={competition.id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "0.25s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {competition.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1.5 }}
                      >
                        {competition.description}
                      </Typography>
                      <Chip
                        label={`Début : ${competition.startDate}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </CardContent>
                    <CardActions
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        px: 2,
                        pb: 2,
                      }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenEdit(competition)}
                      >
                        Modifier
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Dialog de formulaire */}
      <CompetitionFormDialog
        open={openForm}
        onClose={handleCloseForm}
        onSave={handleFakeSave}
        initialData={editingCompetition}
      />
    </Box>
  );
}
