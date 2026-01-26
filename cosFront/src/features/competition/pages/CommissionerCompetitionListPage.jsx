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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/Event";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

import competitionService from "../services/competitionService";
import CompetitionDetailDialog from "./CompetitionDetailDialog";

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

const getStatusStyle = (statusLabel) => ({
  padding: "4px 12px",
  borderRadius: appTheme.radius.pill,
  fontWeight: 600,
  fontSize: 13,
  whiteSpace: "nowrap",
  background:
    statusLabel === "À venir"
      ? "rgba(250,204,21,0.25)"
      : statusLabel === "En cours"
      ? "rgba(34,211,238,0.25)"
      : statusLabel === "Annulée"
      ? "rgba(239,68,68,0.25)"
      : "rgba(34,197,94,0.25)",
  color: appTheme.colors.dark,
});


export default function CommissionerCompetitionListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [competitions, setCompetitions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [openDetail, setOpenDetail] = useState(false);
  const [viewingCompetition, setViewingCompetition] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  /* Charger événements */
  useEffect(() => {
    competitionService.getEvents().then((data) => {
      const safeData = Array.isArray(data) ? data : [];
      setEvents(safeData);

      const eventIdFromUrl = searchParams.get("eventId");
      if (eventIdFromUrl && safeData.length > 0) {
        const event = safeData.find(
          (e) => String(e.idEvent || e.id) === String(eventIdFromUrl)
        );
        setSelectedEventId(event?.idEvent || event?.id);
      } else if (safeData.length > 0) {
        setSelectedEventId(safeData[0].idEvent || safeData[0].id);
      }
    });
  }, [searchParams]);

  /* Charger compétitions */
  useEffect(() => {
    if (!selectedEventId) return;

    competitionService
      .getCompetitionsByEventForCommissioner(selectedEventId)
      .then(setCompetitions)
      .catch(() => setCompetitions([]));
  }, [selectedEventId]);

  const currentEvent = events.find(
    (e) => String(e.idEvent || e.id) === String(selectedEventId)
  );

  /* Tri */
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredCompetitions = competitions.filter((c) =>
    !normalizedSearch
      ? true
      : (c.name || "").toLowerCase().includes(normalizedSearch) ||
        (c.description || "").toLowerCase().includes(normalizedSearch) ||
        formatDate(c.startDate).includes(normalizedSearch) ||
        formatDate(c.endDate).includes(normalizedSearch) ||
        (c.statusLabel || "").toLowerCase().includes(normalizedSearch)
  );

  const sortedCompetitions = [...filteredCompetitions].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === "startDate" || sortConfig.key === "endDate") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (typeof aValue === "string") aValue = aValue.toLowerCase();
    if (typeof bValue === "string") bValue = bValue.toLowerCase();

    return sortConfig.direction === "asc"
      ? aValue > bValue ? 1 : -1
      : aValue < bValue ? 1 : -1;
  });

  return (
    <Box sx={{ p: 4, background: appTheme.gradients.page, minHeight: "100vh" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/commissioner")}
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

      <Typography sx={{ fontSize: 32, fontWeight: 900, mb: 2 }}>
        Gestion des compétitions et épreuves
      </Typography>

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
            navigate(`/commissioner/competitions?eventId=${eventId}`, {
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
                {["Nom", "Description", "Début", "Fin", "Statut"].map(
                  (label, i) => (
                    <td key={i}>
                      <strong>{label}</strong>
                      <UnfoldMoreIcon sx={{ fontSize: 16, ml: 0.5 }} />
                    </td>
                  )
                )}
                <td><strong>Actions</strong></td>
              </tr>
            </thead>

            <tbody>
              {sortedCompetitions.map((c) => (
                <tr
                  key={c.id}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/commissioner/competitions/${c.id}/trials`)
                  }
                >
                  <td className="fw-bold">{c.name}</td>
                  <td>{truncateText(c.description, 50)}</td>
                  <td>{formatDate(c.startDate)}</td>
                  <td>{formatDate(c.endDate)}</td>
                  <td>
                    <span style={getStatusStyle(c.statusLabel)}>
                      {c.statusLabel}
                    </span>
                  </td>
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
                        navigate(`/commissioner/competitions/${c.id}/trials`);
                      }}
                    >
                      <EmojiEventsIcon sx={{ fontSize: 16 }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CompetitionDetailDialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        competition={viewingCompetition}
        currentEvent={currentEvent}
      />
    </Box>
  );
}
