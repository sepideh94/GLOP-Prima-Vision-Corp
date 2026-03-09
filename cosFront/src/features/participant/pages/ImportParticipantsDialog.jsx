import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import commissionerImportService from "../services/commissionerImportService";
import appTheme from "../../../common/theme/appTheme";

export default function ImportParticipantsDialog({ open, onClose, competitionId, competitionName }) {

  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState([]);
  const [importResult, setImportResult] = useState(null);

  const parseCsv = (selectedFile) => {
    const reader = new FileReader();

    reader.onload = () => {
      const lines = reader.result
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        setError("Le fichier CSV est vide ou invalide");
        setPreview([]);
        return;
      }

      const header = lines[0].replace(/\s/g, "");
      if (header !== "email,firstName,lastName") {
        setError("Format CSV invalide. L'en-tête doit être : email,firstName,lastName");
        setPreview([]);
        return;
      }

      const rows = lines.slice(1).map((line, index) => {
        const [email, firstName, lastName] = line.split(",");

        if (!email || !firstName || !lastName) {
          return {
            email: "—",
            firstName: "Ligne invalide",
            lastName: `#${index + 2}`,
            status: "Erreur",
          };
        }

        return {
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          status: "Invitation à envoyer",
        };
      });

      setError("");
      setPreview(rows);
    };

    reader.readAsText(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError("");
    setSuccess("");
    setImportResult(null);

    if (!selectedFile) {
      setError("Veuillez sélectionner un fichier CSV");
      return;
    }

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

    if (!competitionId) {
      setError("Aucune compétition sélectionnée");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await commissionerImportService.importAthletesForCompetition(file, competitionId);
      const result = response.data;

      setImportResult(result);

      setPreview((prev) =>
        prev.map((p) => ({
          ...p,
          status: "Invitation envoyée",
        }))
      );

      setSuccess(
        `Import terminé : ${result.invited} athlète(s) invité(s), ${result.skipped} ignoré(s)`
      );
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'import des athlètes");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setError("");
    setSuccess("");
    setImportResult(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      fullWidth
      sx={{
        "& .MuiDialog-container .MuiDialog-paper": {
          width: "90%",
          maxWidth: "900px",
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <GroupAddIcon sx={{ color: appTheme.colors.cyan }} />
        Importer les participants
        {competitionName && (
          <Typography component="span" sx={{ ml: 1, color: "text.secondary", fontWeight: 400 }}>
            - {competitionName}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>

        {/* 🔹 Nouveau texte professionnel */}
        <Typography sx={{ mb: 3, color: "text.secondary" }}>
          Veuillez importer un fichier CSV contenant les athlètes à inviter à cette compétition.
        </Typography>

        {/* 🔹 Bloc centré comme celui des volontaires */}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            component="label"
            sx={{
              border: "2px dashed #94a3b8",
              borderRadius: 3,
              p: 4,
              textAlign: "center",
              cursor: "pointer",
              width: "70%",
              "&:hover": { backgroundColor: "rgba(148,163,184,0.1)" },
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
            <Typography sx={{ mb: 1 }} fontWeight={800}>
              Aperçu des athlètes ({preview.length})
            </Typography>

            <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
              <table className="table table-sm table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((p, index) => (
                    <tr key={index}>
                      <td>{p.firstName} {p.lastName}</td>
                      <td>{p.email}</td>
                      <td>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: appTheme.radius.pill,
                            fontSize: 12,
                            fontWeight: 700,
                            background:
                              p.status === "Invitation envoyée"
                                ? "rgba(34,197,94,0.25)"
                                : "rgba(250,204,21,0.25)",
                          }}
                        >
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
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1.1,
            borderRadius: appTheme.radius.pill,
            background: "linear-gradient(135deg, #86efac, #4ade80)",
            color: "#064e3b",
          }}
        >
          Fermer
        </Button>

        <Button
          onClick={handleSendInvitations}
          disabled={loading || preview.length === 0 || !competitionId}
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
          {loading ? (
            <>
              <CircularProgress size={18} sx={{ mr: 1 }} />
              Envoi...
            </>
          ) : (
            "Envoyer les invitations"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
