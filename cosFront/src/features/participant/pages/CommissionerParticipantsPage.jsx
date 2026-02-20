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
import athleteService from "../services/athleteService";
import competitionService from "../../competition/services/competitionService";
import AthleteParticipationsModal from "../components/AthleteParticipationsModal";

export default function CommissionerParticipantsPage() {
  const navigate = useNavigate();

  const [athletes, setAthletes] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAthletes();
  }, [selectedCompetition]);

  const fetchInitialData = async () => {
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

  const fetchAthletes = async () => {
    setLoading(true);
    setError(null);

    try {
      let data;

      if (selectedCompetition) {
        data = await athleteService.getAthletesByCompetition(
          selectedCompetition
        );
      } else {
        data = await athleteService.getAllAthletes();
      }

      setAthletes(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les athlètes");
    } finally {
      setLoading(false);
    }
  };

  const filteredAthletes = useMemo(() => {
    if (!searchTerm) return athletes;

    const term = searchTerm.toLowerCase();

    return athletes.filter(
      (a) =>
        a.firstName?.toLowerCase().includes(term) ||
        a.lastName?.toLowerCase().includes(term) ||
        a.email?.toLowerCase().includes(term)
    );
  }, [athletes, searchTerm]);

  const handleOpenModal = (athlete) => {
    setSelectedAthlete(athlete);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAthlete(null);
  };

  const getStatusStyle = (status) => ({
    padding: "6px 14px",
    borderRadius: appTheme.radius.pill,
    fontSize: 13,
    fontWeight: 700,
    display: "inline-block",
    minWidth: 100,
    textAlign: "center",
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
        Gestion des athlètes
      </Typography>

      {/* Filtres */}
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
            startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} />,
          }}
        />
      </Box>

      <div className="card" style={{ borderRadius: 22 }}>
        <div className="card-header">
          <strong>Liste des athlètes</strong>
        </div>

        <div className="card-body">
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : filteredAthletes.length === 0 ? (
            <Typography sx={{ textAlign: "center", p: 3 }}>
              Aucun athlète trouvé.
            </Typography>
          ) : (
            <table className="table align-middle">
              <thead>
                <tr>
                  <th style={{ width: "35%" }}>Nom</th>
                  <th style={{ width: "35%" }}>Email</th>

                  {selectedCompetition ? (
                    <th style={{ width: "30%", textAlign: "center" }}>
                      Statut
                    </th>
                  ) : (
                    <th style={{ width: "30%", textAlign: "center" }}>
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredAthletes.map((a) => (
                  <tr key={a.id}>
                    <td>{a.firstName} {a.lastName}</td>
                    <td>{a.email}</td>

                    {selectedCompetition ? (
                      <td style={{ textAlign: "center" }}>
                        <span style={getStatusStyle(a.status)}>
                          {a.status || "Non défini"}
                        </span>
                      </td>
                    ) : (
                      <td style={{ textAlign: "center" }}>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleOpenModal(a)}
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

      <AthleteParticipationsModal
        open={modalOpen}
        onClose={handleCloseModal}
        athlete={selectedAthlete}
      />
    </Box>
  );
}
