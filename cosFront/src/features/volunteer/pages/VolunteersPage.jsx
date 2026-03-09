import { useState, useEffect, useMemo } from "react";

import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import AdminPageLayout from "../../../common/components/AdminPageLayout";
import useVolunteers from "../hooks/useVolunteers";
import { filterVolunteers } from "../utils/filterVolunteers";

import VolunteersTable from "../components/VolunteersTable";
import VolunteerParticipationsModal from "../components/VolonteerParticipationsModal";

export default function VolunteersPage() {

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
    <AdminPageLayout
      title="Gestion des volontaires"
      backPath="/admin"
    >

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

    </AdminPageLayout>
  );
}