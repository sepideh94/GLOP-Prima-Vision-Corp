import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import { Event, EmojiEvents } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Gestion des événements",
      icon: <Event sx={{ fontSize: 40 }} />,
      route: "/events",
    },
    {
      title: "Gestion des compétitions",
      icon: <EmojiEvents sx={{ fontSize: 40 }} />,
      route: "/admin/competitions",
    },
  ];

  return (
    <Box>
      <Typography
        sx={{
          fontSize: "26px",
          fontWeight: 700,
          mb: 4,
          color: "#020617",
        }}
      >
        Tableau de bord
      </Typography>

      <Grid container spacing={4}>
        {sections.map((section) => (
          <Grid item xs={12} md={6} key={section.title}>
            <Card
              sx={{
                height: 180,
                borderRadius: "22px",
                background:
                  "linear-gradient(135deg, #E0F2FE 0%, #DCFCE7 100%)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(section.route)}
                sx={{ height: "100%" }}
              >
                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#020617",
                  }}
                >
                  {section.icon}
                  <Typography sx={{ mt: 2, fontWeight: 600 }}>
                    {section.title}
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
