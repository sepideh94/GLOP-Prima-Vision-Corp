import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import sidebarConfig from "./sidebarConfig";
import appTheme from "../theme/appTheme";

const drawerWidth = 240;

export default function Sidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || "GUEST";

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
        },
      }}
    >
      <List sx={{ mt: 2 }}>
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
    </Drawer>
  );
}
