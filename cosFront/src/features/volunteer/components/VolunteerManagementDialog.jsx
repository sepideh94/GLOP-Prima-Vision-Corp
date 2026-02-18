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

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const parseCsv = (selectedFile) => {
    const reader = new FileReader();

    reader.onload = () => {
      const lines = reader.result
        .split("\n")
        .map((l) => l.replace(/\r/g, "").trim()) 
        .filter(Boolean);

      if (lines.length < 2) {
        setError("Le fichier CSV est vide ou invalide");
        return;
      }

      const header = lines[0].replace(/\s/g, "");
      if (header !== "email;firstName;lastName") {
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError("");
    setSuccess("");

    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setError("Seuls les fichiers CSV sont acceptés");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
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

    if (!form.firstName || !form.lastName || !form.email) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    try {
      await volunteerService.createVolunteer(competitionId, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
      }); 

      setSuccess("Invitation envoyée au volontaire !");
      setForm({ firstName: "", lastName: "", email: "" });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la création du volontaire"
      );
    }
  };

  const handleClose = () => {
    setTab(0);
    setForm({ firstName: "", lastName: "", email: "" });
    setFile(null);
    setPreview([]);
    setError("");
    setSuccess("");
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

      <Tabs value={tab} onChange={(e, v) => setTab(v)} centered>
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
                  "&:hover": {
                    backgroundColor: "rgba(148,163,184,0.1)",
                  },
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
                      {preview.map((p, i) => (
                        <tr key={i}>
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Nom"
              value={form.lastName}
              onChange={(e) =>
                setForm({ ...form, lastName: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Prénom"
              value={form.firstName}
              onChange={(e) =>
                setForm({ ...form, firstName: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              fullWidth
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
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
              background: "linear-gradient(135deg, #facc15, #22c55e)",
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
