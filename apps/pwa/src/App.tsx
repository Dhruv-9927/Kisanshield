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
import { getFarmerByPhone, createFarmer } from './lib/services/farmerService';
import type { FarmerProfile } from './lib/types';
import './index.css';

// Demo farmer phone for hackathon (in production: use OTP auth)
const DEMO_PHONE = '+919876543210';

function App() {
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [elderMode, setElderMode] = useState(false);

  useEffect(() => {
    (async () => {
      let profile = await getFarmerByPhone(DEMO_PHONE);
      if (!profile) {
        profile = await createFarmer(DEMO_PHONE, 'Ramu Kaka', 'Bareilly', 'Uttar Pradesh');
      }
      if (profile) {
        setFarmer(profile);
        setElderMode(profile.accessibility_mode?.elder ?? false);
      }
    })();
  }, []);

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
          <Route path="/profile"    element={<Profile farmer={farmer} elderMode={elderMode} onElderModeToggle={setElderMode} />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
