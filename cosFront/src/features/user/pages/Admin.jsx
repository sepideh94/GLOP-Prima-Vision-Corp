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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  AddCircleOutline,
  Event,
  Report,
  Map,
  People,
  Timeline,
  CalendarMonth,
  Group,
  EmojiEvents,
} from "@mui/icons-material";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

async function fetchUsers() {

  const users = [
    { email: "admin@cos.com", role: "ADMIN" },
    { email: "commissaire@cos.com", role: "COMMISSAIRE" },
    { email: "athlete@cos.com", role: "ATHLETE" },
    { email: "spectateur@cos.com", role: "SPECTATEUR" },
    { email: "volontaire@cos.com", role: "VOLONTAIRE" },
  ];
  return Promise.resolve(users);
}

export default function Admin() {

  const navigate = useNavigate();

  const sections = [
    { title: "Créer / Modifier un évènement", icon: <Event />, color: "#0288d1", route: "/events" },
    { title: "Gérer les compétitions", icon: <EmojiEvents />, color: "#ff9800", key: "competitions"},
    { title: "Créer des commissaires", icon: <People />, color: "#1976d2" },
    { title: "Suivi des indicateurs quotidiens", icon: <Timeline />, color: "#00796b" },
    { title: "Déclarer / Gérer un incident", icon: <Report />, color: "#d32f2f" },
    { title: "Créer le planning des acteurs", icon: <CalendarMonth />, color: "#7b1fa2" },
    { title: "Générer un rapport pour le comité", icon: <AddCircleOutline />, color: "#512da8" },
    { title: "Gérer les infos sur la carte", icon: <Map />, color: "#455a64" },
    { title: "Afficher les utilisateurs", icon: <Group />, color: "#388e3c", key: "users" },
  ];

  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);

  const handleShowUsers = async () => {
    if (!showUsers) {
      const data = await fetchUsers();
      setUsers(data);
    }
    setShowUsers(!showUsers);
  };

  const handleClick = (section) => {
    if (section.key === "competitions") {
      navigate("/admin/competitions");
    }
    if (section.key === "users") {
      handleShowUsers();
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

        {showUsers && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Liste des utilisateurs et leurs rôles
            </Typography>

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: "#e3f2fd" }}>
                  <TableRow>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Rôle</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Button variant="outlined" color="secondary" onClick={handleShowUsers}>
                Masquer les utilisateurs
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
