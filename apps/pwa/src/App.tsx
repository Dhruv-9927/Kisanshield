import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { Home } from './screens/Home';
import { CropMind } from './screens/CropMind';
import { ClimateGuard } from './screens/ClimateGuard';
import { FraudSense } from './screens/FraudSense';
import { MandiBridge } from './screens/MandiBridge';
import { CarbonKisan } from './screens/CarbonKisan';
import { Profile } from './screens/Profile';
import { Onboarding } from './screens/Onboarding';
import type { FarmerProfile } from './lib/types';
import './index.css';

// Profile is stored fully in localStorage — no Supabase auth needed
const LOCAL_PROFILE_KEY = 'kisanshield_profile';

type AppState = 'loading' | 'onboarding' | 'ready';

function App() {
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [elderMode, setElderMode] = useState(false);
  const [appState, setAppState] = useState<AppState>('loading');

  useEffect(() => {
    // Load profile from localStorage immediately — instant, no network needed
    const raw = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (raw) {
      try {
        const profile: FarmerProfile = JSON.parse(raw);
        if (profile.name && profile.district) {
          setFarmer(profile);
          setElderMode(profile.accessibility_mode?.elder ?? false);
          setAppState('ready');
          return;
        }
      } catch {
        // Corrupted data — clear and re-onboard
        localStorage.removeItem(LOCAL_PROFILE_KEY);
      }
    }
    setAppState('onboarding');
  }, []);

  const handleOnboardingComplete = (completedFarmer: FarmerProfile) => {
    setFarmer(completedFarmer);
    setElderMode(completedFarmer.accessibility_mode?.elder ?? false);
    setAppState('ready');
  };

  const handleLogout = () => {
    localStorage.removeItem(LOCAL_PROFILE_KEY);
    setFarmer(null);
    setElderMode(false);
    setAppState('onboarding');
  };

  const handleElderModeToggle = (val: boolean) => {
    setElderMode(val);
    if (farmer) {
      const updated = { ...farmer, accessibility_mode: { ...farmer.accessibility_mode, elder: val } };
      setFarmer(updated);
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));
    }
  };

  const handleProfileUpdate = (updated: FarmerProfile) => {
    setFarmer(updated);
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));
  };

  // Loading screen
  if (appState === 'loading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>🌾</div>
        <div style={{ fontSize: '20px', fontWeight: 600 }}>KisanShield</div>
        <div style={{ color: 'var(--color-muted)', fontSize: '14px' }}>लोड हो रहा है...</div>
      </div>
    );
  }

  // Onboarding screen
  if (appState === 'onboarding') {
    return (
      <BrowserRouter>
        <Onboarding onComplete={handleOnboardingComplete} />
      </BrowserRouter>
    );
  }

  // Main app
  return (
    <BrowserRouter>
      <div className={elderMode ? 'elder-mode' : ''}>
        <Routes>
          <Route path="/"           element={<Home farmer={farmer} elderMode={elderMode} />} />
          <Route path="/cropmind"   element={<CropMind farmer={farmer} />} />
          <Route path="/climate"    element={<ClimateGuard farmer={farmer} />} />
          <Route path="/fraudsense" element={<FraudSense farmer={farmer} />} />
          <Route path="/mandi"      element={<MandiBridge farmer={farmer} />} />
          <Route path="/carbon"     element={<CarbonKisan farmer={farmer} />} />
          <Route path="/profile"    element={
            <Profile
              farmer={farmer}
              elderMode={elderMode}
              onElderModeToggle={handleElderModeToggle}
              onLogout={handleLogout}
              onProfileUpdate={handleProfileUpdate}
            />
          } />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
