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
} from "@mui/material";

import {
  Event,
  EmojiEvents,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

export default function Admin() {

  const navigate = useNavigate();

  const sections = [
    { title: "Créer / Modifier un évènement", icon: <Event />, color: "#0288d1", route: "/events" },
    { title: "Gérer les compétitions", icon: <EmojiEvents />, color: "#ff9800", key: "competitions"},
  ];

  const handleClick = (section) => {
    if (section.key === "competitions") {
      navigate("/admin/competitions");
      return;
    }
    if (section.route) {
      navigate(section.route);
    }
  };

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
            Tableau Admin
          </Typography>
        </Box>
        <List>
          {sections.map((section, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton onClick={() => handleClick(section)}>
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
                <CardActionArea onClick={() => handleClick(section)}>
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
    </Box>
  );
}
