import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWeatherForecast } from '../lib/services/weatherService';
import { speakText } from '../components/VoiceButton';
import type { WeatherForecast, FarmerProfile } from '../lib/types';
import './ClimateGuard.css';

interface ClimateGuardProps { farmer: FarmerProfile | null; }

export const ClimateGuard = ({ farmer }: ClimateGuardProps) => {
  const navigate = useNavigate();
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const lat = farmer?.lat ?? 28.3670;
    const lng = farmer?.lng ?? 79.4304;
    const district = farmer?.district ?? 'Bareilly';
    getWeatherForecast(lat, lng, district).then(data => { setWeather(data); setIsLoading(false); });
  }, [farmer]);

  if (isLoading) return <div className="loading-page"><div className="spin" style={{ fontSize: 40 }}>⏳</div><span>मौसम जानकारी ला रहे हैं...</span></div>;

  const alertColors = { CRITICAL: 'var(--color-danger)', WARNING: 'var(--color-turmeric)', INFO: 'var(--color-sky)' };

  return (
    <div className="climate-page fade-in">
      <header className="page-header" style={{ background: 'var(--color-shield)' }}>
        <button id="climate-back" className="back-btn" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => navigate('/')} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 style={{ color: '#fff' }}>⛈️ ClimateGuard — मौसम</h1>
      </header>

      <div className="page-content">
        {/* Current Weather Hero */}
        <div className={`weather-hero card alert-${weather?.alert_level?.toLowerCase()}`}>
          <div className="weather-hero-top">
            <div>
              <div className="weather-location">{weather?.location}</div>
              <div className="weather-updated">Updated just now</div>
            </div>
            <span className={`badge badge-${weather?.alert_level === 'CRITICAL' ? 'danger' : weather?.alert_level === 'WARNING' ? 'warning' : 'info'}`}>
              {weather?.alert_level}
            </span>
          </div>
          <div className="weather-main">
            <span className="weather-icon-big" aria-hidden="true">{weather?.current.icon}</span>
            <div>
              <div className="weather-temp">{weather?.current.temp}°C</div>
              <div className="weather-condition-hindi">{weather?.current.condition_hindi}</div>
              <div className="weather-condition-en">{weather?.current.condition}</div>
            </div>
          </div>
          <div className="weather-meta">
            <span>💧 {weather?.current.humidity}%</span>
            <span>💨 {weather?.current.wind_speed} km/h</span>
          </div>
        </div>

        {/* 4-Day Forecast */}
        <div className="forecast-card card">
          <h2 className="section-title">4 दिन का पूर्वानुमान / 4-Day Forecast</h2>
          <div className="forecast-grid">
            {weather?.forecast.map((day, i) => (
              <div key={i} className="forecast-day">
                <span className="forecast-day-name">{day.day}</span>
                <span className="forecast-icon" aria-hidden="true">{day.icon}</span>
                <span className="forecast-temp-max">{day.temp_max}°</span>
                <span className="forecast-temp-min">{day.temp_min}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Required */}
        {weather?.action_required && (
          <div
            className="action-card card slide-up"
            style={{ borderLeft: `4px solid ${alertColors[weather.alert_level]}` }}
            role="alert"
          >
            <div className="action-header">
              <span style={{ fontSize: 22 }}>⚠️</span>
              <span className="action-label" style={{ color: alertColors[weather.alert_level] }}>ACTION NEEDED</span>
            </div>
            <div className="action-text-hindi">{weather.action_hindi}</div>
            <div className="action-text-en">{weather.action_required}</div>
            <button id="speak-weather-btn" className="btn btn-secondary" style={{ marginTop: 'var(--space-2)' }}
              onClick={() => {
                speakText(weather.action_hindi ?? '', 'hi-IN');
              }}>
              🔊 हिंदी में सुनें
            </button>
          </div>
        )}

        {/* Alert History */}
        <div className="alert-info card">
          <h3 className="section-title" style={{ fontSize: 'var(--text-body)', marginBottom: 'var(--space-2)' }}>ℹ️ ClimateGuard कैसे काम करता है</h3>
          <ul style={{ paddingLeft: 'var(--space-5)', color: 'var(--color-muted)', fontSize: 'var(--text-label)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li>हर 6 घंटे में IMD + OpenWeatherMap से जानकारी आती है</li>
            <li>CRITICAL alert मिलने पर WhatsApp + IVR call जाएगी</li>
            <li>आपके जिले के सभी किसानों को एक साथ alert मिलती है</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
