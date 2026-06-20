import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeMessageWithGroq, getFraudIncidents, saveFraudIncident, formatScamType } from '../lib/services/fraudService';
import type { FraudIncident, FarmerProfile, ScamType } from '../lib/types';
import './FraudSense.css';

interface FraudSenseProps { farmer: FarmerProfile | null; }

export const FraudSense = ({ farmer }: FraudSenseProps) => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<FraudIncident[]>([]);
  const [testMessage, setTestMessage] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{ scam_type: ScamType; confidence: number; explanation: string; explanation_hindi: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!farmer) { setIsLoading(false); return; }
    getFraudIncidents(farmer.id).then(data => { setIncidents(data); setIsLoading(false); });
  }, [farmer]);

  const handleCheck = async () => {
    if (!testMessage.trim()) return;
    setIsChecking(true);
    setResult(null);

    try {
      const analysis = await analyzeMessageWithGroq(testMessage);
      setResult(analysis);

      if (analysis.scam_type !== 'legitimate' && analysis.confidence > 0.55 && farmer) {
        await saveFraudIncident(farmer.id, {
          scam_type: analysis.scam_type,
          confidence: analysis.confidence,
          caller_number: null,
          transcript: testMessage,
          fir_submitted: false,
          family_notified: false,
        });
        setIncidents(prev => [{
          id: Date.now().toString(),
          farmer_id: farmer.id,
          scam_type: analysis.scam_type,
          confidence: analysis.confidence,
          caller_number: null,
          transcript: testMessage,
          fir_submitted: false,
          family_notified: false,
          created_at: new Date().toISOString(),
        }, ...prev]);
      }
    } catch (err) {
      console.error('[FraudSense.handleCheck]', err);
    } finally {
      setIsChecking(false);
    }
  };

  const protectionScore = incidents.length === 0 ? 100 : Math.max(60, 100 - incidents.filter(i => i.scam_type !== 'legitimate').length * 5);

  return (
    <div className="fraudsense-page fade-in">
      <header className="page-header">
        <button id="fraudsense-back" className="back-btn" onClick={() => navigate('/')} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1>🛡️ FraudSense — सुरक्षा</h1>
      </header>

      <div className="page-content">
        {/* Protection Status */}
        <div className="protection-status card">
          <div className="protection-header">
            <span className="shield-icon" aria-hidden="true">🛡️</span>
            <div>
              <div className="protection-title">सुरक्षा सक्रिय है / Protection ACTIVE</div>
              <div className="protection-score-text">{protectionScore}% Secure</div>
            </div>
          </div>
          <div className="progress-bar" role="progressbar" aria-valuenow={protectionScore} aria-valuemin={0} aria-valuemax={100} aria-label={`Protection score: ${protectionScore}%`}>
            <div className="progress-fill" style={{ width: `${protectionScore}%`, background: protectionScore > 80 ? 'var(--color-sprout)' : 'var(--color-turmeric)' }} />
          </div>
        </div>

        {/* Message Checker */}
        <div className="checker-card card">
          <h2 className="section-title">📱 संदेश जाँचें / Check a Message</h2>
          <p className="checker-hint">कोई संदिग्ध संदेश यहाँ पेस्ट करें। / Paste any suspicious message below.</p>
          <textarea
            id="fraud-check-input"
            className="message-input"
            rows={4}
            placeholder="Namaskar, main CBI officer hun. Aapke account mein suspicious activity hai..."
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            aria-label="Enter suspicious message to check"
          />
          <button
            id="check-message-btn"
            className="btn btn-primary"
            onClick={handleCheck}
            disabled={isChecking || !testMessage.trim()}
          >
            {isChecking ? '🔍 जाँच हो रही है...' : '🔍 जाँचें / Check'}
          </button>

          {result && (
            <div className={`analysis-result ${result.scam_type !== 'legitimate' && result.confidence > 0.55 ? 'danger' : 'safe'} slide-up`} role="alert">
              {result.scam_type === 'legitimate' || result.confidence <= 0.55 ? (
                <>
                  <span className="result-icon">✅</span>
                  <div>
                    <div className="result-title">सुरक्षित / Safe Message</div>
                    <div className="result-detail">{result.explanation_hindi}</div>
                  </div>
                </>
              ) : (
                <>
                  <span className="result-icon">🚨</span>
                  <div>
                    <div className="result-title">
                      {formatScamType(result.scam_type).label_hindi} — {Math.round(result.confidence * 100)}% Risk
                    </div>
                    <div className="result-detail">{result.explanation_hindi}</div>
                    <div className="result-detail-en">{result.explanation}</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Incident Log */}
        <div>
          <h2 className="section-title">📋 आज के खतरे / Today's Threats</h2>
          {isLoading ? (
            <div className="loading-text">Loading...</div>
          ) : incidents.length === 0 ? (
            <div className="empty-state card">
              <span style={{ fontSize: 32 }}>✅</span>
              <span>कोई खतरा नहीं मिला। / No threats detected.</span>
            </div>
          ) : (
            <div className="incidents-list">
              {incidents.slice(0, 5).map(incident => {
                const meta = formatScamType(incident.scam_type);
                const isScam = incident.scam_type !== 'legitimate';
                return (
                  <div key={incident.id} className={`incident-card card ${isScam ? 'incident-danger' : 'incident-safe'}`}>
                    <div className="incident-header">
                      <span className="incident-icon">{isScam ? '🚨' : '✅'}</span>
                      <div className="incident-info">
                        <div className="incident-type" style={{ color: meta.color }}>{meta.label} — {meta.label_hindi}</div>
                        {incident.caller_number && <div className="incident-number">{incident.caller_number.replace(/\d{5}$/, '■■■■■')}</div>}
                      </div>
                      <div className="incident-time">{formatRelativeTime(incident.created_at)}</div>
                    </div>
                    {incident.transcript && (
                      <div className="incident-transcript">"{incident.transcript.slice(0, 100)}{incident.transcript.length > 100 ? '...' : ''}"</div>
                    )}
                    <div className="incident-actions">
                      {isScam && !incident.fir_submitted && (
                        <button id={`report-1930-${incident.id}`} className="btn btn-danger" style={{ fontSize: '13px', padding: '8px 16px' }}>
                          Report to 1930
                        </button>
                      )}
                      <span className={`badge ${isScam ? 'badge-danger' : ''}`}>
                        {Math.round(incident.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
