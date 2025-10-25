import AuthProvider from "../common/contexts/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/user/pages/LoginPage.jsx";

import Admin from "../features/user/pages/Admin.jsx";
import Athlete from "../features/user/pages/Athlete.jsx";
import Commissioner from "../features/user/pages/Commissioner.jsx";
import Spectator from "../features/user/pages/Spectator.jsx";
import Volunteer from "../features/user/pages/Volunteer.jsx";




// //Page temporaire juste pour tester la redirection après connexion 
// function AdminPage() {
//   return (
//     <div className="container mt-5 text-center">
//       <h1>Page Admin</h1>
//       <p>Redirection réussie</p>
//     </div>
//   );
// }

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/athlete" element={<Athlete />} />   
          <Route path="/commissioner" element={<Commissioner />} />
          <Route path="/spectator" element={<Spectator />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
