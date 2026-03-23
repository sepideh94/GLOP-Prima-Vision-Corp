import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  Autocomplete,
} from "@mui/material";

import appTheme from "../../../common/theme/appTheme";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/Event";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import CompetitionFormDialog from "./CompetitionFormDialog";
import CompetitionDetailDialog from "./CompetitionDetailDialog";
import competitionService from "../services/competitionService";
import { stripHtmlTags } from "../../../common/utils/htmlUtils";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR");
};

const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
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
  const [openDetail, setOpenDetail] = useState(false);
  const [viewingCompetition, setViewingCompetition] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    competitionService.getEvents().then((data) => {
      const safeData = Array.isArray(data) ? data : [];
      setEvents(safeData);

      const eventIdFromUrl = searchParams.get("eventId");
      if (eventIdFromUrl && safeData.length > 0) {
        const event = safeData.find(
          (e) => String(e.idEvent || e.id) === String(eventIdFromUrl)
        );
        setSelectedEventId(
          event?.idEvent ||
            event?.id ||
            safeData[0]?.idEvent ||
            safeData[0]?.id
        );
      } else if (safeData.length > 0) {
        setSelectedEventId(safeData[0].idEvent || safeData[0].id);
      }
    });
  }, [searchParams]);

  useEffect(() => {
    if (!selectedEventId) return;
    setCurrentPage(1);
    competitionService
      .getCompetitionsByEvent(selectedEventId)
      .then(setCompetitions)
      .catch(() => setCompetitions([]));
  }, [selectedEventId]);

  const currentEvent = events.find(
    (e) => String(e.idEvent || e.id) === String(selectedEventId)
  );

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredCompetitions = competitions.filter((c) => {
    if (!normalizedSearch) return true;
    return (
      (c.name || "").toLowerCase().includes(normalizedSearch) ||
      stripHtmlTags(c.description).toLowerCase().includes(normalizedSearch) ||
      formatDate(c.startDate).toLowerCase().includes(normalizedSearch) ||
      formatDate(c.endDate).toLowerCase().includes(normalizedSearch) ||
      (c.statusLabel || "").toLowerCase().includes(normalizedSearch)
    );
  });

  const sortedCompetitions = [...filteredCompetitions].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle special cases for different column types
    if (sortConfig.key === "startDate" || sortConfig.key === "endDate") {
      aValue = new Date(a[sortConfig.key]).getTime();
      bValue = new Date(b[sortConfig.key]).getTime();
    }

    // Convert to string for comparison if not already a number
    if (typeof aValue === "string") aValue = aValue.toLowerCase();
    if (typeof bValue === "string") bValue = bValue.toLowerCase();

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCompetitions = sortedCompetitions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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

      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: 32, fontWeight: 900 }}>
          Gestion des compétitions et épreuves
        </Typography>

        <Button
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
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
          Ajouter une compétition
        </Button>
      </Box>

      <Card
        sx={{
          mb: 4,
          p: 3,
          borderRadius: appTheme.radius.lg,
          background: appTheme.gradients.card,
          boxShadow: appTheme.shadows.card,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <EventIcon sx={{ color: appTheme.colors.cyan }} />

        <Autocomplete
          options={events}
          value={currentEvent || null}
          getOptionLabel={(option) => option.name || ""}
          onChange={(_, newValue) => {
            if (!newValue) return;
            const eventId = newValue.idEvent || newValue.id;
            setSelectedEventId(eventId);
            navigate(`/admin/competitions?eventId=${eventId}`, {
              replace: true,
            });
          }}
          sx={{
            minWidth: 320,
            backgroundColor: "rgba(34,211,238,0.15)",
            borderRadius: 2,
            "& .MuiInputBase-root": {
              color: "#e0f7fa",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#22D3EE",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#67e8f9",
            },
            "& .MuiSvgIcon-root": {
              color: "#22D3EE",
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Événement"
              InputLabelProps={{
                sx: { color: "#67e8f9" },
              }}
            />
          )}
        />
      </Card>

      <div className="card" style={{ borderRadius: 22, overflow: "hidden" }}>
        <div className="card-header d-flex justify-content-between">
          <strong>Liste des compétitions</strong>
          <TextField
            size="small"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="card-body">
          <table className="table align-middle table-hover">
            <thead>
              <tr>
                <td style={{ cursor: "pointer" }} onClick={() => handleSort("name")}>
                  <strong>Nom</strong> <UnfoldMoreIcon sx={{ fontSize: 16, verticalAlign: "middle", ml: 0.5 }} />
                </td>
                <td style={{ cursor: "pointer" }} onClick={() => handleSort("description")}>
                  <strong>Description</strong> <UnfoldMoreIcon sx={{ fontSize: 16, verticalAlign: "middle", ml: 0.5 }} />
                </td>
                <td style={{ cursor: "pointer" }} onClick={() => handleSort("startDate")}>
                  <strong>Début</strong> <UnfoldMoreIcon sx={{ fontSize: 16, verticalAlign: "middle", ml: 0.5 }} />
                </td>
                <td style={{ cursor: "pointer" }} onClick={() => handleSort("endDate")}>
                  <strong>Fin</strong> <UnfoldMoreIcon sx={{ fontSize: 16, verticalAlign: "middle", ml: 0.5 }} />
                </td>
                <td style={{ cursor: "pointer" }} onClick={() => handleSort("statusLabel")}>
                  <strong>Statut</strong> <UnfoldMoreIcon sx={{ fontSize: 16, verticalAlign: "middle", ml: 0.5 }} />
                </td>
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
                  style={{ cursor: "pointer" }}
                >
                  <td className="fw-bold">{c.name}</td>
                  <td title={stripHtmlTags(c.description)}>
                    {truncateText(stripHtmlTags(c.description), 50)}
                  </td>
                  <td>{formatDate(c.startDate)}</td>
                  <td>{formatDate(c.endDate)}</td>
                  <td>{c.statusLabel}</td>
                  <td>
                    <button
                      className="btn"
                      style={{
                        borderRadius: appTheme.radius.pill,
                        background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
                        color: "#fff",
                        fontWeight: 700,
                        padding: "4px 12px",
                        marginRight: 8,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingCompetition(c);
                        setOpenDetail(true);
                      }}
                    >
                      <VisibilityIcon sx={{ fontSize: 16 }} />
                    </button>
                    <button
                      className="btn"
                      style={{
                        borderRadius: appTheme.radius.pill,
                        background: appTheme.gradients.navbar,
                        color: appTheme.colors.dark,
                        fontWeight: 700,
                        padding: "4px 12px",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCompetition(c);
                        setOpenForm(true);
                      }}
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CompetitionFormDialog
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditingCompetition(null);
        }}
        onSave={async (form) => {
          const payload = {
            name: form.name,
            description: form.description,
            startDate: toLocalDateTime(form.startDate),
            endDate: toLocalDateTime(form.endDate),
            parentEventId: selectedEventId,
          };
          if (editingCompetition) {
            await competitionService.updateCompetition(editingCompetition.id, payload);
          } else {
            await competitionService.createCompetition(payload);
          }
          const updated = await competitionService.getCompetitionsByEvent(selectedEventId);
          setCompetitions(updated);
          setOpenForm(false);
          setEditingCompetition(null);
        }}
        initialData={editingCompetition}
        currentEvent={currentEvent}
      />

      <CompetitionDetailDialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        competition={viewingCompetition}
        currentEvent={currentEvent}
      />
    </Box>
  );
}
