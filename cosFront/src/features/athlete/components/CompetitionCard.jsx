import { Card, Box, Typography, Button, Chip } from "@mui/material";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useNavigate } from "react-router-dom";

const HEADER_COLORS = {
  INVITED: "linear-gradient(90deg, #2563eb, #1d4ed8)",   
  CONFIRMED: "linear-gradient(90deg, #16a34a, #15803d)", 
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("fr-FR");
};

export default function CompetitionCard({ competition, onConfirm, isProfileComplete = false }) {
  const navigate = useNavigate();
  const isConfirmed = competition.status === "CONFIRMED";
  // Si le profil est complet, considérer comme confirmé visuellement
  const showAsConfirmed = isConfirmed || isProfileComplete;

  return (
    <Card
      elevation={6}
      sx={{
        width: 380,
        height: 300,
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ===== HEADER ===== */}
      <Box
        sx={{
          height: 80,
          background:
            showAsConfirmed ? HEADER_COLORS.CONFIRMED : HEADER_COLORS.INVITED,
          px: 2.5,
          py: 2,
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        <Chip
          label={competition.eventName}
          size="small"
          sx={{
            backgroundColor: "rgba(0,0,0,0.35)",
            color: "#fff",
            fontWeight: 700,
          }}
        />
      </Box>

      {/* ===== CONTENT ===== */}
      <Box sx={{ flex: 1, px: 3, py: 2 }}>
        <Typography sx={{ fontSize: 13, color: "#2563eb" }}>
          Début : {formatDate(competition.startDate)} &nbsp;|&nbsp; Fin :{" "}
          {formatDate(competition.endDate)}
        </Typography>
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 900,
            mt: 2.2, 
          }}
        >
          {competition.competitionName}
        </Typography>
      </Box>

      {/* ===== FOOTER ===== */}
      <Box
        sx={{
          height: 64,
          px: 3,
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HourglassBottomIcon
            sx={{
              fontSize: 18,
              color: showAsConfirmed ? "#16a34a" : "#f59e0b",
            }}
          />
          <Typography
            sx={{
              fontSize: 13,
              color: showAsConfirmed ? "#16a34a" : "#f59e0b",
              fontWeight: 600,
            }}
          >
            {showAsConfirmed ? "Participation confirmée" : "En attente"}
          </Typography>
        </Box>

        {!isConfirmed && !isProfileComplete && (
          <Button
            onClick={() => onConfirm(competition)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              backgroundColor: "#2563eb",
              color: "#fff",
              px: 2,
              "&:hover": {
                backgroundColor: "#1d4ed8",
              },
            }}
          >
            Confirmer ma participation
          </Button>
        )}

        {showAsConfirmed && (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Chip label="Confirmée" color="success" size="small" />
            <Button
              onClick={() => {
                const compId = competition.competitionId || competition.id;
                if (compId) {
                  navigate(`/athlete/schedule/${compId}`);
                } else {
                  console.error("competitionId manquant dans l'objet competition:", competition);
                }
              }}
              startIcon={<CalendarMonthIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                backgroundColor: "#16a34a",
                color: "#fff",
                px: 2,
                "&:hover": {
                  backgroundColor: "#15803d",
                },
              }}
            >
              Mon planning
            </Button>
          </Box>
        )}
      </Box>
    </Card>
  );
}
