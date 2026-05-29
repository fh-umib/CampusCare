import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import DashboardPage from '../pages/DashboardPage';
import HelpRequestsPage from '../pages/HelpRequestsPage';
import LoginPage from '../pages/LoginPage';
import LostFoundPage from '../pages/LostFoundPage';
import MoodCampusPage from '../pages/MoodCampusPage';
import RegisterPage from '../pages/RegisterPage';
import SkillMapPage from '../pages/SkillMapPage';
import StressTrackerPage from '../pages/StressTrackerPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/silent-help" element={<HelpRequestsPage />} />
        <Route path="/skill-map" element={<SkillMapPage />} />
        <Route path="/stress-tracker" element={<StressTrackerPage />} />
        <Route path="/mood-campus" element={<MoodCampusPage />} />
        <Route path="/lost-found" element={<LostFoundPage />} />
      </Route>
    </Routes>
  );
}

