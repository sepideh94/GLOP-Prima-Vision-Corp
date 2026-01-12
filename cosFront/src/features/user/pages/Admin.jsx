
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import { Event, EmojiEvents, People } from "@mui/icons-material";
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
      title: "Gestion des compétitions et épreuves",
      subtitle: "Suivi sportif et résultats",
      icon: <EmojiEvents sx={{ fontSize: 42 }} />,
      color: appTheme.colors.green,
      route: "/admin/competitions",
    },
    {
      title: "Gestion des utilisateurs",
      subtitle: "Contrôler les accès et maintenir la sécurité",
      icon: <People sx={{ fontSize: 42 }} />,
      color: appTheme.colors.violet,
      route: "/admin/users",
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
          <Grid item xs={12} md={6} key={s.title} sx={{ display: "flex" }}>
            <Card
              sx={{
                width: "100%",
                height: 220,
                borderRadius: appTheme.radius.lg,
                background: appTheme.gradients.card,
                boxShadow: appTheme.shadows.card,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 36,      
                bottom: 36,    
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
                  justifyContent: "center",
                  color: appTheme.colors.textPrimary,
              }}
            >
           <Box
              sx={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  background: s.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                  color: "#020617",
              }}
            >
               {s.icon}
           </Box>
           <Typography sx={{ fontWeight: 700 }}>
              {s.title}
           </Typography>
           <Typography sx={{ fontSize: 13, color: appTheme.colors.textMuted }}>
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
