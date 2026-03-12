import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
} from "@mui/material";

import appTheme from "../../../common/theme/appTheme";

export default function DeleteIncidentDialog({
  open,
  onClose,
  onConfirm,
  incident,
}) {

  if (!incident) return null;

  return (

    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      keepMounted={false}
      disableRestoreFocus
    >

      <DialogTitle>
        Confirmer la suppression
      </DialogTitle>

      <DialogContent>

        <Box sx={{ mt: 1 }}>

          <Typography sx={{ mb: 1 }}>
            Êtes-vous sûr de vouloir supprimer l'incident{" "}
            <strong>{incident.title}</strong> ?
          </Typography>

          <Typography sx={{ color: "#ef4444", fontWeight: 600 }}>
            Cette action est irréversible.
          </Typography>

        </Box>

      </DialogContent>

      <DialogActions>

        <Button
          onClick={onClose}
          sx={{
            mb: 2,
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1.1,
            minWidth: 120,
            borderRadius: appTheme.radius.pill,
            background: "linear-gradient(135deg,#86efac,#4ade80)",
            color: "#064e3b",
          }}
        >
          Annuler
        </Button>

        <Button
          onClick={onConfirm}
          sx={{
            mb: 2,
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1.1,
            minWidth: 120,
            borderRadius: appTheme.radius.pill,
            background: "linear-gradient(135deg,#ef4444,#dc2626)",
            color: "#fff",
          }}
        >
          Confirmer
        </Button>

      </DialogActions>

    </Dialog>

  );
}