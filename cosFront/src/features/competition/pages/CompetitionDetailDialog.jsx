import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import appTheme from "../../../common/theme/appTheme";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const DetailRow = ({ label, value }) => (
  <Box sx={{ display: "flex", py: 1.5, borderBottom: "1px solid #e0e0e0" }}>
    <Typography sx={{ fontWeight: 600, minWidth: 150, color: "#555" }}>
      {label}
    </Typography>
    <Typography sx={{ flex: 1 }}>{value || "-"}</Typography>
  </Box>
);

export default function CompetitionDetailDialog({ open, onClose, competition, currentEvent }) {
  if (!competition) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <EventIcon sx={{ color: appTheme.colors.cyan }} />
        Détails de la compétition
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {currentEvent && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                backgroundColor: "rgba(34, 211, 238, 0.1)",
                border: "1px solid rgba(34, 211, 238, 0.3)",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: appTheme.colors.cyan }}>
                Évènement : {currentEvent.name}
              </Typography>
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />

          <DetailRow label="Nom" value={competition.name} />
          <DetailRow label="Description" value={competition.description} />
          <DetailRow label="Date de début" value={formatDate(competition.startDate)} />
          <DetailRow label="Date de fin" value={formatDate(competition.endDate)} />
          <DetailRow label="Statut" value={competition.statusLabel} />
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
            minWidth: 130,
            borderRadius: appTheme.radius.pill,
            background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
            color: appTheme.colors.dark,
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
