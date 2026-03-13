import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Alert,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";

import appTheme from "../../../common/theme/appTheme";
import competitionService from "../../competition/services/competitionService";
import trialService from "../../trial/services/trialService";

const impactOptions = [
  { label: "Commissaires", value: "COMMISSIONNER" },
  { label: "Athlètes", value: "ATHLETE" },
  { label: "Volontaires", value: "VOLONTEER" },
  { label: "Spectateurs", value: "SPECTATOR" },
  { label: "Tous les utilisateurs", value: "TOUS" },
];

const SITE_OPTIONS = [
  { value: 1, label: "Site 1 - Piscine principale" },
  { value: 2, label: "Site 2 - Piscine secondaire" },
];

const emptyForm = {
  title: "",
  instructions: "",
  impactLevels: [],
  eventId: "",
  competitionId: "",
  trialId: "",
  siteId: "",
};

export default function IncidentFormDialog({
  open,
  onClose,
  onSave,
  incident,
}) {

  const isEdit = Boolean(incident);

  const [events, setEvents] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [trials, setTrials] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  /* ---------------- LOAD EVENTS ---------------- */

  useEffect(() => {

    const loadEvents = async () => {
      try {
        const data = await competitionService.getEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setEvents([]);
      }
    };

    if (open) loadEvents();

  }, [open]);

  /* ---------------- INIT FORM ---------------- */

  useEffect(() => {

    if (!open) return;

    if (incident) {
      setForm({
        title: incident.title || "",
        instructions: incident.description || "",
        impactLevels: Array.isArray(incident.impactLevels)
          ? incident.impactLevels
          : [],
        eventId: incident.eventId ?? "",
        competitionId: incident.competitionId ?? "",
        trialId: incident.trialId ?? "",
        siteId: incident.siteId ?? "",
      });
    } else {
      setForm(emptyForm);
      setCompetitions([]);
      setTrials([]);
    }

    setError("");

  }, [incident, open]);

  /* ---------------- LOAD COMPETITIONS ---------------- */

  useEffect(() => {

    const loadCompetitions = async () => {

      if (!form.eventId) {
        setCompetitions([]);
        return;
      }

      try {
        const data = await competitionService.getCompetitionsByEvent(form.eventId);
        setCompetitions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setCompetitions([]);
      }

    };

    loadCompetitions();

  }, [form.eventId]);

  /* ---------------- LOAD TRIALS ---------------- */

  useEffect(() => {

    const loadTrials = async () => {

      if (!form.competitionId) {
        setTrials([]);
        return;
      }

      try {
        const data = await trialService.getTrialsByCompetition(form.competitionId);
        setTrials(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setTrials([]);
      }

    };

    loadTrials();

  }, [form.competitionId]);

  /* ---------------- HANDLE CHANGE ---------------- */

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((prev) => {

      const updated = { ...prev, [name]: value };

      if (name === "eventId") {
        updated.competitionId = "";
        updated.trialId = "";
        setTrials([]);
      }

      if (name === "competitionId") {
        updated.trialId = "";
      }

      return updated;

    });

  };

  /* ---------------- IMPACT ---------------- */

  const handleImpactChange = (value) => {

    setForm((prev) => {

      const alreadySelected = prev.impactLevels.includes(value);
      let nextValues = [];

      if (alreadySelected) {
        nextValues = prev.impactLevels.filter((item) => item !== value);
      } else if (value === "TOUS") {
        nextValues = ["TOUS"];
      } else {
        nextValues = prev.impactLevels
          .filter((item) => item !== "TOUS")
          .concat(value);
      }

      return {
        ...prev,
        impactLevels: nextValues,
      };

    });

  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {

    if (!form.title.trim()) {
      setError("Veuillez saisir un titre");
      return;
    }

    if (!form.eventId) {
      setError("Veuillez sélectionner un événement");
      return;
    }

    if (!form.impactLevels.length) {
      setError("Veuillez sélectionner au moins un impact");
      return;
    }

    if (
      form.impactLevels.includes("TOUS") &&
      form.impactLevels.length > 1
    ) {
      setError("TOUS ne peut pas être combiné avec un autre impact");
      return;
    }

    setError("");

    try {

      await onSave({
        title: form.title.trim(),
        instructions: form.instructions?.trim() || null,
        impactLevels: form.impactLevels,
        eventId: Number(form.eventId),
        competitionId: form.competitionId
          ? Number(form.competitionId)
          : null,
        trialId: form.trialId
          ? Number(form.trialId)
          : null,
        siteId: form.siteId
          ? Number(form.siteId)
          : null,
      });

      setForm(emptyForm);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Une erreur interne est survenue."
      );

    }

  };

  /* ---------------- UI ---------------- */

  return (

    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">

      <DialogTitle>
        {isEdit ? "Modifier un incident" : "Créer un incident"}
      </DialogTitle>

      <DialogContent>

        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Titre"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="Instructions"
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />

          <Box>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              Utilisateurs impactés
            </Typography>

            <FormGroup>
              {impactOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={form.impactLevels.includes(option.value)}
                      onChange={() => handleImpactChange(option.value)}
                    />
                  }
                  label={option.label}
                />
              ))}
            </FormGroup>
          </Box>

          {/* EVENT (OBLIGATOIRE) */}

          <TextField
            select
            label="Événement"
            name="eventId"
            value={form.eventId}
            onChange={handleChange}
            fullWidth
            required
          >
            {events.map((event) => (
              <MenuItem key={event.id} value={event.id}>
                {event.name}
              </MenuItem>
            ))}
          </TextField>

          {/* COMPETITION */}

          <TextField
            select
            label="Compétition (optionnel)"
            name="competitionId"
            value={form.competitionId || ""}
            onChange={handleChange}
            fullWidth
            disabled={!form.eventId}
          >
            <MenuItem value="">—</MenuItem>

            {competitions.map((comp) => (
              <MenuItem key={comp.id} value={comp.id}>
                {comp.name}
              </MenuItem>
            ))}
          </TextField>

          {/* TRIAL */}

          <TextField
            select
            label="Épreuve (optionnel)"
            name="trialId"
            value={form.trialId || ""}
            onChange={handleChange}
            fullWidth
            disabled={!form.competitionId}
          >
            <MenuItem value="">—</MenuItem>

            {trials.map((trial) => (
              <MenuItem key={trial.id} value={trial.id}>
                {trial.name || trial.trialName || `Épreuve #${trial.id}`}
              </MenuItem>
            ))}
          </TextField>

          {/* SITE */}

          <TextField
            select
            label="Site (optionnel)"
            name="siteId"
            value={form.siteId || ""}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="">—</MenuItem>

            {SITE_OPTIONS.map((site) => (
              <MenuItem key={site.value} value={site.value}>
                {site.label}
              </MenuItem>
            ))}
          </TextField>

        </Box>

      </DialogContent>

      <DialogActions>

        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: appTheme.radius.pill,
            background: "linear-gradient(135deg,#86efac,#4ade80)",
            color: "#064e3b",
          }}
        >
          Annuler
        </Button>

        <Button
          onClick={handleSubmit}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: appTheme.radius.pill,
            background: "linear-gradient(135deg,#22D3EE,#3B82F6)",
            color: appTheme.colors.dark,
          }}
        >
          {isEdit ? "Enregistrer" : "Créer"}
        </Button>

      </DialogActions>

    </Dialog>

  );

}
