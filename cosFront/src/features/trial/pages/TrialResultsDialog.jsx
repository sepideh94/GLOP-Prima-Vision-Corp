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
  TableContainer,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
  Divider,
  InputAdornment,
  Alert,
  Stack,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import EditIcon from "@mui/icons-material/Edit";
import appTheme from "../../../common/theme/appTheme";
import trialService from "../services/trialService";

export default function TrialResultsDialog({ open, onClose, trial, onSaved }) {

  const [participants, setParticipants] = useState([]);
  const [performanceType, setPerformanceType] = useState("TIME");
  const [values, setValues] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [participantsError, setParticipantsError] = useState(null);
  const [hasExistingResults, setHasExistingResults] = useState(false);
  const [rowLocked, setRowLocked] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const btnGreen = {
    mb: 0.5,
    textTransform: "none",
    fontWeight: 700,
    px: 3,
    py: 1.1,
    minWidth: 130,
    borderRadius: appTheme.radius.pill,
    background: "linear-gradient(135deg, #86efac, #4ade80)",
    color: "#064e3b",
    boxShadow: "0 6px 16px rgba(74,222,128,0.35)",
    "&:hover": { background: "linear-gradient(135deg, #4ade80, #22c55e)" },
  };

  const btnBlue = {
    mb: 0.5,
    textTransform: "none",
    fontWeight: 700,
    minWidth: 130,
    px: 3,
    py: 1.1,
    borderRadius: appTheme.radius.pill,
    background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
    color: appTheme.colors.dark,
    "&:disabled": {
      opacity: 0.55,
      color: "rgba(0,0,0,0.55)",
    },
  };

  useEffect(() => {
    if (!trial || !open) return;

    setLoadingParticipants(true);
    setParticipants([]);
    setValues({});
    setFieldErrors({});
    setSubmitError(null);
    setParticipantsError(null);
    setHasExistingResults(false);
    setRowLocked({});

    trialService.getParticipants(trial.id)
      .then((data) => {

        const filtered = data.filter((p) => {
          if (trial.mode === "INDIVIDUAL") {
            return p.competitorType === "ATHLETE";
          }
          if (trial.mode === "TEAM") {
            return p.competitorType === "TEAM";
          }
          return true;
        });

        setParticipants(filtered);

        const initial = {};
        filtered.forEach((p) => {
          initial[p.id] = "";
        });
        setValues(initial);
        setFieldErrors({});

        if (filtered.length > 0) {
          // Charger d'éventuels résultats existants pour pré-remplir et verrouiller
          trialService
            .getResults(trial.id)
            .then((results) => {
              if (!Array.isArray(results) || results.length === 0) {
                setHasExistingResults(false);
                setRowLocked({});
                return;
              }

              const byParticipant = {};
              const locked = {};

              results.forEach((r) => {
                const participantId = r?.participant?.id;
                if (!participantId) return;
                const perfRaw = String(r.performance ?? "");
                const numericPart = parseFloat(
                  perfRaw.replace(/[^\d,.\-]/g, "").replace(",", ".")
                );
                if (!Number.isNaN(numericPart)) {
                  byParticipant[participantId] = String(numericPart);
                  locked[participantId] = true;
                }
              });

              if (Object.keys(byParticipant).length > 0) {
                setHasExistingResults(true);
                setValues((prev) => ({ ...prev, ...byParticipant }));
                setRowLocked(locked);
              }
            })
            .catch(() => {
              // Si l'appel échoue, on considère qu'il n'y a pas de résultats existants
              setHasExistingResults(false);
              setRowLocked({});
            });
        }
      })
      .catch((e) => {
        setParticipants([]);
        const status = e?.response?.status;
        if (status === 401) {
          setParticipantsError("Session expirée. Veuillez vous reconnecter.");
          return;
        }
        if (status === 403) {
          setParticipantsError("Accès refusé. Vous devez être commissaire.");
          return;
        }
        setParticipantsError(
          "Impossible de charger les participants. Réessayez dans quelques instants."
        );
      })
      .finally(() => setLoadingParticipants(false));

  }, [trial, open]);

  const normalizeNumberInput = (raw) => String(raw ?? "").trim().replace(",", ".");

  const validateValue = (raw) => {
    const v = normalizeNumberInput(raw);
    if (v === "") return "Champ obligatoire";
    if (!/^\d+(\.\d+)?$/.test(v)) return "Format invalide (ex: 10.01)";
    const n = Number(v);
    if (Number.isNaN(n)) return "Valeur invalide";
    if (n < 0) return "La valeur doit être ≥ 0";
    return null;
  };

  const extractBackendMessage = (data) => {
    if (!data) return null;
    if (typeof data === "string") return data;
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error === "string") return data.error;
    if (typeof data?.title === "string") return data.title;
    if (Array.isArray(data?.errors)) {
      const parts = data.errors
        .map((x) => (typeof x === "string" ? x : x?.message))
        .filter(Boolean);
      if (parts.length) return parts.join(" | ");
    }
    return null;
  };

  const handleChange = (id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    setFieldErrors((prev) => ({ ...prev, [id]: validateValue(value) }));
    setSubmitError(null);
  };

  const isTime = performanceType === "TIME";
  const unitLabel = isTime ? "secondes" : "points";
  const unitAdornment = isTime ? "s" : "pts";
  const performanceChipLabel = isTime ? "Temps" : "Points";

  const hasAnyError = participants.some((p) => Boolean(fieldErrors[p.id]));
  const isSubmitDisabled =
    loading ||
    loadingParticipants ||
    participants.length === 0 ||
    hasAnyError ||
    Object.keys(values).length === 0;

  const handleSubmit = async () => {

    if (participants.length === 0) {
      setSubmitError("Aucun participant assigné à cette épreuve.");
      return;
    }

    const nextErrors = {};
    participants.forEach((p) => {
      nextErrors[p.id] = validateValue(values[p.id]);
    });
    setFieldErrors(nextErrors);

    const invalidParticipant = participants.find((p) => nextErrors[p.id]);
    if (invalidParticipant) {
      setSubmitError(
        `Erreur de saisie pour "${invalidParticipant.displayName}" : ${nextErrors[invalidParticipant.id]}`
      );
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const payload = {
        performanceType,
        results: participants.map((p) => ({
          trialParticipantId: p.id,
          performanceValue: Number(normalizeNumberInput(values[p.id])),
        })),
      };

      if (hasExistingResults) {
        await trialService.updateResults(trial.id, payload);
      } else {
        await trialService.saveResults(trial.id, payload);
      }

      onClose();
      onSaved && onSaved(); // 🔥 ouvre classement auto

    } catch (e) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      const backendMessage = extractBackendMessage(data);

      if (status === 400) {
        setSubmitError(
          `Enregistrement refusé (400). Vérifiez que l'épreuve est bien terminée, que la date autorise la modification et que toutes les valeurs sont valides.${backendMessage ? ` Détail: ${backendMessage}` : ""}`
        );
        return;
      }
      if (status === 401) {
        setSubmitError("Session expirée. Veuillez vous reconnecter.");
        return;
      }
      if (status === 403) {
        setSubmitError("Accès refusé. Vous devez être commissaire pour enregistrer des résultats.");
        return;
      }
      if (status === 404) {
        setSubmitError("Épreuve introuvable (404). Actualisez la page et réessayez.");
        return;
      }

      setSubmitError(
        `Erreur lors de l'enregistrement${status ? ` (HTTP ${status})` : ""}${backendMessage ? ` : ${backendMessage}` : ""}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      sx={{
        "& .MuiDialog-container": {
          "& .MuiDialog-paper": {
            width: "92%",
            maxWidth: "980px",
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
              Saisir les résultats
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              {trial?.name || "Épreuve"} —{" "}
              {trial?.mode === "TEAM" ? "Équipe" : "Individuel"}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={`Performance : ${performanceChipLabel}`}
          size="small"
          sx={{
            fontWeight: 800,
            borderRadius: appTheme.radius.pill,
            background: "rgba(34, 211, 238, 0.14)",
            border: "1px solid rgba(34, 211, 238, 0.35)",
          }}
        />
      </DialogTitle>

      <DialogContent dividers>

        {participantsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {participantsError}
          </Alert>
        )}

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2.2,
            borderRadius: 3,
            background: "rgba(15,23,42,0.02)",
            border: "1px solid rgba(15,23,42,0.06)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="flex-start"
          >
            <Box sx={{ flex: 1, minWidth: 260 }}>
              <TextField
                select
                fullWidth
                label="Type de performance"
                value={performanceType}
                onChange={(e) => {
                  setPerformanceType(e.target.value);
                  setSubmitError(null);
                  // On garde les valeurs, mais on recalcul les erreurs pour garder des messages cohérents
                  setFieldErrors((prev) => {
                    const updated = { ...prev };
                    participants.forEach((p) => {
                      updated[p.id] = validateValue(values[p.id]);
                    });
                    return updated;
                  });
                }}
                helperText={
                  isTime
                    ? "Saisir un temps en secondes (ex : 10.01)"
                    : "Saisir un score en points (ex : 9.75)"
                }
              >
                <MenuItem value="TIME">Temps</MenuItem>
                <MenuItem value="POINTS">Points</MenuItem>
              </TextField>
            </Box>
          </Stack>
        </Paper>

        {loadingParticipants ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : participants.length === 0 ? (
          <Typography sx={{ textAlign: "center", color: "text.secondary", py: 4 }}>
            Aucun participant assigné à cette épreuve.
          </Typography>
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
                <TableCell sx={{ fontWeight: 900, background: "#fff" }}>
                  Performance ({unitLabel})
                </TableCell>
                {hasExistingResults && (
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 900, background: "#fff" }}
                  >
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {participants.map((p, index) => (
                <TableRow
                  key={p.id}
                  sx={{
                    "&:hover": { background: "rgba(34, 211, 238, 0.06)" },
                  }}
                >

                  <TableCell>{index + 1}</TableCell>

                  <TableCell>
                    <Typography fontWeight={600}>
                      {p.displayName}
                    </Typography>

                    {trial.mode === "TEAM" && p.members && (
                      <Typography sx={{ fontSize: "0.8rem", color: "#666" }}>
                        {p.members.map(m => m.firstName).join(", ")}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell width={260}>
                    <TextField
                      fullWidth
                      type="number"
                      inputProps={{
                        min: 0,
                        step: 0.01,
                        inputMode: "decimal",
                      }}
                      placeholder={isTime ? "ex: 10.01" : "ex: 9.75"}
                      label={isTime ? "Temps" : "Points"}
                      value={values[p.id] || ""}
                      onChange={(e) => handleChange(p.id, e.target.value)}
                      disabled={hasExistingResults && rowLocked[p.id]}
                      error={Boolean(fieldErrors[p.id])}
                      helperText={fieldErrors[p.id] || " "}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {unitAdornment}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </TableCell>

                  {hasExistingResults && (
                    <TableCell align="right" width={90}>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() =>
                          setRowLocked((prev) => ({
                            ...prev,
                            [p.id]: !prev[p.id],
                          }))
                        }
                        sx={{
                          minWidth: "auto",
                          px: 1,
                          textTransform: "none",
                          fontSize: 12,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                        {rowLocked[p.id] ? "Modifier" : "Verrouiller"}
                      </Button>
                    </TableCell>
                  )}

                </TableRow>
              ))}
            </TableBody>
          </Table>
          </TableContainer>
        )}

      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} sx={btnGreen} disabled={loading}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} sx={btnBlue} disabled={isSubmitDisabled}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </DialogActions>

    </Dialog>
  );
}