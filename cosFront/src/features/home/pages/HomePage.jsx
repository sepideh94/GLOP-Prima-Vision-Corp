import { Box, Typography, Button, Container, Grid, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import EventIcon from "@mui/icons-material/Event";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import appTheme from "../../../common/theme/appTheme";

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      title: "Suivi des compétitions",
      description: "Consultez le calendrier des compétitions et les informations clés de chaque événement en quelques clics simples.",
      color: appTheme.colors.cyan,
    },
    {
      icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
      title: "Billets numériques",
      description: "Retrouvez vos billets au même endroit et gardez une trace de vos participations aux événements sportifs variés.",
      color: appTheme.colors.violet,
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: "Expérience spectateur",
      description: "Une interface pensée pour les spectateurs avec accès rapide aux compétitions suivies et informations importantes.",
      color: appTheme.colors.green,
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: "Sécurité & Accès",
      description: "Système d'authentification robuste avec gestion des rôles et permissions pour une sécurité optimale complète.",
      color: appTheme.colors.cyan,
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: "Suivi des Résultats",
      description: "Consultez les résultats, programmes et informations de vos événements en temps réel pour tous les spectateurs.",
      color: appTheme.colors.violet,
    },
    {
      icon: <SportsScoreIcon sx={{ fontSize: 40 }} />,
      title: "Tout au même endroit",
      description: "Une application unique pour suivre vos compétitions, retrouver vos billets et accéder aux résultats en direct complet.",
      color: appTheme.colors.green,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: appTheme.gradients.page,
        fontFamily: appTheme.typography.fontFamily,
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          px: { xs: 3, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: "center",
              maxWidth: "900px",
              mx: "auto",
            }}
          >
            {/* Badge */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 3,
                py: 1,
                borderRadius: "999px",
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                mb: 4,
              }}
            >
              <SportsScoreIcon sx={{ fontSize: 20, color: appTheme.colors.cyan }} />
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: appTheme.colors.textPrimary,
                }}
              >
                CiblOrgaSport
              </Typography>
            </Box>

            {/* Main Title */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "4rem", lg: "5rem" },
                fontWeight: 900,
                lineHeight: 1.1,
                mb: 3,
                background: `linear-gradient(135deg, ${appTheme.colors.textPrimary} 0%, ${appTheme.colors.cyan} 50%, ${appTheme.colors.green} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Plateforme digitale des{" "}
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(135deg, ${appTheme.colors.green} 0%, ${appTheme.colors.cyan} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                événements sportifs
              </Box>
            </Typography>

            {/* Subtitle */}
            <Typography
              sx={{
                fontSize: { xs: "1rem", md: "1.25rem" },
                color: appTheme.colors.textSecondary,
                mb: 5,
                maxWidth: "700px",
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              Retrouvez toutes les informations essentielles, accédez à vos services et suivez vos événements sportifs en quelques clics.
              Tout votre univers sportif, réuni en un seul endroit.
            </Typography>

            {/* CTA Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
                mb: 8,
              }}
            >
              <Button
                onClick={() => navigate("/login")}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textTransform: "none",
                  background: appTheme.gradients.navbar,
                  color: "#020617",
                  boxShadow: "0 10px 30px rgba(34, 211, 238, 0.3)",
                  "&:hover": {
                    background: appTheme.gradients.navbar,
                    transform: "translateY(-2px)",
                    boxShadow: "0 15px 40px rgba(34, 211, 238, 0.4)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Se connecter
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                variant="outlined"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textTransform: "none",
                  border: `2px solid ${appTheme.colors.green}`,
                  color: appTheme.colors.green,
                  background: "transparent",
                  "&:hover": {
                    border: `2px solid ${appTheme.colors.green}`,
                    background: "rgba(163, 230, 53, 0.1)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                S'inscrire
              </Button>
            </Box>

            {/* Stats or Tags */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {["Programmes", "Événements", "Résultats", "Participants"].map((tag) => (
                <Box
                  key={tag}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: "999px",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: appTheme.colors.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {tag}
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 6 },
          background: "rgba(255, 255, 255, 0.3)",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2rem", md: "3rem" },
                fontWeight: 800,
                mb: 2,
                color: appTheme.colors.dark,
              }}
            >
              Fonctionnalités principales
            </Typography>
            <Typography
              sx={{
                fontSize: "1.125rem",
                color: appTheme.colors.textSecondary,
                maxWidth: "600px",
                mx: "auto",
              }}
            >
              Une application dédiée aux spectateurs pour suivre les compétitions, conserver ses billets et consulter les résultats en direct.
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ alignItems: "stretch" }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: "flex" }}>
                <Card
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: appTheme.gradients.card,
                    borderRadius: appTheme.radius.lg,
                    boxShadow: appTheme.shadows.card,
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: `0 25px 50px rgba(0,0,0,0.4), 0 0 0 2px ${feature.color}40`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", flex: 1 }}>
                    <Box
                      sx={{
                        color: feature.color,
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 1.5,
                        color: appTheme.colors.textPrimary,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: appTheme.colors.textSecondary,
                        fontSize: "0.9375rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 6 },
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: "center",
              p: { xs: 4, md: 6 },
              borderRadius: appTheme.radius.lg,
              background: appTheme.gradients.card,
              boxShadow: appTheme.shadows.card,
              border: "1px solid rgba(148, 163, 184, 0.1)",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "1.75rem", md: "2.5rem" },
                fontWeight: 800,
                mb: 2,
                color: appTheme.colors.textPrimary,
              }}
            >
              Prêt à commencer ?
            </Typography>
            <Typography
              sx={{
                fontSize: "1.125rem",
                color: appTheme.colors.textSecondary,
                mb: 4,
              }}
            >
              Rejoignez CiblOrgaSport dès aujourd'hui pour suivre vos compétitions préférées et ne rien manquer des résultats.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                onClick={() => navigate("/signup")}
                sx={{
                  px: 5,
                  py: 1.5,
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textTransform: "none",
                  background: appTheme.gradients.navbar,
                  color: "#020617",
                  boxShadow: "0 10px 30px rgba(34, 211, 238, 0.3)",
                  "&:hover": {
                    background: appTheme.gradients.navbar,
                    transform: "translateY(-2px)",
                    boxShadow: "0 15px 40px rgba(34, 211, 238, 0.4)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Créer un compte
              </Button>
              <Button
                onClick={() => navigate("/login")}
                variant="outlined"
                sx={{
                  px: 5,
                  py: 1.5,
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textTransform: "none",
                  border: `2px solid ${appTheme.colors.cyan}`,
                  color: appTheme.colors.cyan,
                  background: "transparent",
                  "&:hover": {
                    border: `2px solid ${appTheme.colors.cyan}`,
                    background: "rgba(34, 211, 238, 0.1)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Se connecter
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 4,
          px: 3,
          textAlign: "center",
          background: "rgba(226, 232, 240, 0.5)",
          borderTop: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <Typography
          sx={{
            color: "#475569",
            fontSize: "0.875rem",
          }}
        >
          © 2025 CiblOrgaSport — Plateforme de gestion sportive
        </Typography>
      </Box>
    </Box>
  );
}
