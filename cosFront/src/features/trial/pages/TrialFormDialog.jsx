import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
} from "@mui/material";


const TRIAL_NAME_OPTIONS = [
  { value: "FIFTY_M_FREESTYLE", label: "50m nage libre" },
  { value: "HUNDRED_M_FREESTYLE", label: "100m nage libre" },
  { value: "TWO_HUNDRED_M_FREESTYLE", label: "200m nage libre" },
  { value: "FOUR_HUNDRED_M_FREESTYLE", label: "400m nage libre" },
  { value: "FIVE_HUNDRED_M_FREESTYLE", label: "500m nage libre" },
  { value: "EIGHT_HUNDRED_M_FREESTYLE", label: "800m nage libre" },
  { value: "FIFTEEN_HUNDRED_M_FREESTYLE", label: "1500m nage libre" },
  { value: "HUNDRED_M_BACKSTROKE", label: "100m dos" },
  { value: "TWO_HUNDRED_M_BACKSTROKE", label: "200m dos" },
  { value: "HUNDRED_M_BREASTSTROKE", label: "100m brasse" },
  { value: "TWO_HUNDRED_M_BREASTSTROKE", label: "200m brasse" },
  { value: "HUNDRED_M_BUTTERFLY", label: "100m papillon" },
  { value: "TWO_HUNDRED_M_BUTTERFLY", label: "200m papillon" },
  { value: "TWO_HUNDRED_M_INDIVIDUAL_MEDLEY", label: "200m 4 nages" },
  { value: "FOUR_HUNDRED_M_INDIVIDUAL_MEDLEY", label: "400m 4 nages" },
  { value: "RELAY_4X100M_FREESTYLE", label: "Relais 4×100m nage libre" },
  { value: "RELAY_4X200M_FREESTYLE", label: "Relais 4×200m nage libre" },
  { value: "RELAY_4X100M_MEDLEY", label: "Relais 4×100m 4 nages" },
];

const MODE_OPTIONS = [
  { value: "INDIVIDUAL", label: "Individuel" },
  { value: "TEAM", label: "Équipe" },
];

const CATEGORY_OPTIONS = [
  { value: "MALE", label: "Homme" },
  { value: "FEMALE", label: "Femme" },
  { value: "MIXTE", label: "Mixte" },
];

const SITE_OPTIONS = [
  { value: 1, label: "Site 1 - Piscine principale" },
  { value: 2, label: "Site 2 - Piscine secondaire" },
];

const ROUND_OPTIONS = [
  { value: 1, label: "Round 1 - Qualifications" },
  { value: 2, label: "Round 2 - Demi-finale" },
  { value: 3, label: "Round 3 - Finale" },
];

const emptyForm = {
  trialName: "",
  roundNumber: "",
  description: "",
  rules: "",
  startDate: "",
  startHour: "",
  endDate: "",
  endHour: "",
  mode: "",
  categoryGender: "",
  siteId: "",
  roundId: "",
};

export default function TrialFormDialog({ open, onClose, onSave, initialData }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          trialName: initialData.trialName || "",
          roundNumber: initialData.roundNumber ?? "",
          description: initialData.description || "",
          rules: initialData.rules || "",
          startDate: initialData.startDate || "",
          startHour: initialData.startHour ? initialData.startHour.substring(0, 5) : "",
          endDate: initialData.endDate || "",
          endHour: initialData.endHour ? initialData.endHour.substring(0, 5) : "",
          mode: initialData.mode || "",
          categoryGender: initialData.categoryGender || "",
          siteId: initialData.siteId || "",
          roundId: initialData.roundId || "",
        });
      } else {
        setForm(emptyForm);
      }
      setError("");
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (
      !form.trialName ||
      !form.startDate ||
      !form.startHour ||
      !form.endDate ||
      !form.endHour ||
      !form.mode ||
      !form.categoryGender ||
      !form.siteId ||
      !form.roundId
    ) {
      setError("Merci de remplir tous les champs obligatoires (*)");
      return;
    }

    setError("");
    onSave(form);
  };

  const dialogTitle = initialData
    ? "Modifier une épreuve"
    : "Créer une épreuve";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>

      <DialogContent dividers>
        {error && (
          <p style={{ color: "red", marginBottom: 16 }}>{error}</p>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Type d'épreuve */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Type d'épreuve *"
              name="trialName"
              value={form.trialName}
              onChange={handleChange}
            >
              {TRIAL_NAME_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Round number (optionnel) */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Numéro de round (optionnel)"
              name="roundNumber"
              value={form.roundNumber}
              onChange={handleChange}
              inputProps={{ min: 1 }}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>

          {/* Règles */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Règles"
              name="rules"
              value={form.rules}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>

          {/* Dates et heures */}
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Date de début *"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Heure de début *"
              type="time"
              name="startHour"
              value={form.startHour}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Date de fin *"
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Heure de fin *"
              type="time"
              name="endHour"
              value={form.endHour}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Mode & Catégorie */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Mode *"
              name="mode"
              value={form.mode}
              onChange={handleChange}
            >
              {MODE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Catégorie *"
              name="categoryGender"
              value={form.categoryGender}
              onChange={handleChange}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Site & Round */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Site *"
              name="siteId"
              value={form.siteId}
              onChange={handleChange}
            >
              {SITE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Round *"
              name="roundId"
              value={form.roundId}
              onChange={handleChange}
            >
              {ROUND_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Annuler
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
