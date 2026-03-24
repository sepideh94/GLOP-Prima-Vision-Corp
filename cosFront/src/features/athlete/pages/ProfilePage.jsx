import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArticleIcon from "@mui/icons-material/Article";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";
import * as yup from "yup";
import athleteProfileService from "../services/athleteProfileService";
import { useAuth } from "../../../common/contexts/AuthContext";
import UploadedFilePreviewModal from "../../../common/components/UploadedFilePreviewModal";

const PROFILE_HERO =
  "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=2000&q=78";

const formLabelSx = {
  mb: 1,
  fontWeight: 800,
  fontSize: 16,
  color: "#0f172a",
  letterSpacing: "-0.01em",
};

const textFieldAccentSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    fontWeight: 650,
  },
  "& .MuiOutlinedInput-input, & .MuiNativeSelect-select, & textarea": {
    fontWeight: 650,
    fontSize: "1.02rem",
    color: "#0f172a",
  },
  "& .MuiFormHelperText-root": {
    fontWeight: 600,
    fontSize: "0.8125rem",
  },
};

// Schéma de validation yup
const profileSchema = yup.object().shape({
  nationality: yup.string().required("La nationalité est obligatoire"),
  dateOfBirth: yup
    .date()
    .required("La date de naissance est obligatoire")
    .max(new Date(), "La date de naissance ne peut pas être dans le futur"),
  gender: yup.string().oneOf(["M", "F"], "Le sexe doit être M ou F").required("Le sexe est obligatoire"),
  passportNumber: yup.string().required("Le numéro de passeport est obligatoire"),
  passportFile: yup
    .mixed()
    .test("fileRequired", "Le passeport est obligatoire", (value) => {
      return value instanceof File || value === "existing" || value === null;
    })
    .test("fileType", "Le fichier doit être une image ou un PDF", (value) => {
      if (!value || value === "existing") return true;
      if (value instanceof File) {
        const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
        return validTypes.includes(value.type);
      }
      return true;
    }),
  medicalCertificateFile: yup
    .mixed()
    .test("fileRequired", "Le certificat médical est obligatoire", (value) => {
      return value instanceof File || value === "existing" || value === null;
    })
    .test("fileType", "Le fichier doit être une image ou un PDF", (value) => {
      if (!value || value === "existing") return true;
      if (value instanceof File) {
        const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
        return validTypes.includes(value.type);
      }
      return true;
    }),
});

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
  const [charterAccepted, setCharterAccepted] = useState(false);
  const [charterModalOpen, setCharterModalOpen] = useState(false);
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewBlob, setPreviewBlob] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");

  // Vérifier que l'utilisateur est un athlète
  useEffect(() => {
    if (user && user.role && user.role.toUpperCase() !== "ATHLETE") {
      // Rediriger vers le dashboard approprié selon le rôle
      const roleRoutes = {
        ADMIN: "/admin",
        COMMISSIONNER: "/commissioner",
        VOLONTEER: "/volunteer",
        SPECTATOR: "/spectator",
      };
      const redirectPath = roleRoutes[user.role.toUpperCase()] || "/athlete";
      navigate(redirectPath, { replace: true });
      return;
    }
    
    if (user && user.role && user.role.toUpperCase() === "ATHLETE") {
      loadProfile();
      loadCountries();
    }
  }, [user, navigate]);

  const loadCountries = async () => {
    setLoadingCountries(true);
    try {
      const countriesList = await athleteProfileService.getCountries();
      setCountries(countriesList);
    } catch (err) {
      console.error("Erreur lors du chargement des pays:", err);
      // En cas d'erreur, on peut utiliser une liste de secours
      setCountries([
        { code: "FR", name: "France" },
        { code: "BE", name: "Belgique" },
        { code: "CH", name: "Suisse" },
        { code: "CA", name: "Canada" },
        { code: "DE", name: "Allemagne" },
        { code: "ES", name: "Espagne" },
        { code: "IT", name: "Italie" },
        { code: "GB", name: "Royaume-Uni" },
        { code: "US", name: "États-Unis" },
      ]);
    } finally {
      setLoadingCountries(false);
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profile = await athleteProfileService.getMyProfile();
      setFormData({
        nationality: profile.nationality || "",
        dateOfBirth: profile.birthDate ? new Date(profile.birthDate) : null,
        gender: profile.sexe || "",
        passportNumber: profile.passportNumber || "",
        passportFile: profile.hasPassport ? "existing" : null,
        medicalCertificateFile: profile.hasMedicalCertificate ? "existing" : null,
      });
      setCharterAccepted(profile.hasAcceptedCharte || false);
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

  const handleCharterToggle = (event) => {
    const checked = event.target.checked;
    setCharterAccepted(checked);

    localStorage.setItem("athlete_eu_charter_accepted", checked ? "true" : "false");

    if (checked && errors.charterAccepted) {
      setErrors((prev) => ({
        ...prev,
        charterAccepted: undefined,
      }));
    }
  };

  const handleFileChange = (field, file) => {
    if (file) {
      handleChange(field, file);
    }
  };

  const openFilePreview = async (type) => {
    setPreviewError("");
    setPreviewLoading(true);
    try {
      if (type === "passport") {
        const blob = await athleteProfileService.downloadPassportBlob();
        setPreviewBlob(blob);
        setPreviewTitle("Passeport / CNI");
        setPreviewFileName("passeport");
      } else {
        const blob = await athleteProfileService.downloadMedicalCertificateBlob();
        setPreviewBlob(blob);
        setPreviewTitle("Certificat médical");
        setPreviewFileName("certificat-medical");
      }
      setPreviewOpen(true);
    } catch {
      setPreviewError("Impossible d'afficher le document pour le moment.");
      setPreviewOpen(true);
    } finally {
      setPreviewLoading(false);
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

    if (!charterAccepted) {
      setErrors((prev) => ({
        ...prev,
        charterAccepted: "Vous devez accepter la charte européenne de l'athlète pour continuer.",
      }));
      return;
    }

    const isValid = await validate();
    if (!isValid) {
      return;
    }

    setSaving(true);
    try {
      // Préparer les données pour le backend (convertir les noms de champs)
      const profileData = {
        nationality: formData.nationality,
        birthDate: formData.dateOfBirth,
        sexe: formData.gender,
        passportNumber: formData.passportNumber,
        hasAcceptedCharte: charterAccepted,
      };

      // Mettre à jour le profil (données texte)
      await athleteProfileService.updateProfile(profileData);

      // Uploader les fichiers séparément si nécessaire
      if (formData.passportFile && formData.passportFile !== "existing" && formData.passportFile instanceof File) {
        await athleteProfileService.uploadPassport(formData.passportFile);
      }

      if (formData.medicalCertificateFile && formData.medicalCertificateFile !== "existing" && formData.medicalCertificateFile instanceof File) {
        await athleteProfileService.uploadMedicalCertificate(formData.medicalCertificateFile);
      }

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
    <Box
      sx={{
        position: "relative",
        minHeight: "100%",
        mx: { xs: -3, sm: -4, md: -6 },
        mt: { xs: -2, sm: -3 },
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 2, sm: 3 },
        pb: 6,
        overflow: "hidden",
        background:
          "linear-gradient(165deg, #fffbeb 0%, #ffedd5 35%, #fef9c3 65%, #fff7ed 100%)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(251, 191, 36, 0.22) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 100% 80%, rgba(249, 115, 22, 0.15) 0%, transparent 50%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1, maxWidth: 800, mx: "auto" }}>
        <Box
          sx={{
            position: "relative",
            borderRadius: 3,
            overflow: "hidden",
            mb: 3,
            border: "1px solid rgba(15, 39, 68, 0.12)",
            boxShadow: "0 16px 40px rgba(15, 39, 68, 0.14)",
            minHeight: { xs: 200, sm: 220 },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${PROFILE_HERO})`,
              backgroundSize: "cover",
              backgroundPosition: "center 38%",
              transform: "scale(1.05)",
              filter: "blur(4px)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(105deg, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.55) 45%, rgba(2,132,199,0.35) 100%)",
            }}
          />
          <Box
            sx={{
              position: "relative",
              px: { xs: 3, sm: 4 },
              py: { xs: 3.5, sm: 4.5 },
              textAlign: "center",
            }}
          >
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: "1.75rem", sm: "2.15rem" },
                fontWeight: 900,
                mb: 1.5,
                color: "#fff",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                textShadow: "0 2px 16px rgba(0,0,0,0.35)",
              }}
            >
              Mon profil athlète
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 15, sm: 16 },
                fontWeight: 600,
                color: "rgba(255,255,255,0.94)",
                lineHeight: 1.65,
                maxWidth: 520,
                mx: "auto",
                textShadow: "0 1px 10px rgba(0,0,0,0.25)",
              }}
            >
              Complétez vos informations et vos documents : sans profil complet, la validation par le
              commissaire ne peut pas aboutir.
            </Typography>
          </Box>
        </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          backdropFilter: "blur(14px)",
          border: "3px solid rgba(234, 88, 12, 0.45)",
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          boxShadow:
            "0 0 0 1px rgba(15, 39, 68, 0.06), 0 8px 0 rgba(251, 191, 36, 0.35), 0 28px 56px rgba(234, 88, 12, 0.14), inset 0 1px 0 rgba(255,255,255,1)",
        }}
      >
        <Box
          sx={{
            height: 4,
            borderRadius: 2,
            background: "linear-gradient(90deg, #eab308, #f97316, #ea580c)",
            mb: 3,
            opacity: 0.95,
          }}
        />
        {success && (
          <Alert severity="success" sx={{ mb: 3, fontWeight: 700, fontSize: "0.95rem" }}>
            Profil mis à jour avec succès !
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3, fontWeight: 700, fontSize: "0.95rem" }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Nationalité */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel sx={formLabelSx}>Nationalité *</FormLabel>
            <TextField
              select
              value={formData.nationality}
              onChange={(e) => handleChange("nationality", e.target.value)}
              error={!!errors.nationality}
              helperText={errors.nationality}
              SelectProps={{
                native: true,
              }}
              sx={textFieldAccentSx}
            >
              <option value="">Sélectionnez un pays</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </TextField>
          </FormControl>

          {/* Date de naissance */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel sx={formLabelSx}>Date de naissance *</FormLabel>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
              <DatePicker
                value={formData.dateOfBirth}
                onChange={(date) => handleChange("dateOfBirth", date)}
                slotProps={{
                  textField: {
                    error: !!errors.dateOfBirth,
                    helperText: errors.dateOfBirth,
                    fullWidth: true,
                    sx: textFieldAccentSx,
                  },
                }}
              />
            </LocalizationProvider>
          </FormControl>

          {/* Sexe */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel sx={formLabelSx}>Sexe *</FormLabel>
            <RadioGroup
              row
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
            >
              <FormControlLabel
                value="M"
                control={<Radio sx={{ "& .MuiSvgIcon-root": { fontSize: 22 } }} />}
                label="Homme"
                sx={{ "& .MuiFormControlLabel-label": { fontWeight: 750, fontSize: 16, color: "#0f172a" } }}
              />
              <FormControlLabel
                value="F"
                control={<Radio sx={{ "& .MuiSvgIcon-root": { fontSize: 22 } }} />}
                label="Femme"
                sx={{ "& .MuiFormControlLabel-label": { fontWeight: 750, fontSize: 16, color: "#0f172a" } }}
              />
            </RadioGroup>
            {errors.gender && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75, fontWeight: 700 }}>
                {errors.gender}
              </Typography>
            )}
          </FormControl>

          {/* Numéro de passeport */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel sx={formLabelSx}>Numéro de passeport *</FormLabel>
            <TextField
              value={formData.passportNumber}
              onChange={(e) => handleChange("passportNumber", e.target.value)}
              error={!!errors.passportNumber}
              helperText={errors.passportNumber}
              placeholder="Ex: 12AB34567"
              sx={textFieldAccentSx}
            />
          </FormControl>

          {/* Passeport - Upload */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel sx={formLabelSx}>Passeport (Image ou PDF) *</FormLabel>
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
                  py: 1.75,
                  fontWeight: 750,
                  fontSize: "1rem",
                  borderWidth: 2,
                  borderColor: "rgba(15, 23, 42, 0.2)",
                  color: "#0f172a",
                }}
              >
                {formData.passportFile && formData.passportFile !== "existing"
                  ? formData.passportFile.name
                  : formData.passportFile === "existing"
                  ? "Fichier déjà uploadé"
                  : "Choisir un fichier"}
              </Button>
            </label>
            {formData.passportFile && (
              <Button
                variant="text"
                startIcon={<VisibilityIcon />}
                onClick={() => openFilePreview("passport")}
                sx={{ mt: 1, textTransform: "none", fontWeight: 700, alignSelf: "flex-start" }}
              >
                Visualiser le document
              </Button>
            )}
            {errors.passportFile && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, fontWeight: 700 }}>
                {errors.passportFile}
              </Typography>
            )}
          </FormControl>

          {/* Certificat médical - Upload */}
          <FormControl fullWidth sx={{ mb: 4 }}>
            <FormLabel sx={formLabelSx}>Certificat Médical (Image ou PDF) *</FormLabel>
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
                  py: 1.75,
                  fontWeight: 750,
                  fontSize: "1rem",
                  borderWidth: 2,
                  borderColor: "rgba(15, 23, 42, 0.2)",
                  color: "#0f172a",
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
            {formData.medicalCertificateFile && (
              <Button
                variant="text"
                startIcon={<VisibilityIcon />}
                onClick={() => openFilePreview("medical")}
                sx={{ mt: 1, textTransform: "none", fontWeight: 700, alignSelf: "flex-start" }}
              >
                Visualiser le document
              </Button>
            )}
            {errors.medicalCertificateFile && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, fontWeight: 700 }}>
                {errors.medicalCertificateFile}
              </Typography>
            )}
          </FormControl>

          {/* Charte européenne du sport */}
          <Box
            sx={{
              mb: 4,
              p: 3,
              borderRadius: 2,
              backgroundColor: "#eef2ff",
              border: "2px solid rgba(37, 99, 235, 0.25)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            <Typography sx={{ fontWeight: 900, fontSize: 17, mb: 1.25, color: "#0f172a" }}>
              Charte européenne du sport
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox
                checked={charterAccepted}
                onChange={handleCharterToggle}
                color="primary"
                sx={{ "& .MuiSvgIcon-root": { fontSize: 26 } }}
              />
              <Typography
                onClick={() => setCharterModalOpen(true)}
                sx={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  userSelect: "none",
                  fontWeight: 750,
                  fontSize: 16,
                  color: "#0f172a",
                  "&:hover": {
                    color: "#1d4ed8",
                  },
                }}
              >
                J&apos;accepte la charte européenne de l&apos;athlète.
              </Typography>
            </Box>
            {errors.charterAccepted && (
              <Typography variant="caption" color="error" sx={{ mt: 0.75, display: "block", fontWeight: 700 }}>
                {errors.charterAccepted}
              </Typography>
            )}
          </Box>

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
                fontWeight: 800,
                textTransform: "none",
                background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                color: "#fff",
                boxShadow: "0 8px 24px rgba(234, 88, 12, 0.35)",
                "&:hover": {
                  background: "linear-gradient(135deg, #d97706, #c2410c)",
                },
              }}
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </Box>
        </form>
      </Paper>
      </Box>

      {/* Modale pour afficher la charte complète */}
      <Dialog
        open={charterModalOpen}
        onClose={() => setCharterModalOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1.2}>
              <ArticleIcon color="primary" />
              <Typography fontSize={24} fontWeight={900}>
                Charte Européenne du Sport
              </Typography>
            </Box>
            <IconButton onClick={() => setCharterModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          <Box
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: 3,
              p: 3,
              maxHeight: "60vh",
              overflowY: "auto",
              backgroundColor: "#f8fafc",
            }}
          >
            <Typography fontWeight={900} mb={2} fontSize={18}>
              CHARTE EUROPÉENNE DU SPORT
            </Typography>

            <Typography variant="body2" paragraph>
              <strong>Article 1 – Objectif de la Charte</strong>
              <br />
              Les gouvernements, en vue de la promotion du sport en tant que facteur
              important du développement humain, prennent les mesures nécessaires
              pour donner effet aux dispositions de la présente Charte conformément
              aux principes énoncés dans le Code d&apos;éthique sportive.
            </Typography>

            <Typography variant="body2" paragraph>
              <strong>Article 2 – Définition et champ d&apos;application</strong>
              <br />
              On entend par « sport » toutes formes d&apos;activités physiques qui, à
              travers une participation organisée ou non, ont pour objectif
              l&apos;expression ou l&apos;amélioration de la condition physique et
              psychique, le développement des relations sociales ou l&apos;obtention
              de résultats en compétition.
            </Typography>

            <Typography variant="body2" paragraph>
              <strong>Article 3 – Le rôle des pouvoirs publics</strong>
              <br />
              Les pouvoirs publics encouragent la pratique du sport pour tous,
              garantissent l&apos;égalité d&apos;accès, luttent contre le dopage et assurent la
              protection de l&apos;intégrité morale et physique des sportifs.
            </Typography>

            <Typography variant="body2" paragraph>
              <strong>Article 4 – Éthique et fair-play</strong>
              <br />
              La pratique sportive repose sur le respect des règles, des
              adversaires, des officiels et de l&apos;esprit sportif. Toute forme de
              tricherie, de violence ou de discrimination est strictement
              proscrite.
            </Typography>

            <Typography variant="body2">
              <strong>Article 5 – Protection des données</strong>
              <br />
              Les participants reconnaissent que leurs données personnelles peuvent
              être utilisées dans le cadre de l&apos;organisation des compétitions,
              conformément aux réglementations en vigueur (RGPD).
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setCharterModalOpen(false)}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 4,
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      <UploadedFilePreviewModal
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewBlob(null);
          setPreviewError("");
          setPreviewTitle("");
          setPreviewFileName("");
        }}
        title={previewTitle || "Visualisation du document"}
        fileBlob={previewBlob}
        fileName={previewFileName}
        contentType={previewBlob?.type || ""}
        loading={previewLoading}
        error={previewError}
      />
    </Box>
  );
}
