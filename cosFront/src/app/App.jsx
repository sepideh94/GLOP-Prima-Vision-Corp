import AuthProvider from "../common/contexts/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "../common/components/PrivateRoute.jsx";
import Layout from "../common/components/Layout.jsx";
import LoginPage from "../features/user/pages/LoginPage.jsx";
import SignUpPage from "../features/user/pages/SignUpPage.jsx";

import Admin from "../features/user/pages/Admin.jsx";
import Athlete from "../features/user/pages/Athlete.jsx";
import Commissioner from "../features/user/pages/Commissioner.jsx";
import Spectator from "../features/user/pages/Spectator.jsx";
import Volunteer from "../features/user/pages/Volunteer.jsx";
import EventsList from "../features/events/pages/EventsList.jsx";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          <Route element={<PrivateRoute />}>
           <Route element={<Layout />}>
             <Route path="/admin" element={<Admin />} />
             <Route path="/events" element={<EventsList />} />
             <Route path="/athlete" element={<Athlete />} />   
             <Route path="/commissioner" element={<Commissioner />} />
             <Route path="/spectator" element={<Spectator />} />
             <Route path="/volunteer" element={<Volunteer />} />
            </Route>
          </Route>
          
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
