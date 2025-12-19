import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";

export default function CompetitionFormDialog({
  open,
  onClose,
  onSave,
  initialData,
}) {
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "", 
  });

  const [errors, setErrors] = useState({});

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

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(form);
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
          <TextField
            label="Date de début"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={Boolean(errors.startDate)}
            helperText={errors.startDate}
          />
          <TextField
            label="Date de fin"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={Boolean(errors.endDate)}
            helperText={errors.endDate}
          />

        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {isEdit ? "Enregistrer" : "Créer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
