import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../../common/contexts/AuthContext";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  IconButton,
  InputAdornment,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import spectatorProfileService from "../services/spectatorProfileService";
import appTheme from "../../../common/theme/appTheme";
import { getSpectatorDisplayFirstName } from "../../../common/utils/spectatorWelcomeName";
import { SPECTATOR_MENU_GLASS_DECOR } from "../swimmingVisuals";
import {
  spectatorGlassTint,
  textLegibleDark,
} from "../spectatorGlassTheme";
import UploadedFilePreviewModal from "../../../common/components/UploadedFilePreviewModal";

const TICKET_MAX_BYTES = 15 * 1024 * 1024;
const TICKET_ACCEPT = "application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp";

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

const profileGlassCardSx = {
  background: "linear-gradient(145deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.72) 100%)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "0 12px 36px rgba(2,6,23,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
};

function SpectatorProfileGlassShell({ children, scrollContentProps = {} }) {
  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        alignSelf: "stretch",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          flex: 1,
          width: "100%",
          minHeight: 0,
          position: "relative",
          borderRadius: 0,
          overflow: "hidden",
          border: "none",
          boxSizing: "border-box",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background: spectatorGlassTint,
            backdropFilter: "blur(26px) saturate(1.12)",
            WebkitBackdropFilter: "blur(26px) saturate(1.12)",
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${SPECTATOR_MENU_GLASS_DECOR})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.42,
            mixBlendMode: "soft-light",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            overflow: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            p: { xs: 2, sm: 2.5, md: 3.5 },
            boxSizing: "border-box",
            ...scrollContentProps,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default function SpectatorProfilePage() {
  const { user } = useAuth();
  const ticketInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [ticketStatusLoading, setTicketStatusLoading] = useState(true);
  const [hasTicket, setHasTicket] = useState(false);
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

  // Mot de passe
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

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
      setHasTicket(tickets.length > 0);
    } catch (e) {
      setHasTicket(false);
      setTicketRows([]);
      setTicketError(formatTicketError(e));
    } finally {
      setTicketStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTicketStatus();
  }, [refreshTicketStatus]);

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
    setError("");
  };

  const handleTicketFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > TICKET_MAX_BYTES) {
      setTicketError("Le fichier est trop volumineux (maximum 15 Mo).");
      return;
    }
    setTicketError("");
    setTicketSuccess("");
    setTicketUploading(true);
    try {
      await spectatorProfileService.uploadTicket(file);
      await refreshTicketStatus();
      setTicketSuccess("Billet enregistré. Vous pouvez le visualiser dans le tableau.");
    } catch (err) {
      setTicketError(formatTicketError(err));
    } finally {
      setTicketUploading(false);
    }
  };

  const handleViewTicket = async (row) => {
    setTicketError("");
    setTicketSuccess("");
    setPreviewError("");
    try {
      setPreviewLoading(true);
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
    if (!ticketToDelete) return;
    setTicketError("");
    setTicketSuccess("");
    setTicketDeleting(true);
    try {
      await spectatorProfileService.deleteTicketById(ticketToDelete.id);
      setDeleteTicketOpen(false);
      await refreshTicketStatus();
      setTicketToDelete(null);
      setTicketSuccess("Billet supprimé.");
    } catch (err) {
      setTicketError(formatTicketError(err));
    } finally {
      setTicketDeleting(false);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setSaving(true);
    try {
      await spectatorProfileService.changePassword(
        passwordData.oldPassword,
        passwordData.newPassword
      );
      setSuccess(true);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const d = err.response?.data;
      const msg =
        typeof d === "string" && d.trim()
          ? d
          : d && typeof d === "object" && d.message
            ? String(d.message)
            : "Une erreur est survenue lors du changement de mot de passe.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const welcomeFirst = getSpectatorDisplayFirstName(user);
  const spectatorWelcomeTitle = welcomeFirst
    ? `Bienvenue, ${welcomeFirst}`
    : "Bienvenue";

  return (
    <SpectatorProfileGlassShell>
      <Box
        sx={{
          mb: 4,
          pb: 3,
          borderBottom: "1px solid rgba(14, 116, 144, 0.2)",
          px: { xs: 0, sm: 0.5 },
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 900,
            mb: 0,
            letterSpacing: "-0.02em",
            fontSize: { xs: "1.65rem", sm: "2rem" },
            ...textLegibleDark,
          }}
        >
          {spectatorWelcomeTitle}
        </Typography>
        <Typography
          sx={{
            mt: 1.15,
            lineHeight: 1.55,
            fontSize: { xs: "0.9375rem", sm: "1rem" },
            fontWeight: 400,
            color: "#d1d5db",
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
          }}
        >
          Mon profil — mot de passe et billet
        </Typography>
      </Box>

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            maxWidth: 600,
            borderRadius: 2,
            background: "rgba(220, 252, 231, 0.96)",
            color: "#14532d",
            border: "1px solid rgba(34, 197, 94, 0.45)",
          }}
        >
          Modifications enregistrées avec succès !
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            maxWidth: 600,
            borderRadius: 2,
            background: "rgba(254, 226, 226, 0.95)",
            color: "#991b1b",
            border: "1px solid rgba(248, 113, 113, 0.45)",
          }}
        >
          {error}
        </Alert>
      )}

      <Card
        sx={{
          borderRadius: appTheme.radius.lg,
          maxWidth: 600,
          ...profileGlassCardSx,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 800,
              mb: 3,
              color: "#f8fafc",
              letterSpacing: "-0.02em",
              textShadow: "0 1px 2px rgba(0,0,0,0.35)",
            }}
          >
            Changer le mot de passe
          </Typography>

              <TextField
                fullWidth
                type={showPasswords.old ? "text" : "password"}
                label="Ancien mot de passe"
                value={passwordData.oldPassword}
                onChange={(e) => handlePasswordChange("oldPassword", e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPasswords((prev) => ({ ...prev, old: !prev.old }))
                        }
                        edge="end"
                        sx={{ color: "rgba(226,232,240,0.85)" }}
                      >
                        {showPasswords.old ? (
                          <VisibilityOffIcon sx={{ fontSize: 22 }} />
                        ) : (
                          <VisibilityIcon sx={{ fontSize: 22 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    color: appTheme.colors.textPrimary,
                    bgcolor: "rgba(2, 6, 23, 0.28)",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "rgba(2, 6, 23, 0.38)" },
                    "&.Mui-focused": { bgcolor: "rgba(2, 6, 23, 0.42)" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(148, 163, 184, 0.35)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(34, 211, 238, 0.45)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: appTheme.colors.cyan,
                      borderWidth: "1.5px",
                    },
                  },
                }}
                InputLabelProps={{
                  sx: { color: "rgba(203, 213, 225, 0.92)" },
                }}
              />

              <TextField
                fullWidth
                type={showPasswords.new ? "text" : "password"}
                label="Nouveau mot de passe"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                        }
                        edge="end"
                        sx={{ color: "rgba(226,232,240,0.85)" }}
                      >
                        {showPasswords.new ? (
                          <VisibilityOffIcon sx={{ fontSize: 22 }} />
                        ) : (
                          <VisibilityIcon sx={{ fontSize: 22 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    color: appTheme.colors.textPrimary,
                    bgcolor: "rgba(2, 6, 23, 0.28)",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "rgba(2, 6, 23, 0.38)" },
                    "&.Mui-focused": { bgcolor: "rgba(2, 6, 23, 0.42)" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(148, 163, 184, 0.35)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(34, 211, 238, 0.45)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: appTheme.colors.cyan,
                      borderWidth: "1.5px",
                    },
                  },
                }}
                InputLabelProps={{
                  sx: { color: "rgba(203, 213, 225, 0.92)" },
                }}
              />

              <TextField
                fullWidth
                type={showPasswords.confirm ? "text" : "password"}
                label="Confirmer le mot de passe"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            confirm: !prev.confirm,
                          }))
                        }
                        edge="end"
                        sx={{ color: "rgba(226,232,240,0.85)" }}
                      >
                        {showPasswords.confirm ? (
                          <VisibilityOffIcon sx={{ fontSize: 22 }} />
                        ) : (
                          <VisibilityIcon sx={{ fontSize: 22 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    color: appTheme.colors.textPrimary,
                    bgcolor: "rgba(2, 6, 23, 0.28)",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "rgba(2, 6, 23, 0.38)" },
                    "&.Mui-focused": { bgcolor: "rgba(2, 6, 23, 0.42)" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(148, 163, 184, 0.35)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(34, 211, 238, 0.45)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: appTheme.colors.cyan,
                      borderWidth: "1.5px",
                    },
                  },
                }}
                InputLabelProps={{
                  sx: { color: "rgba(203, 213, 225, 0.92)" },
                }}
              />

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleChangePassword}
            disabled={saving}
            sx={{
              background: appTheme.gradients.navbar,
              color: "#020617",
              fontWeight: 700,
              textTransform: "none",
              "&:hover": {
                background: appTheme.gradients.navbar,
                opacity: 0.9,
              },
            }}
          >
            {saving ? "Changement..." : "Changer le mot de passe"}
          </Button>
        </CardContent>
      </Card>

      <Card
        sx={{
          mt: 3,
          borderRadius: appTheme.radius.lg,
          maxWidth: 600,
          ...profileGlassCardSx,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <ConfirmationNumberIcon sx={{ color: appTheme.colors.cyan, fontSize: 28 }} />
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 800,
                color: "#f8fafc",
                letterSpacing: "-0.02em",
                textShadow: "0 1px 2px rgba(0,0,0,0.35)",
              }}
            >
              Mon billet
            </Typography>
          </Stack>
          <Typography
            sx={{
              color: "rgba(203,213,225,0.95)",
              fontSize: 14,
              mb: 2,
              lineHeight: 1.55,
            }}
          >
            Déposez un PDF ou une image de votre billet. Vous pourrez le visualiser ou le supprimer depuis
            cet écran.
          </Typography>

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

          {ticketStatusLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
              <CircularProgress size={28} sx={{ color: appTheme.colors.cyan }} />
              <Typography sx={{ color: appTheme.colors.textMuted }}>Vérification du billet…</Typography>
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
                  fontWeight: 800,
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
                  sx={{ borderRadius: 2, background: "rgba(2, 6, 23, 0.35)", border: "1px solid rgba(148,163,184,0.2)" }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: "#E2E8F0", fontWeight: 800 }}>Billet</TableCell>
                        <TableCell sx={{ color: "#E2E8F0", fontWeight: 800 }}>Date</TableCell>
                        <TableCell sx={{ color: "#E2E8F0", fontWeight: 800, width: 120 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ticketRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell sx={{ color: "#E2E8F0" }}>{row.filename}</TableCell>
                          <TableCell sx={{ color: "rgba(226,232,240,0.82)" }}>
                            {new Date(row.uploadedAt).toLocaleString("fr-FR")}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.4}>
                              <Tooltip title="Visualiser">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewTicket(row)}
                                  sx={{ color: "#67E8F9" }}
                                >
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
                                  sx={{ color: "#f87171" }}
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
        PaperProps={{
          sx: {
            borderRadius: appTheme.radius.lg,
            background: "linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.96) 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 24px 48px rgba(2,6,23,0.55)",
          },
        }}
      >
        <DialogTitle sx={{ color: "#f8fafc", fontWeight: 800 }}>Supprimer le billet ?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "rgba(226,232,240,0.88)", lineHeight: 1.55 }}>
            Ce billet sera retiré de la liste. S’il s’agit du billet actif, il sera aussi supprimé du compte.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteTicketOpen(false)}
            disabled={ticketDeleting}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              color: "#e2e8f0",
              border: "1px solid rgba(255,255,255,0.22)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
            }}
          >
            Annuler
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={ticketDeleting}
            onClick={handleConfirmDeleteTicket}
            sx={{ textTransform: "none", fontWeight: 800 }}
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
    </SpectatorProfileGlassShell>
  );
}
