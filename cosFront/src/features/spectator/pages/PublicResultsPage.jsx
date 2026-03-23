import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Button,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import appTheme from "../../../common/theme/appTheme";
import publicResultsService from "../services/publicResultsService";

export default function PublicResultsPage() {
  const navigate = useNavigate();
  const [availableCompetitions, setAvailableCompetitions] = useState([]);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState(null);
  const [resultsByTrial, setResultsByTrial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDiscovery = async () => {
    try {
      setLoading(true);
      setError(null);
      const discovered = await publicResultsService.getCompetitionsWithResults();
      setAvailableCompetitions(discovered);

      if (discovered.length > 0) {
        const first = discovered[0];
        setSelectedCompetitionId(first.competitionId);
        setResultsByTrial(Array.isArray(first?.trialGroups) ? first.trialGroups : []);
      } else {
        setSelectedCompetitionId(null);
        setResultsByTrial([]);
      }
    } catch (e) {
      setAvailableCompetitions([]);
      setSelectedCompetitionId(null);
      setResultsByTrial([]);
      setError(
        e?.response?.data?.message ||
          "Impossible de charger les classements publics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscovery();
  }, []);

  const handleSelectCompetition = async (competitionId) => {
    setSelectedCompetitionId(competitionId);
    const selected = availableCompetitions.find((x) => x.competitionId === competitionId);
    if (selected) {
      setResultsByTrial(Array.isArray(selected.trialGroups) ? selected.trialGroups : []);
      return;
    }
    try {
      setLoading(true);
      const data = await publicResultsService.getCompetitionResults(competitionId);
      setResultsByTrial(Array.isArray(data) ? data : []);
    } catch {
      setResultsByTrial([]);
      setError("Impossible de charger cette compétition pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  const totalResults = useMemo(
    () =>
      resultsByTrial.reduce((sum, trialGroup) => {
        const count = Array.isArray(trialGroup?.results) ? trialGroup.results.length : 0;
        return sum + count;
      }, 0),
    [resultsByTrial]
  );

  const selectedCompetitionName = useMemo(
    () =>
      availableCompetitions.find((c) => c.competitionId === selectedCompetitionId)?.competitionName ||
      null,
    [availableCompetitions, selectedCompetitionId]
  );

  const getMedal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };
  const withDisplayRank = (rows) =>
    rows.map((row, index, arr) => {
      if (index === 0) return { ...row, displayRank: 1 };
      const prev = arr[index - 1];
      const isSameRankAsPrev =
        row?.rank != null && prev?.rank != null && row.rank === prev.rank;
      return {
        ...row,
        displayRank: isSameRankAsPrev ? prev.displayRank : index + 1,
      };
    });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        position: "relative",
        backgroundImage:
          "url(https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?auto=format&fit=crop&w=1975&q=80)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.62) 0%, rgba(30, 41, 59, 0.55) 50%, rgba(15, 23, 42, 0.62) 100%)",
        },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/")}
            sx={{
              color: "#E2E8F0",
              textTransform: "none",
              fontWeight: 900,
              px: 2.2,
              py: 0.9,
              borderRadius: appTheme.radius.pill,
              border: "1px solid rgba(34,211,238,0.45)",
              background: "linear-gradient(135deg, rgba(15,23,42,0.75), rgba(30,41,59,0.65))",
            }}
          >
            Accueil
          </Button>
          <IconButton
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            sx={{ color: "#E2E8F0", background: "rgba(15,23,42,0.55)" }}
          >
            <ArrowForwardIcon sx={{ transform: "rotate(-90deg)" }} />
          </IconButton>
        </Box>

        <Card
          sx={{
            mb: 3,
            position: "relative",
            zIndex: 1,
            borderRadius: 4,
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.96) 0%, rgba(10,20,52,0.95) 58%, rgba(30,27,75,0.93) 100%)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(56, 189, 248, 0.26)",
            boxShadow: "0 16px 38px rgba(15, 23, 42, 0.42)",
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
              <EmojiEventsIcon sx={{ color: appTheme.colors.violet }} />
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#E2E8F0" }}>
                Résultats & Classements publics
              </Typography>
            </Box>
            <Typography sx={{ color: "rgba(226,232,240,0.72)", mb: 1.2 }}>
              Explorez les classements officiels des dernières compétitions
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {availableCompetitions.map((competition) => (
                <Chip
                  key={competition.competitionId}
                  label={
                    competition.competitionName ||
                    `Compétition ${competition.competitionId}`
                  }
                  clickable
                  onClick={() => handleSelectCompetition(competition.competitionId)}
                  sx={{
                    fontWeight: 800,
                    borderRadius: appTheme.radius.pill,
                    background:
                      selectedCompetitionId === competition.competitionId
                        ? "linear-gradient(135deg, #22D3EE, #3B82F6)"
                        : "rgba(2, 6, 23, 0.7)",
                    color:
                      selectedCompetitionId === competition.competitionId
                        ? "#08101f"
                        : "#E2E8F0",
                  }}
                />
              ))}
            </Stack>
            {availableCompetitions.length === 0 && !loading && !error && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Aucune compétition avec classement public détectée pour le moment.
              </Alert>
            )}
          </CardContent>
        </Card>

        {loading && (
          <Box sx={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: appTheme.colors.cyan }} />
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {!loading && !error && (
          <Stack spacing={2.2} sx={{ position: "relative", zIndex: 1 }}>
            <Typography sx={{ color: "rgba(226,232,240,0.8)", fontWeight: 700 }}>
              {resultsByTrial.length} épreuve(s) · {totalResults} résultat(s)
            </Typography>

            {resultsByTrial.map((trialGroup) => {
              const results = Array.isArray(trialGroup?.results) ? trialGroup.results : [];
              const rankedRows = withDisplayRank(
                results.filter((r) => r?.participant?.status !== "FORFEIT")
              );
              const displayResults = [
                ...rankedRows,
                ...results
                  .filter((r) => r?.participant?.status === "FORFEIT")
                  .map((r) => ({ ...r, rank: null, tie: false, displayRank: null })),
              ];
              const hasTeam = results.some((r) => r?.participant?.competitorType === "TEAM");
              const modeLabel = hasTeam ? "Équipe" : "Individuel";
              const performanceType = results[0]?.performanceType || null;
              const performanceLabel =
                performanceType === "TIME"
                  ? "Temps"
                  : performanceType === "POINTS"
                    ? "Points"
                    : "Performance";

              return (
                <Card
                  key={trialGroup?.trialId}
                  sx={{
                    borderRadius: 3,
                    background:
                      "linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(10,20,52,0.96) 58%, rgba(30,27,75,0.95) 100%)",
                    border: "1px solid rgba(56, 189, 248, 0.22)",
                    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.38)",
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        mb: 1.6,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 1.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 900, fontSize: 17, color: "#E2E8F0" }}>
                          {trialGroup?.trialName || `Épreuve ${trialGroup?.trialId}`}
                        </Typography>
                        {selectedCompetitionId && selectedCompetitionName && (
                          <Typography sx={{ color: "#67E8F9", fontSize: 12, mb: 0.3, fontWeight: 700 }}>
                            {selectedCompetitionName}
                          </Typography>
                        )}
                        <Typography sx={{ color: "rgba(226,232,240,0.72)", fontSize: 13 }}>
                          {trialGroup?.roundName || "Round non défini"}
                          {trialGroup?.categoryGender ? ` · ${trialGroup?.categoryGender}` : ""}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={modeLabel}
                          size="small"
                          sx={{ background: "rgba(167,139,250,0.18)", color: "#DDD6FE", fontWeight: 700 }}
                        />
                        <Chip
                          label={performanceLabel}
                          size="small"
                          sx={{ background: "rgba(134,239,172,0.14)", color: "#BBF7D0", fontWeight: 700 }}
                        />
                      </Stack>
                    </Box>

                    {results.length === 0 ? (
                      <Typography sx={{ color: appTheme.colors.textSecondary }}>
                        Aucun résultat enregistré pour cette épreuve.
                      </Typography>
                    ) : (
                      <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{ borderRadius: 2, background: "rgba(2, 6, 23, 0.35)" }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 900, color: "#E2E8F0" }}>Rang</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: "#E2E8F0" }}>Participant</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: "#E2E8F0" }}>Performance</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {displayResults.map((result) => {
                              const members = Array.isArray(result?.participant?.members)
                                ? result.participant.members
                                : [];
                              const isTeam = result?.participant?.competitorType === "TEAM";
                              const isForfeit = result?.participant?.status === "FORFEIT";

                              return (
                                <TableRow key={result.id}>
                                  <TableCell sx={{ width: 76 }}>
                                    <Typography sx={{ fontWeight: 800, color: "#E2E8F0" }}>
                                      {result.displayRank == null ? "—" : getMedal(result.displayRank)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography sx={{ fontWeight: 700, color: "#E2E8F0" }}>
                                      {result?.participant?.displayName || "Participant inconnu"}
                                    </Typography>
                                    {isForfeit && (
                                      <Chip
                                        label="Forfait"
                                        size="small"
                                        sx={{
                                          mt: 0.6,
                                          fontWeight: 700,
                                          color: "#fecaca",
                                          background: "rgba(239, 68, 68, 0.20)",
                                          border: "1px solid rgba(239, 68, 68, 0.45)",
                                        }}
                                      />
                                    )}
                                    {isTeam && members.length > 0 && (
                                      <Typography
                                        sx={{
                                          mt: 0.3,
                                          fontSize: "0.8rem",
                                          color: "rgba(226,232,240,0.72)",
                                        }}
                                      >
                                        {members
                                          .map(
                                            (m) =>
                                              `${m?.firstName || ""} ${m?.lastName || ""}`.trim()
                                          )
                                          .filter(Boolean)
                                          .join(", ")}
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                      <Typography
                                        sx={{
                                          fontWeight: 900,
                                          color: isForfeit ? "#fecaca" : "#E2E8F0",
                                        }}
                                      >
                                        {isForfeit ? "Forfait" : result.performance}
                                      </Typography>
                                      {result.tie && !isForfeit && (
                                        <Chip label="Ex æquo" size="small" color="warning" />
                                      )}
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
