import { useEffect, useState } from "react";
import { Grid, Typography, Box, Alert, Chip, CircularProgress, Stack } from "@mui/material";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import CompetitionCard from "../components/CompetitionCard";
import ConfirmParticipationModal from "../components/ConfirmParticipationModal";
import IncompleteProfileModal from "../components/IncompleteProfileModal";
import athleteCompetitionService from "../services/athleteCompetitionService";
import athleteProfileService from "../services/athleteProfileService";

const PAGE_BG =
  "linear-gradient(165deg, #ecfeff 0%, #fef9c3 28%, #fff7ed 55%, #e0f2fe 100%)";

const HEADER_IMAGE =
  "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1600&q=75";

export default function AthleteCompetitionsPage() {
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIncompleteProfileModal, setShowIncompleteProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [confirmError, setConfirmError] = useState("");
  const loadCompetitions = async () => {
    const data = await athleteCompetitionService.getMyCompetitions();
    setCompetitions(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    const loadData = async () => {
      await loadCompetitions();
      await loadProfile();
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadProfile();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", loadProfile);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", loadProfile);
    };
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await athleteProfileService.getMyProfile();
      setUserProfile(profile);
    } catch {
      setUserProfile(null);
    }
  };

  const isProfileComplete = () => {
    if (!userProfile) return false;
    return (
      userProfile.nationality &&
      userProfile.birthDate &&
      userProfile.sexe &&
      userProfile.passportNumber &&
      userProfile.hasPassport &&
      userProfile.hasMedicalCertificate
    );
  };

  const handleConfirmClick = async (competition) => {
    setConfirmError("");
    if (!isProfileComplete()) {
      setShowIncompleteProfileModal(true);
      return;
    }

    if (userProfile?.hasAcceptedCharte) {
      try {
        await athleteCompetitionService.confirmParticipation(competition.participationId);
        await loadCompetitions();
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error("Erreur lors de la confirmation:", err);
          setConfirmError(
            err.response?.data?.message ||
              "Impossible de confirmer la participation pour le moment."
          );
        }
      }
      return;
    }

    setSelectedCompetition(competition);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 320 }}>
        <CircularProgress sx={{ color: "#0284c7" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        background: PAGE_BG,
        mx: { xs: -3, sm: -4, md: -6 },
        mt: { xs: -2, sm: -3 },
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 2, sm: 3 },
        pb: 6,
      }}
    >
      <Box
        sx={{
          position: "relative",
          borderRadius: 3,
          overflow: "hidden",
          mb: 4,
          border: "1px solid rgba(15, 39, 68, 0.1)",
          boxShadow: "0 12px 40px rgba(15, 39, 68, 0.1)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${HEADER_IMAGE})`,
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            transform: "scale(1.04)",
            filter: "blur(4px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.65) 45%, rgba(2,132,199,0.35) 100%)",
          }}
        />
        <Box
          sx={{
            position: "relative",
            p: { xs: 2.5, md: 3.5 },
          }}
        >
          <Stack spacing={0}>
            <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap" sx={{ mb: 2 }}>
              <Chip
                icon={<EmojiEventsOutlinedIcon sx={{ fontSize: 18, color: "#fef08a !important" }} />}
                label="Espace compétition"
                size="small"
                sx={{
                  fontWeight: 800,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.35)",
                }}
              />
            </Stack>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: "1.65rem", md: "2rem" },
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                mb: 1.5,
                textShadow: "0 2px 12px rgba(0,0,0,0.35)",
              }}
            >
              Mes compétitions
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                color: "rgba(255,255,255,0.92)",
                maxWidth: { xs: "100%", sm: 640 },
                lineHeight: 1.65,
                textShadow: "0 1px 8px rgba(0,0,0,0.25)",
              }}
            >
              Retrouvez les compétitions auxquelles vous êtes invité(e), confirmez votre participation et
              accédez au planning dès que votre dossier et votre équipe sont validés.
            </Typography>
          </Stack>
        </Box>
      </Box>

      {confirmError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {confirmError}
        </Alert>
      )}

      <Typography
        sx={{
          fontWeight: 900,
          fontSize: "1.05rem",
          color: "#0f2744",
          mb: 2,
          letterSpacing: "-0.02em",
        }}
      >
        Vos compétitions
      </Typography>

      <Grid container spacing={2.5} alignItems="stretch">
        {competitions.map((competition) => (
          <Grid
            key={competition.participationId}
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box sx={{ width: "100%", maxWidth: 360, display: "flex" }}>
              <CompetitionCard
                competition={competition}
                onConfirm={handleConfirmClick}
                isProfileComplete={isProfileComplete()}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      {competitions.length === 0 && (
        <Box
          sx={{
            mt: 3,
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            background: "rgba(255,255,255,0.75)",
            border: "1px dashed rgba(14, 165, 233, 0.4)",
          }}
        >
          <Typography sx={{ color: "#64748b", fontWeight: 600 }}>
            Aucune compétition pour le moment. Les invitations apparaîtront ici.
          </Typography>
        </Box>
      )}

      {selectedCompetition && (
        <ConfirmParticipationModal
          open
          competition={selectedCompetition}
          onClose={() => setSelectedCompetition(null)}
          onConfirm={async () => {
            try {
              setConfirmError("");
              await athleteCompetitionService.confirmParticipation(selectedCompetition.participationId);
              await loadCompetitions();
              setSelectedCompetition(null);
            } catch (err) {
              if (err.response?.status !== 401) {
                console.error("Erreur lors de la confirmation de participation:", err);
                setConfirmError(
                  err.response?.data?.message ||
                    "Impossible de confirmer la participation pour le moment."
                );
              }
            }
          }}
        />
      )}

      <IncompleteProfileModal
        open={showIncompleteProfileModal}
        onClose={() => {
          setShowIncompleteProfileModal(false);
          loadProfile();
        }}
      />
    </Box>
  );
}
