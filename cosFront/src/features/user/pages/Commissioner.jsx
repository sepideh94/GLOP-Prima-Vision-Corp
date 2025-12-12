import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
} from "@mui/material";

import {
  EditCalendar
} from "@mui/icons-material";

import { useState } from "react";

export default function Commissioner() {
  const [showAuth, setShowAuth] = useState(false);

  const features = [
    { title: "Gérer les épreuves", icon: <EditCalendar />, color: "#1976d2" },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Tableau de bord du Commissaire
      </Typography>

      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                transition: "0.3s",
                "&:hover": { transform: "scale(1.03)" },
              }}
            >
              <CardActionArea>
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <Box
                    sx={{
                      mb: 2,
                      fontSize: 50,
                      color: feature.color,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {feature.title}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {showAuth && (
        <Box
          sx={{
            mt: 5,
            p: 3,
            borderRadius: 2,
            bgcolor: "#e3f2fd",
            boxShadow: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" mb={2}>
            S’authentifier
          </Typography>
          <Typography variant="body1" mb={2}>
            Cette action est requise avant d’accéder aux fonctionnalités.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowAuth(false)}
          >
            Se connecter
          </Button>
        </Box>
      )}
    </Box>
  );
}
