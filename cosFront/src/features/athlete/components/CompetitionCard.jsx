import { Card, Box, Typography, Button, Chip } from "@mui/material";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";

const HEADER_COLORS = {
  INVITED: "linear-gradient(90deg, #2563eb, #1d4ed8)",   
  CONFIRMED: "linear-gradient(90deg, #16a34a, #15803d)", 
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("fr-FR");
};

export default function CompetitionCard({ competition, onConfirm, isProfileComplete = false }) {
  const isConfirmed = competition.status === "CONFIRMED";

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
            HEADER_COLORS[competition.status] || HEADER_COLORS.INVITED,
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
              color: isConfirmed ? "#16a34a" : "#f59e0b",
            }}
          />
          <Typography
            sx={{
              fontSize: 13,
              color: isConfirmed ? "#16a34a" : "#f59e0b",
              fontWeight: 600,
            }}
          >
            {isConfirmed ? "Participation confirmée" : "En attente"}
          </Typography>
        </Box>

        {!isConfirmed && (
          <Button
            onClick={() => onConfirm(competition)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              backgroundColor: isProfileComplete ? "#16a34a" : "#2563eb",
              color: "#fff",
              px: 2,
              "&:hover": {
                backgroundColor: isProfileComplete ? "#15803d" : "#1d4ed8",
              },
            }}
          >
            {isProfileComplete ? "Confirmée" : "Confirmer ma participation"}
          </Button>
        )}

        {isConfirmed && (
          <Chip label="Confirmée" color="success" size="small" />
        )}
      </Box>
    </Card>
  );
}
