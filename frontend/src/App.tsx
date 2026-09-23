import { ScrollToTop } from './components/ScrollToTop';
import { AppRoutes } from './routes/AppRoutes';
import { ThemeWelcome } from './components/theme/ThemeWelcome';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { hasPreference } = useTheme();
  if (!hasPreference) return <ThemeWelcome />;
  return (
    <>
      <ScrollToTop />
      <AppRoutes />
    </>
  );
}
