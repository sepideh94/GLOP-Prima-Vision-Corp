import {
  Card,
  Box,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";

const HEADER_COLORS = {
  INVITED: "#2563eb",
  CONFIRMED: "#15803d",
  FINISHED: "#d97706", 
};

export default function CompetitionCard({ competition, onConfirm }) {
  if (!competition) return null;

  return (
    <Card
      elevation={6}
      sx={{
        width: 320,
        height: 420,
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          height: 90,
          backgroundColor: HEADER_COLORS[competition.status],
          px: 2.5,
          py: 2,
        }}
      >
        <Chip
          label={competition.eventName}
          size="small"
          sx={{
            backgroundColor: "rgba(0,0,0,0.35)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 12,
          }}
        />
      </Box>

      {/* CONTENT */}
      <Box sx={{ flex: 1, px: 3, py: 2 }}>
        <Typography sx={{ fontSize: 13, color: "#2563eb", mb: 0.5 }}>
          {competition.date}
        </Typography>

        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 900,
            mb: 1,
          }}
        >
          {competition.competitionName}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PlaceIcon sx={{ fontSize: 18, color: "#e11d48", mr: 1 }} />
          <Typography sx={{ fontSize: 14 }}>
            {competition.location}
          </Typography>
        </Box>
      </Box>

      {/* FOOTER */}
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
          <HourglassBottomIcon sx={{ fontSize: 18, color: "#f59e0b" }} />
          <Typography sx={{ fontSize: 13, color: "#f59e0b" }}>
            fin : j-15
          </Typography>
        </Box>

        {competition.status === "INVITED" && (
          <Button
            size="small"
            onClick={() => onConfirm(competition)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Confirmer la participation
          </Button>
        )}

        {competition.status === "CONFIRMED" && (
          <Chip label="Confirmée" size="small" color="success" />
        )}

        {competition.status === "FINISHED" && (
          <Chip label="Terminée" size="small" />
        )}
      </Box>
    </Card>
  );
}
