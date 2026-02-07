import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";
import * as yup from "yup";
import athleteProfileService from "../services/athleteProfileService";
import appTheme from "../../../common/theme/appTheme";

// Liste des pays (version simplifiée - vous pouvez utiliser une librairie complète)
const COUNTRIES = [
  "France",
  "Belgique",
  "Suisse",
  "Canada",
  "Allemagne",
  "Espagne",
  "Italie",
  "Royaume-Uni",
  "États-Unis",
  "Autre",
];

// Schéma de validation yup
const profileSchema = yup.object().shape({
  nationality: yup.string().required("La nationalité est obligatoire"),
  dateOfBirth: yup
    .date()
    .required("La date de naissance est obligatoire")
    .max(new Date(), "La date de naissance ne peut pas être dans le futur"),
  gender: yup.string().required("Le sexe est obligatoire"),
  passportNumber: yup.string().required("Le numéro de passeport est obligatoire"),
  passportFile: yup
    .mixed()
    .test("fileRequired", "Le passeport est obligatoire", (value) => {
      return value instanceof File || value === null;
    })
    .test("fileType", "Le fichier doit être une image ou un PDF", (value) => {
      if (!value) return true;
      if (value instanceof File) {
        const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
        return validTypes.includes(value.type);
      }
      return true;
    }),
  medicalCertificateFile: yup
    .mixed()
    .test("fileRequired", "Le certificat médical est obligatoire", (value) => {
      return value instanceof File || value === null;
    })
    .test("fileType", "Le fichier doit être une image ou un PDF", (value) => {
      if (!value) return true;
      if (value instanceof File) {
        const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
        return validTypes.includes(value.type);
      }
      return true;
    }),
});

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    nationality: "",
    dateOfBirth: null,
    gender: "",
    passportNumber: "",
    passportFile: null,
    medicalCertificateFile: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profile = await athleteProfileService.getMyProfile();
      setFormData({
        nationality: profile.nationality || "",
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
        gender: profile.gender || "",
        passportNumber: profile.passportNumber || "",
        passportFile: profile.passportFile ? "existing" : null,
        medicalCertificateFile: profile.medicalCertificateFile ? "existing" : null,
      });
    } catch (err) {
      // Si le profil n'existe pas encore, on continue avec un formulaire vide
      console.log("Profil non trouvé, création d'un nouveau profil");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
    setSuccess(false);
    setError("");
  };

  const handleFileChange = (field, file) => {
    if (file) {
      handleChange(field, file);
    }
  };

  const validate = async () => {
    try {
      await profileSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const validationErrors = {};
      err.inner.forEach((error) => {
        validationErrors[error.path] = error.message;
      });
      setErrors(validationErrors);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const isValid = await validate();
    if (!isValid) {
      return;
    }

    setSaving(true);
    try {
      await athleteProfileService.updateProfile(formData);
      setSuccess(true);
      // Recharger le profil pour afficher les fichiers uploadés
      await loadProfile();
    } catch (err) {
      setError(
        err.response?.data?.message || "Une erreur est survenue lors de la sauvegarde."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Typography sx={{ fontSize: 36, fontWeight: 900, mb: 1 }}>
        Mon Profil
      </Typography>
      <Typography sx={{ fontSize: 15, color: "#374151", mb: 4 }}>
        Complétez votre profil pour participer aux compétitions.
      </Typography>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          background: "#fff",
        }}
      >
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Profil mis à jour avec succès !
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Nationalité */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel sx={{ mb: 1, fontWeight: 600, color: "#1E293B" }}>
              Nationalité *
            </FormLabel>
            <TextField
              select
              value={formData.nationality}
              onChange={(e) => handleChange("nationality", e.target.value)}
              error={!!errors.nationality}
              helperText={errors.nationality}
              SelectProps={{
                native: true,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            >
              <option value="">Sélectionnez un pays</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </TextField>
          </FormControl>

          {/* Date de naissance */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel sx={{ mb: 1, fontWeight: 600, color: "#1E293B" }}>
              Date de naissance *
            </FormLabel>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
              <DatePicker
                value={formData.dateOfBirth}
                onChange={(date) => handleChange("dateOfBirth", date)}
                slotProps={{
                  textField: {
                    error: !!errors.dateOfBirth,
                    helperText: errors.dateOfBirth,
                    fullWidth: true,
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </FormControl>

          {/* Sexe */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel sx={{ mb: 1, fontWeight: 600, color: "#1E293B" }}>
              Sexe *
            </FormLabel>
            <RadioGroup
              row
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
            >
              <FormControlLabel value="MALE" control={<Radio />} label="Homme" />
              <FormControlLabel value="FEMALE" control={<Radio />} label="Femme" />
            </RadioGroup>
            {errors.gender && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                {errors.gender}
              </Typography>
            )}
          </FormControl>

          {/* Numéro de passeport */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel sx={{ mb: 1, fontWeight: 600, color: "#1E293B" }}>
              Numéro de passeport *
            </FormLabel>
            <TextField
              value={formData.passportNumber}
              onChange={(e) => handleChange("passportNumber", e.target.value)}
              error={!!errors.passportNumber}
              helperText={errors.passportNumber}
              placeholder="Ex: 12AB34567"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </FormControl>

          {/* Passeport - Upload */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel sx={{ mb: 1, fontWeight: 600, color: "#1E293B" }}>
              Passeport (Image ou PDF) *
            </FormLabel>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange("passportFile", e.target.files[0])}
              style={{ display: "none" }}
              id="passport-file-input"
            />
            <label htmlFor="passport-file-input">
              <Button
                variant="outlined"
                component="span"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  width: "100%",
                  py: 1.5,
                }}
              >
                {formData.passportFile && formData.passportFile !== "existing"
                  ? formData.passportFile.name
                  : formData.passportFile === "existing"
                  ? "Fichier déjà uploadé"
                  : "Choisir un fichier"}
              </Button>
            </label>
            {errors.passportFile && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.passportFile}
              </Typography>
            )}
          </FormControl>

          {/* Certificat médical - Upload */}
          <FormControl fullWidth sx={{ mb: 4 }}>
            <FormLabel sx={{ mb: 1, fontWeight: 600, color: "#1E293B" }}>
              Certificat Médical (Image ou PDF) *
            </FormLabel>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) =>
                handleFileChange("medicalCertificateFile", e.target.files[0])
              }
              style={{ display: "none" }}
              id="medical-file-input"
            />
            <label htmlFor="medical-file-input">
              <Button
                variant="outlined"
                component="span"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  width: "100%",
                  py: 1.5,
                }}
              >
                {formData.medicalCertificateFile &&
                formData.medicalCertificateFile !== "existing"
                  ? formData.medicalCertificateFile.name
                  : formData.medicalCertificateFile === "existing"
                  ? "Fichier déjà uploadé"
                  : "Choisir un fichier"}
              </Button>
            </label>
            {errors.medicalCertificateFile && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.medicalCertificateFile}
              </Typography>
            )}
          </FormControl>

          {/* Bouton de soumission */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
                background: appTheme.gradients.navbar,
                color: "#020617",
                "&:hover": {
                  background: appTheme.gradients.navbar,
                  opacity: 0.9,
                },
              }}
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
