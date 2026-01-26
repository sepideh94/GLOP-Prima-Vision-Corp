import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import DatePickerForm from "../../../common/components/DatePickerForm";
import EventIcon from "@mui/icons-material/Event";
import appTheme from "../../../common/theme/appTheme";

export default function CompetitionFormDialog({
  open,
  onClose,
  onSave,
  initialData,
  currentEvent,
}) {
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "", 
  });

  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState("");

  useEffect(() => {
  if (initialData) {
    setForm({
      name: initialData.name || "",
      description: initialData.description || "",
      startDate: initialData.startDate
        ? String(initialData.startDate).slice(0, 10)
        : "",
      endDate: initialData.endDate
        ? String(initialData.endDate).slice(0, 10)
        : "",
    });
  } else {
    setForm({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
    });
  }
  setErrors({});
  setBackendError("");
}, [initialData, open]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Nom obligatoire";
    if (!form.description.trim())
      newErrors.description = "Description obligatoire";
    if (!form.startDate) newErrors.startDate = "Date obligatoire";
    if (!form.endDate) newErrors.endDate = "Date de fin obligatoire";

    if (
    form.startDate &&
    form.endDate &&
    new Date(form.endDate) < new Date(form.startDate)
    ) {
    newErrors.endDate =
      "La date de fin doit être après la date de début";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setBackendError("");
    try {
      await onSave(form);
    } catch (err) {
      setBackendError(err.message || "Une erreur s'est produite");
    }
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? "Modifier une compétition" : "Créer une compétition"}
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            mt: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {backendError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {backendError}
            </Alert>
          )}
          {currentEvent && (
            <Alert
              severity="info"
              icon={<EventIcon />}
              sx={{
                borderRadius: 2,
                "& .MuiAlert-message": {
                  width: "100%",
                },
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Événement : {currentEvent.name}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                <strong>Début :</strong> {formatEventDate(currentEvent.startDate)}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                <strong>Fin :</strong> {formatEventDate(currentEvent.endDate)}
              </Typography>
            </Alert>
          )}
          <TextField
            label="Nom"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            error={Boolean(errors.name)}
            helperText={errors.name}
          />
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={3}
            error={Boolean(errors.description)}
            helperText={errors.description}
          />
          <DatePickerForm
            label="Date de début"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            fullWidth
            error={Boolean(errors.startDate)}
            helperText={errors.startDate}
            disablePast
          />
          <DatePickerForm
            label="Date de fin"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            fullWidth
            error={Boolean(errors.endDate)}
            helperText={errors.endDate}
            minDate={form.startDate}
            disablePast={!form.startDate}
          />

        </Box>
      </DialogContent>
      <DialogActions>

       <Button
        onClick={onClose}
        sx={{
          mb: 2,
          textTransform: "none",
          fontWeight: 700,
          px: 3,
          py: 1.1,
          minWidth: 130, 
          borderRadius: appTheme.radius.pill,
          background: "linear-gradient(135deg, #86efac, #4ade80)",
          color: "#064e3b",
          boxShadow: "0 6px 16px rgba(74,222,128,0.35)",
          "&:hover": {
          background: "linear-gradient(135deg, #4ade80, #22c55e)",
        },
        }}
        >
        Annuler
        </Button>

        <Button 
        sx={{
          mb: 2,
          textTransform: "none",
          fontWeight: 700,
          minWidth: 130,
          px: 3,
          py: 1.1,
          borderRadius: appTheme.radius.pill,
          background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
          color: appTheme.colors.dark,
        }}
        onClick={handleSubmit}>
          {isEdit ? "Enregistrer" : "Créer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
