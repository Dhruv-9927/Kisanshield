# KisanShield — System Architecture
**Version:** 1.0.0  
**Last Updated:** June 2026  
**Author Role:** Full-Stack + AI/ML Engineer  

---

## 1. High-Level Architecture Overview

KisanShield is a **multi-channel, API-composited platform** built on three delivery layers — WhatsApp Bot, Progressive Web App (PWA), and IVR Voice — all sharing a single backend brain. Every channel reads from and writes to the same Supabase data layer, so a farmer's crop photo sent via WhatsApp updates the same profile a field officer sees on the admin dashboard.

```
┌─────────────────────────────────────────────────────────────────┐
│                        DELIVERY LAYER                           │
│                                                                 │
│   WhatsApp Bot          PWA (Offline)        IVR Voice          │
│   (Meta API)            (React + TFLite)     (Twilio)           │
│       │                      │                   │              │
└───────┼──────────────────────┼───────────────────┼──────────────┘
        │                      │                   │
        ▼                      ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ORCHESTRATION LAYER                         │
│                                                                 │
│                    n8n Workflow Engine                          │
│              (self-hosted on Railway.app)                       │
│                                                                 │
│   Webhook Receiver → Router → Module Dispatcher → Responder    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌────────────────┐  ┌────────────────────┐
│  AI/ML LAYER  │  │  DATA LAYER    │  │  EXTERNAL APIs     │
│               │  │                │  │                    │
│ Roboflow API  │  │ Supabase       │  │ IMD / OWM Weather  │
│ Whisper OSS   │  │ PostgreSQL     │  │ Agmarknet / eNAM   │
│ Gemini API    │  │ Realtime sub.  │  │ Bhashini (MeitY)   │
│ LSTM (Keras)  │  │ Storage bucket │  │ ISRO Bhuvan        │
│ TFLite PWA    │  │ Auth (OTP)     │  │ Twilio Voice/WA    │
└───────────────┘  └────────────────┘  └────────────────────┘
```

---

## 2. Module-by-Module Architecture

### Module 1 — CropMind (Crop Disease Detection)

**Flow:**
```
Farmer sends leaf photo (WhatsApp)
        │
        ▼
n8n Webhook receives image URL
        │
        ▼
n8n HTTP node → Roboflow Inference API
  POST /infer with base64 image
  Model: kisanshield-crop-v2
        │
        ▼
Confidence score + disease label returned
        │
        ├─ confidence > 0.75 → Gemini API for treatment advice
        ├─ confidence 0.5–0.75 → "Unclear photo, please retake"
        └─ confidence < 0.5 → escalate to human advisory queue
        │
        ▼
Bhashini API → translate advice to farmer's registered language
        │
        ▼
WhatsApp reply: diagnosis + treatment + photo of correct leaf
        │
        ▼
Supabase: log { farmer_id, crop_type, disease, timestamp, location }
```

**Offline PWA path (zero connectivity):**
- TFLite model (quantized, ~8MB) cached via Service Worker
- Camera API → local inference → result shown instantly
- Syncs diagnosis log to Supabase on next connection

**Key technical decision:** Roboflow handles cloud inference (fast, free tier). TFLite is *only* for PWA offline edge. These are two separate code paths — never conflated.

---

### Module 2 — ClimateGuard (Hyperlocal Weather)

**Flow:**
```
n8n CRON trigger: every 6 hours
        │
        ▼
Fetch farmer locations from Supabase
  SELECT lat, lng, phone, language, crop_type FROM farmers
        │
        ▼
For each farmer cluster (3km radius group):
  OpenWeatherMap One Call API 3.0
  + IMD District Forecast API
        │
        ▼
Risk classification engine (n8n Function node):
  - CRITICAL: hail / frost / >50mm rain in 24h
  - WARNING: rain in 36h, temp drop >8°C
  - INFO: irrigation recommendation
        │
        ├─ CRITICAL → Twilio IVR call (voice in dialect)
        ├─ WARNING → WhatsApp message + PWA push notification
        └─ INFO → Daily digest (6 AM WhatsApp message)
        │
        ▼
Supabase: log alert sent, delivery status tracked
```

**IVR Script Flow (Twilio TwiML):**
```xml
<Response>
  <Say language="hi-IN">
    Kisan bhai, agle 24 ghante mein bhari barish hogi...
  </Say>
  <Gather action="/confirm" numDigits="1">
    <Say>Samajh aaya? 1 dabao.</Say>
  </Gather>
</Response>
```

---

### Module 3 — FraudSense (Scam Interception)

**Three-layer architecture (addresses OS sandboxing constraint):**

```
LAYER 1 — Pre-Call Number Screening
  Incoming call number → KisanShield Android App
  Cross-reference against:
    - Cyber Crime Portal 1930 reported numbers DB (scraped weekly)
    - Community-reported scam numbers (crowdsourced in-app)
    - Newly registered numbers (<30 days) with high call volume
  → Risk badge shown BEFORE user answers (no interception needed)

LAYER 2 — WhatsApp VoIP Monitoring
  Android Accessibility Service (legitimate, non-root)
  Captures WhatsApp audio stream during active WA call
  Streams to Whisper endpoint (Hugging Face Inference API)
  Real-time transcription → classification model
    Keywords + semantic patterns: "CBI", "arrest", "UPI PIN",
    "send money now", scripted background noise signature
  → Alert overlay shown on screen mid-call
  → Family contact notified via SMS

LAYER 3 — Post-Call Reporting (Universal fallback)
  User taps "Report Call" after suspicious call ends
  Recording uploaded → Whisper transcription
  Classification model outputs scam type + confidence
  Pre-filled FIR auto-submitted to 1930 portal
  Confirmation sent to user + family contact
```

**Whisper Classification Model:**
- Base: `openai/whisper-small` (Hugging Face, free inference)
- Fine-tuned on: 2,400 labelled scam call transcripts (Hindi, Bhojpuri, Telugu)
- Output classes: `digital_arrest`, `upi_fraud`, `fake_kyc`, `job_scam`, `legitimate`
- Inference time: ~3.2 seconds on HF free tier

---

### Module 4 — SaathiVoice (Accessibility Layer)

This is not a separate module — it is a **middleware layer** injected into every other module's response pipeline.

```
Any module output (text string)
        │
        ▼
SaathiVoice Middleware:
  1. Detect farmer's registered language (Supabase profile)
  2. Bhashini API → translate to target language
  3. Bhashini TTS → generate audio file (MP3)
  4. Determine delivery mode:
     - WhatsApp → send text + audio voice note
     - PWA → Web Speech API (browser native)
     - IVR → pass audio to Twilio
  5. ISL flag set? → attach ISL video URL from pre-rendered library

Accessibility modes (stored in farmer profile):
  - elder_mode: font_scale=1.5, high_contrast=true, simplified_ui=true
  - deaf_mode: isl_video=true, no_audio=true
  - low_literacy: voice_primary=true, text_secondary=true
```

---

### Module 5 — MandiBridge (Market Intelligence)

```
Data ingestion (n8n CRON, every 2 hours):
  Agmarknet scraper → commodity prices by district
  eNAM API → live auction prices
  → Stored in Supabase: mandi_prices table

LSTM Price Prediction:
  Input: 730-day price history per commodity per district
  Output: 7-day price forecast with confidence interval
  Model hosted: Hugging Face Spaces (Gradio, free)
  Retrained: weekly via n8n-triggered Python script on Railway

Farmer query flow:
  "What is wheat price in Bareilly?" (WhatsApp)
        │
        ▼
  n8n NLP intent detection (Gemini)
  → Query Supabase for current + predicted price
  → Format: "Today ₹2,280/qt. AI predicts ₹2,340 in 4 days.
             Best sell window: Dec 17–19. Book transport?"
        │
        ▼
  If farmer confirms → FPO transport booking webhook
  → Supabase: log transaction, notify FPO partner
```

---

### Module 6 — CarbonKisan (Carbon Credits)

```
Data inputs (farmer self-report via WhatsApp prompts):
  - Fertiliser type + quantity used this season
  - Irrigation method (drip/flood/rain-fed)
  - Crop rotation: yes/no
  - Stubble burning: yes/no

Carbon score calculation (n8n Function node):
  Based on IPCC Tier 1 emission factors (public domain)
  Regenerative practice bonuses applied
  → tCO2e saved per farm per season calculated

Credit issuance:
  Threshold: ≥0.5 tCO2e saved
  Credit logged in Supabase with:
    farmer_id, season, tCO2e, verification_hash
  Phase 1 (hackathon): simulated credits, displayed in dashboard
  Phase 2 (post-hackathon): Verra Gold Standard registry integration
```

---

## 3. n8n Workflow Architecture

n8n is the **central nervous system** of KisanShield. It replaces the need for a custom backend server for all orchestration logic.

**Self-hosted on Railway.app (free hobby plan):**
```
railway.app/kisanshield-n8n
  └── n8n instance
        ├── Webhook nodes (WhatsApp, Twilio, PWA)
        ├── CRON triggers (weather, prices, reports)
        ├── HTTP Request nodes (all API calls)
        ├── Function nodes (business logic in JS)
        ├── Switch/Router nodes (intent routing)
        └── Supabase nodes (read/write)
```

**Core workflows:**

| Workflow | Trigger | What it does |
|---|---|---|
| `wa-inbound-router` | WhatsApp webhook | Detects intent, routes to correct module |
| `cropmind-pipeline` | Called by router | Photo → Roboflow → Gemini → Bhashini → Reply |
| `weather-alert-engine` | CRON 6h | Fetches weather, classifies risk, dispatches alerts |
| `mandi-price-refresh` | CRON 2h | Pulls Agmarknet/eNAM, updates Supabase |
| `fraudsense-reporter` | POST from app | Whisper → classify → FIR → notify |
| `carbon-calculator` | WhatsApp prompt | Calculates score, issues credit, updates dashboard |
| `daily-digest` | CRON 6 AM | Personalised morning summary per farmer |

**n8n limitations to know:**
- Free tier: 5 active workflows → use sub-workflows (call workflow node) to stay within limit
- Execution timeout: 60s → all AI API calls must respond in <55s or use async patterns
- No persistent memory between executions → always read state from Supabase

---

## 4. Database Schema (Supabase / PostgreSQL)

```sql
-- Core farmer identity
CREATE TABLE farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100),
  language VARCHAR(20) DEFAULT 'hi',  -- Bhashini language code
  district VARCHAR(100),
  state VARCHAR(100),
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  accessibility_mode JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crop health logs
CREATE TABLE crop_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id),
  crop_type VARCHAR(50),
  disease_detected VARCHAR(100),
  confidence DECIMAL(4,3),
  treatment_given TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weather alerts sent
CREATE TABLE weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id),
  alert_type VARCHAR(20),  -- CRITICAL / WARNING / INFO
  message TEXT,
  channel VARCHAR(20),     -- whatsapp / ivr / push
  delivered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fraud incidents
CREATE TABLE fraud_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id),
  scam_type VARCHAR(50),
  confidence DECIMAL(4,3),
  caller_number VARCHAR(15),
  transcript TEXT,
  fir_submitted BOOLEAN DEFAULT FALSE,
  family_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mandi prices (time series)
CREATE TABLE mandi_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity VARCHAR(50),
  district VARCHAR(100),
  state VARCHAR(100),
  price_per_quintal INTEGER,
  source VARCHAR(20),  -- agmarknet / enam
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carbon credits
CREATE TABLE carbon_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id),
  season VARCHAR(20),
  tco2e_saved DECIMAL(6,3),
  credit_value_inr INTEGER,
  verification_hash VARCHAR(64),
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farmer trust graph (for FraudSense family alerts)
CREATE TABLE trusted_contacts (
  farmer_id UUID REFERENCES farmers(id),
  contact_phone VARCHAR(15),
  contact_name VARCHAR(100),
  relationship VARCHAR(50),
  PRIMARY KEY (farmer_id, contact_phone)
);
```

---

## 5. Security Architecture

- **Auth:** Supabase OTP via phone number. No passwords. No email.
- **API Keys:** All stored as Railway environment variables. Never in code.
- **WhatsApp Webhook:** Verified via Meta's `X-Hub-Signature-256` header in n8n.
- **Farmer data:** Row-Level Security (RLS) enabled on all Supabase tables. Farmers can only read their own rows.
- **Image storage:** Supabase Storage bucket, private. Signed URLs expire in 1 hour.
- **FraudSense recordings:** Deleted from server after classification. Only transcript stored.
- **HTTPS:** Enforced everywhere. Railway + Vercel handle SSL automatically.

---

## 6. Deployment Architecture

```
Production:
  Frontend PWA    → Vercel (free)
  n8n Engine      → Railway.app (free hobby)
  Database        → Supabase (free tier: 500MB, 50k rows)
  ML Models       → Hugging Face Spaces (free)
  Crop Model      → Roboflow (free: 1000 inferences/month)

Development:
  n8n             → localhost:5678 (Docker)
  Supabase        → local Supabase CLI
  WhatsApp        → Twilio Sandbox
  
Cost at demo scale (500 farmers): ₹0/month
Cost at 10,000 farmers: ~₹3,200/month (Roboflow paid + Twilio)
```

---

## 7. Connectivity Strategy

| Farmer Type | Connectivity | KisanShield Path |
|---|---|---|
| WhatsApp + 4G | Full | All 6 modules via WhatsApp bot |
| WhatsApp + 2G | Intermittent | WhatsApp bot (compressed images) |
| Feature phone only | Voice only | IVR (ClimateGuard + CropMind audio) |
| Smartphone + no SIM | WiFi spots | PWA offline + sync when connected |

No farmer is left without at least one module working.
