import  { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import CompetitionFormDialog from "./CompetitionFormDialog";
import competitionService from "../services/competitionService";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("fr-FR");
};

export default function CompetitionListPage() {

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
        setSelectedEventId(safeData[0].idEvent);
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
    .then((data) => setCompetitions(data))
    .catch((err) => {
      console.error("Erreur lors du chargement des compétitions :", err);
      setCompetitions([]);
    });
}, [selectedEventId]);

  const currentEvent = events.find((e) => e.idEvent  === selectedEventId);

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
  setEditingCompetition(null); // ✅ on réinitialise le mode édition
};

const handleSave = async (form) => {
  try {
    if (!selectedEventId) {
      alert("Aucun événement sélectionné");
      return;
    }

    if (editingCompetition) {
      // ✏️ MODE ÉDITION → PUT
      const payload = {
        name: form.name,
        description: form.description,
        startDate: form.startDate,
      };

      console.log("Payload UPDATE :", payload);

      const updated = await competitionService.updateCompetition(
        editingCompetition.id,
        payload
      );

      // 🔁 On remplace juste la ligne dans le state
      setCompetitions((prev) =>
        prev.map((c) => (c.id === editingCompetition.id ? updated : c))
      );
    } else {
      // ➕ MODE CRÉATION → POST
      const payload = {
        name: form.name,
        description: form.description,
        startDate: form.startDate,
        parentEventId: selectedEventId,
      };

      console.log("Payload CREATE :", payload);

      const created = await competitionService.createCompetition(payload);

      // ➕ On ajoute la nouvelle compétition à la fin de la liste
      setCompetitions((prev) => [...prev, created]);
    }

    // On ferme la popup et on sort du mode édition
    setOpenForm(false);
    setEditingCompetition(null);
  } catch (err) {
    console.error("Erreur sauvegarde compétition :", err);
    if (err.response) {
      console.error("STATUS :", err.response.status);
      console.error("BODY   :", err.response.data);
      alert(`Erreur lors de la sauvegarde (status ${err.response.status})`);
    } else {
      alert("Erreur réseau lors de la sauvegarde");
    }
  }
};

return (
    <Box sx={{ p: 4 }}>
      {/* Titre page */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Gestion des compétitions
        </Typography>
      </Box>

      {/* Si aucun évènement */}
      {!hasEvents ? (
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2, p: 2 }}>
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
      ) : (
        <>
          {/* Bouton ajouter */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
            >
              Ajouter une compétition
            </Button>
          </Box>

          {/* Sélecteur d'événement */}
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
                  key={event.idEvent}
                  label={event.name}
                  color={
                    event.idEvent === selectedEventId ? "primary" : "default"
                  }
                  variant={
                    event.idEvent === selectedEventId ? "filled" : "outlined"
                  }
                  onClick={() => setSelectedEventId(event.idEvent)}
                  sx={{ borderRadius: 999 }}
                />
              ))}
            </Box>
          </Card>

          {/* Tableau des compétitions */}
          <div className="row gx-3">
            <div className="col-sm-12 col-12">
              <div className="card">
                {/* En-tête */}
                <div className="card-header">
                  <div className="card-title">Liste des compétitions</div>
                </div>

                {/* Corps */}
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <td>Nom</td>
                          <td>Description</td>
                          <td>Date de début</td>
                          <td>Actions</td>
                        </tr>
                      </thead>

                      <tbody>
                        {competitions.length === 0 ? (
                          <tr>
                            <td
                              colSpan="4"
                              className="text-center text-muted py-4"
                            >
                              Aucune compétition pour cet événement.
                            </td>
                          </tr>
                        ) : (
                          competitions.map((c) => (
                            <tr key={c.id}>
                              {/* Nom */}
                              <td>
                                <div className="d-flex align-items-center">
                                  <i className="bi bi-flag me-3 fs-4 text-primary"></i>
                                  <p className="m-0 fw-bold">{c.name}</p>
                                </div>
                              </td>

                              {/* Description */}
                              <td>{c.description}</td>

                              {/* Date de début */}
                              <td>{formatDate(c.startDate)}</td>

                              {/* Actions */}
                              <td>
                                <button
                                  className="btn btn-primary me-2"
                                  onClick={() => handleOpenEdit(c)}
                                >
                                  Modifier
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Popup création / édition */}
      <CompetitionFormDialog
        open={openForm}
        onClose={handleCloseForm}
        onSave={handleSave}
        initialData={editingCompetition}
      />
    </Box>
  );
}
