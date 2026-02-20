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

import appTheme from "../../../common/theme/appTheme";
import volunteerService from "../services/volunteerService";
import competitionService from "../../competition/services/competitionService";

export default function CommissionerVolunteersPage() {
  const navigate = useNavigate();

  const [volunteers, setVolunteers] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  /* =========================
     LOAD COMPETITIONS
  ========================== */

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchVolunteers();
  }, [selectedCompetition]);

  const fetchInitialData = async () => {
    try {
      const events = await competitionService.getEvents();
      const allCompetitions = [];

      for (const event of events) {
        try {
          const comps =
            await competitionService.getCompetitionsByEventForCommissioner(
              event.id
            );
          allCompetitions.push(...comps);
        } catch (e) {
          console.error("Erreur compétition:", e);
        }
      }

      setCompetitions(allCompetitions);
    } catch (err) {
      console.error("Erreur chargement compétitions:", err);
    }
  };

  /* =========================
     LOAD VOLUNTEERS
  ========================== */

  const fetchVolunteers = async () => {
    setLoading(true);
    setError(null);

    try {
      let data;

      if (selectedCompetition) {
        data =
          await volunteerService.getVolunteersByCompetition(
            selectedCompetition
          );
      } else {
        data = await volunteerService.getAllVolunteers();
      }

      setVolunteers(data);
    } catch (err) {
      console.error("Erreur chargement volontaires:", err);
      setError("Impossible de charger les volontaires");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     SEARCH FILTER
  ========================== */

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

  /* =========================
     STATUS STYLE
  ========================== */

  const getStatusStyle = (status) => ({
    padding: "4px 12px",
    borderRadius: appTheme.radius.pill,
    fontWeight: 600,
    fontSize: 13,
    background:
      status === "CONFIRMED"
        ? "rgba(34,197,94,0.25)"
        : status === "INVITED"
        ? "rgba(250,204,21,0.25)"
        : "rgba(239,68,68,0.25)",
    color: appTheme.colors.dark,
  });

  return (
    <Box sx={{ p: 4, background: appTheme.gradients.page, minHeight: "100vh" }}>
      {/* BACK BUTTON */}
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

      {/* TITLE */}
      <Typography sx={{ fontSize: 32, fontWeight: 900, mb: 3 }}>
        Gestion des volontaires
      </Typography>

      {/* FILTERS */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
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
            startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} />,
          }}
          sx={{ minWidth: 250 }}
        />
      </Box>

      {/* TABLE */}
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
          ) : filteredVolunteers.length === 0 ? (
            <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
              Aucun volontaire trouvé.
            </Typography>
          ) : (
            <table className="table align-middle">
              <thead>
                <tr>
                  <td><strong>Nom</strong></td>
                  <td><strong>Email</strong></td>
                  <td><strong>Statut</strong></td>
                </tr>
              </thead>
              <tbody>
                {filteredVolunteers.map((v) => (
                  <tr key={v.id}>
                    <td>{v.firstName} {v.lastName}</td>
                    <td>{v.email}</td>
                    <td>
                      <span style={getStatusStyle(v.status)}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Box>
  );
}
