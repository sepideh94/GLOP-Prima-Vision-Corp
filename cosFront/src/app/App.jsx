import AuthProvider from "../common/contexts/AuthContext";
import GoogleMapsProvider from "../common/components/GoogleMapsProvider";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "../common/components/PrivateRoute.jsx";

import Layout from "../common/components/Layout";

import HomePage from "../features/home/pages/HomePage.jsx";
import LoginPage from "../features/user/pages/LoginPage.jsx";
import SignUpPage from "../features/user/pages/SignUpPage.jsx";
import ForgotPasswordPage from "../features/user/pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../features/user/pages/ResetPasswordPage.jsx";

import Admin from "../features/user/pages/Admin.jsx";
import Athlete from "../features/user/pages/Athlete.jsx";
import Commissioner from "../features/user/pages/Commissioner.jsx";
import Spectator from "../features/user/pages/Spectator.jsx";
import Volunteer from "../features/user/pages/Volunteer.jsx";

import EventsList from "../features/events/pages/EventsList.jsx";
import CompetitionListPage from "../features/competition/pages/CompetitionListPage.jsx";
import TrialListPage from "../features/trial/pages/TrialListPage.jsx";
import UsersManagementPage from "../features/user/pages/UsersManagementPage.jsx";
import VolunteerSchedulePage from "../features/user/pages/VolunteerSchedulePage.jsx";
import IncidentsPage from "../features/incident/pages/IncidentsPage.jsx";

import CommissionerCompetitionListPage from
  "../features/competition/pages/CommissionerCompetitionListPage.jsx";

import CommissionerTrialListPage from
  "../features/trial/pages/CommissionerTrialListPage.jsx";

import CommissionerParticipantsPage from
  "../features/participant/pages/CommissionerParticipantsPage.jsx";

import VolunteersPage from
  "../features/volunteer/pages/VolunteersPage.jsx";

import AthleteCompetitionsPage from
  "../features/athlete/pages/AthleteCompetitionsPage.jsx";

import ProfilePage from "../features/athlete/pages/ProfilePage.jsx";
import AthleteSchedulePage from "../features/athlete/pages/AthleteSchedulePage.jsx";
import AdminCreateSchedulePage from "../features/schedule/pages/AdminCreateSchedulePage.jsx";
import AdminFanZonePage from "../features/map/pages/AdminFanZonePage.jsx";
import AdminMapPage from "../features/map/pages/AdminMapPage.jsx";

import EventDetailsPage from "../features/spectator/pages/EventDetailsPage.jsx";
import CompetitionResultsPage from "../features/spectator/pages/CompetitionResultsPage.jsx";
import SpectatorProfilePage from "../features/spectator/pages/SpectatorProfilePage.jsx";
import SpectatorMapPage from "../features/map/pages/SpectatorMapPage.jsx";


export default function App() {
  return (
    <GoogleMapsProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>

              <Route path="/admin" element={<Admin />} />
              <Route path="/athlete" element={<Athlete />} />
              <Route path="/commissioner" element={<Commissioner />} />
              <Route path="/spectator" element={<Spectator />} />
              <Route path="/volunteer" element={<Volunteer />} />

              <Route path="/events" element={<EventsList />} />
              <Route
                path="/admin/competitions"
                element={<CompetitionListPage />}
              />
              <Route
                path="/admin/competitions/:competitionId/trials"
                element={<TrialListPage />}
              />
              <Route
               path="/admin/volunteers"
               element={<VolunteersPage />}
              />

              <Route
               path="/admin/incidents"
               element={<IncidentsPage />}
              />
              
              <Route
                path="/admin/users"
                element={<UsersManagementPage />}
              />
              <Route
                path="/admin/volunteer-schedule"
                element={<VolunteerSchedulePage />}
              />
              <Route
                path="/admin/schedules/create"
                element={<AdminCreateSchedulePage />}
              />
              <Route
                path="/admin/fan-zones"
                element={<AdminFanZonePage />}
              />
              <Route
                path="/admin/map"
                element={<AdminMapPage />}
              />

              <Route
                path="/commissioner/competitions"
                element={<CommissionerCompetitionListPage />}
              />
              <Route
                path="/commissioner/competitions/:competitionId/trials"
                element={<CommissionerTrialListPage />}
              />
              <Route
                path="/commissioner/participants"
                element={<CommissionerParticipantsPage />}
              />

              <Route
                path="/athlete/competitions"
                element={<AthleteCompetitionsPage />}
              />
              <Route
                path="/athlete/profile"
                element={<ProfilePage />}
              />
              <Route
                path="/athlete/schedule/:competitionId"
                element={<AthleteSchedulePage />}
              />
              {/* SPECTATOR */}
              <Route
                path="/spectator/events/:eventId"
                element={<EventDetailsPage />}
              />
              <Route
                path="/spectator/competitions/:competitionId"
                element={<CompetitionResultsPage />}
              />
              <Route
                path="/spectator/profile"
                element={<SpectatorProfilePage />}
              />
              <Route
                path="/spectator/map"
                element={<SpectatorMapPage />}
              />

            </Route>
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </GoogleMapsProvider>
  );
}