import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import DashboardPage from '../pages/DashboardPage';
import HelpRequestsPage from '../pages/HelpRequestsPage';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import LostFoundPage from '../pages/LostFoundPage';
import MoodCampusPage from '../pages/MoodCampusPage';
import OnboardingPage from '../pages/OnboardingPage';
import ProfilePage from '../pages/ProfilePage';
import RegisterPage from '../pages/RegisterPage';
import RoleEntryPage from '../pages/RoleEntryPage';
import SkillMapPage from '../pages/SkillMapPage';
import StressTrackerPage from '../pages/StressTrackerPage';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/start" element={<RoleEntryPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/silent-help" element={<HelpRequestsPage />} />
          <Route path="/skill-map" element={<SkillMapPage />} />
          <Route path="/stress-tracker" element={<StressTrackerPage />} />
          <Route path="/mood-campus" element={<MoodCampusPage />} />
          <Route path="/lost-found" element={<LostFoundPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
