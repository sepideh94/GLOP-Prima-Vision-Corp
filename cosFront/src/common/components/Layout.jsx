import { Box } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      
      <Sidebar />

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        
        <Navbar />

        <Box sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5" }}>
          <Outlet />
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}
