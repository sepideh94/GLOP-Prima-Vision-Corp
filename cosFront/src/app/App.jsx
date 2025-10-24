import AuthProvider from "../common/contexts/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/user/pages/LoginPage.jsx";

//Page temporaire juste pour tester la redirection après connexion 
function AdminPage() {
  return (
    <div className="container mt-5 text-center">
      <h1>Page Admin</h1>
      <p>Redirection réussie</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
