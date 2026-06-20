# KisanShield — Coding Rules & Engineering Standards
**Version:** 1.0.0  
**Enforced from:** Day 1 of development  
**Non-negotiable. Every team member signs off on this.**

---

## 1. Project Structure

```
kisanshield/
├── apps/
│   ├── pwa/                    # React PWA (Vite + React)
│   │   ├── src/
│   │   │   ├── modules/        # One folder per KisanShield module
│   │   │   │   ├── cropmind/
│   │   │   │   ├── climateguard/
│   │   │   │   ├── fraudsense/
│   │   │   │   ├── saathivoice/
│   │   │   │   ├── mandibridge/
│   │   │   │   └── carbonkisan/
│   │   │   ├── components/     # Shared UI components only
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Supabase client, API wrappers
│   │   │   ├── store/          # Zustand global state
│   │   │   ├── styles/         # Design tokens, global CSS
│   │   │   └── utils/          # Pure utility functions
│   │   ├── public/
│   │   │   └── models/         # Cached TFLite model files
│   │   └── vite.config.ts
│   │
│   └── admin/                  # Admin dashboard (separate Vite app)
│
├── n8n-workflows/              # Exported n8n workflow JSON files
│   ├── wa-inbound-router.json
│   ├── cropmind-pipeline.json
│   ├── weather-alert-engine.json
│   ├── mandi-price-refresh.json
│   ├── fraudsense-reporter.json
│   ├── carbon-calculator.json
│   └── daily-digest.json
│
├── ml/                         # All ML model code
│   ├── cropmind/
│   │   ├── train.py            # Roboflow dataset + training script
│   │   ├── evaluate.py
│   │   └── export_tflite.py
│   ├── fraudsense/
│   │   ├── finetune_whisper.py
│   │   ├── classifier.py
│   │   └── dataset/            # Labelled scam transcripts (gitignored)
│   └── mandibridge/
│       ├── lstm_train.py
│       └── price_data/         # Historical mandi data CSVs
│
├── supabase/
│   ├── migrations/             # All SQL migrations (numbered)
│   │   ├── 001_init_schema.sql
│   │   ├── 002_add_rls.sql
│   │   └── 003_add_carbon.sql
│   └── seed.sql                # Demo data for hackathon
│
├── docs/
│   ├── architecture.md         # This project's architecture
│   ├── coding-rules.md         # This file
│   ├── UI.md                   # Design system
│   └── project-context.md      # What, why, who
│
├── .env.example                # All required env vars listed (no values)
├── .env.local                  # Real values — NEVER committed
├── .gitignore
└── README.md
```

---

## 2. Language & Runtime Rules

**Frontend (PWA + Admin)**
- Language: **TypeScript strictly**. No `.js` files. No `any` type except in migration scripts.
- React version: **18.3+**
- Build tool: **Vite 5**
- Node version: **20 LTS**
- Package manager: **pnpm** (faster, better for monorepo)

**Backend / Orchestration**
- n8n Function nodes: **JavaScript (ES2020)**
- n8n HTTP nodes: Always set timeout to **45 seconds** (buffer before Railway kills at 60s)
- Python (ML only): **3.11**, managed via `pyenv`

**Database**
- All schema changes via **numbered migration files** in `supabase/migrations/`
- Never use Supabase dashboard to make schema changes — always write SQL
- Every table must have `id UUID`, `created_at TIMESTAMPTZ`

---

## 3. TypeScript Rules

```typescript
// ✅ CORRECT — explicit types everywhere
interface FarmerProfile {
  id: string;
  phone: string;
  language: BhashiniLanguageCode;
  district: string;
  lat: number;
  lng: number;
  accessibilityMode: AccessibilityMode;
}

// ❌ WRONG — never do this
const farmer: any = await getFarmer(id);

// ✅ CORRECT — use type guards for API responses
function isCropDiagnosis(data: unknown): data is CropDiagnosis {
  return typeof data === 'object' && data !== null && 'disease' in data;
}

// ✅ CORRECT — explicit return types on all functions
async function getDiseaseFromImage(imageUrl: string): Promise<CropDiagnosis | null> {
  // ...
}

// ❌ WRONG — implicit return type
async function getDiseaseFromImage(imageUrl: string) {
  // ...
}
```

**Enum pattern for all fixed values:**
```typescript
// In src/lib/types.ts — single source of truth
export const LANGUAGE_CODES = ['hi', 'te', 'ta', 'bn', 'mr', 'pa', 'gu', 'kn', 'ml', 'or', 'as', 'ur'] as const;
export type BhashiniLanguageCode = typeof LANGUAGE_CODES[number];

export const ALERT_LEVELS = ['CRITICAL', 'WARNING', 'INFO'] as const;
export type AlertLevel = typeof ALERT_LEVELS[number];

export const SCAM_TYPES = ['digital_arrest', 'upi_fraud', 'fake_kyc', 'job_scam', 'legitimate'] as const;
export type ScamType = typeof SCAM_TYPES[number];
```

---

## 4. React Component Rules

**Component structure (mandatory order inside every file):**
```typescript
// 1. Imports (external → internal → types → styles)
import { useState, useEffect } from 'react';
import { useFarmerProfile } from '@/hooks/useFarmerProfile';
import type { CropDiagnosis } from '@/lib/types';
import styles from './CropMind.module.css';

// 2. Types local to this component
interface CropMindProps {
  farmerId: string;
  onDiagnosisComplete: (result: CropDiagnosis) => void;
}

// 3. Component (arrow function, named)
export const CropMind = ({ farmerId, onDiagnosisComplete }: CropMindProps) => {
  // 3a. Hooks first
  const { profile } = useFarmerProfile(farmerId);
  const [isAnalysing, setIsAnalysing] = useState(false);

  // 3b. Derived state
  const canUpload = !isAnalysing && !!profile;

  // 3c. Effects
  useEffect(() => {
    // ...
  }, [farmerId]);

  // 3d. Handlers
  const handleImageUpload = async (file: File) => {
    // ...
  };

  // 3e. Render
  return (
    <div className={styles.container}>
      {/* ... */}
    </div>
  );
};
```

**Rules:**
- One component per file. File name = component name.
- No default exports. Always named exports.
- No inline styles. Use CSS Modules.
- Props interface always above component.
- Max component length: **150 lines**. Split if longer.
- No component does data fetching AND renders. Separate the hook.

---

## 5. API & Data Fetching Rules

**All Supabase calls go through a service layer — never call Supabase directly from components:**

```typescript
// ✅ CORRECT — lib/services/farmerService.ts
export async function getFarmerByPhone(phone: string): Promise<FarmerProfile | null> {
  const { data, error } = await supabase
    .from('farmers')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error) {
    console.error('[farmerService.getFarmerByPhone]', error.message);
    return null;
  }
  return data;
}

// ❌ WRONG — calling Supabase directly in a component
const { data } = await supabase.from('farmers').select('*').eq('phone', phone);
```

**Error handling — never swallow errors silently:**
```typescript
// ✅ CORRECT
try {
  const diagnosis = await getCropDiagnosis(imageUrl);
  if (!diagnosis) throw new Error('Diagnosis returned null');
  onDiagnosisComplete(diagnosis);
} catch (err) {
  console.error('[CropMind.handleImageUpload]', err);
  showToast({ type: 'error', message: 'Could not analyse image. Please try again.' });
}

// ❌ WRONG
try {
  const diagnosis = await getCropDiagnosis(imageUrl);
} catch (e) {
  // silent fail
}
```

---

## 6. n8n Workflow Rules

**Every n8n Function node must follow this template:**
```javascript
// Node name: [MODULE]-[ACTION] e.g. CROPMIND-CLASSIFY
// Description: What this node does in one sentence

const items = $input.all();
const results = [];

for (const item of items) {
  try {
    const { imageUrl, farmerId, language } = item.json;

    // Validate inputs first — always
    if (!imageUrl || !farmerId) {
      throw new Error(`Missing required fields: imageUrl=${imageUrl}, farmerId=${farmerId}`);
    }

    // Your logic here
    const result = {
      farmerId,
      processed: true,
      // ...
    };

    results.push({ json: result });

  } catch (error) {
    // Log and continue — never let one farmer's error crash the whole batch
    console.error(`[CROPMIND-CLASSIFY] farmer ${item.json.farmerId}:`, error.message);
    results.push({
      json: {
        farmerId: item.json.farmerId,
        error: error.message,
        processed: false,
      }
    });
  }
}

return results;
```

**n8n naming conventions:**
- Workflow names: `module-action` in kebab-case (e.g. `cropmind-pipeline`)
- Node names: `MODULE ACTION` in SCREAMING CASE (e.g. `CROPMIND CLASSIFY IMAGE`)
- All webhook paths: `/webhook/kisanshield/[module]` (e.g. `/webhook/kisanshield/cropmind`)

---

## 7. Environment Variables

**All secrets in `.env.local`. All required keys documented in `.env.example`:**

```bash
# .env.example — commit this file
# .env.local  — NEVER commit this file

# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # n8n only, never in frontend

# AI APIs
ROBOFLOW_API_KEY=
GEMINI_API_KEY=
HUGGINGFACE_API_TOKEN=

# Communication
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
META_WHATSAPP_TOKEN=
META_VERIFY_TOKEN=               # For webhook verification

# Weather
OPENWEATHERMAP_API_KEY=

# Bhashini
BHASHINI_USER_ID=
BHASHINI_API_KEY=

# n8n
N8N_WEBHOOK_BASE_URL=
N8N_API_KEY=
```

**Rule:** If a value isn't in `.env.example`, it doesn't exist. If it isn't in `.env.local`, the app doesn't start.

---

## 8. Git Rules

**Branch naming:**
```
main              → production-ready only
dev               → integration branch
feature/[name]    → new features (e.g. feature/fraudsense-whisper)
fix/[name]        → bug fixes (e.g. fix/weather-alert-cron)
ml/[name]         → ML model work (e.g. ml/crop-model-v2)
```

**Commit message format (Conventional Commits):**
```
feat(cropmind): add offline TFLite inference for PWA
fix(weather): correct IMD API endpoint after March 2026 change
chore(n8n): export updated cropmind workflow JSON
docs(arch): clarify FraudSense three-layer model
ml(fraudsense): add 400 Bhojpuri scam transcripts to dataset
```

**PR rules:**
- No PR merged without at least one other team member review
- Every PR must include: what changed, why, and how to test it
- Never commit directly to `main`

---

## 9. Performance Rules

**PWA / Frontend:**
- Lighthouse score target: **90+ on mobile** (measured on Moto G Power class device)
- First Contentful Paint: **<2s on 3G**
- TFLite model: load lazily, only when camera opens. Do not block app startup.
- Images: always use WebP. Max upload size: 800KB (compress before sending to WhatsApp)
- All icons: SVG inline. No icon font libraries.

**n8n:**
- CRON intervals: minimum 5 minutes. Never more frequent.
- Batch farmer queries: process in groups of 50, not one-by-one
- Cache mandi prices in Supabase — never hit Agmarknet per-request

**Supabase:**
- Index all foreign keys and all columns used in WHERE clauses
- Never `SELECT *` — always specify columns
- Use Supabase Realtime subscriptions for dashboard live updates (not polling)

---

## 10. Accessibility Code Rules

These apply to every UI component. No exceptions.

```typescript
// ✅ All interactive elements have accessible labels
<button aria-label="Analyse crop photo" onClick={handleUpload}>
  <CameraIcon />
</button>

// ✅ All images have meaningful alt text
<img src={cropPhoto} alt={`${cropType} leaf showing ${disease}`} />

// ✅ Error messages are announced to screen readers
<div role="alert" aria-live="polite">
  {errorMessage}
</div>

// ✅ Keyboard navigation works on all interactive elements
// Tab order follows visual layout
// Focus ring never removed (can be styled but not hidden)

// ✅ Reduced motion respected
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}

// ✅ Touch targets minimum 44×44px on mobile
.button { min-height: 44px; min-width: 44px; }
```

**Elder mode rules (auto-activated when accessibility_mode.elder=true):**
- Base font size: 20px minimum
- Line height: 1.8 minimum
- All buttons: pill-shaped, large, labelled in plain language
- No hover-dependent information

---

## 11. What Never Goes in This Codebase

- No `console.log` in committed code (use `console.error` for actual errors only)
- No `TODO` comments without an associated GitHub issue number
- No hardcoded phone numbers, API keys, or farmer data
- No mock/fake data in production code paths (seed.sql only)
- No third-party analytics scripts that send farmer data abroad
- No dependencies added without team discussion (run `pnpm audit` weekly)
