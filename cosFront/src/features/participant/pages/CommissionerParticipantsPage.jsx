import { useState, useEffect, useMemo, useCallback } from "react";

import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";
import BadgeIcon from "@mui/icons-material/Badge";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CancelIcon from "@mui/icons-material/Cancel";

import appTheme from "../../../common/theme/appTheme";
import AdminPageLayout from "../../../common/components/AdminPageLayout";
import UploadedFilePreviewModal from "../../../common/components/UploadedFilePreviewModal";

import athleteService from "../services/athleteService";
import competitionService from "../../competition/services/competitionService";
import AthleteParticipationsModal from "../components/AthleteParticipationsModal";

const STATUS_LABELS = {
  PENDING: "En attente",
  PENDING_VALIDATION: "En attente de validation",
  INVITED: "Invité",
  CONFIRMED: "Confirmé",
  ACCEPTED: "Accepté",
  CANCELED: "Annulé",
  COMPLETED: "Terminé",
};

/** Filtre liste : tous | à valider | invité | confirmé */
const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "PENDING_VALIDATION", label: "À valider" },
  { value: "INVITED", label: "Invité" },
  { value: "CONFIRMED", label: "Confirmé" },
];

export default function CommissionerParticipantsPage() {
  const [athletes, setAthletes] = useState([]);
  const [competitions, setCompetitions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewBlob, setPreviewBlob] = useState(null);
  const [previewName, setPreviewName] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [refuseDialogOpen, setRefuseDialogOpen] = useState(false);
  const [refuseParticipationId, setRefuseParticipationId] = useState(null);
  const [rejectedDocument, setRejectedDocument] = useState("PASSPORT");
  const [refuseReason, setRefuseReason] = useState("");

  const fetchCompetitions = useCallback(async () => {
    try {
      const events = await competitionService.getEvents();

      const competitionsRequests = events.map((event) =>
        competitionService.getCompetitionsByEventForCommissioner(event.id)
      );

      const results = await Promise.all(competitionsRequests);
      setCompetitions(results.flat());
    } catch (err) {
      console.error("Erreur chargement compétitions:", err);
    }
  }, []);

  const normalizeStatus = (status) => {
    if (!status) return null;

    if (status === "ACCEPTED") return "ACCEPTED";
    if (status === "CONFIRMED") return "CONFIRMED";
    if (status === "INVITED") return "INVITED";
    if (status === "PENDING_VALIDATION") return "PENDING_VALIDATION";
    if (status === "PENDING") return "PENDING";
    if (status === "CANCELED") return "CANCELED";
    if (status === "COMPLETED") return "COMPLETED";

    return status;
  };

  const translateStatus = (status) => {
    const normalized = normalizeStatus(status);
    return STATUS_LABELS[normalized] || "Non défini";
  };

  const getStatusStyle = (status) => {
    const normalized = normalizeStatus(status);

    return {
      padding: "6px 14px",
      borderRadius: appTheme.radius.pill,
      fontSize: 13,
      fontWeight: 700,
      display: "inline-block",
      minWidth: 110,
      textAlign: "center",
      background:
        normalized === "CONFIRMED" || normalized === "ACCEPTED"
          ? "rgba(34,197,94,0.25)"
          : normalized === "INVITED"
            ? "rgba(250,204,21,0.25)"
            : normalized === "CANCELED"
              ? "rgba(239,68,68,0.25)"
              : normalized === "PENDING"
                ? "rgba(250,204,21,0.25)"
                : normalized === "PENDING_VALIDATION"
                  ? "rgba(59,130,246,0.18)"
                  : "rgba(148,163,184,0.25)",
      color: appTheme.colors.dark,
    };
  };

  const fetchAthletes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!selectedCompetition) {
        const data = await athleteService.getAllAthletes();
        const normalized = (data || []).map((a) => ({
          athlete: a,
          status: null,
          participationId: null,
        }));
        setAthletes(normalized);
        return;
      }

      const data = await athleteService.getAthletesByCompetition(selectedCompetition);

      const athletesFromCompetition = data || [];

      const hasDirectStatus = athletesFromCompetition.some((item) => item?.status);

      if (hasDirectStatus) {
        const mapped = athletesFromCompetition.map((item) => {
          const athleteData = item?.athlete ?? item;
          return {
            athlete: athleteData,
            status: item.status ?? null,
            participationId: item.participationId ?? item.participation?.id ?? null,
          };
        });
        setAthletes(mapped);
        return;
      }

      const enrichedAthletes = await Promise.all(
        athletesFromCompetition.map(async (item) => {
          const athleteData = item?.athlete ?? item;

          try {
            const participations = await athleteService.getAthleteParticipations(athleteData.id);

            const currentParticipation = (participations || []).find((p) => {
              const competitionId =
                p.competitionId ?? p.competition?.id ?? p.idCompetition ?? p.competitionID;

              return String(competitionId) === String(selectedCompetition);
            });

            return {
              athlete: athleteData,
              status: currentParticipation?.status || null,
              participationId:
                currentParticipation?.participationId ?? currentParticipation?.id ?? null,
            };
          } catch (err) {
            console.error(`Erreur récupération participations athlète ${athleteData.id}:`, err);

            return {
              athlete: athleteData,
              status: null,
              participationId: null,
            };
          }
        })
      );

      setAthletes(enrichedAthletes);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les athlètes");
    } finally {
      setLoading(false);
    }
  }, [selectedCompetition]);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  useEffect(() => {
    fetchAthletes();
  }, [fetchAthletes]);

  useEffect(() => {
    setStatusFilter("ALL");
  }, [selectedCompetition]);

  const filteredAthletes = useMemo(() => {
    let list = athletes;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter((item) => {
        const athleteData = item.athlete ?? item;

        return (
          athleteData.firstName?.toLowerCase().includes(term) ||
          athleteData.lastName?.toLowerCase().includes(term) ||
          athleteData.email?.toLowerCase().includes(term)
        );
      });
    }

    if (statusFilter !== "ALL") {
      list = list.filter((item) => {
        const s = normalizeStatus(item?.status);
        return s === statusFilter;
      });
    }

    return list;
  }, [athletes, searchTerm, statusFilter]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const openPreview = (blob, filename, title) => {
    setPreviewBlob(blob);
    setPreviewName(filename);
    setPreviewTitle(title);
    setPreviewError("");
    setPreviewOpen(true);
  };

  const handleOpenMedical = async (athleteId) => {
    setPreviewError("");
    try {
      setPreviewLoading(true);
      const blob = await athleteService.downloadMedicalCertificate(athleteId);
      openPreview(blob, `certificat-medical-${athleteId}.pdf`, "Certificat médical");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.status === 403
          ? "Accès refusé : votre accréditation commissaire doit être validée par l'administrateur."
          : "Impossible d'ouvrir le certificat médical.";
      setPreviewError(msg);
      setPreviewOpen(true);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleOpenPassport = async (athleteId) => {
    setPreviewError("");
    try {
      setPreviewLoading(true);
      const blob = await athleteService.downloadPassport(athleteId);
      openPreview(blob, `passeport-${athleteId}.pdf`, "Passeport / CNI");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.status === 403
          ? "Accès refusé : votre accréditation commissaire doit être validée par l'administrateur."
          : "Impossible d'ouvrir le passeport.";
      setPreviewError(msg);
      setPreviewOpen(true);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleValidateParticipation = async (participationId) => {
    if (!participationId) return;
    setActionLoadingId(participationId);
    try {
      await athleteService.validateParticipation(participationId);
      showSnackbar("Participation validée.", "success");
      await fetchAthletes();
    } catch (err) {
      console.error(err);
      showSnackbar("La validation a échoué. Réessayez.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenRefuseDialog = (participationId, athleteId) => {
    setRefuseParticipationId(participationId);
    setRefuseAthleteId(athleteId);
    setRejectedDocument("PASSPORT");
    setRefuseReason("");
    setRefuseDialogOpen(true);
  };

  const handleSubmitRefuse = async () => {
    if (!refuseParticipationId || !refuseReason.trim()) return;
    setActionLoadingId(refuseParticipationId);
    try {
      await athleteService.refuseParticipation(refuseParticipationId, {
        rejectedDocument,
        reason: refuseReason.trim(),
      });
      setRefuseDialogOpen(false);
      setRefuseParticipationId(null);
      showSnackbar("Participation refusée.", "success");
      await fetchAthletes();
    } catch (err) {
      console.error(err);
      showSnackbar("Le refus a échoué.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenModal = (athlete) => {
    setSelectedAthlete(athlete);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAthlete(null);
  };

  return (
    <AdminPageLayout backPath="/commissioner">
      <Typography sx={{ fontSize: 32, fontWeight: 900, mb: 3 }}>
        Gestion des athlètes
      </Typography>

      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel>Compétition</InputLabel>

          <Select
            value={selectedCompetition}
            label="Compétition"
            onChange={(e) => setSelectedCompetition(e.target.value)}
          >
            <MenuItem value="">Toutes les compétitions</MenuItem>

            {competitions.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Statut</InputLabel>
          <Select
            value={statusFilter}
            label="Statut"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Rechercher"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "gray" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: appTheme.radius.lg,
          overflow: "hidden",
          boxShadow: appTheme.shadows.card,
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ background: appTheme.gradients.card }}>
              <TableCell sx={{ fontWeight: 700, color: appTheme.colors.textPrimary }}>Nom</TableCell>
              <TableCell sx={{ fontWeight: 700, color: appTheme.colors.textPrimary }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700, color: appTheme.colors.textPrimary, textAlign: "center" }}>
                {selectedCompetition ? "Statut" : "—"}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: appTheme.colors.textPrimary }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography color="error">{error}</Typography>
                </TableCell>
              </TableRow>
            ) : filteredAthletes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  Aucun athlète trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredAthletes.map((item, index) => {
                const athleteData = item.athlete ?? item;
                const status = item?.status ?? null;
                const participationId = item?.participationId ?? null;
                const canReview =
                  !!selectedCompetition &&
                  participationId &&
                  normalizeStatus(status) === "PENDING_VALIDATION";

                return (
                  <TableRow key={athleteData.id ?? index} hover>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {athleteData.firstName} {athleteData.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>{athleteData.email}</TableCell>
                    <TableCell align="center">
                      {selectedCompetition ? (
                        <span style={getStatusStyle(status)}>{translateStatus(status)}</span>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }}>
                        <Tooltip title="Voir certificat médical">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenMedical(athleteData.id)}
                            sx={{ color: appTheme.colors.cyan }}
                          >
                            <DescriptionIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Voir passeport / CNI">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenPassport(athleteData.id)}
                            sx={{ color: "#8b5cf6" }}
                          >
                            <BadgeIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {selectedCompetition && (
                          <>
                            <Tooltip title={canReview ? "Valider la participation" : "Validation uniquement si statut « à valider »"}>
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={!canReview || actionLoadingId === participationId}
                                  onClick={() => handleValidateParticipation(participationId)}
                                  sx={{ color: canReview ? "#22c55e" : "#94a3b8" }}
                                >
                                  <TaskAltIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title={canReview ? "Refuser la participation" : "Refus uniquement si statut « à valider »"}>
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={!canReview || actionLoadingId === participationId}
                                  onClick={() => handleOpenRefuseDialog(participationId)}
                                  sx={{ color: canReview ? "#ef4444" : "#94a3b8" }}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Voir les participations">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenModal(athleteData)}
                            sx={{ color: "#a78bfa" }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AthleteParticipationsModal
        open={modalOpen}
        onClose={handleCloseModal}
        athlete={selectedAthlete}
      />

      <Dialog open={refuseDialogOpen} onClose={() => setRefuseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Refuser la participation</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel id="rejected-document-label-page">Document refusé</InputLabel>
            <Select
              labelId="rejected-document-label-page"
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
            value={refuseReason}
            onChange={(e) => setRefuseReason(e.target.value)}
            placeholder="Ex: Photo floue, merci d'envoyer un document lisible."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefuseDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSubmitRefuse}
            disabled={!refuseReason.trim() || actionLoadingId === refuseParticipationId}
          >
            Confirmer le refus
          </Button>
        </DialogActions>
      </Dialog>

      <UploadedFilePreviewModal
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewBlob(null);
          setPreviewError("");
          setPreviewName("");
          setPreviewTitle("");
        }}
        title={previewTitle || "Document"}
        fileBlob={previewBlob}
        fileName={previewName}
        contentType={previewBlob?.type || ""}
        loading={previewLoading}
        error={previewError}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminPageLayout>
  );
}
