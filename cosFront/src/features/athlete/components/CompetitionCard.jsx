import { Card, Box, Typography, Button, Chip } from "@mui/material";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventIcon from "@mui/icons-material/Event";
import { useNavigate } from "react-router-dom";
import appTheme from "../../../common/theme/appTheme";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("fr-FR");
};

export default function CompetitionCard({ competition, onConfirm, isProfileComplete = false }) {
  const navigate = useNavigate();
  const status = competition.status;
  const isConfirmed = status === "CONFIRMED";
  const isPendingValidation = status === "PENDING_VALIDATION";
  const isPending = status === "PENDING" || status === "INVITED";
  const statusLabel = isConfirmed
    ? "Confirmée"
    : isPendingValidation
    ? "En attente de validation"
    : "Confirmer sa participation";
  const statusColor = isConfirmed
    ? appTheme.colors.green
    : isPendingValidation
    ? appTheme.colors.cyan
    : appTheme.colors.yellow;

  return (
    <Card
      elevation={0}
      sx={{
        width: 380,
        borderRadius: appTheme.radius.lg,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: appTheme.gradients.card,
        boxShadow: appTheme.shadows.card,
        border: `1px solid rgba(34, 211, 238, 0.12)`,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.45), 0 0 0 1px rgba(34,211,238,0.2)",
        },
      }}
    >
      {/* ===== HEADER ===== */}
      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          background: "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(163,230,53,0.08))",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Chip
          icon={<EventIcon sx={{ fontSize: 16, color: appTheme.colors.cyan + " !important" }} />}
          label={competition.eventName}
          size="small"
          sx={{
            backgroundColor: "rgba(34, 211, 238, 0.12)",
            color: appTheme.colors.cyan,
            fontWeight: 700,
            fontSize: 12,
            border: "1px solid rgba(34, 211, 238, 0.2)",
          }}
        />
      </Box>

      {/* ===== CONTENT ===== */}
      <Box sx={{ flex: 1, px: 3, py: 2.5 }}>
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 900,
            color: appTheme.colors.textPrimary,
            mb: 1.5,
            letterSpacing: "-0.3px",
          }}
        >
          {competition.competitionName}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: appTheme.radius.pill,
              background: "rgba(34, 211, 238, 0.08)",
            }}
          >
            <Typography sx={{ fontSize: 12, color: appTheme.colors.cyan, fontWeight: 600 }}>
              {formatDate(competition.startDate)}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: appTheme.colors.textMuted }}>→</Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: appTheme.radius.pill,
              background: "rgba(163, 230, 53, 0.08)",
            }}
          >
            <Typography sx={{ fontSize: 12, color: appTheme.colors.green, fontWeight: 600 }}>
              {formatDate(competition.endDate)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ===== FOOTER ===== */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Statut */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          {isConfirmed ? (
            <CheckCircleIcon sx={{ fontSize: 18, color: appTheme.colors.green }} />
          ) : (
            <HourglassBottomIcon sx={{ fontSize: 18, color: appTheme.colors.yellow }} />
          )}
          <Typography
            sx={{
              fontSize: 13,
              color: statusColor,
              fontWeight: 700,
            }}
          >
            {statusLabel}
          </Typography>
        </Box>

        {/* Actions */}
        {isPending && (
          <Button
            onClick={() => onConfirm(competition)}
            disabled={false}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              px: 2.5,
              py: 0.8,
              borderRadius: appTheme.radius.pill,
              background: appTheme.gradients.navbar,
              color: appTheme.colors.dark,
              transition: "all 0.3s ease",
              "&:hover": {
                background: appTheme.gradients.navbar,
                transform: "translateY(-1px)",
                boxShadow: "0 4px 15px rgba(34, 211, 238, 0.3)",
              },
              "&.Mui-disabled": {
                background: appTheme.gradients.navbar,
                color: appTheme.colors.dark,
                opacity: 1,
              },
            }}
          >
            {isProfileComplete ? "Confirmer" : "Compléter le profil"}
          </Button>
        )}

        {isPendingValidation && (
          <Button
            disabled
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              px: 2.5,
              py: 0.8,
              borderRadius: appTheme.radius.pill,
              color: appTheme.colors.dark,
              background: "rgba(34,211,238,0.35)",
            }}
          >
            En attente de validation
          </Button>
        )}

        {isConfirmed && (
          <Button
            onClick={() => {
              const compId = competition.competitionId || competition.id;
              if (compId) {
                navigate(`/athlete/schedule/${compId}`);
              } else {
                console.error("competitionId manquant dans l'objet competition:", competition);
              }
            }}
            startIcon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              px: 2.5,
              py: 0.8,
              borderRadius: appTheme.radius.pill,
              whiteSpace: "nowrap",
              background: appTheme.gradients.navbar,
              color: appTheme.colors.dark,
              transition: "all 0.3s ease",
              "&:hover": {
                background: appTheme.gradients.navbar,
                transform: "translateY(-1px)",
                boxShadow: "0 4px 15px rgba(34, 211, 238, 0.3)",
              },
            }}
          >
            Voir le planning
          </Button>
        )}
      </Box>
    </Card>
  );
}
