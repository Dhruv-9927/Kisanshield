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
            <div className="farmer-location">{farmer?.district ? `📍 ${farmer.district}, ${farmer.state}` : 'Location not set'}</div>
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

        {/* Location Settings */}
        <div className="settings-section card">
          <h2 className="section-title">📍 स्थान / Location</h2>
          <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
            <div className="setting-hint">अपना जिला दर्ज करें ताकि हम मौसम का सटीक अनुमान दे सकें (Enter your district for accurate weather):</div>
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <input 
                type="text" 
                placeholder="District (e.g. Bareilly)" 
                className="location-input"
                defaultValue={farmer?.district ?? ''}
                onBlur={async (e) => {
                  const val = e.target.value.trim();
                  if (val && farmer && val !== farmer.district) {
                    await supabase.from('farmers').update({ district: val }).eq('id', farmer.id);
                    alert('स्थान सहेजा गया! / Location saved!');
                    window.location.reload();
                  }
                }}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--color-dust)', fontSize: '16px', background: 'var(--color-surface)', color: 'var(--color-ink)' }}
              />
            </div>
          </div>
        </div>

        <div className="profile-footer">
          <span>KisanShield v1.0.0</span>
          <span style={{ color: 'var(--color-muted)' }}>हर किसान की रक्षा करना हमारा संकल्प है</span>
        </div>
      </div>
    </div>
  );
};
