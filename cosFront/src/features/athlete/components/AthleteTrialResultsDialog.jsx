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
import appTheme from "../../../common/theme/appTheme";

export default function AthleteTrialResultsDialog({
  open,
  onClose,
  trial,
  loading,
  error,
  results,
}) {
  const getMedal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

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
  const modeLabel = trial?.mode === "TEAM" || hasTeamResults ? "Équipe" : "Individuel";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
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
            "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(59,130,246,0.12))",
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
              Mes résultats
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              {trial?.trialName}
            </Typography>
          </Box>
        </Box>

        {performanceLabel ? (
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
                color: "#DDD6FE",
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
              color: "#DDD6FE",
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

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : !results || results.length === 0 ? (
          <Typography sx={{ textAlign: "center", py: 3 }}>
            Aucun résultat disponible pour cette épreuve.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Rang</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Epreuve</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Performance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Typography fontWeight={700}>
                      {getMedal(r.rank)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>
                      {r.participant?.displayName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{r.performance}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

