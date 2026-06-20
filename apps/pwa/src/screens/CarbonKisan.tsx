import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateCarbonScore, issueCarbonCredit } from '../lib/services/carbonService';
import type { FarmerProfile } from '../lib/types';
import './CarbonKisan.css';

interface CarbonKisanProps { farmer: FarmerProfile | null; }

type IrrigationMethod = 'drip' | 'flood' | 'rain-fed';
type FertiliserType = 'organic' | 'chemical' | 'mixed';

export const CarbonKisan = ({ farmer }: CarbonKisanProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [fertiliserType, setFertiliserType] = useState<FertiliserType>('chemical');
  const [fertiliserKg, setFertiliserKg] = useState(50);
  const [irrigation, setIrrigation] = useState<IrrigationMethod>('flood');
  const [cropRotation, setCropRotation] = useState(false);
  const [stubbleBurning, setStubbleBurning] = useState(false);
  const [farmAcres, setFarmAcres] = useState(2.3);
  const [result, setResult] = useState<{ tco2e_saved: number; credit_value_inr: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const score = calculateCarbonScore({ fertiliser_type: fertiliserType, fertiliser_kg_per_acre: fertiliserKg, irrigation_method: irrigation, crop_rotation: cropRotation, stubble_burning: stubbleBurning, farm_acres: farmAcres });

  const handleSubmit = async () => {
    if (!farmer) return;
    setIsSubmitting(true);
    const credit = await issueCarbonCredit(farmer.id, 'Rabi-2025-26', { fertiliser_type: fertiliserType, fertiliser_kg_per_acre: fertiliserKg, irrigation_method: irrigation, crop_rotation: cropRotation, stubble_burning: stubbleBurning, farm_acres: farmAcres });
    setResult(credit ? { tco2e_saved: credit.tco2e_saved, credit_value_inr: credit.credit_value_inr } : score);
    setIsSubmitting(false);
    setStep(4);
  };

  return (
    <div className="carbon-page fade-in">
      <header className="page-header" style={{ background: 'var(--color-carbon)' }}>
        <button id="carbon-back" className="back-btn" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => navigate('/')} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 style={{ color: '#A8D5B5' }}>🌱 CarbonKisan — कार्बन क्रेडिट</h1>
      </header>

      <div className="page-content">
        {step < 4 && (
          <div className="carbon-progress">
            {[1, 2, 3].map(s => (
              <div key={s} className={`carbon-step ${step >= s ? 'active' : ''}`}>
                <div className="step-dot">{step > s ? '✓' : s}</div>
                <span className="step-label">{['खाद', 'सिंचाई', 'अभ्यास'][s - 1]}</span>
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="carbon-section card fade-in">
            <h2 className="section-title">1. खाद / Fertiliser</h2>
            <label className="carbon-label" htmlFor="farm-acres">खेत का आकार / Farm size (acres)</label>
            <input id="farm-acres" type="number" className="carbon-input" value={farmAcres} onChange={e => setFarmAcres(parseFloat(e.target.value))} min={0.1} max={100} step={0.1} />

            <label className="carbon-label">खाद का प्रकार / Fertiliser type</label>
            <div className="option-group">
              {(['organic', 'mixed', 'chemical'] as FertiliserType[]).map(t => (
                <button key={t} id={`fert-${t}`} className={`option-btn ${fertiliserType === t ? 'selected' : ''}`} onClick={() => setFertiliserType(t)}>
                  {t === 'organic' ? '🌿 जैविक' : t === 'mixed' ? '⚗️ मिश्रित' : '🏭 रासायनिक'}
                </button>
              ))}
            </div>

            <label className="carbon-label" htmlFor="fert-kg">खाद की मात्रा / Amount (kg/acre)</label>
            <input id="fert-kg" type="number" className="carbon-input" value={fertiliserKg} onChange={e => setFertiliserKg(parseInt(e.target.value))} min={0} max={500} />

            <button id="carbon-next-1" className="btn btn-primary" onClick={() => setStep(2)}>अगला / Next →</button>
          </div>
        )}

        {step === 2 && (
          <div className="carbon-section card fade-in">
            <h2 className="section-title">2. सिंचाई / Irrigation</h2>
            <label className="carbon-label">सिंचाई का तरीका / Irrigation method</label>
            <div className="option-group vertical">
              {([['drip', '💧 ड्रिप (Drip)'], ['flood', '🌊 बाढ़ (Flood)'], ['rain-fed', '🌧️ बारिश (Rain-fed)']] as [IrrigationMethod, string][]).map(([val, label]) => (
                <button key={val} id={`irr-${val}`} className={`option-btn ${irrigation === val ? 'selected' : ''}`} onClick={() => setIrrigation(val)}>
                  {label}
                </button>
              ))}
            </div>
            <div className="nav-btns">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← वापस</button>
              <button id="carbon-next-2" className="btn btn-primary" onClick={() => setStep(3)}>अगला →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="carbon-section card fade-in">
            <h2 className="section-title">3. खेती अभ्यास / Farm Practices</h2>
            <div className="toggle-group">
              <div className="toggle-row">
                <div>
                  <div className="toggle-label">फसल चक्र / Crop Rotation</div>
                  <div className="toggle-hint">पिछले साल अलग फसल लगाई?</div>
                </div>
                <button id="crop-rotation-toggle" className={`toggle-btn ${cropRotation ? 'on' : 'off'}`} onClick={() => setCropRotation(!cropRotation)} aria-pressed={cropRotation}>{cropRotation ? 'हाँ' : 'नहीं'}</button>
              </div>
              <div className="toggle-row">
                <div>
                  <div className="toggle-label">पराली जलाना / Stubble Burning</div>
                  <div className="toggle-hint">क्या आप पराली जलाते हैं?</div>
                </div>
                <button id="stubble-burning-toggle" className={`toggle-btn ${stubbleBurning ? 'on danger' : 'off'}`} onClick={() => setStubbleBurning(!stubbleBurning)} aria-pressed={stubbleBurning}>{stubbleBurning ? 'हाँ' : 'नहीं'}</button>
              </div>
            </div>

            {/* Live Preview */}
            <div className="carbon-preview">
              <h3>आपका अनुमान / Your Estimate</h3>
              <div className="preview-row"><span>CO₂ बचत:</span><strong>{score.tco2e_saved} tCO₂e</strong></div>
              <div className="preview-row"><span>क्रेडिट मूल्य:</span><strong style={{ color: 'var(--color-carbon)' }}>₹{score.credit_value_inr.toLocaleString('en-IN')}</strong></div>
              {score.tco2e_saved < 0.5 && <div className="threshold-warn">⚠️ न्यूनतम 0.5 tCO₂e चाहिए (Minimum 0.5 tCO₂e required)</div>}
            </div>

            <div className="nav-btns">
              <button className="btn btn-ghost" onClick={() => setStep(2)}>← वापस</button>
              <button id="submit-carbon-btn" className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting || score.tco2e_saved < 0.5}>
                {isSubmitting ? '⏳ जमा हो रहा है...' : '✅ जमा करें / Submit'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && result && (
          <div className="carbon-result card slide-up">
            <div className="result-celebration">🎉</div>
            <h2 className="result-title">बधाई हो! / Congratulations!</h2>
            <div className="credit-display">
              <span className="credit-co2">{result.tco2e_saved} tCO₂e</span>
              <span className="credit-label">कार्बन बचाया / Carbon Saved</span>
            </div>
            <div className="credit-value-display">
              <span>₹{result.credit_value_inr.toLocaleString('en-IN')}</span>
              <span className="credit-value-label">क्रेडिट मूल्य / Credit Value</span>
            </div>
            <p className="result-note">आपके कार्बन क्रेडिट Supabase में सुरक्षित हैं। Verra Gold Standard registry में जोड़े जाएंगे।</p>
            <button id="carbon-done-btn" className="btn btn-primary" onClick={() => navigate('/')}>होम पर जाएं 🏠</button>
          </div>
        )}
      </div>
    </div>
  );
};
