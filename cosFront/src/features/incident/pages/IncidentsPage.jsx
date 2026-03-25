import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Box, Typography, Button } from "@mui/material";

import appTheme from "../../../common/theme/appTheme";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import incidentService from "../services/incidentService";
import competitionService from "../../competition/services/competitionService";

import IncidentTable from "../components/IncidentTable";
import IncidentFormDialog from "../components/IncidentFormDialog";
import IncidentDetailsDialog from "../components/IncidentDetailsDialog";
import DeleteIncidentDialog from "../components/DeleteIncidentDialog";

export default function IncidentsPage() {

  const navigate = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [events, setEvents] = useState([]);
  const [competitions, setCompetitions] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentToDelete, setIncidentToDelete] = useState(null);

  /* ---------------- LOAD EVENTS ---------------- */

  useEffect(() => {
    loadEvents();
  }, []);

  /* ---------------- LOAD DATA AFTER EVENTS ---------------- */

  useEffect(() => {
    if (events.length > 0) {
      loadCompetitions();
      loadIncidents();
    }
  }, [events]);

  const loadEvents = async () => {

    try {

      const data = await competitionService.getEvents();

      if (Array.isArray(data)) {
        setEvents(data);
      }

    } catch (error) {
      console.error("Erreur chargement events", error);
    }

  };

  /* ---------------- LOAD COMPETITIONS ---------------- */

  const loadCompetitions = async () => {

    try {

      const allCompetitions = [];

      for (const event of events) {

        const comps = await competitionService.getCompetitionsByEvent(event.id);

        if (Array.isArray(comps)) {
          allCompetitions.push(...comps);
        }

      }

      setCompetitions(allCompetitions);

    } catch (error) {

      console.error("Erreur chargement competitions", error);
      setCompetitions([]);

    }

  };

  /* ---------------- LOAD INCIDENTS ---------------- */

  const loadIncidents = async () => {

    try {

      const allIncidents = [];

      for (const event of events) {

        const data = await incidentService.getAll(event.id);

        if (Array.isArray(data)) {
          allIncidents.push(...data);
        }

      }

      // ordre stable
      allIncidents.sort((a, b) => a.id - b.id);

      setIncidents(allIncidents);

    } catch (error) {

      console.error("Erreur chargement incidents", error);
      setIncidents([]);

    }

  };

  /* ---------------- NAME HELPERS ---------------- */

  const getEventName = (id) => {

    const event = events.find((e) => e.id === id);

    return event ? event.name : "-";

  };

  const getCompetitionName = (id) => {

    const comp = competitions.find(
      (c) => c.id === id || c.idCompetition === id
    );

    return comp ? comp.name : "-";

  };

  /* ---------------- SORT ---------------- */

  const handleSort = (key) => {

    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });

  };

  /* ---------------- SEARCH ---------------- */

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredIncidents = incidents.filter((incident) => {

    if (!normalizedSearch) return true;

    const impacts = (incident.impactLevels || [])
      .join(" ")
      .toLowerCase();

    return (
      (incident.title || "").toLowerCase().includes(normalizedSearch) ||
      (incident.description || "").toLowerCase().includes(normalizedSearch) ||
      impacts.includes(normalizedSearch) ||
      (incident.status || "").toLowerCase().includes(normalizedSearch)
    );

  });

  let sortedIncidents = filteredIncidents;

  if (sortConfig.key) {

    sortedIncidents = [...filteredIncidents].sort((a, b) => {

      let aValue;
      let bValue;

      if (sortConfig.key === "impactLevels") {
        aValue = (a.impactLevels || []).join(" ").toLowerCase();
        bValue = (b.impactLevels || []).join(" ").toLowerCase();
      } else if (sortConfig.key === "eventId") {
        aValue = (getEventName(a.eventId) || "").toLowerCase();
        bValue = (getEventName(b.eventId) || "").toLowerCase();
      } else if (sortConfig.key === "siteId") {
        aValue = a.siteId ?? -1;
        bValue = b.siteId ?? -1;
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;

      return 0;

    });

  }

  /* ---------------- STATUS ---------------- */

  const handleChangeStatus = async (incident) => {

    await incidentService.changeStatus(incident.id, "RESOLU");

    await loadIncidents();

  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = (incident) => {

    setIncidentToDelete(incident);
    setOpenDelete(true);

  };

  const confirmDelete = async () => {

    if (!incidentToDelete) return;

    await incidentService.delete(incidentToDelete.id);

    setOpenDelete(false);
    setIncidentToDelete(null);

    await loadIncidents();

  };

  const closeDialogs = () => {

    setOpenForm(false);
    setOpenDetails(false);
    setOpenDelete(false);

    setSelectedIncident(null);
    setIncidentToDelete(null);

  };

  return (

    <Box sx={{ p: 4, background: appTheme.gradients.page, minHeight: "100vh" }}>

      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => {
          closeDialogs();
          navigate("/admin");
        }}
        sx={{
          mb: 2,
          textTransform: "none",
          fontWeight: 700,
          px: 3,
          py: 1.1,
          borderRadius: appTheme.radius.pill,
          background: "linear-gradient(135deg,#22D3EE,#3B82F6)",
          color: appTheme.colors.dark,
        }}
      >
        Retour
      </Button>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >

        <Typography sx={{ fontSize: 32, fontWeight: 900 }}>
          Gestion des incidents
        </Typography>

        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedIncident(null);
            setOpenForm(true);
          }}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1.2,
            borderRadius: appTheme.radius.pill,
            background: appTheme.gradients.navbar,
            color: appTheme.colors.dark,
          }}
        >
          Créer un incident
        </Button>

      </Box>

      <IncidentTable
        incidents={sortedIncidents}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        getEventName={getEventName}
        onSort={handleSort}
        onView={(incident) => {
          setSelectedIncident(incident);
          setOpenDetails(true);
        }}
        onEdit={(incident) => {
          setSelectedIncident(incident);
          setOpenForm(true);
        }}
        onChangeStatus={handleChangeStatus}
        onDelete={handleDelete}
      />

      <IncidentFormDialog
        open={openForm}
        incident={selectedIncident}
        onClose={() => {
          setOpenForm(false);
          setSelectedIncident(null);
        }}
        onSave={async (form) => {

          const payload = {
            title: form.title.trim(),
            description: form.instructions?.trim() || null,
            impactLevels: form.impactLevels,
            eventId: Number(form.eventId),
            competitionId: form.competitionId ? Number(form.competitionId) : null,
            trialId: form.trialId ? Number(form.trialId) : null,
            siteId: form.siteId ? Number(form.siteId) : null,
          };

          if (selectedIncident) {
            await incidentService.update(selectedIncident.id, payload);
          } else {
            await incidentService.create(payload);
          }

          await loadIncidents();

          setOpenForm(false);
          setSelectedIncident(null);

        }}
      />

      <IncidentDetailsDialog
        open={openDetails}
        incident={selectedIncident}
        getEventName={getEventName}
        getCompetitionName={getCompetitionName}
        onClose={() => {
          setOpenDetails(false);
          setSelectedIncident(null);
        }}
      />

      <DeleteIncidentDialog
        open={openDelete}
        incident={incidentToDelete}
        onClose={() => {
          setOpenDelete(false);
          setIncidentToDelete(null);
        }}
        onConfirm={confirmDelete}
      />

    </Box>

  );

}