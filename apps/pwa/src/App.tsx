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
import { getFarmerById } from './lib/services/farmerService';
import type { FarmerProfile } from './lib/types';
import './index.css';

// Each device stores its own farmer UUID in localStorage
const LOCAL_KEY = 'kisanshield_farmer_id';

type AppState = 'loading' | 'onboarding' | 'ready';

function App() {
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [elderMode, setElderMode] = useState(false);
  const [appState, setAppState] = useState<AppState>('loading');

  useEffect(() => {
    (async () => {
      // Check if this device already has a saved farmer ID
      const savedId = localStorage.getItem(LOCAL_KEY);

      if (savedId) {
        // Load that specific farmer from Supabase
        const profile = await getFarmerById(savedId);

        if (profile && profile.name && profile.district &&
            profile.name.trim() !== '' && profile.district.trim() !== '') {
          setFarmer(profile);
          setElderMode(profile.accessibility_mode?.elder ?? false);
          setAppState('ready');
          return;
        }
      }

      // No saved ID or incomplete profile — show onboarding
      setFarmer(null);
      setAppState('onboarding');
    })();
  }, []);

  const handleOnboardingComplete = (completedFarmer: FarmerProfile) => {
    // Save this farmer's ID to this device's localStorage
    localStorage.setItem(LOCAL_KEY, completedFarmer.id);
    setFarmer(completedFarmer);
    setElderMode(completedFarmer.accessibility_mode?.elder ?? false);
    setAppState('ready');
  };

  const handleLogout = () => {
    // Clear this device's saved farmer
    localStorage.removeItem(LOCAL_KEY);
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
          existingFarmer={null}
          phone={`device_${Date.now()}`}
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
