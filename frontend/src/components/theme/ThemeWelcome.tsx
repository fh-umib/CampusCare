import { CampusCareLogoMark } from '../brand/CampusCareLogoMark';
import { useTheme, type Theme } from '../../context/ThemeContext';

function ChoiceIcon({ theme }: { theme: Theme }) {
  return theme === 'light' ? <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg> : <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21 12.8A8.4 8.4 0 1 1 11.2 3 6.8 6.8 0 0 0 21 12.8Z"/></svg>;
}

export function ThemeWelcome() {
  const { setTheme } = useTheme();
  const choices: Array<{ theme: Theme; label: string; description: string }> = [
    { theme: 'light', label: 'Light Mode', description: 'Bright, clear and focused.' },
    { theme: 'dark', label: 'Dark Mode', description: 'Calm, comfortable and easy on the eyes.' }
  ];
  return <main className="cc-theme-welcome">
    <section className="cc-theme-welcome-card" aria-labelledby="theme-welcome-title">
      <div className="cc-theme-welcome-brand"><CampusCareLogoMark size={54} variant="dark" /><span>CampusCare</span></div>
      <p className="cc-theme-kicker">Your CampusCare experience</p>
      <h1 id="theme-welcome-title">Welcome to CampusCare</h1>
      <blockquote>“Your space for support, balance, and growth.”</blockquote>
      <p className="cc-theme-intro">Choose how you want to experience CampusCare.</p>
      <div className="cc-theme-choices">
        {choices.map((choice) => <button key={choice.theme} className={`cc-theme-choice cc-theme-choice-${choice.theme}`} type="button" onClick={() => setTheme(choice.theme)} aria-label={`Continue in ${choice.label}`}>
          <span className="cc-theme-choice-icon"><ChoiceIcon theme={choice.theme}/></span>
          <strong>{choice.label}</strong><span>{choice.description}</span>
          <i>Continue <span aria-hidden="true">→</span></i>
        </button>)}
      </div>
      <p className="cc-theme-note">You can change this later from the theme control.</p>
    </section>
  </main>;
}
