import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  IconButton,
  Stack,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import { useNavigate } from "react-router-dom";
import { useNotificationUnread } from "../../../common/contexts/NotificationUnreadContext";
import spectatorProfileService from "../services/spectatorProfileService";
import UploadedFilePreviewModal from "../../../common/components/UploadedFilePreviewModal";
import SpectatorSocialShell from "../components/SpectatorSocialShell";

const pageInk = "#0f2744";
const pageMuted = "#475569";
const pageBorder = "rgba(15, 39, 68, 0.1)";

const TICKET_MAX_BYTES = 15 * 1024 * 1024;
const TICKET_ACCEPT =
  "application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp";

function formatTicketError(err) {
  const status = err.response?.status;
  const data = err.response?.data;
  if (status === 404 && typeof data === "string" && data.includes("billet")) {
    return "Aucun billet n’est enregistré pour ce compte.";
  }
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object" && data.message) return String(data.message);
  if (err.message) return err.message;
  return "Une erreur est survenue. Réessayez.";
}

export default function SpectatorTicketsPage() {
  const navigate = useNavigate();
  const { unreadCount } = useNotificationUnread();
  const ticketInputRef = useRef(null);

  const [ticketStatusLoading, setTicketStatusLoading] = useState(true);
  const [ticketRows, setTicketRows] = useState([]);
  const [ticketUploading, setTicketUploading] = useState(false);
  const [ticketDeleting, setTicketDeleting] = useState(false);
  const [ticketError, setTicketError] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState("");

  const [deleteTicketOpen, setDeleteTicketOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewBlob, setPreviewBlob] = useState(null);
  const [previewName, setPreviewName] = useState("");

  const refreshTicketStatus = useCallback(async () => {
    setTicketStatusLoading(true);
    setTicketError("");
    try {
      const tickets = await spectatorProfileService.listTickets();
      setTicketRows(
        tickets.map((t) => ({
          id: t.id,
          filename: t.fileName || `billet-${t.id}`,
          uploadedAt: t.uploadedAt || new Date().toISOString(),
          active: !!t.active,
        }))
      );
    } catch (e) {
      setTicketRows([]);
      setTicketError(formatTicketError(e));
    } finally {
      setTicketStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTicketStatus();
  }, [refreshTicketStatus]);

  const handleTicketFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setTicketSuccess("");
    setTicketError("");

    if (file.size > TICKET_MAX_BYTES) {
      setTicketError("Fichier trop volumineux (max 15 Mo).");
      return;
    }

    setTicketUploading(true);
    try {
      await spectatorProfileService.uploadTicket(file);
      setTicketSuccess("Billet importé.");
      await refreshTicketStatus();
    } catch (err) {
      setTicketError(formatTicketError(err));
    } finally {
      setTicketUploading(false);
    }
  };

  const handleViewTicket = async (row) => {
    setPreviewLoading(true);
    setPreviewError("");
    try {
      const { blob, filename } = await spectatorProfileService.getTicketBlobById(row?.id);
      setPreviewBlob(blob);
      setPreviewName(filename || row?.filename || "billet");
      setPreviewOpen(true);
    } catch (err) {
      setPreviewError(formatTicketError(err));
      setPreviewOpen(true);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleConfirmDeleteTicket = async () => {
    if (!ticketToDelete?.id) return;
    setTicketDeleting(true);
    setTicketError("");
    setTicketSuccess("");
    try {
      await spectatorProfileService.deleteTicketById(ticketToDelete.id);
      setTicketSuccess("Billet supprimé.");
      setDeleteTicketOpen(false);
      setTicketToDelete(null);
      await refreshTicketStatus();
    } catch (err) {
      setTicketError(formatTicketError(err));
    } finally {
      setTicketDeleting(false);
    }
  };

  return (
    <SpectatorSocialShell
      activeKey="tickets"
      unreadCount={unreadCount}
      leftTitle="Espace fan"
      hideRight
      onNavigate={(key) => {
        if (key === "home") navigate("/spectator");
        if (key === "followed") navigate("/spectator?view=followed");
        if (key === "followed_results") navigate("/spectator?view=followed_results");
        if (key === "map") navigate("/spectator/map");
        if (key === "notifications") navigate("/spectator/notifications");
        if (key === "profile") navigate("/spectator/profile");
        if (key === "tickets") navigate("/spectator/tickets");
      }}
      center={<Box sx={{ minWidth: 0 }}>
      <Box
        sx={{
          mb: 3,
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          border: `1px solid ${pageBorder}`,
          bgcolor: "rgba(255,255,255,0.97)",
          boxShadow: "0 8px 28px rgba(15, 39, 68, 0.06)",
        }}
      >
        <Typography
          component="h1"
          sx={{
            fontWeight: 900,
            fontSize: { xs: "1.4rem", sm: "1.75rem" },
            color: pageInk,
            letterSpacing: "-0.02em",
          }}
        >
          <ConfirmationNumberIcon sx={{ fontSize: 28, mr: 1, color: "#0891b2", verticalAlign: "text-bottom" }} />
          Billets
        </Typography>
        <Typography sx={{ mt: 1, color: pageMuted, fontWeight: 600 }}>
          Importez, visualisez ou supprimez votre billet.
        </Typography>
      </Box>

      <input
        ref={ticketInputRef}
        type="file"
        accept={TICKET_ACCEPT}
        style={{ display: "none" }}
        onChange={handleTicketFileSelected}
      />

      {ticketSuccess && (
        <Alert
          severity="success"
          sx={{
            mb: 2,
            borderRadius: 2,
            background: "rgba(220, 252, 231, 0.96)",
            color: "#14532d",
            border: "1px solid rgba(34, 197, 94, 0.45)",
          }}
          onClose={() => setTicketSuccess("")}
        >
          {ticketSuccess}
        </Alert>
      )}
      {ticketError && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2,
            background: "rgba(254, 226, 226, 0.95)",
            color: "#991b1b",
            border: "1px solid rgba(248, 113, 113, 0.45)",
          }}
          onClose={() => setTicketError("")}
        >
          {ticketError}
        </Alert>
      )}

      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          bgcolor: "rgba(255,255,255,0.97)",
          border: `1px solid ${pageBorder}`,
          boxShadow: "0 8px 28px rgba(15, 39, 68, 0.06)",
          maxWidth: 720,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <ConfirmationNumberIcon sx={{ color: "#0891b2", fontSize: 28 }} />
            <Typography sx={{ fontWeight: 900, color: pageInk, letterSpacing: "-0.02em" }}>
              Mon billet
            </Typography>
          </Stack>

          {ticketStatusLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
              <CircularProgress size={28} sx={{ color: "#0891b2" }} />
              <Typography sx={{ color: pageMuted, fontWeight: 600 }}>Vérification du billet…</Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              <Button
                variant="contained"
                startIcon={ticketUploading ? <CircularProgress size={18} color="inherit" /> : <UploadFileIcon />}
                disabled={ticketUploading || ticketDeleting}
                onClick={() => ticketInputRef.current?.click()}
                sx={{
                  background: "linear-gradient(135deg, #22D3EE, #06B6D4)",
                  color: "#0f172a",
                  fontWeight: 900,
                  textTransform: "none",
                  "&:hover": { background: "linear-gradient(135deg, #06B6D4, #0891B2)" },
                }}
              >
                Importer un billet
              </Button>

              {ticketRows.length > 0 && (
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    background: "#f8fafc",
                    border: `1px solid ${pageBorder}`,
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: pageInk, fontWeight: 900 }}>Billet</TableCell>
                        <TableCell sx={{ color: pageInk, fontWeight: 900 }}>Date</TableCell>
                        <TableCell sx={{ color: pageInk, fontWeight: 900, width: 120 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ticketRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell sx={{ color: pageInk, fontWeight: 700 }}>{row.filename}</TableCell>
                          <TableCell sx={{ color: pageMuted, fontWeight: 500 }}>
                            {new Date(row.uploadedAt).toLocaleString("fr-FR")}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.4}>
                              <Tooltip title="Visualiser">
                                <IconButton size="small" onClick={() => handleViewTicket(row)} sx={{ color: "#0891b2" }}>
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setTicketToDelete(row);
                                    setDeleteTicketOpen(true);
                                  }}
                                  disabled={ticketDeleting}
                                  sx={{ color: "#dc2626" }}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={deleteTicketOpen}
        onClose={() => !ticketDeleting && setDeleteTicketOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              background: "#fff",
              border: `1px solid ${pageBorder}`,
              boxShadow: "0 24px 48px rgba(15,39,68,0.12)",
            },
          },
        }}
      >
        <DialogTitle sx={{ color: pageInk, fontWeight: 900 }}>Supprimer le billet ?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: pageMuted, lineHeight: 1.55, fontWeight: 500 }}>
            Ce billet sera retiré de la liste. S’il s’agit du billet actif, il sera aussi supprimé du compte.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteTicketOpen(false)}
            disabled={ticketDeleting}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              color: pageInk,
              border: `1px solid ${pageBorder}`,
              "&:hover": { bgcolor: "rgba(15,39,68,0.04)" },
            }}
          >
            Annuler
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={ticketDeleting}
            onClick={handleConfirmDeleteTicket}
            sx={{ textTransform: "none", fontWeight: 900 }}
          >
            {ticketDeleting ? "Suppression…" : "Supprimer"}
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
        }}
        title="Billet"
        fileBlob={previewBlob}
        fileName={previewName}
        contentType={previewBlob?.type || ""}
        loading={previewLoading}
        error={previewError}
      />
    </Box>}
    />
  );
}

