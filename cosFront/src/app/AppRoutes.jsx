import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../features/home/pages/HomePage';
import LoginPage from '../features/user/pages/LoginPage';
import SignUpPage from '../features/user/pages/SignUpPage';
import Admin from '../features/user/pages/Admin';
import Spectator from '../features/user/pages/Spectator';
import Athlete from '../features/user/pages/Athlete';
import Commissioner from '../features/user/pages/Commissioner';
import Volunteer from '../features/user/pages/Volunteer';
import EventsList from '../features/events/pages/EventsList';
import CompetitionListPage from '../features/competition/pages/CompetitionListPage';
import UsersManagementPage from '../features/user/pages/UsersManagementPage';
import NotFound from '../features/home/pages/NotFound';

export default function AppRoutes() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/competitions" element={<CompetitionListPage />} />
        <Route path="/admin/users" element={<UsersManagementPage />} />
        <Route path="/events" element={<EventsList />} />
        <Route path="/spectator" element={<Spectator />} />
        <Route path="/athlete" element={<Athlete />} />
        <Route path="/commissioner" element={<Commissioner />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}