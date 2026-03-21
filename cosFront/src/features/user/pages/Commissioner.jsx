import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { EmojiEvents, People } from "@mui/icons-material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DescriptionIcon from "@mui/icons-material/Description";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import appTheme from "../../../common/theme/appTheme";
import commissionerAccreditationService from "../services/commissionerAccreditationService";

export default function Commissioner() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [accreditationStatusLoading, setAccreditationStatusLoading] = useState(true);
  const [hasAccreditationDocument, setHasAccreditationDocument] = useState(false);

  const sections = [
    {
      title: "Gestion des compétitions et épreuves",
      subtitle: "Organisation et suivi",
      icon: <EmojiEvents sx={{ fontSize: 42 }} />,
      color: appTheme.colors.green,
      route: "/commissioner/competitions",
    },
    {
      title: "Gestion des athlètes",
      subtitle: "Inscriptions et confirmations",
      icon: <People sx={{ fontSize: 42 }} />,
      color: appTheme.colors.cyan,
      route: "/commissioner/participants",
    },
  ];

  const refreshAccreditationStatus = async () => {
    setAccreditationStatusLoading(true);
    try {
      await commissionerAccreditationService.downloadMyAccreditation();
      setHasAccreditationDocument(true);
    } catch {
      setHasAccreditationDocument(false);
    } finally {
      setAccreditationStatusLoading(false);
    }
  };

  useEffect(() => {
    refreshAccreditationStatus();
  }, []);

  const openBlob = (blob, filename) => {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const handleChooseAccreditation = () => {
    setUploadError("");
    setUploadSuccess("");
    fileInputRef.current?.click();
  };

  const handleAccreditationUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadError("");
    setUploadSuccess("");
    try {
      await commissionerAccreditationService.uploadMyAccreditation(file);
      setUploadSuccess(
        "Document CEN envoyé. Un administrateur doit maintenant valider votre accréditation."
      );
      setHasAccreditationDocument(true);
    } catch (err) {
      setUploadError(
        err.response?.data?.message ||
          "Impossible d'envoyer le document d'accréditation."
      );
    } finally {
      setUploadLoading(false);
      event.target.value = "";
    }
  };

  const handleDownloadAccreditation = async () => {
    setUploadError("");
    setUploadSuccess("");
    try {
      const blob = await commissionerAccreditationService.downloadMyAccreditation();
      openBlob(blob, "accreditation-cen");
      setHasAccreditationDocument(true);
    } catch (err) {
      setHasAccreditationDocument(false);
      setUploadError(
        err.response?.data?.message ||
          "Aucun document d'accréditation disponible pour le moment."
      );
    }
  };

  return (
    <Box>
      <Typography
        sx={{
          fontSize: 32,
          fontWeight: 900,
          mb: 3,
        }}
      >
        Tableau de bord du Commissaire
      </Typography>

      <Box
        sx={{
          mb: 5,
          p: 3,
          borderRadius: 4,
          background: appTheme.gradients.card,
          boxShadow: appTheme.shadows.card,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <VerifiedUserIcon sx={{ color: appTheme.colors.violet, fontSize: 28 }} />
            <Typography
              sx={{
                fontSize: 21,
                fontWeight: 900,
                color: appTheme.colors.textPrimary,
                lineHeight: 1.1,
              }}
            >
              Accréditation CEN
            </Typography>
          </Box>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.8,
              px: 1.8,
              py: 0.7,
              borderRadius: appTheme.radius.pill,
              fontSize: 12.5,
              fontWeight: 900,
              letterSpacing: 0.2,
              background: accreditationStatusLoading
                ? "#e2e8f0"
                : hasAccreditationDocument
                ? "#86efac"
                : "#fca5a5",
              border: accreditationStatusLoading
                ? "1px solid #94a3b8"
                : hasAccreditationDocument
                ? "1px solid #16a34a"
                : "1px solid #dc2626",
              boxShadow: accreditationStatusLoading
                ? "0 2px 10px rgba(148,163,184,0.35)"
                : hasAccreditationDocument
                ? "0 2px 12px rgba(22,163,74,0.35)"
                : "0 2px 12px rgba(220,38,38,0.35)",
              color: "#0f172a",
            }}
          >
            <VerifiedUserIcon sx={{ fontSize: 16, color: "#0f172a" }} />
            {accreditationStatusLoading
              ? "Statut: vérification..."
              : hasAccreditationDocument
              ? "Statut: document soumis"
              : "Statut: document manquant"}
          </Box>
        </Box>

        <Typography sx={{ color: appTheme.colors.textSecondary, mb: 2.5, maxWidth: 900 }}>
          Pour garantir la conformité réglementaire, merci de soumettre votre document d'accréditation CEN.
          Tant que cette accréditation n'est pas validée par un administrateur, certaines actions resteront bloquées.
        </Typography>

        {uploadError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {uploadError}
          </Alert>
        )}
        {uploadSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {uploadSuccess}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            onClick={handleChooseAccreditation}
            disabled={uploadLoading}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1.1,
              borderRadius: appTheme.radius.pill,
              background: "linear-gradient(135deg, #22D3EE, #3B82F6)",
              color: appTheme.colors.dark,
            }}
            startIcon={
              uploadLoading ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />
            }
          >
            {hasAccreditationDocument ? "Remplacer mon accréditation" : "Soumettre mon accréditation"}
          </Button>
          <Button
            onClick={handleDownloadAccreditation}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1.1,
              borderRadius: appTheme.radius.pill,
              background: "linear-gradient(135deg, #86efac, #4ade80)",
              color: "#064e3b",
            }}
            startIcon={<DescriptionIcon />}
          >
            Voir mon document actuel
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {sections.map((s) => (
          <Grid
            item
            xs={12}
            md={6}
            key={s.title}
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Card
              sx={{
                width: 260,
                height: 170,
                borderRadius: 4,
                background: appTheme.gradients.card,
                boxShadow: appTheme.shadows.card,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Barre colorée */}
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 24,
                  bottom: 24,
                  width: 4,
                  borderRadius: 6,
                  background: s.color,
                }}
              />

              <CardActionArea
                onClick={() => navigate(s.route)}
                sx={{ height: "100%" }}
              >
                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    pt: 3,
                    pl: 3,
                    pr: 3,
                    color: appTheme.colors.textPrimary,
                  }}
                >
                  {/* Icône */}
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: s.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1.5,
                      color: "#020617",
                    }}
                  >
                    {s.icon}
                  </Box>

                  {/* Titre */}
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: 14,
                      lineHeight: 1.3,
                      mb: 0.5,
                    }}
                  >
                    {s.title}
                  </Typography>

                  {/* Sous-titre */}
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      color: appTheme.colors.textMuted,
                      lineHeight: 1.3,
                    }}
                  >
                    {s.subtitle}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleAccreditationUpload}
      />
    </Box>
  );
}
