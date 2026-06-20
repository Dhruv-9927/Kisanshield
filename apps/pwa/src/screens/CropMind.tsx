import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { detectCropDisease, saveCropLog, getCropHistory } from '../lib/services/cropService';
import { speakText } from '../components/VoiceButton';
import type { CropDiagnosis, CropLog, FarmerProfile } from '../lib/types';
import './CropMind.css';

interface CropMindProps { farmer: FarmerProfile | null; }

export const CropMind = ({ farmer }: CropMindProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<CropDiagnosis | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [history] = useState<CropLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return; }
    setError(null);
    setDiagnosis(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      setPreviewUrl(e.target?.result as string);
      setIsAnalyzing(true);

      try {
        const result = await detectCropDisease(base64);
        if (result) {
          setDiagnosis(result);
          if (farmer) await saveCropLog(farmer.id, result);
          speakText(`${result.disease_hindi}। ${result.treatment_steps[0]?.instruction_hindi ?? ''}`, 'hi-IN');
        }
      } catch (err) {
        console.error('[CropMind.handleFile]', err);
        setError('Could not analyse image. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const confidenceColor = (c: number) => c > 0.8 ? 'var(--color-sprout)' : c > 0.6 ? 'var(--color-turmeric)' : 'var(--color-danger)';

  return (
    <div className="cropmind-page fade-in">
      <header className="page-header">
        <button id="cropmind-back" className="back-btn" onClick={() => navigate('/')} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1>🌿 CropMind — फसल जाँच</h1>
      </header>

      <div className="page-content">
        {/* Upload zone */}
        <div
          className={`upload-zone ${isAnalyzing ? 'analyzing' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          role="button"
          tabIndex={0}
          aria-label="Upload or drop a crop photo here"
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Uploaded crop leaf" className="preview-image" />
          ) : (
            <div className="upload-placeholder">
              <span className="upload-icon">📷</span>
              <span className="upload-text-hindi">यहाँ फसल की फ़ोटो डालें</span>
              <span className="upload-text-en">Tap to upload or take a photo</span>
            </div>
          )}
          {isAnalyzing && (
            <div className="analyzing-overlay">
              <div className="analyzing-spinner" aria-label="Analyzing crop photo">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-saffron)" strokeWidth="2" className="spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
              </div>
              <span>जाँच हो रही है... / Analysing...</span>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden-input"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          aria-label="Select crop photo"
        />

        <div className="upload-actions">
          <button id="take-photo-btn" className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
            📸 फ़ोटो लें
          </button>
          <button id="upload-btn" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            🖼️ Upload
          </button>
        </div>

        {error && (
          <div role="alert" aria-live="polite" className="error-banner">
            ⚠️ {error}
          </div>
        )}

        {/* Diagnosis Result */}
        {diagnosis && !isAnalyzing && (
          <div className="diagnosis-card slide-up card">
            <div className="diagnosis-header">
              <div>
                <span className="diagnosis-label">आपकी फसल / Your Crop</span>
                <div className="confidence-badge" style={{ color: confidenceColor(diagnosis.confidence) }}>
                  {Math.round(diagnosis.confidence * 100)}% confident
                </div>
              </div>
            </div>

            <div className="disease-name">
              <span className="disease-indicator" style={{ background: diagnosis.disease === 'Healthy' ? 'var(--color-sprout)' : 'var(--color-danger)' }} aria-hidden="true" />
              <div>
                <div className="disease-primary">{diagnosis.disease_hindi}</div>
                <div className="disease-secondary">{diagnosis.disease} ({diagnosis.crop_type})</div>
              </div>
            </div>

            {diagnosis.disease !== 'Healthy' && (
              <>
                <hr className="divider" />
                <div className="treatment-section">
                  <h3 className="treatment-title">📋 उपचार / Treatment</h3>
                  <ol className="treatment-list">
                    {diagnosis.treatment_steps.map((step) => (
                      <li key={step.step} className="treatment-item">
                        <span className="treatment-step-en">{step.instruction}</span>
                        <span className="treatment-step-hi">{step.instruction_hindi}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="cost-estimate">
                    💰 अनुमानित खर्च / Est. Cost: <strong>{diagnosis.cost_estimate}</strong>
                  </div>
                </div>
              </>
            )}

            <div className="diagnosis-actions">
              <button
                id="speak-diagnosis-btn"
                className="btn btn-secondary"
                onClick={() => speakText(`${diagnosis.disease_hindi}। ${diagnosis.treatment_steps.map(s => s.instruction_hindi).join('। ')}`, 'hi-IN')}
              >
                🔊 हिंदी में सुनें
              </button>
              <button id="expert-call-btn" className="btn btn-ghost">
                📞 Expert Call
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <h2 className="section-title">पिछली जाँच / Recent Scans</h2>
            {history.slice(0, 3).map(log => (
              <div key={log.id} className="history-item card">
                <span>{log.crop_type ?? 'Crop'}</span>
                <span>{log.disease_detected ?? 'Unknown'}</span>
                <span className="tag">{new Date(log.created_at).toLocaleDateString('hi-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
