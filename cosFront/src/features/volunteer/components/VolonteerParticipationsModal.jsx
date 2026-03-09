import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

import appTheme from "../../../common/theme/appTheme";

export default function VolunteerParticipationsModal({
  open,
  onClose,
  volunteer,
}) {
  const volunteerName = volunteer
    ? `${volunteer.firstName || ""} ${volunteer.lastName || ""}`.trim()
    : "";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>

      <DialogTitle>
        {volunteerName
          ? `Participations de ${volunteerName}`
          : "Participations du volontaire"}
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