import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { FarmerProfile } from '../lib/types';
import './Profile.css';

interface OnboardingProps {
  farmer: FarmerProfile;
  onComplete: (updatedFarmer: FarmerProfile) => void;
}

export const Onboarding = ({ farmer, onComplete }: OnboardingProps) => {
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !district.trim()) return;

    setIsSubmitting(true);
    const { data, error } = await supabase
      .from('farmers')
      .update({ name: name.trim(), district: district.trim(), state: 'India' })
      .eq('id', farmer.id)
      .select()
      .single();

    setIsSubmitting(false);

    if (error) {
      alert('Error saving profile. Please try again.');
    } else if (data) {
      onComplete(data);
    }
  };

  return (
    <div className="profile-page fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="page-content" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌾</div>
          <h1 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--color-ink)' }}>नमस्ते / Welcome</h1>
          <p style={{ color: 'var(--color-muted)', marginBottom: '32px' }}>
            कृपया अपना नाम और जिला दर्ज करें ताकि हम आपको सटीक मौसम और मंडी की जानकारी दे सकें।
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>आपका नाम (Name)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="उदा. राम कुमार"
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-dust)', fontSize: '16px', background: 'var(--color-surface)', color: 'var(--color-ink)' }}
              />
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>आपका जिला (District)</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="उदा. Bareilly"
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-dust)', fontSize: '16px', background: 'var(--color-surface)', color: 'var(--color-ink)' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting || !name.trim() || !district.trim()}
              style={{ marginTop: '16px', padding: '14px', fontSize: '16px' }}
            >
              {isSubmitting ? 'सेव हो रहा है...' : 'शुरू करें / Start'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
