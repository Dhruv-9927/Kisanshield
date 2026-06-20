import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CropHealthRing } from '../components/CropHealthRing';
import { ModuleCard } from '../components/ModuleCard';
import { VoiceButton } from '../components/VoiceButton';
import type { FarmHealthScore, FarmerProfile, WeatherForecast } from '../lib/types';
import { getWeatherForecast } from '../lib/services/weatherService';
import './Home.css';

interface HomeProps {
  farmer: FarmerProfile | null;
  elderMode: boolean;
}

const MODULES = [
  { path: '/cropmind',    icon: '🌿', name: 'CropMind',    name_hindi: 'फसल जाँच',     description: 'Identify crop diseases instantly', color: 'var(--color-leaf)',    isLive: true,  id: 'module-cropmind' },
  { path: '/climate',     icon: '⛈️', name: 'ClimateGuard', name_hindi: 'मौसम सुरक्षा', description: 'Hyperlocal weather alerts',         color: 'var(--color-sky)',     isLive: true,  id: 'module-climate' },
  { path: '/fraudsense',  icon: '🛡️', name: 'FraudSense',  name_hindi: 'धोखा रोकें',    description: 'Scam interception & reporting',    color: 'var(--color-shield)',  isLive: false, id: 'module-fraud' },
  { path: '/mandi',       icon: '📊', name: 'MandiBridge',  name_hindi: 'मंडी भाव',      description: 'Live & predicted market prices',   color: 'var(--color-turmeric)', isLive: true, id: 'module-mandi' },
  { path: '/carbon',      icon: '🌱', name: 'CarbonKisan',  name_hindi: 'कार्बन क्रेडिट', description: 'Earn carbon credits for practices', color: 'var(--color-carbon)', isLive: false, id: 'module-carbon' },
];

export const Home = ({ farmer, elderMode }: HomeProps) => {
  const navigate = useNavigate();
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [healthScore] = useState<FarmHealthScore>({
    overall: 84,
    crop_health: 91,
    weather_safety: 62,
    fraud_protection: 98,
    status: 'good',
    status_hindi: 'अच्छा 👍',
  });

  useEffect(() => {
    const lat = farmer?.lat ?? 28.3670;
    const lng = farmer?.lng ?? 79.4304;
    const district = farmer?.district ?? 'Bareilly';
    getWeatherForecast(lat, lng, district).then(setWeather);
  }, [farmer]);

  const greeting = getGreeting();
  const farmerName = farmer?.name ?? 'Kisan Bhai';

  return (
    <div className={`home-page ${elderMode ? 'elder-mode' : ''}`}>
      {/* Top Bar */}
      <header className="home-topbar">
        <div className="home-topbar-left">
          <span className="topbar-logo">🌾</span>
          <span className="topbar-brand">KisanShield</span>
        </div>
        <div className="home-topbar-right">
          <button id="notifications-btn" className="topbar-icon-btn" aria-label="Notifications">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button id="profile-btn" className="topbar-icon-btn" onClick={() => navigate('/profile')} aria-label="Profile">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        </div>
      </header>

      <main className="home-content page-content">
        {/* Greeting */}
        <div className="home-greeting fade-in">
          <h1 className="greeting-text">{greeting}, {farmerName} 🌾</h1>
          <p className="greeting-sub">
            {farmer?.district ? `${farmer.district}, ${farmer.state}` : 'Bareilly, UP'} &nbsp;|&nbsp; Wheat Season
          </p>
        </div>

        {/* Critical Weather Alert Banner */}
        {weather?.alert_level === 'CRITICAL' && (
          <div className="alert-banner critical slide-up" role="alert">
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <div>
              <strong>ALERT</strong> — {weather.current.condition_hindi}
              <div style={{ fontSize: '13px', marginTop: '2px' }}>{weather.action_hindi}</div>
            </div>
          </div>
        )}

        {/* Health Ring */}
        <div className="home-health-section">
          <CropHealthRing score={healthScore} />
          <div className="health-sub-scores">
            <div className="sub-score">
              <span className="sub-score-icon">🌿</span>
              <span className="sub-score-value">{healthScore.crop_health}%</span>
              <span className="sub-score-label">फसल</span>
            </div>
            <div className="sub-score">
              <span className="sub-score-icon">⛈️</span>
              <span className="sub-score-value">{healthScore.weather_safety}%</span>
              <span className="sub-score-label">मौसम</span>
            </div>
            <div className="sub-score">
              <span className="sub-score-icon">🛡️</span>
              <span className="sub-score-value">{healthScore.fraud_protection}%</span>
              <span className="sub-score-label">सुरक्षा</span>
            </div>
          </div>
        </div>

        {/* Module Cards */}
        <div className="home-modules">
          <h2 className="section-title">आपकी सेवाएं</h2>
          <div className="modules-list">
            {MODULES.map(m => (
              <ModuleCard
                key={m.path}
                id={m.id}
                icon={m.icon}
                name={m.name}
                name_hindi={m.name_hindi}
                description={m.description}
                color={m.color}
                isLive={m.isLive}
                lastActivity={m.path === '/cropmind' ? '2 days ago' : undefined}
                onClick={() => navigate(m.path)}
              />
            ))}
          </div>
        </div>
      </main>

      <VoiceButton onTranscript={(text) => {
        if (text.toLowerCase().includes('फसल') || text.toLowerCase().includes('crop')) navigate('/cropmind');
        else if (text.toLowerCase().includes('मौसम') || text.toLowerCase().includes('weather')) navigate('/climate');
        else if (text.toLowerCase().includes('भाव') || text.toLowerCase().includes('mandi')) navigate('/mandi');
        else if (text.toLowerCase().includes('धोखा') || text.toLowerCase().includes('fraud')) navigate('/fraudsense');
        else if (text.toLowerCase().includes('carbon') || text.toLowerCase().includes('कार्बन')) navigate('/carbon');
      }} />
    </div>
  );
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'नमस्ते';
  if (hour < 17) return 'नमस्कार';
  return 'प्रणाम';
}
