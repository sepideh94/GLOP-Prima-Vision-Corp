import { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import appTheme from "../../../common/theme/appTheme";

function ParticipantCell({ result, highlight = false }) {
  const p = result?.participant;
  const name = p?.displayName || "—";
  const isTeam = p?.competitorType === "TEAM";
  const members = Array.isArray(p?.members) ? p.members : [];

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
        {isTeam ? (
          <GroupsIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        ) : null}
        <Typography fontWeight={highlight ? 800 : 600}>{name}</Typography>
        {isTeam ? (
          <Chip label="Équipe" size="small" sx={{ height: 22, fontWeight: 700, fontSize: 11 }} />
        ) : null}
      </Box>
      {isTeam && members.length > 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
          {members.map((m) => [m.firstName, m.lastName].filter(Boolean).join(" ")).join(" · ")}
        </Typography>
      ) : null}
    </Box>
  );
}

export default function AthleteTrialResultsDialog({
  open,
  onClose,
  trial,
  loading,
  error,
  competitorsError,
  results,
  competitorResults = [],
}) {
  const getMedal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  const performanceType = results?.[0]?.performanceType || competitorResults?.[0]?.performanceType || null;
  const performanceLabel =
    performanceType === "TIME"
      ? "Temps"
      : performanceType === "POINTS"
        ? "Points"
        : null;

  const hasTeamResults =
    Array.isArray(results) &&
    results.some((r) => r?.participant?.competitorType === "TEAM");
  const hasTeamCompetitors =
    Array.isArray(competitorResults) &&
    competitorResults.some((r) => r?.participant?.competitorType === "TEAM");
  const modeLabel =
    trial?.mode === "TEAM" || hasTeamResults || hasTeamCompetitors ? "Équipe" : "Individuel";

  const myResultIds = useMemo(() => {
    const mine = Array.isArray(results) ? results : [];
    return new Set(mine.map((r) => r.id).filter((id) => id != null));
  }, [results]);

  const rankedRows = useMemo(() => {
    const mine = Array.isArray(results) ? results : [];
    const others = Array.isArray(competitorResults) ? competitorResults : [];
    const byId = new Map();
    [...mine, ...others].forEach((r) => {
      if (r && r.id != null && !byId.has(r.id)) byId.set(r.id, r);
    });
    return [...byId.values()].sort((a, b) => {
      const ra = a.rank ?? 9999;
      const rb = b.rank ?? 9999;
      if (ra !== rb) return ra - rb;
      return (a.id ?? 0) - (b.id ?? 0);
    });
  }, [results, competitorResults]);

  const hasAnyResults = rankedRows.length > 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          px: 3,
          py: 2.2,
          background: "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(59,130,246,0.12))",
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
              background: "rgba(34,197,94,0.16)",
              border: "1px solid rgba(34,197,94,0.28)",
            }}
          >
            <EmojiEventsIcon sx={{ color: appTheme.colors.green }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>
              Résultats de l&apos;épreuve
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              {trial?.trialName}
            </Typography>
          </Box>
        </Box>

        {performanceLabel ? (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
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
                color: "#5b21b6",
                border: "1px solid rgba(167, 139, 250, 0.42)",
              }}
            />
          </Box>
        ) : (
          <Chip
            label={modeLabel}
            size="small"
            sx={{
              fontWeight: 700,
              borderRadius: appTheme.radius.pill,
              background: "rgba(167, 139, 250, 0.17)",
              color: "#5b21b6",
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

        {competitorsError && !error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {competitorsError}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography sx={{ fontWeight: 900, fontSize: 15, mb: 0.5, color: "#0f172a" }}>
              Classement
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Retrouvez le classement officiel de cette épreuve et les performances qui y ont été
              publiées.
            </Typography>
            {!hasAnyResults ? (
              <Typography sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
                Aucun résultat disponible pour cette épreuve pour le moment.
              </Typography>
            ) : (
              <Table size="small" sx={{ borderCollapse: "separate", borderSpacing: 0 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Rang</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Participant</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rankedRows.map((r) => {
                    const isYou = myResultIds.has(r.id);
                    return (
                      <TableRow
                        key={r.id}
                        sx={
                          isYou
                            ? {
                                "& > td": {
                                  borderTop: "2px solid rgba(14, 165, 233, 0.55)",
                                  borderBottom: "2px solid rgba(14, 165, 233, 0.55)",
                                  bgcolor: "rgba(224, 242, 254, 0.65)",
                                },
                                "& > td:first-of-type": {
                                  borderLeft: "4px solid #0284c7",
                                  borderTopLeftRadius: 8,
                                  borderBottomLeftRadius: 8,
                                },
                                "& > td:last-of-type": {
                                  borderRight: "2px solid rgba(14, 165, 233, 0.45)",
                                  borderTopRightRadius: 8,
                                  borderBottomRightRadius: 8,
                                },
                              }
                            : undefined
                        }
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
                            <Typography fontWeight={700}>{getMedal(r.rank)}</Typography>
                            {isYou ? (
                              <Chip
                                label="Vous"
                                size="small"
                                sx={{
                                  height: 22,
                                  fontWeight: 800,
                                  fontSize: 11,
                                  bgcolor: "#0284c7",
                                  color: "#fff",
                                }}
                              />
                            ) : null}
                            {r.tie ? (
                              <Chip label="Ex aequo" size="small" sx={{ height: 20, fontSize: 10 }} />
                            ) : null}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <ParticipantCell result={r} highlight={isYou} />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={isYou ? 800 : 600}>{r.performance}</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </DialogContent>

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
