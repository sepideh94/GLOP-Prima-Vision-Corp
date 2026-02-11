import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import appTheme from "../../../common/theme/appTheme";

export default function CommissionerFormDialog({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        firstName: "",
        lastName: "",
        email: "",
      });
      setErrors({});
      setBackendError("");
    }
  }, [open]);

  const validateName = (name) => {
    // Caractères autorisés : lettres, espaces, tirets, apostrophes
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!name.trim()) {
      return "Le nom est obligatoire";
    }
    if (!nameRegex.test(name)) {
      return "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes";
    }
    if (name.length < 2) {
      return "Le nom doit contenir au moins 2 caractères";
    }
    return null;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return "L'email est obligatoire";
    }
    if (!emailRegex.test(email)) {
      return "Format d'email invalide";
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    const firstNameError = validateName(form.firstName);
    if (firstNameError) newErrors.firstName = firstNameError;

    const lastNameError = validateName(form.lastName);
    if (lastNameError) newErrors.lastName = lastNameError;

    const emailError = validateEmail(form.email);
    if (emailError) newErrors.email = emailError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setBackendError("");
    try {
      await onSave(form);
    } catch (err) {
      setBackendError(err.response?.data?.message || "Une erreur s'est produite");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Créer un commissaire</DialogTitle>
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

          <TextField
            label="Nom"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            fullWidth
            required
            error={Boolean(errors.lastName)}
            helperText={errors.lastName}
            placeholder="Dupont"
          />

          <TextField
            label="Prénom"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            fullWidth
            required
            error={Boolean(errors.firstName)}
            helperText={errors.firstName}
            placeholder="Jean"
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            required
            error={Boolean(errors.email)}
            helperText={errors.email}
            placeholder="jean.dupont@example.com"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          onClick={handleSubmit}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1.1,
            borderRadius: appTheme.radius.pill,
            background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
            color: appTheme.colors.dark,
          }}
        >
          Créer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
