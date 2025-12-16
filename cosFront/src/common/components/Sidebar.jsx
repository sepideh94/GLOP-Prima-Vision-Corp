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

const drawerWidth = 240;

export default function Sidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = user?.role || "GUEST";
  const menuItems = sidebarConfig[role] || [];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          background: "#ECFDF5",
          borderRight: "1px solid rgba(0,0,0,0.05)",
        },
      }}
    >
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
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
            <ListItemIcon sx={{ color: "#65A30D" }}>
              <item.icon />
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
