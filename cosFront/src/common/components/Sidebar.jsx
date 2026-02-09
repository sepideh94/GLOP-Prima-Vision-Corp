import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import sidebarConfig from "./sidebarConfig";
import appTheme from "../theme/appTheme";

const drawerWidth = 240;

export default function Sidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || "GUEST";

  // Générer les initiales du nom
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  // Obtenir le nom d'affichage
  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "Utilisateur";
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          background: appTheme.gradients.sidebar,
          color: appTheme.colors.textSecondary,
          mt: "64px",          
          height: "calc(100% - 64px)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Menu de navigation */}
      <List sx={{ mt: 2, flex: 1 }}>
        {(sidebarConfig[role] || []).map((item) => (
          <ListItemButton
            key={item.label}
            onClick={() => navigate(item.path)}
            sx={{
              mx: 1,
              borderRadius: 2,
              "&:hover": {
                background: "rgba(34,211,238,0.15)",
              },
            }}
          >
            <ListItemIcon sx={{ color: appTheme.colors.green }}>
              <item.icon />
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      {/* Menu Profile avec Avatar + Nom en bas - Uniquement pour les athlètes */}
      {user && user.role && user.role.toUpperCase() === "ATHLETE" && (
        <>
          <Divider sx={{ borderColor: "rgba(148,163,184,0.2)", mx: 2 }} />
          <Box
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              onClick={() => navigate("/athlete/profile")}
              sx={{
                borderRadius: 2,
                width: "calc(100% - 16px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 2,
                px: 1,
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  background: "rgba(34,211,238,0.15)",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: appTheme.colors.green,
                  color: appTheme.colors.dark,
                  fontWeight: 700,
                  fontSize: 18,
                  mb: 1,
                }}
              >
                {getInitials()}
              </Avatar>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: appTheme.colors.textPrimary,
                  textAlign: "center",
                  mb: 0.5,
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  px: 1,
                }}
              >
                {getDisplayName()}
              </Typography>
              <Typography
                sx={{
                  fontSize: 10,
                  color: appTheme.colors.textMuted,
                  textAlign: "center",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Mon profil
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Drawer>
  );
}
