import { Box, Typography, Button } from "@mui/material";
import { CalendarToday, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import HtmlContent from "../../../common/components/HtmlContent";

export default function EventCard({ event, isAdmin, onEdit }) {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => {
        const eventId = event.idEvent || event.id;
        navigate(`/admin/competitions?eventId=${eventId}`);
      }}
      sx={{
        position: "relative",
        p: 4,            
        minHeight: 140,  
        borderRadius: 3,
        cursor: "pointer",
        background: "linear-gradient(135deg, #0f172a, #020617)",
        color: "white",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
        },
      }}
    >
      {/* Barre latérale */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          borderRadius: "12px 0 0 12px",
          background: "linear-gradient(180deg, #22d3ee, #4ade80)",
        }}
      />

      {/* Contenu */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(34,211,238,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CalendarToday sx={{ color: "#22d3ee" }} />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            {event.name}
          </Typography>

          {event.description && (
            <HtmlContent
              html={event.description}
              sx={{
                color: "#cbd5f5",
                mt: 0.5,
                fontSize: "0.875rem",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                "& p:last-child": { marginBottom: 0 },
              }}
            />
          )}

          <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
            <Typography
              variant="caption"
              sx={{ color: "#38bdf8", fontWeight: 600 }}
            >
            Début :{" "}
            {event.startDate
            ? new Date(event.startDate).toLocaleDateString("fr-FR")
            : "—"}
            </Typography>

            <Typography
              variant="caption"
              sx={{ color: "#4ade80", fontWeight: 600 }}
            >
            Fin :{" "}
            {event.endDate
            ? new Date(event.endDate).toLocaleDateString("fr-FR")
            : "—"}
            </Typography>
          </Box>
        </Box>

        {isAdmin && (
          <Button
            onClick={(e) => {
            e.stopPropagation();
            onEdit(event);
            }}
            startIcon={<Edit fontSize="small" />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#22d3ee",
              "&:hover": {
              backgroundColor: "rgba(34,211,238,0.15)",
              },
            }}
          >
          Modifier
         </Button>
        )}
      </Box>
    </Box>
  );
}
