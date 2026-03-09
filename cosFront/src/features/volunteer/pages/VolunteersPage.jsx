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

import useVolunteers from "../hooks/useVolunteers";
import { filterVolunteers } from "../utils/filterVolunteers";

import VolunteersTable from "../components/VolunteersTable";
import VolunteerParticipationsModal from "../components/VolonteerParticipationsModal";

export default function VolunteersPage() {
  const navigate = useNavigate();

  const {
    volunteers,
    competitions,
    loading,
    error,
    loadCompetitions,
    loadVolunteers,
  } = useVolunteers();

  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  useEffect(() => {
    loadCompetitions();
  }, []);

  useEffect(() => {
    if (competitions.length) {
      loadVolunteers(selectedCompetition, competitions);
    }
  }, [competitions, selectedCompetition]);

  const filteredVolunteers = useMemo(
    () => filterVolunteers(volunteers, searchTerm),
    [volunteers, searchTerm]
  );

  const openModal = (v) => {
    setSelectedVolunteer(v);
    setModalOpen(true);
  };

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
            <VolunteersTable
              volunteers={filteredVolunteers}
              selectedCompetition={selectedCompetition}
              onOpenModal={openModal}
            />
          )}
        </div>
      </div>

      <VolunteerParticipationsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        volunteer={selectedVolunteer}
      />
    </Box>
  );
}