import  { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import { TextField } from "@mui/material";
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

const toLocalDateTime = (date) => {
  if (!date) return null;
  return `${date}T00:00:00`;
};

export default function CompetitionListPage() {

  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [competitions, setCompetitions] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

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
  setCurrentPage(1);

  competitionService
    .getCompetitionsByEvent(selectedEventId)
    .then((data) => setCompetitions(data))
    .catch((err) => {
      console.error("Erreur lors du chargement des compétitions :", err);
      setCompetitions([]);
    });
  }, [selectedEventId]);

  const currentEvent = events.find((e) => e.id  === selectedEventId);

  const hasEvents = events.length > 0;

  // filtrage par mot-clé 
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredCompetitions = competitions.filter((c) => {
  if (!normalizedSearch) return true;

  const name = (c.name || "").toLowerCase();
  const description = (c.description || "").toLowerCase();
  const startDate = formatDate(c.startDate || "").toLowerCase();
  const endDate = formatDate(c.endDate || "").toLowerCase();
  const status = (c.statusLabel || "").toLowerCase();

  return (
  name.includes(normalizedSearch) ||
  description.includes(normalizedSearch) ||
  startDate.includes(normalizedSearch) ||
  endDate.includes(normalizedSearch) ||
  status.includes(normalizedSearch) 
  );

});

  // Pagination
  const totalPages = Math.ceil(filteredCompetitions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCompetitions = filteredCompetitions.slice(
  startIndex,
  startIndex + itemsPerPage
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
  setEditingCompetition(null); 
};

  const handleSave = async (form) => {
  try {
    if (!selectedEventId) {
      alert("Aucun événement sélectionné");
      return;
    }

    if (editingCompetition) {
      const payload = {
        name: form.name,
        description: form.description,
        startDate: toLocalDateTime(form.startDate),
        endDate: toLocalDateTime(form.endDate),
      };

      console.log("Payload UPDATE :", payload);

      const updated = await competitionService.updateCompetition(
        editingCompetition.id,
        payload
      );

      setCompetitions((prev) =>
        prev.map((c) => (c.id === editingCompetition.id ? updated : c))
      );
    } else {

      const payload = {
        name: form.name,
        description: form.description,
        startDate: toLocalDateTime(form.startDate),
        endDate: toLocalDateTime(form.endDate),
        parentEventId: selectedEventId,
      };

      console.log("Payload CREATE :", payload);

      const created = await competitionService.createCompetition(payload);

      setCompetitions((prev) => [...prev, created]);
    }
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
                  key={event.id}
                  label={event.name}
                  color={
                    event.id === selectedEventId ? "primary" : "default"
                  }
                  variant={
                    event.id === selectedEventId ? "filled" : "outlined"
                  }
                  onClick={() => setSelectedEventId(event.id)}
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
                <div className="card-header d-flex justify-content-between align-items-center">
                <div className="card-title">Liste des compétitions</div>

                {/* Barre de recherche  */}
                <div style={{ width: 300 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Rechercher par nom, description ou date"
                  value={searchTerm} 
                  onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); 
                  }}            
               />
               </div>
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
                          <td>Date de fin</td>
                          <td>Statut</td>
                          <td>Actions</td>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredCompetitions.length === 0 ? (
                          <tr>
                            <td
                              colSpan="6"
                              className="text-center text-muted py-4"
                            >
                              Aucune compétition pour cet événement.
                            </td>
                          </tr>
                        ) : (
                            currentCompetitions.map((c) => (
                              <tr key={c.id}
                                  onClick={() => 
                                    navigate(`/admin/competitions/${c.id}/trials`)
                                  }
                                  style={{ cursor: "pointer" }}
                              >

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

                              {/* Date de fin */}
                              <td>{formatDate(c.endDate)}</td> 

                              {/* Badge statut */}                      
                              <td>
                              {/* Style du badge selon le texte du statut */}
                              <span
                                className={`badge ${
                                c.statusLabel === "Terminée" ? "bg-success" :
                                c.statusLabel === "En cours" ? "bg-primary" :
                                c.statusLabel === "À venir" ? "bg-warning text-dark" :
                                "bg-secondary"
                                }`}
                                >
                               {c.statusLabel}
                               </span>
                               </td>
                               
                              {/* Actions */}
                              <td>
                                <button
                                  className="btn btn-primary me-2"
                                  onClick={(e) => {
                                     e.stopPropagation();
                                     handleOpenEdit(c);
                                  }}
                                >
                                Modifier
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    <div className="d-flex justify-content-center mt-3">
                    <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button 
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    >
                    ←
                    </button>
                    </li>

                    {/* Numéros de pages */}
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <li 
                    key={page}
                    className={`page-item ${currentPage === page ? "active" : ""}`}
                    >
                    <button 
                      className="page-link"
                      onClick={() => setCurrentPage(page)}
                    >
                   {page}
                   </button>
                  </li>
               ))}

                  <li
                   className={`page-item ${
                   currentPage === totalPages || totalPages === 0 ? "disabled" : ""
                   }`}
                   >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                  →
                  </button>
                  </li>
                  </ul>
                  </div>
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
