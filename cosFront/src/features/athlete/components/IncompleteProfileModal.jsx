import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useNavigate } from "react-router-dom";
import appTheme from "../../../common/theme/appTheme";

export default function IncompleteProfileModal({ open, onClose }) {
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    onClose();
    navigate("/athlete/profile");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <WarningAmberIcon sx={{ color: "#f59e0b", fontSize: 32 }} />
          <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
            Profil incomplet
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 15, color: "#374151", lineHeight: 1.6 }}>
          Pour confirmer votre participation, vous devez compléter votre profil.
          Veuillez renseigner les informations suivantes :
        </Typography>
        <Box sx={{ mt: 2, pl: 2 }}>
          <Typography sx={{ fontSize: 14, color: "#6B7280", mb: 0.5 }}>
            • Nationalité
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#6B7280", mb: 0.5 }}>
            • Date de naissance
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#6B7280", mb: 0.5 }}>
            • Sexe
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#6B7280", mb: 0.5 }}>
            • Numéro de passeport
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#6B7280", mb: 0.5 }}>
            • Document de passeport
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
            • Certificat médical
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            color: "#6B7280",
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleGoToProfile}
          variant="contained"
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            borderRadius: 2,
            background: appTheme.gradients.navbar,
            color: "#020617",
            "&:hover": {
              background: appTheme.gradients.navbar,
              opacity: 0.9,
            },
          }}
        >
          Aller au profil
        </Button>
      </DialogActions>
    </Dialog>
  );
}
