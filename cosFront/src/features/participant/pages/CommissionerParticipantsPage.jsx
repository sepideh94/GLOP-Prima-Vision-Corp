import { useState, useEffect, useMemo, useCallback } from "react";

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

import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";

import appTheme from "../../../common/theme/appTheme";
import AdminPageLayout from "../../../common/components/AdminPageLayout";

import athleteService from "../services/athleteService";
import competitionService from "../../competition/services/competitionService";
import AthleteParticipationsModal from "../components/AthleteParticipationsModal";

const STATUS_LABELS = {
  INVITED: "Invité",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  COMPLETED: "Terminé",
};

export default function CommissionerParticipantsPage() {

  const [athletes, setAthletes] = useState([]);
  const [competitions, setCompetitions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  const fetchCompetitions = useCallback(async () => {

    try {

      const events = await competitionService.getEvents();

      const competitionsRequests = events.map((event) =>
        competitionService.getCompetitionsByEventForCommissioner(event.id)
      );

      const results = await Promise.all(competitionsRequests);

      setCompetitions(results.flat());

    } catch (err) {

      console.error("Erreur chargement compétitions:", err);

    }

  }, []);

  const fetchAthletes = useCallback(async () => {

    setLoading(true);
    setError(null);

    try {

      const data = selectedCompetition
        ? await athleteService.getAthletesByCompetition(selectedCompetition)
        : await athleteService.getAllAthletes();

      setAthletes(data || []);

    } catch (err) {

      console.error(err);
      setError("Impossible de charger les athlètes");

    } finally {

      setLoading(false);

    }

  }, [selectedCompetition]);

  useEffect(() => {

    fetchCompetitions();

  }, [fetchCompetitions]);

  useEffect(() => {

    fetchAthletes();

  }, [fetchAthletes]);

  const filteredAthletes = useMemo(() => {

    if (!searchTerm) return athletes;

    const term = searchTerm.toLowerCase();

    return athletes.filter((item) => {

      const athleteData = item.athlete ?? item;

      return (
        athleteData.firstName?.toLowerCase().includes(term) ||
        athleteData.lastName?.toLowerCase().includes(term) ||
        athleteData.email?.toLowerCase().includes(term)
      );

    });

  }, [athletes, searchTerm]);

  const translateStatus = (status) => STATUS_LABELS[status] || "Non défini";

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
        : status === "CANCELLED"
        ? "rgba(239,68,68,0.25)"
        : "rgba(148,163,184,0.25)",
    color: appTheme.colors.dark,
  });

  const handleOpenModal = (athlete) => {

    setSelectedAthlete(athlete);
    setModalOpen(true);

  };

  const handleCloseModal = () => {

    setModalOpen(false);
    setSelectedAthlete(null);

  };

  return (

    <AdminPageLayout backPath="/commissioner">

      <Typography sx={{ fontSize: 32, fontWeight: 900, mb: 3 }}>
        Gestion des athlètes
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
                  <th style={{ width: "30%", textAlign: "center" }}>
                    {selectedCompetition ? "Statut" : "Actions"}
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredAthletes.map((item, index) => {

                  const athleteData = item.athlete ?? item;

                  return (

                    <tr key={athleteData.id ?? index}>

                      <td>
                        {athleteData.firstName} {athleteData.lastName}
                      </td>

                      <td>{athleteData.email}</td>

                      {selectedCompetition ? (

                        <td style={{ textAlign: "center" }}>
                          <span style={getStatusStyle(item.status)}>
                            {translateStatus(item.status)}
                          </span>
                        </td>

                      ) : (

                        <td style={{ textAlign: "center" }}>

                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleOpenModal(athleteData)}
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

                  );

                })}

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

    </AdminPageLayout>

  );

}