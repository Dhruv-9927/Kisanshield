import { useNavigate } from 'react-router-dom';
import type { FarmerProfile } from '../lib/types';
import { supabase } from '../lib/supabase';
import './Profile.css';

interface ProfileProps {
  farmer: FarmerProfile | null;
  elderMode: boolean;
  onElderModeToggle: (v: boolean) => void;
}

export const Profile = ({ farmer, elderMode, onElderModeToggle }: ProfileProps) => {
  const navigate = useNavigate();

  const handleElderToggle = async () => {
    const newVal = !elderMode;
    onElderModeToggle(newVal);
    if (farmer) {
      await supabase.from('farmers').update({ accessibility_mode: { ...farmer.accessibility_mode, elder: newVal } }).eq('id', farmer.id);
    }
  };

  return (
    <div className="profile-page fade-in">
      <header className="page-header">
        <button id="profile-back" className="back-btn" onClick={() => navigate('/')} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1>👤 प्रोफ़ाइल / Profile</h1>
      </header>

      <div className="page-content">
        {/* Farmer Card */}
        <div className="farmer-card card">
          <div className="farmer-avatar" aria-hidden="true">🌾</div>
          <div className="farmer-info">
            <div className="farmer-name">{farmer?.name ?? 'Kisan Bhai'}</div>
            <div className="farmer-phone">{farmer?.phone ?? '—'}</div>
            <div className="farmer-location">{farmer?.district ? `${farmer.district}, ${farmer.state}` : 'Location not set'}</div>
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="settings-section card">
          <h2 className="section-title">♿ सुलभता / Accessibility</h2>

          <div className="setting-row">
            <div>
              <div className="setting-label">बड़ा मोड / Elder Mode</div>
              <div className="setting-hint">बड़े अक्षर, ज़्यादा जगह / Larger text & spacing</div>
            </div>
            <button
              id="elder-mode-toggle"
              className={`toggle-btn ${elderMode ? 'on' : 'off'}`}
              onClick={handleElderToggle}
              aria-pressed={elderMode}
            >
              {elderMode ? 'चालू' : 'बंद'}
            </button>
          </div>
        </div>

        {/* Tech Info */}
        <div className="tech-info card">
          <h2 className="section-title" style={{ fontSize: 'var(--text-body)' }}>🔧 Connected Services</h2>
          <div className="service-list">
            {[
              { name: 'Supabase', status: !!import.meta.env.VITE_SUPABASE_URL, label: 'Database' },
              { name: 'Groq AI', status: !!import.meta.env.VITE_GROQ_API_KEY && import.meta.env.VITE_GROQ_API_KEY !== 'ADD_YOUR_GROQ_KEY_HERE', label: 'AI Engine' },
              { name: 'Roboflow', status: !!import.meta.env.VITE_ROBOFLOW_API_KEY && import.meta.env.VITE_ROBOFLOW_API_KEY !== 'ADD_YOUR_ROBOFLOW_KEY_HERE', label: 'Crop Detection' },
              { name: 'OpenWeatherMap', status: !!import.meta.env.VITE_OPENWEATHERMAP_API_KEY && import.meta.env.VITE_OPENWEATHERMAP_API_KEY !== 'ADD_YOUR_OWM_KEY', label: 'Weather' },
              { name: 'Bhashini', status: !!import.meta.env.VITE_BHASHINI_API_KEY && import.meta.env.VITE_BHASHINI_API_KEY !== 'ADD_YOUR_BHASHINI_KEY', label: 'Hindi TTS' },
            ].map(s => (
              <div key={s.name} className="service-row">
                <span className="service-dot" style={{ background: s.status ? 'var(--color-sprout)' : 'var(--color-dust)' }} aria-hidden="true" />
                <span className="service-name">{s.name}</span>
                <span className="service-label-tag tag">{s.label}</span>
                <span className="service-status" style={{ color: s.status ? 'var(--color-sprout)' : 'var(--color-muted)' }}>
                  {s.status ? '✅ Connected' : '⚠️ Not set'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-footer">
          <span>KisanShield v1.0.0</span>
          <span>by Bharat Academix</span>
          <span style={{ color: 'var(--color-muted)' }}>हर किसान की रक्षा करना हमारा संकल्प है</span>
        </div>
      </div>
    </div>
  );
};
