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

  // Filtres
  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal
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
      // Récupérer toutes les compétitions de tous les événements
      const allCompetitions = [];
      for (const event of events) {
        try {
          const comps = await competitionService.getCompetitionsByEventForCommissioner(event.id);
          allCompetitions.push(...comps);
        } catch (e) {
          console.error(`Erreur pour l'événement ${event.id}:`, e);
        }
      }
      setCompetitions(allCompetitions);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
    }
  };

  const fetchAthletes = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (selectedCompetition) {
        data = await athleteService.getAthletesByCompetition(selectedCompetition);
      } else {
        data = await athleteService.getAllAthletes();
      }
      setAthletes(data);
    } catch (err) {
      console.error("Erreur lors du chargement des athlètes:", err);
      setError("Impossible de charger les athlètes");
    } finally {
      setLoading(false);
    }
  };

  // Filtrer par recherche
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

      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontSize: 32, fontWeight: 900 }}>
          Gestion des athlètes
        </Typography>
      </Box>

      {/* Filtres */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <FormControl sx={{ minWidth: 200 }}>
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
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} />,
          }}
          sx={{ minWidth: 250 }}
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
            <Typography color="error" sx={{ p: 2 }}>
              {error}
            </Typography>
          ) : filteredAthletes.length === 0 ? (
            <Typography sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
              Aucun athlète trouvé.
            </Typography>
          ) : (
            <table className="table align-middle">
              <thead>
                <tr>
                  <td><strong>Nom</strong></td>
                  <td><strong>Email</strong></td>
                  <td><strong>Actions</strong></td>
                </tr>
              </thead>
              <tbody>
                {filteredAthletes.map((a) => (
                  <tr key={a.id}>
                    <td>{a.firstName} {a.lastName}</td>
                    <td>{a.email}</td>
                    <td>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleOpenModal(a)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          px: 2,
                          py: 0.8,
                          borderRadius: appTheme.radius.pill,
                          background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
                          color: "#fff",
                          boxShadow: "0 4px 12px rgba(139,92,246,0.3)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                          },
                        }}
                      >
                        Participations
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal des participations */}
      <AthleteParticipationsModal
        open={modalOpen}
        onClose={handleCloseModal}
        athlete={selectedAthlete}
      />
    </Box>
  );
}
