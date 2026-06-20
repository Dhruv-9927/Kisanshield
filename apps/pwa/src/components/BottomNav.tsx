import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';

const NAV_ITEMS = [
  { path: '/',           icon: '🏠', label: 'होम',     label_en: 'Home',     id: 'nav-home' },
  { path: '/cropmind',   icon: '🌿', label: 'फसल',     label_en: 'Crop',     id: 'nav-crop' },
  { path: '/fraudsense', icon: '🛡️', label: 'सुरक्षा', label_en: 'Shield',   id: 'nav-shield' },
  { path: '/mandi',      icon: '📊', label: 'मंडी',    label_en: 'Mandi',    id: 'nav-mandi' },
  { path: '/profile',    icon: '👤', label: 'प्रोफ़ाइल', label_en: 'Profile',  id: 'nav-profile' },
] as const;

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {NAV_ITEMS.map(({ path, icon, label, label_en, id }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            id={id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(path)}
            aria-label={`${label_en} — ${label}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
