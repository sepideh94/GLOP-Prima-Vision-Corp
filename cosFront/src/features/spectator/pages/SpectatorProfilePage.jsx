import { useState } from "react";
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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SaveIcon from "@mui/icons-material/Save";
import spectatorProfileService from "../services/spectatorProfileService";
import appTheme from "../../../common/theme/appTheme";

export default function SpectatorProfilePage() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
    setError("");
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
    <Box sx={{ p: { xs: 3, md: 4 } }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          mb: 1,
          color: appTheme.colors.dark,
        }}
      >
        Mon Profil
      </Typography>
      <Typography
        sx={{
          color: appTheme.colors.darkSoft,
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
              color: appTheme.colors.dark,
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
    </Box>
  );
}
