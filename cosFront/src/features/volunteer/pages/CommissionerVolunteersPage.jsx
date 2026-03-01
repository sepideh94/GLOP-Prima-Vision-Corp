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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCompetitions();
  }, []);

  useEffect(() => {
    fetchVolunteers();
  }, [selectedCompetition]);

  const fetchCompetitions = async () => {
    try {
      const events = await competitionService.getEvents();
      const allCompetitions = [];

      for (const event of events) {
        const comps =
          await competitionService.getCompetitionsByEventForCommissioner(
            event.id
          );
        allCompetitions.push(...comps);
      }

      setCompetitions(allCompetitions);
    } catch (err) {
      console.error("Erreur chargement compétitions:", err);
    }
  };

  const fetchVolunteers = async () => {
    if (!selectedCompetition) {
      setVolunteers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data =
        await volunteerService.getVolunteersByCompetition(
          selectedCompetition
        );

      setVolunteers(data || []);
    } catch (err) {
      console.error("Erreur chargement volontaires:", err);
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
    PENDING: "En attente",
  };

  const translateStatus = (status) => {
    return STATUS_LABELS[status] || "Non défini";
  };

  const getStatusStyle = (status) => ({
    padding: "6px 14px",
    borderRadius: appTheme.radius.pill,
    fontWeight: 600,
    fontSize: 13,
    minWidth: 110,
    textAlign: "center",
    display: "inline-block",
    background:
      status === "CONFIRMED"
        ? "rgba(34,197,94,0.25)"
        : status === "INVITED"
        ? "rgba(250,204,21,0.25)"
        : status === "CANCELLED"
        ? "rgba(239,68,68,0.25)"
        : "rgba(148,163,184,0.25)",
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
            <MenuItem value="">
              Sélectionner une compétition
            </MenuItem>
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
          {!selectedCompetition ? (
            <Typography
              sx={{ textAlign: "center", color: "text.secondary", p: 3 }}
            >
              Veuillez sélectionner une compétition.
            </Typography>
          ) : loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : filteredVolunteers.length === 0 ? (
            <Typography
              sx={{ textAlign: "center", color: "text.secondary" }}
            >
              Aucun volontaire trouvé.
            </Typography>
          ) : (
            <table className="table align-middle">
              <thead>
                <tr>
                  <td><strong>Nom</strong></td>
                  <td><strong>Email</strong></td>
                  <td style={{ textAlign: "center" }}>
                    <strong>Statut</strong>
                  </td>
                </tr>
              </thead>
              <tbody>
                {filteredVolunteers.map((v) => (
                  <tr key={v.id}>
                    <td>{v.firstName} {v.lastName}</td>
                    <td>{v.email}</td>
                    <td style={{ textAlign: "center" }}>
                      <span style={getStatusStyle(v.status)}>
                        {translateStatus(v.status)}
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