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
  const [competitions, setCompetitions] = useState([]);
  const [events, setEvents] = useState([]);

  const [selectedEventId, setSelectedEventId] = useState(null);

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

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadIncidents();
      loadCompetitions();
    }
  }, [selectedEventId]);

  /* ---------------- LOAD EVENTS ---------------- */

  const loadEvents = async () => {
    try {

      const data = await competitionService.getEvents();

      if (Array.isArray(data)) {

        setEvents(data);

        if (!selectedEventId && data.length > 0) {
          setSelectedEventId(data[0].id);
        }

      }

    } catch (error) {
      console.error("Erreur chargement events", error);
    }
  };

  /* ---------------- LOAD INCIDENTS ---------------- */

  const loadIncidents = async () => {

    if (!selectedEventId) return;

    try {

      const data = await incidentService.getAll(selectedEventId);

      const unique = [...new Map(data.map(i => [i.id, i])).values()];

      setIncidents(Array.isArray(unique) ? unique : []);

    } catch (error) {

      console.error("Erreur chargement incidents", error);
      setIncidents([]);

    }

  };

  /* ---------------- LOAD COMPETITIONS ---------------- */

  const loadCompetitions = async () => {

    try {

      const comps = await competitionService.getCompetitionsByEvent(selectedEventId);

      setCompetitions(Array.isArray(comps) ? comps : []);

    } catch (error) {

      console.error("Erreur chargement competitions", error);
      setCompetitions([]);

    }

  };

  /* ---------------- GET NAMES ---------------- */

  const getCompetitionName = (id) => {

    const comp = competitions.find(
      (c) => c.id === id || c.idCompetition === id
    );

    return comp ? comp.name : "-";

  };

  const getEventName = (id) => {

    const event = events.find((e) => e.id === id);

    return event ? event.name : "-";

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

  /* ---------------- SORT ONLY IF USER CLICKED ---------------- */

  let sortedIncidents = filteredIncidents;

  if (sortConfig.key) {

    sortedIncidents = [...filteredIncidents].sort((a, b) => {

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

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

  /* ---------------- CLOSE DIALOGS ---------------- */

  const closeDialogs = () => {

    setOpenForm(false);
    setOpenDetails(false);
    setOpenDelete(false);

    setSelectedIncident(null);
    setIncidentToDelete(null);

  };

  /* ---------------- UI ---------------- */

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

          if (!form.impactLevels || form.impactLevels.length === 0) {
            alert("Veuillez sélectionner un impact");
            return;
          }

          const payload = {
            title: form.title.trim(),
            description: form.instructions?.trim() || null,
            impactLevels: form.impactLevels,

            eventId: Number(form.eventId || selectedEventId),

            competitionId: form.competitionId
              ? Number(form.competitionId)
              : null,

            trialId: form.trialId
              ? Number(form.trialId)
              : null,

            siteId: form.siteId
              ? Number(form.siteId)
              : null,
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
        getCompetitionName={getCompetitionName}
        getEventName={getEventName}
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
