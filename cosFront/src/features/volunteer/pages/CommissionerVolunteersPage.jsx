import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";

import appTheme from "../../../common/theme/appTheme";
import volunteerService from "../services/volunteerService";
import competitionService from "../../competition/services/competitionService";
import VolonteerParticipationsModal from "../components/VolonteerParticipationsModal";

export default function CommissionerVolunteersPage() {

  const navigate = useNavigate();

  const [volunteers, setVolunteers] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchVolunteers();
  }, [selectedCompetition]);

  const fetchInitialData = async () => {

    try {

      const eventsData = await competitionService.getEvents();
      setEvents(eventsData);

      const allCompetitions = [];

      for (const event of eventsData) {

        const comps =
          await competitionService.getCompetitionsByEventForCommissioner(
            event.id
          );

        allCompetitions.push(...comps);
      }

      setCompetitions(allCompetitions);

    } catch (err) {

      console.error(err);

    }
  };

  const fetchVolunteers = async () => {

    setLoading(true);
    setError(null);

    try {

      let data = [];

      if (selectedCompetition) {

        data = await volunteerService.getVolunteersByCompetition(
          selectedCompetition
        );

      } else {

        for (const comp of competitions) {

          const res =
            await volunteerService.getVolunteersByCompetition(comp.id);

          data.push(...res);
        }

        data = [...new Map(data.map(v => [v.id, v])).values()];
      }

      setVolunteers(data);

    } catch (err) {

      console.error(err);
      setError("Impossible de charger les volontaires");

    } finally {

      setLoading(false);

    }
  };

  const filteredVolunteers = useMemo(() => {

    if (!searchTerm) return volunteers;

    const term = searchTerm.toLowerCase();

    return volunteers.filter(
      (v) =>
        v.firstName?.toLowerCase().includes(term) ||
        v.lastName?.toLowerCase().includes(term) ||
        v.email?.toLowerCase().includes(term)
    );

  }, [volunteers, searchTerm]);

  const STATUS_LABELS = {
    INVITED: "Invité",
    CONFIRMED: "Confirmé",
    CANCELLED: "Annulé",
  };

  const translateStatus = (status) => {
    return STATUS_LABELS[status] || status;
  };

  const getStatusStyle = (status) => ({
    padding: "6px 14px",
    borderRadius: appTheme.radius.pill,
    fontSize: 13,
    fontWeight: 700,
    display: "inline-block",
    minWidth: 110,
    textAlign: "center",
    background:
      status === "CONFIRMED"
        ? "rgba(34,197,94,0.25)"
        : status === "INVITED"
        ? "rgba(250,204,21,0.25)"
        : "rgba(239,68,68,0.25)",
    color: appTheme.colors.dark,
  });

  const handleOpenModal = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedVolunteer(null);
  };

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

      <Typography sx={{ fontSize: 32, fontWeight: 900, mb: 3 }}>
        Gestion des volontaires
      </Typography>

      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>

        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel>Compétition</InputLabel>

          <Select
            value={selectedCompetition}
            label="Compétition"
            onChange={(e) => setSelectedCompetition(e.target.value)}
          >

            <MenuItem value="">Toutes les compétitions</MenuItem>

            {competitions.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}

          </Select>

        </FormControl>

        <TextField
          label="Rechercher"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
        />

      </Box>

      <div className="card" style={{ borderRadius: 22 }}>

        <div className="card-header">
          <strong>Liste des volontaires</strong>
        </div>

        <div className="card-body">

          {loading ? (

            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>

          ) : error ? (

            <Typography color="error">{error}</Typography>

          ) : (

            <table className="table align-middle">

              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th style={{ textAlign: "center" }}>
                    {selectedCompetition ? "Statut" : "Participations"}
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredVolunteers.map((v) => (

                  <tr key={v.id}>

                    <td>{v.firstName} {v.lastName}</td>

                    <td>{v.email}</td>

                    {selectedCompetition ? (

                      <td style={{ textAlign: "center" }}>
                        <span style={getStatusStyle(v.status)}>
                          {translateStatus(v.status)}
                        </span>
                      </td>

                    ) : (

                      <td style={{ textAlign: "center" }}>

                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleOpenModal(v)}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            px: 2,
                            borderRadius: appTheme.radius.pill,
                            background:
                              "linear-gradient(135deg, #a78bfa, #8b5cf6)",
                            color: "#fff",
                          }}
                        >
                          Participations
                        </Button>

                      </td>

                    )}

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </div>

      <VolonteerParticipationsModal
        open={modalOpen}
        onClose={handleCloseModal}
        volunteer={selectedVolunteer}
      />

    </Box>
  );
}