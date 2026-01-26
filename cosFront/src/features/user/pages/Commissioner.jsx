import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import { EmojiEvents, People } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import appTheme from "../../../common/theme/appTheme";

export default function Commissioner() {
  const navigate = useNavigate();

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

  return (
    <Box>
      <Typography
        sx={{
          fontSize: 32,
          fontWeight: 900,
          mb: 7,
        }}
      >
        Tableau de bord du Commissaire
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
    </Box>
  );
}
