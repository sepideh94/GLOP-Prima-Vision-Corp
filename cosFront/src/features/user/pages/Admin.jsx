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
import { AddCircleOutline, Event, Report, Map, People, Timeline, CalendarMonth } from "@mui/icons-material";

export default function Admin() {
  const sections = [
    { title: "Créer des commissaires", icon: <People />, color: "#1976d2" },
    { title: "Créer / Modifier un évènement", icon: <Event />, color: "#0288d1" },
    { title: "Suivi des indicateurs quotidiens", icon: <Timeline />, color: "#00796b" },
    { title: "Déclarer / Gérer un incident", icon: <Report />, color: "#d32f2f" },
    { title: "Créer le planning des acteurs", icon: <CalendarMonth />, color: "#7b1fa2" },
    { title: "Générer un rapport pour le comité", icon: <AddCircleOutline />, color: "#512da8" },
    { title: "Gérer les infos sur la carte", icon: <Map />, color: "#455a64" },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f9fafb" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: "border-box", bgcolor: "#f4f6f8" },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            Tableau Admin
          </Typography>
        </Box>
        <List>
          {sections.map((section, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton>
                <ListItemText primary={section.title} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Tableau de bord de l’administrateur
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
                <CardActionArea>
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

        <Box sx={{ mt: 5, textAlign: "center" }}>
          <Button variant="contained" color="primary">
            Voir le rapport global
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
