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
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

export default function Admin() {

  const navigate = useNavigate();

  const sections = [
    { 
      title: "Gestion des évènements", 
      icon: <Event />, 
      color: "#0288d1", 
      route: "/events" 
    },
    { 
      title: "Gestion descompétitions", 
      icon: <EmojiEvents />, 
      color: "#ff9800", 
      route: "/admin/competitions" 
    }
  ];

return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Tableau de bord Administrateur
      </Typography>

      <Grid container spacing={3}>
        {sections.map((section, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                transition: "0.3s",
                "&:hover": { transform: "scale(1.03)" },
              }}
            >
              <CardActionArea onClick={() => navigate(section.route)}>
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <Box
                    sx={{
                      mb: 2,
                      fontSize: 50,
                      color: section.color,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {section.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
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