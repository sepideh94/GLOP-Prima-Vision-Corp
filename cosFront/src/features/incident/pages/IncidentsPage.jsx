import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
} from "@mui/material";

import appTheme from "../../../common/theme/appTheme";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import incidentService from "../services/incidentService";
import competitionService from "../../competition/services/competitionService";

import IncidentTable from "../components/IncidentTable";
import IncidentFormDialog from "../components/IncidentFormDialog";

export default function IncidentsPage() {
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    loadIncidents();
    loadCompetitions();
  }, []);

  const loadIncidents = async () => {
    try {
      const data = await incidentService.getAll();
      setIncidents(Array.isArray(data) ? data : []);
    } catch {
      setIncidents([]);
    }
  };

  const loadCompetitions = async () => {
    try {
      const events = await competitionService.getEvents();

      let allCompetitions = [];

      for (const event of events) {
        const eventId = event.id || event.idEvent;
        const comps = await competitionService.getCompetitionsByEvent(eventId);

        if (Array.isArray(comps)) {
          allCompetitions = [...allCompetitions, ...comps];
        }
      }

      setCompetitions(allCompetitions);
    } catch (error) {
      console.error("Erreur chargement compétitions", error);
      setCompetitions([]);
    }
  };

  const getCompetitionName = (id) => {
    const comp = competitions.find(
      (c) => c.id === id || c.idCompetition === id
    );
    return comp ? comp.name : "-";
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredIncidents = incidents.filter((incident) => {
    if (!normalizedSearch) return true;

    return (
      (incident.title || "").toLowerCase().includes(normalizedSearch) ||
      (incident.description || "").toLowerCase().includes(normalizedSearch) ||
      (incident.impactLevel || "").toLowerCase().includes(normalizedSearch) ||
      (incident.status || "").toLowerCase().includes(normalizedSearch)
    );
  });

  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (typeof aValue === "string") aValue = aValue.toLowerCase();
    if (typeof bValue === "string") bValue = bValue.toLowerCase();

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;

    return 0;
  });

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
          Gestion des incidents
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
          Créer un incident
        </Button>
      </Box>

      <Card
        sx={{
          mb: 4,
          p: 3,
          borderRadius: appTheme.radius.lg,
          background: appTheme.gradients.card,
          boxShadow: appTheme.shadows.card,
        }}
      >
        <TextField
          size="small"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      <IncidentTable
        incidents={sortedIncidents}
        competitions={competitions}
        getCompetitionName={getCompetitionName}
        onSort={handleSort}
      />

      <IncidentFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        competitions={competitions}
        onSave={async (form) => {
          await incidentService.create(form);
          const updated = await incidentService.getAll();
          setIncidents(updated);
          setOpenForm(false);
        }}
      />
    </Box>
  );
}