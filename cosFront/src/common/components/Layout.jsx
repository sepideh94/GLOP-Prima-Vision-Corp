import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="container py-4">
        <Outlet />
      </main>
      <footer className="text-center py-3 text-muted border-top">
        © 2025 CiblOrgaSport 
      </footer>
    </>
  );
}
