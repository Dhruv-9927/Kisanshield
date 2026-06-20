import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { FarmerProfile } from '../lib/types';
import './Profile.css';

interface OnboardingProps {
  existingFarmer: FarmerProfile | null; // null = no record yet, needs insert
  phone: string;
  onComplete: (farmer: FarmerProfile) => void;
}

export const Onboarding = ({ existingFarmer, phone, onComplete }: OnboardingProps) => {
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !district.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    let data: FarmerProfile | null = null;
    let error: { message: string } | null = null;

    if (existingFarmer) {
      // Record exists — just update it
      const res = await supabase
        .from('farmers')
        .update({ name: name.trim(), district: district.trim(), state: 'India' })
        .eq('id', existingFarmer.id)
        .select()
        .single();
      data = res.data;
      error = res.error;
    } else {
      // No record yet — insert fresh
      const res = await supabase
        .from('farmers')
        .insert([{ phone, name: name.trim(), district: district.trim(), state: 'India' }])
        .select()
        .single();
      data = res.data;
      error = res.error;
    }

    setIsSubmitting(false);

    if (error || !data) {
      console.error('Onboarding save error:', error);
      setErrorMsg('प्रोफ़ाइल सहेजने में त्रुटि हुई। कृपया दोबारा कोशिश करें। (Error saving profile, please retry.)');
    } else {
      onComplete(data);
    }
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

            {errorMsg && (
              <div style={{ color: '#e53e3e', fontSize: '14px', background: '#fff5f5', padding: '10px', borderRadius: '8px' }}>
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !name.trim() || !district.trim()}
              style={{ padding: '15px', fontSize: '17px', marginTop: '8px', borderRadius: '10px' }}
            >
              {isSubmitting ? '⏳ सेव हो रहा है...' : '🚀 शुरू करें / Let\'s Start'}
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
