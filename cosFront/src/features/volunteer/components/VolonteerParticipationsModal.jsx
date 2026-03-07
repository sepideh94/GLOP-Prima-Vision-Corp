import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import appTheme from "../../../common/theme/appTheme";

export default function VolonteerParticipationsModal({ open, onClose, volunteer }) {

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>

      <DialogTitle>
        Participations de {volunteer?.firstName} {volunteer?.lastName}
      </DialogTitle>

      <DialogContent>

        <Typography sx={{ p: 2, textAlign: "center" }}>
          Les participations seront disponibles prochainement.
        </Typography>

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
          }}
        >
          Fermer
        </Button>

      </DialogActions>

    </Dialog>
  );
}