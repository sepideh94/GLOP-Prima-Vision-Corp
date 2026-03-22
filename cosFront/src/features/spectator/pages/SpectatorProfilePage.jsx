import { useCallback, useEffect, useRef, useState } from "react";
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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import spectatorProfileService from "../services/spectatorProfileService";
import appTheme from "../../../common/theme/appTheme";

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

export default function SpectatorProfilePage() {
  const ticketInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [ticketStatusLoading, setTicketStatusLoading] = useState(true);
  const [hasTicket, setHasTicket] = useState(false);
  const [ticketUploading, setTicketUploading] = useState(false);
  const [ticketDownloading, setTicketDownloading] = useState(false);
  const [ticketDeleting, setTicketDeleting] = useState(false);
  const [ticketError, setTicketError] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState("");
  const [deleteTicketOpen, setDeleteTicketOpen] = useState(false);

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
      const exists = await spectatorProfileService.hasStoredTicket();
      setHasTicket(exists);
    } catch (e) {
      setHasTicket(false);
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
      setHasTicket(true);
      setTicketSuccess("Billet enregistré. Vous pouvez le télécharger à tout moment.");
    } catch (err) {
      setTicketError(formatTicketError(err));
    } finally {
      setTicketUploading(false);
    }
  };

  const handleDownloadTicket = async () => {
    setTicketError("");
    setTicketSuccess("");
    setTicketDownloading(true);
    try {
      await spectatorProfileService.downloadTicketToDevice();
    } catch (err) {
      setTicketError(formatTicketError(err));
      setHasTicket(false);
    } finally {
      setTicketDownloading(false);
    }
  };

  const handleConfirmDeleteTicket = async () => {
    setTicketError("");
    setTicketSuccess("");
    setTicketDeleting(true);
    try {
      await spectatorProfileService.deleteTicket();
      setDeleteTicketOpen(false);
      setHasTicket(false);
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
      setError(
        err.response?.data || "Une erreur est survenue lors du changement de mot de passe."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        maxWidth: "100%",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        px: { xs: 1.5, sm: 2, md: 3 },
        py: { xs: 2, sm: 2.5, md: 3 },
        boxSizing: "border-box",
      }}
    >
    <Box
      sx={{
        flex: 1,
        width: "100%",
        p: { xs: 2, sm: 2.5, md: 4 },
        background: "rgba(15, 23, 42, 0.42)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderRadius: { xs: 2, md: 3 },
        boxShadow: "0 8px 32px rgba(2, 6, 23, 0.35)",
        border: "1px solid rgba(255, 255, 255, 0.14)",
        boxSizing: "border-box",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          mb: 1,
          color: "#f8fafc",
        }}
      >
        Mon Profil
      </Typography>
      <Typography
        sx={{
          color: "rgba(226, 232, 240, 0.88)",
          fontSize: "1.1rem",
          mb: 4,
        }}
      >
        Gérez vos informations personnelles et préférences
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Modifications enregistrées avec succès !
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Bloc changement de mot de passe uniquement */}
      <Card
        sx={{
          background: appTheme.gradients.card,
          borderRadius: appTheme.radius.lg,
          boxShadow: appTheme.shadows.card,
          maxWidth: 600,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: appTheme.colors.textPrimary,
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
                      >
                        {showPasswords.old ? (
                          <VisibilityOffIcon sx={{ color: appTheme.colors.textMuted }} />
                        ) : (
                          <VisibilityIcon sx={{ color: appTheme.colors.textMuted }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    color: appTheme.colors.textPrimary,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(148, 163, 184, 0.3)",
                    },
                  },
                }}
                InputLabelProps={{
                  sx: { color: appTheme.colors.textSecondary },
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
                      >
                        {showPasswords.new ? (
                          <VisibilityOffIcon sx={{ color: appTheme.colors.textMuted }} />
                        ) : (
                          <VisibilityIcon sx={{ color: appTheme.colors.textMuted }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    color: appTheme.colors.textPrimary,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(148, 163, 184, 0.3)",
                    },
                  },
                }}
                InputLabelProps={{
                  sx: { color: appTheme.colors.textSecondary },
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
                      >
                        {showPasswords.confirm ? (
                          <VisibilityOffIcon sx={{ color: appTheme.colors.textMuted }} />
                        ) : (
                          <VisibilityIcon sx={{ color: appTheme.colors.textMuted }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    color: appTheme.colors.textPrimary,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(148, 163, 184, 0.3)",
                    },
                  },
                }}
                InputLabelProps={{
                  sx: { color: appTheme.colors.textSecondary },
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
          background: appTheme.gradients.card,
          borderRadius: appTheme.radius.lg,
          boxShadow: appTheme.shadows.card,
          maxWidth: 600,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <ConfirmationNumberIcon sx={{ color: appTheme.colors.cyan, fontSize: 28 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: appTheme.colors.textPrimary,
              }}
            >
              Mon billet
            </Typography>
          </Stack>
          <Typography
            sx={{
              color: appTheme.colors.textSecondary,
              fontSize: 14,
              mb: 2,
              lineHeight: 1.5,
            }}
          >
            Déposez un PDF ou une image de votre billet (remplace le précédent s’il existe). Vous pourrez le
            télécharger ou le supprimer depuis cet écran.
          </Typography>

          <input
            ref={ticketInputRef}
            type="file"
            accept={TICKET_ACCEPT}
            style={{ display: "none" }}
            onChange={handleTicketFileSelected}
          />

          {ticketSuccess && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setTicketSuccess("")}>
              {ticketSuccess}
            </Alert>
          )}
          {ticketError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setTicketError("")}>
              {ticketError}
            </Alert>
          )}

          {ticketStatusLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
              <CircularProgress size={28} sx={{ color: appTheme.colors.cyan }} />
              <Typography sx={{ color: appTheme.colors.textMuted }}>Vérification du billet…</Typography>
            </Box>
          ) : (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} flexWrap="wrap">
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
                {hasTicket ? "Remplacer le billet" : "Importer un billet"}
              </Button>

              {hasTicket && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={
                      ticketDownloading ? <CircularProgress size={18} sx={{ color: appTheme.colors.cyan }} /> : <DownloadIcon />
                    }
                    disabled={ticketDownloading || ticketUploading || ticketDeleting}
                    onClick={handleDownloadTicket}
                    sx={{
                      borderColor: "rgba(34,211,238,0.55)",
                      color: "#a5f3fc",
                      fontWeight: 700,
                      textTransform: "none",
                      "&:hover": {
                        borderColor: appTheme.colors.cyan,
                        background: "rgba(34,211,238,0.08)",
                      },
                    }}
                  >
                    Télécharger
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    disabled={ticketDeleting || ticketUploading || ticketDownloading}
                    onClick={() => setDeleteTicketOpen(true)}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    Supprimer
                  </Button>
                </>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteTicketOpen} onClose={() => !ticketDeleting && setDeleteTicketOpen(false)}>
        <DialogTitle sx={{ color: appTheme.colors.dark }}>Supprimer le billet ?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: appTheme.colors.darkSoft }}>
            Le fichier sera retiré de votre compte. Vous pourrez en importer un autre ensuite.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTicketOpen(false)} disabled={ticketDeleting} sx={{ textTransform: "none" }}>
            Annuler
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={ticketDeleting}
            onClick={handleConfirmDeleteTicket}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {ticketDeleting ? "Suppression…" : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Box>
  );
}
