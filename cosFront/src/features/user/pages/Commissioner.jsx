import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
} from "@mui/material";
import {
  EditCalendar,
  UploadFile,
  ListAlt,
  NotificationImportant,
  CheckCircle,
  PlaylistAddCheck,
  Publish,
  Login,
} from "@mui/icons-material";
import { useState } from "react";

export default function Commissioner() {
  const features = [
    { title: "Modifier / Annuler une épreuve", icon: <EditCalendar />, color: "#1976d2" },
    { title: "Importer le fichier d’inscription des athlètes", icon: <UploadFile />, color: "#0288d1" },
    { title: "Consulter la liste des participants", icon: <ListAlt />, color: "#00796b" },
    { title: "Relancer les participants non conformes", icon: <NotificationImportant />, color: "#d32f2f" },
    { title: "Vérifier la conformité des participants", icon: <CheckCircle />, color: "#7b1fa2" },
    { title: "Saisir les résultats des épreuves manuellement", icon: <PlaylistAddCheck />, color: "#512da8" },
    { title: "Valider et publier les résultats automatiquement", icon: <Publish />, color: "#455a64" },
  ];

  const [showAuth, setShowAuth] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f9fafb" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 240,
            boxSizing: "border-box",
            bgcolor: "#f4f6f8",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            Espace Gestion
          </Typography>
        </Box>
        <List>
          {features.map((feature, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton>
                <ListItemText primary={feature.title} />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding>
            <ListItemButton onClick={() => setShowAuth(!showAuth)}>
              <Login sx={{ mr: 1 }} />
              <ListItemText primary="S'authentifier" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
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
              Cette action est requise avant d’accéder aux fonctionnalités du commissaire.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => setShowAuth(false)}>
              Se connecter
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
