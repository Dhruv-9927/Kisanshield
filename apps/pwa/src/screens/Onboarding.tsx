import { useState } from 'react';
import type { FarmerProfile } from '../lib/types';
import './Profile.css';

// localStorage key for storing full farmer profile locally
const LOCAL_PROFILE_KEY = 'kisanshield_profile';

interface OnboardingProps {
  onComplete: (farmer: FarmerProfile) => void;
}

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !district.trim()) return;

    setIsSubmitting(true);

    // Generate a unique ID for this user on this device
    const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const profile: FarmerProfile = {
      id: localId,
      phone: localId,
      name: name.trim(),
      district: district.trim(),
      state: 'India',
      lat: null,
      lng: null,
      language: 'hi',
      accessibility_mode: { elder: false },
      created_at: new Date().toISOString(),
    };

    // Save entire profile to localStorage — no Supabase needed!
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));

    setIsSubmitting(false);
    onComplete(profile);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card" style={{ padding: '36px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>🌾</div>
          <h1 style={{ fontSize: '26px', marginBottom: '8px' }}>नमस्ते / Welcome</h1>
          <p style={{ color: 'var(--color-muted)', marginBottom: '28px', lineHeight: 1.6 }}>
            KisanShield में आपका स्वागत है!<br />
            कृपया अपना नाम और जिला दर्ज करें।
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                👤 आपका नाम (Your Name)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="उदा. राम कुमार"
                required
                autoFocus
                style={{
                  width: '100%',
                  padding: '13px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--color-dust)',
                  fontSize: '16px',
                  background: 'var(--color-surface)',
                  color: 'var(--color-ink)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                📍 आपका जिला (District)
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="उदा. Bareilly, Delhi, Pune..."
                required
                style={{
                  width: '100%',
                  padding: '13px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--color-dust)',
                  fontSize: '16px',
                  background: 'var(--color-surface)',
                  color: 'var(--color-ink)',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '4px' }}>
                यह मौसम और मंडी भाव के लिए उपयोग होगा।
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !name.trim() || !district.trim()}
              style={{ padding: '15px', fontSize: '17px', marginTop: '8px', borderRadius: '10px' }}
            >
              {isSubmitting ? '⏳ सेव हो रहा है...' : "🚀 शुरू करें / Let's Start"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--color-muted)', fontSize: '13px' }}>
          KisanShield v1.0.0 — हर किसान की रक्षा करना हमारा संकल्प है
        </div>
      </div>
    </div>
  );
};
