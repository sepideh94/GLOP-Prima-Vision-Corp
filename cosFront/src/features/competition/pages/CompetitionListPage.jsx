import { useState } from "react";
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

export default function CompetitionListPage() {
  // Données simulées pour tester
  const [events] = useState([
    { id: 1, name: "Championnats Régionaux 2026" },
    { id: 2, name: "Coupe Nationale Jeunes" },
  ]);

  const [selectedEventId, setSelectedEventId] = useState(1);

  const [competitions, setCompetitions] = useState([
    {
      id: 101,
      name: "100m nage libre",
      description: "Série qualificative – catégorie U18.",
      startDate: "2026-07-10",
      parentEventId: 1,
    },
    {
      id: 102,
      name: "Relais 4x100m",
      description: "Finale relais mixte.",
      startDate: "2026-07-11",
      parentEventId: 1,
    },
    {
      id: 201,
      name: "Tournoi de water-polo",
      description: "Phase de poules – équipes féminines.",
      startDate: "2026-09-02",
      parentEventId: 2,
    },
  ]);

  const [openForm, setOpenForm] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState(null);

  const currentEvent = events.find((e) => e.id === selectedEventId);

  const filteredCompetitions = competitions.filter(
    (c) => c.parentEventId === selectedEventId
  );

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
        <Typography variant="body1" color="text.secondary">
          En tant que commissaire, vous pouvez organiser les compétitions
          rattachées aux événements sportifs.
        </Typography>
      </Box>

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
