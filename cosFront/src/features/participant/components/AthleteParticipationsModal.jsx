import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import athleteService from "../services/athleteService";
import appTheme from "../../../common/theme/appTheme";

const getStatusChip = (status) => {
  switch (status) {
    case "CONFIRMED":
      return <Chip label="Confirmé" color="success" size="small" />;
    case "INVITED":
      return <Chip label="Invité" color="warning" size="small" />;
    case "PENDING":
      return <Chip label="En attente" color="info" size="small" />;
    case "PENDING_VALIDATION":
      return <Chip label="En attente de validation" color="warning" size="small" />;
    case "CANCELLED":
      return <Chip label="Annulé" color="error" size="small" />;
    default:
      return <Chip label={status || "Inconnu"} size="small" />;
  }
};

export default function AthleteParticipationsModal({ open, onClose, athlete }) {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [refuseDialogOpen, setRefuseDialogOpen] = useState(false);
  const [selectedParticipationId, setSelectedParticipationId] = useState(null);
  const [rejectedDocument, setRejectedDocument] = useState("PASSPORT");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open && athlete) {
      fetchParticipations();
    }
  }, [open, athlete]);

  const fetchParticipations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await athleteService.getAthleteParticipations(athlete.id);
      setParticipations(data);
    } catch (err) {
      console.error("Erreur lors du chargement des participations:", err);
      setError("Impossible de charger les participations");
    } finally {
      setLoading(false);
    }
  };

  const openBlob = (blob, filename) => {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const handleOpenMedicalCertificate = async () => {
    if (!athlete?.id) return;
    setActionError(null);
    try {
      const blob = await athleteService.downloadMedicalCertificate(athlete.id);
      openBlob(blob, `certificat-medical-${athlete.id}.pdf`);
    } catch (err) {
      console.error("Erreur téléchargement certificat médical:", err);
      if (err.response?.status === 403) {
        setActionError(
          "Accès refusé : votre accréditation commissaire doit être validée par l'administrateur."
        );
      } else {
        setActionError("Impossible d'ouvrir le certificat médical.");
      }
    }
  };

  const handleOpenPassport = async () => {
    if (!athlete?.id) return;
    setActionError(null);
    try {
      const blob = await athleteService.downloadPassport(athlete.id);
      openBlob(blob, `passeport-${athlete.id}.pdf`);
    } catch (err) {
      console.error("Erreur téléchargement passeport:", err);
      if (err.response?.status === 403) {
        setActionError(
          "Accès refusé : votre accréditation commissaire doit être validée par l'administrateur."
        );
      } else {
        setActionError("Impossible d'ouvrir le passeport.");
      }
    }
  };

  const handleValidateParticipation = async (participationId) => {
    setActionLoadingId(participationId);
    setActionError(null);
    try {
      await athleteService.validateParticipation(participationId);
      await fetchParticipations();
    } catch (err) {
      console.error("Erreur validation participation:", err);
      setActionError("La validation a échoué. Réessaie dans quelques instants.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenRefuseDialog = (participationId) => {
    setSelectedParticipationId(participationId);
    setRejectedDocument("PASSPORT");
    setReason("");
    setActionError(null);
    setRefuseDialogOpen(true);
  };

  const handleSubmitRefuse = async () => {
    if (!selectedParticipationId || !reason.trim()) return;
    setActionLoadingId(selectedParticipationId);
    setActionError(null);
    try {
      await athleteService.refuseParticipation(selectedParticipationId, {
        rejectedDocument,
        reason: reason.trim(),
      });
      setRefuseDialogOpen(false);
      setSelectedParticipationId(null);
      await fetchParticipations();
    } catch (err) {
      console.error("Erreur refus participation:", err);
      setActionError("Le refus a échoué. Vérifie le motif puis réessaie.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Participations de {athlete?.firstName} {athlete?.lastName}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 1, mb: 2 }}>
          <Button variant="outlined" onClick={handleOpenMedicalCertificate}>
            Voir certificat médical
          </Button>
          <Button variant="outlined" onClick={handleOpenPassport}>
            Voir passeport / CNI
          </Button>
        </Box>

        {actionError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {actionError}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ p: 2 }}>
            {error}
          </Typography>
        ) : participations.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
            Aucune participation trouvée pour cet athlète.
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Compétition</strong></TableCell>
                  <TableCell><strong>Statut</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participations.map((p) => {
                  const canReview = p.status === "PENDING_VALIDATION";
                  return (
                    <TableRow key={p.participationId}>
                      <TableCell>{p.competitionName}</TableCell>
                      <TableCell>{getStatusChip(p.status)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            disabled={
                              !canReview || actionLoadingId === p.participationId
                            }
                            onClick={() => handleValidateParticipation(p.participationId)}
                          >
                            {actionLoadingId === p.participationId ? "..." : "Valider"}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={
                              !canReview || actionLoadingId === p.participationId
                            }
                            onClick={() => handleOpenRefuseDialog(p.participationId)}
                          >
                            Refuser
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1,
            borderRadius: appTheme.radius.pill,
            background: "linear-gradient(135deg, #86efac, #4ade80)",
            color: "#064e3b",
            boxShadow: "0 4px 12px rgba(74,222,128,0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #4ade80, #22c55e)",
            },
          }}
        >
          Fermer
        </Button>
      </DialogActions>

      <Dialog
        open={refuseDialogOpen}
        onClose={() => setRefuseDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Refuser la participation</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel id="rejected-document-label">Document refusé</InputLabel>
            <Select
              labelId="rejected-document-label"
              value={rejectedDocument}
              label="Document refusé"
              onChange={(e) => setRejectedDocument(e.target.value)}
            >
              <MenuItem value="PASSPORT">Passeport / CNI</MenuItem>
              <MenuItem value="MEDICAL_CERTIFICATE">Certificat médical</MenuItem>
              <MenuItem value="BOTH">Les deux</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Motif"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: Photo floue, merci d'envoyer un document lisible."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefuseDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSubmitRefuse}
            disabled={!reason.trim() || actionLoadingId === selectedParticipationId}
          >
            Confirmer le refus
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
