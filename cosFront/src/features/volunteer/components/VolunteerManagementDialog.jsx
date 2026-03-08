import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Button,
  Typography,
  TextField,
  Alert,
  Divider,
  CircularProgress,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import appTheme from "../../../common/theme/appTheme";
import volunteerService from "../services/volunteerService";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const CSV_HEADER = "email;firstName;lastName";

/* SAFE EMAIL VALIDATION (SonarQube safe) */
const isValidEmail = (email) => {
  if (!email) return false;

  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const [local, domain] = parts;

  if (!local || !domain) return false;
  if (!domain.includes(".")) return false;

  return true;
};

export default function VolunteerManagementDialog({
  open,
  onClose,
  competitionId,
  competitionName,
}) {
  const [tab, setTab] = useState(0);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetState = () => {
    setTab(0);
    setForm({ firstName: "", lastName: "", email: "" });
    setFormErrors({});
    setFile(null);
    setPreview([]);
    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    const errors = {};

    if (!form.lastName.trim()) {
      errors.lastName = "Le nom est obligatoire";
    }

    if (!form.firstName.trim()) {
      errors.firstName = "Le prénom est obligatoire";
    }

    if (!form.email.trim()) {
      errors.email = "L'email est obligatoire";
    } else if (!isValidEmail(form.email)) {
      errors.email = "Format d'email invalide";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const parseCsv = (selectedFile) => {
    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result;

      if (!content) {
        setError("Fichier CSV invalide");
        return;
      }

      const lines = content
        .split("\n")
        .map((line) => line.replace(/\r/g, "").trim())
        .filter(Boolean);

      if (lines.length < 2) {
        setError("Le fichier CSV est vide ou invalide");
        return;
      }

      const header = lines[0].replace(/\s/g, "");

      if (header !== CSV_HEADER) {
        setError(
          "Format CSV invalide. L'en-tête doit être : email;firstName;lastName"
        );
        return;
      }

      const rows = lines.slice(1).map((line) => {
        const [email, firstName, lastName] = line.split(";");

        return {
          email: email?.trim(),
          firstName: firstName?.trim(),
          lastName: lastName?.trim(),
          status: "Invitation à envoyer",
        };
      });

      setPreview(rows);
      setError("");
    };

    reader.readAsText(selectedFile);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setError("");
    setSuccess("");

    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setError("Seuls les fichiers CSV sont acceptés");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Le fichier est trop volumineux (maximum 5 MB)");
      return;
    }

    setFile(selectedFile);
    parseCsv(selectedFile);
  };

  const handleSendInvitations = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await volunteerService.importVolunteers(competitionId, file);

      setPreview((prev) =>
        prev.map((p) => ({
          ...p,
          status: "Invitation envoyée",
        }))
      );

      setSuccess("Invitations envoyées avec succès !");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de l'import des volontaires"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    try {
      await volunteerService.createVolunteer(competitionId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
      });

      setSuccess("Invitation envoyée au volontaire !");
      setForm({ firstName: "", lastName: "", email: "" });
      setFormErrors({});
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la création du volontaire"
      );
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const getStatusStyle = (status) => ({
    padding: "4px 12px",
    borderRadius: appTheme.radius.pill,
    fontSize: 12,
    fontWeight: 700,
    background:
      status === "Invitation envoyée"
        ? "rgba(34,197,94,0.25)"
        : "rgba(250,204,21,0.25)",
    color: appTheme.colors.dark,
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">

      <DialogTitle sx={{ fontWeight: 900 }}>
        Gestion des volontaires
        {competitionName && (
          <Typography component="span" sx={{ ml: 1, color: "text.secondary" }}>
            - {competitionName}
          </Typography>
        )}
      </DialogTitle>

      <Tabs value={tab} onChange={(e, value) => setTab(value)} centered>
        <Tab icon={<UploadFileIcon />} label="Importer" iconPosition="start" />
        <Tab
          icon={<VolunteerActivismIcon />}
          label="Créer un volontaire"
          iconPosition="start"
        />
      </Tabs>

      <DialogContent dividers>

        {tab === 0 && (
          <>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Box
                component="label"
                sx={{
                  border: "2px dashed #94a3b8",
                  borderRadius: 3,
                  p: 4,
                  textAlign: "center",
                  cursor: "pointer",
                  width: "70%",
                }}
              >
                <UploadFileIcon sx={{ fontSize: 50, mb: 1 }} />

                <Typography fontWeight={800}>
                  {file ? file.name : "Cliquez pour sélectionner un fichier CSV"}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Taille maximale : 5 MB
                </Typography>

                <input hidden type="file" accept=".csv" onChange={handleFileChange} />
              </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            {success && (
              <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}

            {preview.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />

                <Typography fontWeight={800} mb={2}>
                  Aperçu des volontaires ({preview.length})
                </Typography>

                <Box sx={{ maxHeight: 250, overflowY: "auto" }}>
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Statut</th>
                      </tr>
                    </thead>

                    <tbody>
                      {preview.map((p, index) => (
                        <tr key={`${p.email}-${index}`}>
                          <td>{p.firstName} {p.lastName}</td>
                          <td>{p.email}</td>
                          <td>
                            <span style={getStatusStyle(p.status)}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>
                </Box>
              </>
            )}
          </>
        )}

        {tab === 1 && (
          <>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {success && (
              <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Nom"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
                fullWidth
              />

              <TextField
                label="Prénom"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
                fullWidth
              />

              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={!!formErrors.email}
                helperText={formErrors.email}
                fullWidth
              />
            </Box>
          </>
        )}

      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 0.5 }}>

        <Button
          onClick={handleClose}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            borderRadius: appTheme.radius.pill,
            background: "linear-gradient(135deg, #86efac, #4ade80)",
            color: "#064e3b",
          }}
        >
          Fermer
        </Button>

        {tab === 0 && (
          <Button
            onClick={handleSendInvitations}
            disabled={loading || preview.length === 0}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              borderRadius: appTheme.radius.pill,
              background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
              color: appTheme.colors.dark,
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={18} sx={{ mr: 1 }} />
                Envoi...
              </>
            ) : (
              "Envoyer les invitations"
            )}
          </Button>
        )}

        {tab === 1 && (
          <Button
            onClick={handleCreate}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              borderRadius: appTheme.radius.pill,
              background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
              color: appTheme.colors.dark,
            }}
          >
            Créer le volontaire
          </Button>
        )}

      </DialogActions>

    </Dialog>
  );
}