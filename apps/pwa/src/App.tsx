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
import { getFarmerByPhone } from './lib/services/farmerService';
import type { FarmerProfile } from './lib/types';
import './index.css';

// Demo farmer phone for hackathon (in production: use OTP auth)
const DEMO_PHONE = '+919876543210';

type AppState = 'loading' | 'onboarding' | 'ready';

function App() {
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [elderMode, setElderMode] = useState(false);
  const [appState, setAppState] = useState<AppState>('loading');

  useEffect(() => {
    (async () => {
      const profile = await getFarmerByPhone(DEMO_PHONE);
      if (!profile || !profile.name || !profile.district ||
          profile.name.trim() === '' || profile.district.trim() === '' ||
          profile.name === 'Ramu Kaka' || profile.name === 'Kisan Bhai') {
        // No profile or incomplete — show onboarding
        setFarmer(profile); // may be null, onboarding handles both cases
        setAppState('onboarding');
      } else {
        setFarmer(profile);
        setElderMode(profile.accessibility_mode?.elder ?? false);
        setAppState('ready');
      }
    })();
  }, []);

  const handleOnboardingComplete = (completedFarmer: FarmerProfile) => {
    setFarmer(completedFarmer);
    setElderMode(completedFarmer.accessibility_mode?.elder ?? false);
    setAppState('ready');
  };

  const handleLogout = () => {
    setFarmer(null);
    setElderMode(false);
    setAppState('onboarding');
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
        <Onboarding
          existingFarmer={farmer}
          phone={DEMO_PHONE}
          onComplete={handleOnboardingComplete}
        />
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
          <Route path="/profile"    element={<Profile farmer={farmer} elderMode={elderMode} onElderModeToggle={setElderMode} onLogout={handleLogout} />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
