import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Typography, Box, Alert } from "@mui/material";
import CompetitionCard from "../components/CompetitionCard";
import ConfirmParticipationModal from "../components/ConfirmParticipationModal";
import IncompleteProfileModal from "../components/IncompleteProfileModal";
import athleteCompetitionService from "../services/athleteCompetitionService";
import athleteProfileService from "../services/athleteProfileService";

export default function AthleteCompetitionsPage() {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIncompleteProfileModal, setShowIncompleteProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [confirmError, setConfirmError] = useState("");
  useEffect(() => {
    const loadData = async () => {
      const data = await athleteCompetitionService.getMyCompetitions();
      setCompetitions(data);
      await loadProfile();
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Recharger le profil quand la page redevient visible (après retour du profil)
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
    } catch (err) {
      // Profil non trouvé
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
      // Afficher la modale pour informer qu'il faut compléter le profil
      setShowIncompleteProfileModal(true);
      return;
    }
    
    // Si le profil est complet ET la charte a déjà été acceptée, confirmer directement
    if (userProfile?.hasAcceptedCharte) {
      try {
        await athleteCompetitionService.confirmParticipation(competition.participationId);
        setCompetitions((prev) =>
          prev.map((c) =>
            c.participationId === competition.participationId
              ? { ...c, status: "PENDING_VALIDATION" }
              : c
          )
        );
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
    
    // Sinon, ouvrir la modale pour accepter la charte
    setSelectedCompetition(competition);
  };

  if (loading) {
    return <Typography>Chargement…</Typography>;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Typography sx={{ fontSize: 36, fontWeight: 900, mb: 1 }}>
        Participation
      </Typography>

      <Typography sx={{ fontSize: 15, color: "#374151", mb: 6 }}>
        Retrouvez ici les compétitions auxquelles vous êtes invité(e) et confirmez votre participation si nécessaire.
      </Typography>

      {confirmError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {confirmError}
        </Alert>
      )}

      <Grid container spacing={4}>
        {competitions.map((competition) => (
          <Grid key={competition.participationId} item xs={12} md={4}>
            <CompetitionCard
              competition={competition}
              onConfirm={handleConfirmClick}
              isProfileComplete={isProfileComplete()}
            />
          </Grid>
        ))}
      </Grid>

      {selectedCompetition && (
        <ConfirmParticipationModal
          open
          competition={selectedCompetition}
          onClose={() => setSelectedCompetition(null)}
          onConfirm={async () => {
            try {
              setConfirmError("");
              await athleteCompetitionService.confirmParticipation(selectedCompetition.participationId);
              setCompetitions((prev) =>
                prev.map((c) =>
                  c.participationId === selectedCompetition.participationId
                    ? { ...c, status: "PENDING_VALIDATION" }
                    : c
                )
              );
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
          loadProfile(); // Recharger le profil après fermeture de la modale
        }}
      />
    </Box>
  );
}
