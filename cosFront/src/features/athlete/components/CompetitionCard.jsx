import { Card, Box, Typography, Button, Chip, Alert, Stack } from "@mui/material";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventIcon from "@mui/icons-material/Event";
import GroupsIcon from "@mui/icons-material/Groups";
import { useNavigate } from "react-router-dom";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("fr-FR");
};

const ACCENTS = [
  { bar: "#2563eb", headerFrom: "#1e40af", headerTo: "#0ea5e9", chip: "#1d4ed8", chipBg: "rgba(37,99,235,0.18)" },
  { bar: "#16a34a", headerFrom: "#14532d", headerTo: "#4ade80", chip: "#15803d", chipBg: "rgba(22,163,74,0.18)" },
  { bar: "#ea580c", headerFrom: "#9a3412", headerTo: "#fb923c", chip: "#c2410c", chipBg: "rgba(234,88,12,0.18)" },
  { bar: "#ca8a04", headerFrom: "#713f12", headerTo: "#facc15", chip: "#a16207", chipBg: "rgba(202,138,4,0.22)" },
];

function pickAccent(competition) {
  const raw = competition?.competitionId ?? competition?.participationId ?? 0;
  const n = Math.abs(Number(raw) || String(raw).length);
  return ACCENTS[n % ACCENTS.length];
}

export default function CompetitionCard({ competition, onConfirm, isProfileComplete = false }) {
  const navigate = useNavigate();
  const accent = pickAccent(competition);
  const status = competition.status;
  const isTeamParticipation = Boolean(competition.isTeamParticipation);
  const teamStatus = competition.teamStatus;

  const individualConfirmed = status === "CONFIRMED";
  const teamConfirmed = !isTeamParticipation || teamStatus === "CONFIRMED";
  const planningUnlocked = individualConfirmed && teamConfirmed;

  const awaitingTeamValidation =
    isTeamParticipation && individualConfirmed && !teamConfirmed;

  const isPendingValidation = status === "PENDING_VALIDATION";
  const isPending = status === "PENDING" || status === "INVITED";

  const statusLabel = planningUnlocked
    ? "Confirmée"
    : awaitingTeamValidation
      ? "Documents validés — équipe en attente"
      : isPendingValidation
        ? "En attente de validation"
        : "Confirmer sa participation";

  const statusColor = planningUnlocked
    ? "#16a34a"
    : awaitingTeamValidation || isPendingValidation
      ? "#0284c7"
      : "#ca8a04";

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 360,
        borderRadius: 2.5,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#fff",
        boxShadow: `0 10px 36px rgba(15, 39, 68, 0.1), 0 0 0 1px rgba(15,39,68,0.06), -6px 0 0 0 ${accent.bar}`,
        border: "1px solid rgba(15, 39, 68, 0.1)",
        borderLeft: `6px solid ${accent.bar}`,
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 20px 50px rgba(15, 39, 68, 0.14), 0 0 0 1px rgba(15,39,68,0.08), -6px 0 0 0 ${accent.bar}`,
        },
      }}
    >
      {/* Bandeau sans photo : texte toujours lisible */}
      <Box
        sx={{
          px: 2.25,
          py: 1.75,
          background: `linear-gradient(118deg, ${accent.headerFrom} 0%, ${accent.headerTo} 55%, rgba(255,255,255,0.15) 100%)`,
          boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.12)",
        }}
      >
        <Stack direction="row" alignItems="flex-start" gap={1.25}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              backdropFilter: "blur(6px)",
            }}
          >
            <EventIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 800,
                color: "rgba(255,255,255,0.85)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                mb: 0.35,
              }}
            >
              Événement
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 15, sm: 16 },
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1.35,
                textShadow: "0 1px 3px rgba(0,0,0,0.25)",
              }}
            >
              {competition.eventName}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, px: 2.5, py: 2.25 }}>
        <Typography
          sx={{
            fontSize: 19,
            fontWeight: 900,
            color: "#0f2744",
            mb: 1.25,
            letterSpacing: "-0.02em",
            lineHeight: 1.25,
          }}
        >
          {competition.competitionName}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label={formatDate(competition.startDate)}
            size="small"
            sx={{
              backgroundColor: accent.chipBg,
              color: accent.chip,
              fontWeight: 700,
              fontSize: 11,
            }}
          />
          <Typography sx={{ fontSize: 12, color: "#64748b" }}>→</Typography>
          <Chip
            label={formatDate(competition.endDate)}
            size="small"
            sx={{
              backgroundColor: "rgba(34, 197, 94, 0.12)",
              color: "#15803d",
              fontWeight: 700,
              fontSize: 11,
            }}
          />
        </Box>

        {isTeamParticipation && (
          <Alert
            icon={<GroupsIcon />}
            severity="info"
            sx={{
              mt: 2,
              py: 0.5,
              borderRadius: 2,
              backgroundColor: "rgba(14, 165, 233, 0.08)",
              color: "#0f2744",
              border: "1px solid rgba(14, 165, 233, 0.2)",
              "& .MuiAlert-icon": { color: "#0284c7" },
            }}
          >
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.45 }}>
              Vous faites partie d&apos;une équipe. Le planning n&apos;est accessible que lorsque la
              participation de l&apos;équipe est confirmée par le commissaire.
            </Typography>
          </Alert>
        )}

        {awaitingTeamValidation && (
          <Typography
            sx={{
              mt: 1.5,
              fontSize: 12,
              color: "#64748b",
              lineHeight: 1.45,
            }}
          >
            Vos documents ont été validés ; nous attendons la validation des autres membres de votre
            équipe.
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderTop: "1px solid rgba(15, 39, 68, 0.06)",
          background: "linear-gradient(180deg, #fafbff 0%, #f8fafc 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.8,
            minWidth: 0,
            flex: "1 1 auto",
          }}
        >
          {planningUnlocked ? (
            <CheckCircleIcon sx={{ fontSize: 20, color: "#16a34a" }} />
          ) : (
            <HourglassBottomIcon
              sx={{
                fontSize: 20,
                color:
                  awaitingTeamValidation || isPendingValidation ? "#0284c7" : "#ca8a04",
              }}
            />
          )}
          <Typography
            sx={{
              fontSize: 12.5,
              color: statusColor,
              fontWeight: 800,
              lineHeight: 1.25,
            }}
          >
            {statusLabel}
          </Typography>
        </Box>

        {isPending && (
          <Button
            onClick={() => onConfirm(competition)}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 800,
              fontSize: 13,
              px: 2.5,
              py: 0.85,
              borderRadius: 999,
              flexShrink: 0,
              whiteSpace: "nowrap",
              background: `linear-gradient(135deg, ${accent.bar}, #0ea5e9)`,
              color: "#fff",
              boxShadow: "0 6px 20px rgba(37,99,235,0.25)",
              "&:hover": {
                background: `linear-gradient(135deg, #1d4ed8, #0284c7)`,
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
              fontWeight: 800,
              fontSize: 13,
              px: 2.5,
              py: 0.85,
              borderRadius: 999,
              color: "#475569",
              background: "rgba(148, 163, 184, 0.25)",
            }}
          >
            En attente de validation
          </Button>
        )}

        {awaitingTeamValidation && (
          <Button
            disabled
            sx={{
              textTransform: "none",
              fontWeight: 800,
              fontSize: 13,
              px: 2.5,
              py: 0.85,
              borderRadius: 999,
              color: "#475569",
              background: "rgba(14, 165, 233, 0.15)",
            }}
          >
            Équipe en attente
          </Button>
        )}

        {planningUnlocked && (
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
              fontWeight: 800,
              fontSize: 13,
              px: 2.5,
              py: 0.85,
              borderRadius: 999,
              flexShrink: 0,
              whiteSpace: "nowrap",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "#fff",
              "&:hover": {
                background: "linear-gradient(135deg, #16a34a, #15803d)",
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
