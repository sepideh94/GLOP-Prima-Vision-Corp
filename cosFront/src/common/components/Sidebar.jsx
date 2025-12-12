import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
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
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: "#f4f6f8",
        },
      }}
    >
      <Box sx={{ overflowY: "auto", mt: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItemButton key={item.label} onClick={() => navigate(item.path)}>
              <ListItemIcon>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
