import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Autocomplete,
  Alert,
} from "@mui/material";

const impactOptions = [
  { label: "Tous les utilisateurs", value: "TOUS" },
  { label: "Commissaires uniquement", value: "COMMISSIONNERS" },
  { label: "Commissaires et athlètes", value: "COMMISSIONNERS_ATHLETES" },
];

export default function IncidentFormDialog({
  open,
  onClose,
  onSave,
  competitions = [],
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    impactLevel: "TOUS",
    competitionId: null,
  });

  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.title) return;

    await onSave(form);

    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      onClose();
      setForm({
        title: "",
        description: "",
        impactLevel: "TOUS",
        competitionId: null,
      });
      setSelectedCompetition(null);
    }, 1500);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Créer un incident</DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>

        {success && (
          <Alert severity="success">
            Incident créé avec succès
          </Alert>
        )}

        <TextField
          label="Titre"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
          required
          fullWidth
        />

        <TextField
          label="Description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          multiline
          rows={3}
          fullWidth
        />

        <TextField
          select
          label="Niveau d'impact"
          value={form.impactLevel}
          onChange={(e) => handleChange("impactLevel", e.target.value)}
          fullWidth
        >
          {impactOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Autocomplete
          options={competitions}
          getOptionLabel={(option) => option.name || ""}
          value={selectedCompetition}
          onChange={(_, value) => {
            setSelectedCompetition(value);
            handleChange("competitionId", value ? value.id : null);
          }}
          renderInput={(params) => (
            <TextField {...params} label="Compétition liée (optionnel)" />
          )}
        />

      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Annuler
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
}