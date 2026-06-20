import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMandiPrices, queryPriceWithGroq, seedMandiPrices } from '../lib/services/mandiService';
import type { MandiPrice, FarmerProfile } from '../lib/types';
import './MandiBridge.css';

interface MandiBridgeProps { farmer: FarmerProfile | null; }

const COMMODITIES_HI: Record<string, string> = {
  Wheat: 'गेहूँ', Rice: 'चावल', Mustard: 'सरसों', Sugarcane: 'गन्ना',
  Maize: 'मक्का', Cotton: 'कपास', Potato: 'आलू', Onion: 'प्याज',
};

export const MandiBridge = ({ farmer }: MandiBridgeProps) => {
  const navigate = useNavigate();
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [selected, setSelected] = useState<MandiPrice | null>(null);

  useEffect(() => {
    const district = farmer?.district ?? 'Bareilly';
    getMandiPrices(district).then(async data => {
      if (data.length === 0) {
        await seedMandiPrices();
        const fresh = await getMandiPrices(district);
        setPrices(fresh);
      } else {
        setPrices(data);
      }
      setIsLoading(false);
    });
  }, [farmer]);

  const handleQuery = async () => {
    if (!query.trim()) return;
    setIsQuerying(true);
    const response = await queryPriceWithGroq(query, prices);
    setAiResponse(response);
    setIsQuerying(false);
  };

  return (
    <div className="mandi-page fade-in">
      <header className="page-header" style={{ background: 'var(--color-soil)' }}>
        <button id="mandi-back" className="back-btn" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => navigate('/')} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 style={{ color: 'var(--color-wheat)' }}>📊 MandiBridge — मंडी भाव</h1>
      </header>

      <div className="page-content">
        {/* AI Price Query */}
        <div className="query-card card">
          <h2 className="section-title">🤖 भाव पूछें / Ask Price</h2>
          <div className="query-input-row">
            <input
              id="price-query-input"
              type="text"
              className="query-input"
              placeholder="गेहूं का भाव क्या है? / What is wheat price?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
              aria-label="Ask about mandi prices"
            />
            <button id="ask-price-btn" className="btn btn-primary" onClick={handleQuery} disabled={isQuerying || !query.trim()}>
              {isQuerying ? '...' : '→'}
            </button>
          </div>
          {aiResponse && (
            <div className="ai-response slide-up">
              <span aria-hidden="true">🤖</span>
              <p>{aiResponse}</p>
            </div>
          )}
        </div>

        {/* Price Cards */}
        {isLoading ? (
          <div className="loading-text">भाव लोड हो रहे हैं...</div>
        ) : (
          <div>
            <div className="mandi-header-row">
              <h2 className="section-title">{farmer?.district ?? 'Bareilly'} मंडी</h2>
              <span className="tag">Live</span>
            </div>
            <div className="price-list">
              {prices.slice(0, 6).map(price => (
                <div
                  key={price.id}
                  id={`price-card-${price.commodity.toLowerCase()}`}
                  className={`price-card card ${selected?.id === price.id ? 'selected' : ''}`}
                  onClick={() => setSelected(selected?.id === price.id ? null : price)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelected(selected?.id === price.id ? null : price)}
                  aria-expanded={selected?.id === price.id}
                >
                  <div className="price-card-top">
                    <div className="price-commodity">
                      <span className="commodity-hindi">{COMMODITIES_HI[price.commodity] ?? price.commodity}</span>
                      <span className="commodity-en">{price.commodity}</span>
                    </div>
                    <div className="price-value-block">
                      <span className="price-value">₹{price.price_per_quintal.toLocaleString('en-IN')}</span>
                      <span className="price-unit">/quintal</span>
                    </div>
                  </div>

                  <div className="price-trend">
                    <div className="trend-bar">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${Math.min(100, (price.price_per_quintal / (price.predicted_price ?? price.price_per_quintal)) * 100)}%`,
                          background: (price.trend_percent ?? 0) >= 0 ? 'var(--color-sprout)' : 'var(--color-danger)',
                        }} />
                      </div>
                      <span className={`trend-pct ${(price.trend_percent ?? 0) >= 0 ? 'up' : 'down'}`}>
                        {(price.trend_percent ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(price.trend_percent ?? 0)}%
                      </span>
                    </div>
                  </div>

                  {selected?.id === price.id && (
                    <div className="price-detail slide-up">
                      <hr className="divider" />
                      <div className="prediction-row">
                        <span>📈 AI Prediction:</span>
                        <span className="prediction-value">₹{price.predicted_price?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="prediction-row">
                        <span>📅 Best sell:</span>
                        <span className="prediction-value">{price.best_sell_window}</span>
                      </div>
                      <div className="price-actions">
                        <button id={`set-alert-${price.commodity.toLowerCase()}`} className="btn btn-secondary" style={{ fontSize: '13px' }}>
                          🔔 Price Alert
                        </button>
                        <button id={`book-transport-${price.commodity.toLowerCase()}`} className="btn btn-primary" style={{ fontSize: '13px' }}>
                          🚛 Book Transport
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
