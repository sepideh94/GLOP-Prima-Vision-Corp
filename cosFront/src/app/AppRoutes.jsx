import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../features/home/pages/HomePage';
import LoginPage from '../features/user/pages/LoginPage';
import NotFound from '../features/home/pages/NotFound';

export default function AppRoutes() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}