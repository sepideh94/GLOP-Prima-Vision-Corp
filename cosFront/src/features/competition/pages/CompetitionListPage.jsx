import  { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  TextField,
} from "@mui/material";

import appTheme from "../../../common/theme/appTheme";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/Event";
import EditIcon from "@mui/icons-material/Edit";
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
  const [searchParams] = useSearchParams();
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
      
      const eventIdFromUrl = searchParams.get("eventId");
      console.log("EventId from URL:", eventIdFromUrl);
      console.log("Events data:", safeData);
      
      if (eventIdFromUrl && safeData.length > 0) {
        const event = safeData.find((e) => {
          const eventId = e.idEvent || e.id;
          return String(eventId) === String(eventIdFromUrl);
        });
        
        console.log("Found event:", event);
        
        if (event) {
          const selectedId = event.idEvent || event.id;
          console.log("Setting selectedEventId to:", selectedId);
          setSelectedEventId(selectedId);
        } else if (safeData.length > 0) {
          const firstId = safeData[0].idEvent || safeData[0].id;
          console.log("Event not found, using first event:", firstId);
          setSelectedEventId(firstId);
        }
      } else if (safeData.length > 0) {
        const firstId = safeData[0].idEvent || safeData[0].id;
        console.log("No URL param, using first event:", firstId);
        setSelectedEventId(firstId);
      }
    })
    .catch((err) => {
      console.error("Erreur lors du chargement des événements", err);
      setEvents([]);
    });
}, [searchParams]);

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

  const currentEvent = events.find(
    (e) => String(e.idEvent || e.id) === String(selectedEventId)
  );

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

      {/* TITRE + BOUTON */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
          Gestion des compétitions et épreuves
        </Typography>

        <Button
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
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
          Ajouter une compétition
        </Button>
      </Box>

      {!hasEvents ? (
        <Card sx={{ p: 4 }}>
          <Typography>Aucun événement disponible</Typography>
        </Card>
      ) : (
        <>
          {/* SELECTEUR EVENEMENT */}
          <Card
            sx={{
              mb: 4,
              p: 3,
              borderRadius: appTheme.radius.lg,
              background: appTheme.gradients.card,
              boxShadow: appTheme.shadows.card,
              color: appTheme.colors.textPrimary,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <EventIcon sx={{ color: appTheme.colors.cyan }} />
              <Box>
                <Typography variant="subtitle2" color={appTheme.colors.textMuted}>
                  Événement sélectionné
                </Typography>
                <Typography fontWeight={800}>
                  {currentEvent?.name}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {events.map((event) => {
                const eventId = event.idEvent || event.id;
                const isSelected = String(eventId) === String(selectedEventId);
                return (
                  <Chip
                    key={eventId}
                    label={event.name}
                    onClick={() => {
                      setSelectedEventId(eventId);
                      // URL pour refléter la sélection de l'évènement
                      navigate(`/admin/competitions?eventId=${eventId}`, { replace: true });
                    }}
                    sx={{
                      fontWeight: 700,
                      borderRadius: appTheme.radius.pill,
                      background: isSelected
                        ? appTheme.gradients.navbar
                        : appTheme.colors.darkSoft,
                      color: isSelected
                        ? appTheme.colors.dark
                        : appTheme.colors.textPrimary,
                    }}
                  />
                );
              })}
            </Box>
          </Card>

          {/* TABLE */}
          <div className="card" style={{ borderRadius: 22, overflow: "hidden" }}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>Liste des compétitions</strong>
              <TextField
                size="small"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="card-body">
              <table className="table align-middle">
                <thead>
                  <tr style={{ color: appTheme.colors.dark }}>
                    <td><strong>Nom</strong></td>
                    <td><strong>Description</strong></td>
                    <td><strong>Début</strong></td>
                    <td><strong>Fin</strong></td>
                    <td><strong>Statut</strong></td>
                    <td><strong>Actions</strong></td>
                  </tr>
                </thead>

                <tbody>
                  {currentCompetitions.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() =>
                        navigate(`/admin/competitions/${c.id}/trials`)
                      }
                      style={{
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(34, 211, 238, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "";
                      }}
                    >
                      <td className="fw-bold">{c.name}</td>
                      <td>
                        {c.description && c.description.length > 70
                          ? `${c.description.substring(0, 70)}...`
                          : c.description}
                      </td>
                      <td>{formatDate(c.startDate)}</td>
                      <td>{formatDate(c.endDate)}</td>

                      <td>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: appTheme.radius.pill,
                            fontWeight: 600,
                            fontSize: 13,
                            background:
                              c.statusLabel === "À venir"
                                ? "rgba(250,204,21,0.25)"
                                : c.statusLabel === "En cours"
                                ? "rgba(34,211,238,0.25)"
                                : "rgba(34,197,94,0.25)",
                            color: appTheme.colors.dark,
                          }}
                        >
                          {c.statusLabel}
                        </span>
                      </td>

                      <td>
                        <button
                          className="btn d-flex align-items-center gap-1"
                          style={{
                            borderRadius: appTheme.radius.pill,
                            background: appTheme.gradients.navbar,
                            color: appTheme.colors.dark,
                            fontWeight: 700,
                            padding: "4px 12px",
                            fontSize: 13,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(c);
                          }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <CompetitionFormDialog
        open={openForm}
        onClose={handleCloseForm}
        onSave={handleSave}
        initialData={editingCompetition}
        currentEvent={currentEvent}
      />
    </Box>
  );
}