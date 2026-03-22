import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import {
  Event,
  EmojiEvents,
  People,
  VolunteerActivism,
  Schedule,
  ReportProblem,
  Assessment,
} from "@mui/icons-material";
import { Event, EmojiEvents, People, VolunteerActivism, Schedule, ReportProblem, Stadium, Map } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import appTheme from "../../../common/theme/appTheme";

export default function Admin() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Gestion des événements",
      subtitle: "Créer, planifier et organiser",
      icon: <Event sx={{ fontSize: 42 }} />,
      color: appTheme.colors.cyan,
      route: "/events",
    },
    {
      title: "Dashboard et Reporting",
      subtitle: "Indicateurs, graphiques et export PDF",
      icon: <Assessment sx={{ fontSize: 42 }} />,
      color: "#3B82F6",
      route: "/admin/dashboard",
    },
    {
      title: "Gestion des compétitions et épreuves",
      subtitle: "Suivi sportif et résultats",
      icon: <EmojiEvents sx={{ fontSize: 42 }} />,
      color: appTheme.colors.green,
      route: "/admin/competitions",
    },
    {
      title: "Gestion des volontaires",
      subtitle: "Import et création des volontaires",
      icon: <VolunteerActivism sx={{ fontSize: 42 }} />,
      color: appTheme.colors.yellow,
      route: "/admin/volunteers",
    },
    {
      title: "Gestion des incidents",
      subtitle: "Déclarer et suivre les incidents",
      icon: <ReportProblem sx={{ fontSize: 42 }} />,
      color: "#ef4444",
      route: "/admin/incidents",
    },
    {
      title: "Gestion des utilisateurs",
      subtitle: "Contrôler les accès et maintenir la sécurité",
      icon: <People sx={{ fontSize: 42 }} />,
      color: appTheme.colors.violet,
      route: "/admin/users",
    },
    {
      title: "Planning des volontaires",
      subtitle: "Gérer les horaires et affectations",
      icon: <Schedule sx={{ fontSize: 42 }} />,
      color: "#f97316",
      route: "/admin/schedules/create",
    },
    {
      title: "Fan Zones",
      subtitle: "Créer et gérer les espaces spectateurs",
      icon: <Stadium sx={{ fontSize: 42 }} />,
      color: "#ec4899",
      route: "/admin/fan-zones",
    },
    {
      title: "Carte opérations",
      subtitle: "Épreuves, fan zones et suivi athlètes",
      icon: <Map sx={{ fontSize: 42 }} />,
      color: "#6366f1",
      route: "/admin/map",
    },
  ];

  return (
    <Box>
      <Typography
        sx={{
          fontSize: 32,
          fontWeight: 900,
          mb: 7,
        }}
      >
        Tableau de bord
      </Typography>

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
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    pl: 3,
                    height: "100%",
                  }}
                >
                  <Box sx={{ color: s.color, mb: 1 }}>{s.icon}</Box>

                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: 14,
                      lineHeight: 1.3,
                      mb: 0.5,
                      color: "#ffffff",
                    }}
                  >
                    {s.title}
                  </Typography>

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
    </Box>
  );
}
