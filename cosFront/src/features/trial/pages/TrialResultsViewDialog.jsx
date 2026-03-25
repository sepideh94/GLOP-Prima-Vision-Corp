import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Chip,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import appTheme from "../../../common/theme/appTheme";
import trialService from "../services/trialService";

export default function TrialResultsViewDialog({ open, onClose, trial }) {

  const [results, setResults] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !trial) return;

    setLoading(true);
    setError(null);

    Promise.all([trialService.getResults(trial.id), trialService.getParticipants(trial.id)])
      .then(([resultsData, participantsData]) => {
        setResults(Array.isArray(resultsData) ? resultsData : []);
        setParticipants(Array.isArray(participantsData) ? participantsData : []);
      })
      .catch((e) => {
        setResults([]);
        setParticipants([]);
        const status = e?.response?.status;
        if (status === 401) {
          setError("Session expirée. Veuillez vous reconnecter.");
          return;
        }
        if (status === 403) {
          setError("Accès refusé.");
          return;
        }
        if (status === 404) {
          setError("Épreuve introuvable (404).");
          return;
        }
        setError("Impossible de charger le classement. Réessayez dans quelques instants.");
      })
      .finally(() => setLoading(false));

  }, [open, trial]);

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

  const performanceType = results?.[0]?.performanceType || null;
  const performanceLabel =
    performanceType === "TIME"
      ? "Temps"
      : performanceType === "POINTS"
      ? "Points"
      : null;

  const hasTeamResults =
    Array.isArray(results) &&
    results.some((r) => r?.participant?.competitorType === "TEAM");
  const modeLabel =
    trial?.mode === "TEAM" || hasTeamResults ? "Équipe" : "Individuel";

  const lastUpdated = results.find((r) => r.updatedAt) || null;

  const rankCounts = results.reduce((acc, r) => {
    const key = String(r.rank ?? "");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const tiedRanks = new Set(
    results
      .filter((r) => r.tie || (rankCounts[String(r.rank ?? "")] || 0) > 1)
      .map((r) => r.rank)
  );
  const normalizedResults = results.map((r) =>
    r?.participant?.status === "FORFEIT"
      ? { ...r, rank: null, tie: false, isForfeitNoResult: true }
      : r
  );
  const rankedRows = withDisplayRank(
    normalizedResults.filter((r) => r?.participant?.status !== "FORFEIT")
  );
  const forfeitRowsWithResult = normalizedResults.filter(
    (r) => r?.participant?.status === "FORFEIT"
  );
  const resultByParticipantId = new Map(
    results
      .filter((r) => r?.participant?.id)
      .map((r) => [r.participant.id, r])
  );
  const forfeitedWithoutResultRows = participants
    .filter((p) => p.status === "FORFEIT" && !resultByParticipantId.has(p.id))
    .map((p) => ({
      id: `forfeit-${p.id}`,
      rank: null,
      tie: false,
      performance: "Forfait",
      participant: p,
      isForfeitNoResult: true,
    }));
  const displayRows = [...rankedRows, ...forfeitRowsWithResult, ...forfeitedWithoutResultRows];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      sx={{
        "& .MuiDialog-container": {
          "& .MuiDialog-paper": {
            borderRadius: 4,
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: 3,
          py: 2.2,
          background:
            "linear-gradient(135deg, rgba(250,204,21,0.20), rgba(34,211,238,0.12))",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: appTheme.radius.pill,
              display: "grid",
              placeItems: "center",
              background: "rgba(250,204,21,0.18)",
              border: "1px solid rgba(250,204,21,0.30)",
            }}
          >
            <EmojiEventsIcon sx={{ color: appTheme.colors.green }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, lineHeight: 1.1, color: "#0f172a" }}>
              Classement
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
              {trial?.name || "Épreuve"}
            </Typography>
          </Box>
        </Box>

        {performanceLabel && (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Chip
              label={`Performance : ${performanceLabel}`}
              size="small"
              sx={{
                fontWeight: 800,
                borderRadius: appTheme.radius.pill,
                background: "rgba(34, 211, 238, 0.14)",
                border: "1px solid rgba(34, 211, 238, 0.35)",
              }}
            />
            <Chip
              label={modeLabel}
              size="small"
              sx={{
                fontWeight: 700,
                borderRadius: appTheme.radius.pill,
                background: "rgba(167, 139, 250, 0.17)",
                color: "#6d28d9",
                border: "1px solid rgba(167, 139, 250, 0.42)",
              }}
            />
          </Box>
        )}

        {!performanceLabel && (
          <Chip
            label={modeLabel}
            size="small"
            sx={{
              fontWeight: 700,
              borderRadius: appTheme.radius.pill,
              background: "rgba(167, 139, 250, 0.17)",
              color: "#6d28d9",
              border: "1px solid rgba(167, 139, 250, 0.42)",
            }}
          />
        )}
      </DialogTitle>

      <DialogContent dividers>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!error && lastUpdated && (
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{ fontSize: 12, color: "text.secondary", fontStyle: "italic" }}
            >
              Dernière modification par{" "}
              <strong>{lastUpdated.updatedBy || "—"}</strong>{" "}
              le{" "}
              {new Date(lastUpdated.updatedAt).toLocaleString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : displayRows.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px dashed rgba(15,23,42,0.18)",
              background: "rgba(15,23,42,0.02)",
              textAlign: "center",
            }}
          >
            <Typography sx={{ fontWeight: 800, mb: 0.6 }}>
              Aucun résultat enregistré
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
              Les résultats de cette épreuve ne sont pas encore publiés.
            </Typography>
          </Paper>
        ) : (

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(15,23,42,0.08)",
              overflow: "hidden",
            }}
          >
          <Table size="small" stickyHeader>

            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, background: "#fff" }}>#</TableCell>
                <TableCell sx={{ fontWeight: 900, background: "#fff" }}>Participant</TableCell>
                <TableCell sx={{ fontWeight: 900, background: "#fff" }}>Performance</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>

              {displayRows.map((r) => (
                <TableRow
                  key={r.id}
                  sx={
                    !r.isForfeitNoResult && tiedRanks.has(r.rank)
                      ? {
                          background: "rgba(250, 204, 21, 0.10)",
                          "&:hover": { background: "rgba(250, 204, 21, 0.14)" },
                        }
                      : undefined
                  }
                >

                  {/* RANK + MÉDAILLE */}
                  <TableCell>
                    <Typography fontWeight={700}>
                      {r.displayRank ? getMedal(r.displayRank) : "—"}
                    </Typography>
                  </TableCell>

                  {/* PARTICIPANT */}
                  <TableCell>
                    <Typography fontWeight={600}>
                      {r.participant.displayName}
                    </Typography>

                    {r.participant.competitorType === "TEAM" && r.participant.members && (
                      <Typography sx={{ fontSize: "0.8rem", color: "#666" }}>
                        {r.participant.members
                          .map((m) => `${m.firstName} ${m.lastName}`.trim())
                          .join(", ")}
                      </Typography>
                    )}
                  </TableCell>

                  {/* PERFORMANCE */}
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: r.participant?.status === "FORFEIT" ? "#b91c1c" : "inherit",
                        }}
                      >
                        {r.participant?.status === "FORFEIT" ? "Forfait" : r.performance}
                      </Typography>

                      {r.participant?.status === "FORFEIT" && (
                        <Chip
                          label="Forfait"
                          size="small"
                          sx={{
                            backgroundColor: "rgba(239, 68, 68, 0.15)",
                            color: "#b91c1c",
                            fontWeight: 700,
                          }}
                        />
                      )}

                      {!r.isForfeitNoResult && tiedRanks.has(r.rank) && (
                        <Chip
                          label="Ex æquo"
                          size="small"
                          color="warning"
                        />
                      )}
                    </Stack>
                  </TableCell>

                </TableRow>
              ))}

            </TableBody>

          </Table>
          </TableContainer>
        )}

      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            borderRadius: appTheme.radius.pill,
            background: "linear-gradient(135deg,#22D3EE,#3B82F6)",
            color: appTheme.colors.dark,
          }}
        >
          Fermer
        </Button>
      </DialogActions>

    </Dialog>
  );
}