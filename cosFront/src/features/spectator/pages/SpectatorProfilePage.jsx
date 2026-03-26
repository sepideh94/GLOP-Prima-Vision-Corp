import { useState } from "react";
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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SaveIcon from "@mui/icons-material/Save";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import spectatorProfileService from "../services/spectatorProfileService";
import appTheme from "../../../common/theme/appTheme";
import { getSpectatorDisplayFirstName } from "../../../common/utils/spectatorWelcomeName";
import { useNavigate } from "react-router-dom";
import { useNotificationUnread } from "../../../common/contexts/NotificationUnreadContext";
import SpectatorSocialShell from "../components/SpectatorSocialShell";

const pageInk = "#0f2744";
const pageMuted = "#475569";
const pageBorder = "rgba(15, 39, 68, 0.1)";

const profileCardSx = {
  bgcolor: "rgba(255,255,255,0.97)",
  border: `1px solid ${pageBorder}`,
  boxShadow: "0 8px 28px rgba(15, 39, 68, 0.06)",
};

const lightFieldSlotProps = {
  input: {
    sx: {
      borderRadius: 1,
      bgcolor: "#fff",
      fontWeight: 600,
    },
  },
};

export default function SpectatorProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotificationUnread();

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
    <SpectatorSocialShell
      activeKey="profile"
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
      center={
        <Box sx={{ maxWidth: 720 }}>
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
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 900,
                mb: 0,
                letterSpacing: "-0.02em",
                fontSize: { xs: "1.65rem", sm: "2rem" },
                color: pageInk,
              }}
            >
              <PersonOutlineIcon sx={{ fontSize: 30, mr: 1, color: "#0891b2", verticalAlign: "text-bottom" }} />
              {spectatorWelcomeTitle}
            </Typography>
            <Typography
              sx={{
                mt: 1.15,
                lineHeight: 1.55,
                fontSize: { xs: "0.9375rem", sm: "1rem" },
                fontWeight: 600,
                color: pageMuted,
              }}
            >
              Profil — changement de mot de passe
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
          borderRadius: 3,
          maxWidth: 600,
          ...profileCardSx,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 800,
              mb: 3,
              color: pageInk,
              letterSpacing: "-0.02em",
            }}
          >
            <SaveIcon sx={{ fontSize: 22, mr: 1, color: "#0e7490", verticalAlign: "text-bottom" }} />
            Changer le mot de passe
          </Typography>

              <TextField
                fullWidth
                type={showPasswords.old ? "text" : "password"}
                label="Ancien mot de passe"
                value={passwordData.oldPassword}
                onChange={(e) => handlePasswordChange("oldPassword", e.target.value)}
                sx={{ mb: 2 }}
                slotProps={lightFieldSlotProps}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPasswords((prev) => ({ ...prev, old: !prev.old }))
                        }
                        edge="end"
                        sx={{ color: pageMuted }}
                      >
                        {showPasswords.old ? (
                          <VisibilityOffIcon sx={{ fontSize: 22 }} />
                        ) : (
                          <VisibilityIcon sx={{ fontSize: 22 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                type={showPasswords.new ? "text" : "password"}
                label="Nouveau mot de passe"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                sx={{ mb: 2 }}
                slotProps={lightFieldSlotProps}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                        }
                        edge="end"
                        sx={{ color: pageMuted }}
                      >
                        {showPasswords.new ? (
                          <VisibilityOffIcon sx={{ fontSize: 22 }} />
                        ) : (
                          <VisibilityIcon sx={{ fontSize: 22 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                type={showPasswords.confirm ? "text" : "password"}
                label="Confirmer le mot de passe"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                sx={{ mb: 3 }}
                slotProps={lightFieldSlotProps}
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
                        sx={{ color: pageMuted }}
                      >
                        {showPasswords.confirm ? (
                          <VisibilityOffIcon sx={{ fontSize: 22 }} />
                        ) : (
                          <VisibilityIcon sx={{ fontSize: 22 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
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
      }
    />
  );
}
