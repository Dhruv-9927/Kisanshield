# KisanShield — UI Design System
**Version:** 1.0.0  
**Philosophy:** Designed for Ramu Kaka first. Everything else is a consequence.

---

## 1. Design Philosophy

KisanShield serves two distinct users simultaneously:

**Primary User:** Ramu Kaka — 58 years old, Bareilly, UP. Basic Android phone. Reads Hindi slowly. Arthritic fingers. Never used a banking app. Trusts things that feel familiar, not things that feel "modern."

**Secondary User:** The Admin / Field Officer — educated, English-literate, desktop or mid-range Android, needs data density and operational control.

**The design principle that governs every decision:**
> If Ramu Kaka can use it without being taught, we built it right. If he needs a tutorial, we failed.

This means: voice-first, icon-forward, minimal text, large targets, familiar metaphors (fields, crops, weather, rupees), and zero jargon.

---

## 2. Design Tokens

### 2.1 Colour Palette

The palette is derived from the physical world of Indian agriculture — not from tech industry conventions. It should feel like soil, crops, sky, and sunlight — not a SaaS dashboard.

```css
:root {
  /* Primary — Soil & Earth */
  --color-soil:        #1E1206;   /* deepest brown — primary text, hero backgrounds */
  --color-clay:        #6B2D0F;   /* fired clay — active states, destructive actions */
  --color-earth:       #8B4513;   /* earth brown — secondary text on light backgrounds */

  /* Accent — Harvest & Life */
  --color-saffron:     #E8750A;   /* ripe saffron — primary CTA, key highlights */
  --color-turmeric:    #D4A017;   /* turmeric gold — warnings, secondary highlights */
  --color-wheat:       #F2C97E;   /* wheat grain — soft highlights, tags */

  /* Nature — Leaf & Sky */
  --color-leaf:        #1F6B45;   /* deep leaf — success states, CropMind */
  --color-sprout:      #3DAA72;   /* new growth — positive metrics, active states */
  --color-paddy:       #A8D5B5;   /* paddy green — backgrounds, subtle indicators */
  --color-sky:         #4A90D9;   /* monsoon sky — ClimateGuard module */
  --color-rain:        #7BB8F0;   /* rain light — weather data, info states */

  /* Neutral — Parchment & Paper */
  --color-parchment:   #FBF5E6;   /* aged paper — primary background */
  --color-chalk:       #F4EDD8;   /* chalk — card backgrounds */
  --color-dust:        #E5D9C0;   /* dust — borders, dividers */
  --color-muted:       #7A6A52;   /* muted — secondary text, placeholders */

  /* Semantic */
  --color-danger:      #C0392B;   /* FraudSense alerts — danger */
  --color-danger-bg:   #FDEEEC;   /* danger background */
  --color-shield:      #1A3A5C;   /* FraudSense primary — shield blue */
  --color-carbon:      #2D6B4A;   /* CarbonKisan — deep green */
}
```

**Module colour associations (consistent throughout app):**
```
CropMind      → --color-leaf, --color-sprout
ClimateGuard  → --color-sky, --color-rain
FraudSense    → --color-shield, --color-danger
SaathiVoice   → --color-saffron, --color-turmeric
MandiBridge   → --color-turmeric, --color-wheat
CarbonKisan   → --color-carbon, --color-paddy
```

### 2.2 Typography

```css
/* Display — Tiro Devanagari Hindi */
/* Chosen because it renders Hindi and English with equal beauty.
   Most Indian agriculture apps use generic sans-serifs — this is distinctive. */
@import url('https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&display=swap');

/* Body — Noto Sans (covers all 22 Bhashini languages with one font family) */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;700&family=Noto+Sans+Devanagari:wght@300;400;500;700&display=swap');

/* Data / Mono — JetBrains Mono (prices, scores, codes) */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-display:  'Tiro Devanagari Hindi', Georgia, serif;
  --font-body:     'Noto Sans', 'Noto Sans Devanagari', sans-serif;
  --font-data:     'JetBrains Mono', monospace;
}
```

**Type Scale:**
```css
:root {
  /* PWA — Mobile First (Ramu Kaka) */
  --text-hero:    clamp(28px, 6vw, 40px);   /* App name, critical alerts */
  --text-title:   clamp(20px, 4vw, 28px);   /* Module names, screen titles */
  --text-heading: clamp(17px, 3.5vw, 22px); /* Card titles, section headers */
  --text-body:    clamp(16px, 3vw, 18px);   /* All body text — min 16px always */
  --text-label:   clamp(13px, 2.5vw, 15px); /* Labels, metadata */
  --text-data:    clamp(12px, 2vw, 14px);   /* Prices, scores (JetBrains Mono) */

  /* Elder Mode (accessibility_mode.elder = true) */
  --text-body-elder:    22px;
  --text-heading-elder: 26px;
  --text-title-elder:   32px;
}
```

### 2.3 Spacing Scale

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  24px;
  --space-6:  32px;
  --space-7:  48px;
  --space-8:  64px;
  --space-9:  96px;
}
```

### 2.4 Border Radius

```css
:root {
  --radius-sm:   6px;
  --radius-md:   12px;
  --radius-lg:   20px;
  --radius-xl:   28px;
  --radius-pill: 999px;
}
```

### 2.5 Shadows

```css
:root {
  --shadow-sm:  0 1px 3px rgba(30,18,6,0.08);
  --shadow-md:  0 4px 16px rgba(30,18,6,0.10);
  --shadow-lg:  0 12px 40px rgba(30,18,6,0.14);
  --shadow-glow-saffron: 0 0 24px rgba(232,117,10,0.35);
  --shadow-glow-danger:  0 0 24px rgba(192,57,43,0.30);
}
```

---

## 3. Component Library

### 3.1 The Module Card (Home Screen)

Six large tappable cards on the home screen. Each is a portal to a module.

```
┌─────────────────────────────────┐
│  🌿              [LIVE badge]   │
│                                 │
│  CropMind                       │
│  फसल बीमारी पहचानें              │
│  Identify crop diseases          │
│                                 │
│  ───────────────────────────    │
│  Last scan: 2 days ago          │
└─────────────────────────────────┘
```

**Specifications:**
- Size: Full width, 140px height minimum (elder: 180px)
- Touch target: entire card
- Left icon: 48px emoji/SVG, module colour background circle
- Badge: live pulse dot if module has real-time data
- Hindi subtitle: always present, above English
- Bottom strip: last activity or live data preview
- Tap feedback: scale(0.97) + haptic vibration

### 3.2 Alert Card (FraudSense)

The most critical UI component. Must communicate danger instantly without requiring reading.

```
┌─────────────────────────────────────┐
│ ⚠️  DANGER          2 minutes ago  │
│ ─────────────────────────────────  │
│                                     │
│  Fake call blocked                  │
│  नकली CBI गिरफ्तारी कॉल रोकी         │
│                                     │
│  Risk Score: ████████░░  94%        │
│                                     │
│  [Report to 1930]  [Ignore]         │
└─────────────────────────────────────┘
```

**Colour states:**
```
DANGER (scam blocked)   → red border (#C0392B), red icon, red badge
WARNING (suspicious)    → turmeric border, warning icon
SAFE (verified)         → leaf green border, checkmark
INFO (educational)      → sky blue border, info icon
```

**Interaction:**
- Card appears with slide-up animation from bottom
- Danger cards: device vibrates in SOS pattern (3 short, 3 long, 3 short)
- Danger cards: screen flashes red once (if reduced-motion not set)
- "Report to 1930" → one tap, confirmation dialog, auto-submits

### 3.3 Crop Diagnosis Result Card

```
┌────────────────────────────────────────┐
│  📸 Your Crop            94% confident │
│  ──────────────────────────────────── │
│                                        │
│  🔴  Iron Deficiency                   │
│      लोहे की कमी (Iron ki kami)         │
│                                        │
│  Treatment:                            │
│  • FeSO₄ spray करें (Spray FeSO₄)     │
│  • 500g per acre, next 2 days          │
│  • Cost: ₹120–180 at local shop        │
│                                        │
│  ──────────────────────────────────── │
│  🔊 Listen in Hindi    📞 Call Expert  │
└────────────────────────────────────────┘
```

**Key rules:**
- Disease name: Hindi first, English in parentheses
- Treatment: numbered steps, max 3 steps shown
- Cost estimate: always include — farmers need to know affordability
- Voice button: always present, prominent

### 3.4 Weather Widget (ClimateGuard)

```
┌──────────────────────────────────────────┐
│  Bareilly, UP          Updated 3 min ago │
│                                          │
│         ⛈️                               │
│    Heavy Rain                            │
│    भारी बारिश                            │
│    Expected in 34 hours                  │
│                                          │
│  ┌────────┬────────┬────────┬────────┐  │
│  │ Today  │ Fri    │ Sat    │ Sun    │  │
│  │  ⛅    │  🌧️    │  ⛈️    │  ☀️    │  │
│  │  27°   │  24°   │  22°   │  29°  │  │
│  └────────┴────────┴────────┴────────┘  │
│                                          │
│  ⚠️ ACTION NEEDED                        │
│  Harvest rows 3–7 before 6 PM today      │
│  फसल की कटाई करें                         │
└──────────────────────────────────────────┘
```

### 3.5 Mandi Price Card

```
┌─────────────────────────────────────────┐
│  गेहूँ (Wheat)            Bareilly Mandi │
│  ──────────────────────────────────── │
│                                         │
│  ₹2,280                                 │
│  per quintal today                      │
│                                         │
│  📈 AI Prediction: ₹2,340 in 4 days    │
│     Best sell: Dec 17–19               │
│                                         │
│  ████████████████░░░░  +2.4% this week │
│                                         │
│  [Set Price Alert]  [Book Transport]    │
└─────────────────────────────────────────┘
```

### 3.6 Voice Input Button (SaathiVoice)

This is the most important single UI element. Present on every screen.

```
┌──────────────────────────────────────┐
│                                      │
│           🎤                         │
│    बोलकर पूछें                        │
│    Ask by speaking                   │
│                                      │
│  ● ● ●  (pulse animation)           │
└──────────────────────────────────────┘
```

**Specifications:**
- Size: 80px × 80px circular button
- Position: Fixed bottom-right (floating), 24px from edges
- Colour: --color-saffron background, white icon
- State: pulsing animation when listening, waveform when processing
- Accessible: `aria-label="Speak your question"`, keyboard trigger on Space

### 3.7 Carbon Credit Badge

```
┌──────────────────────────┐
│  🌱  This Season          │
│                          │
│  6 Credits Earned        │
│  6 क्रेडिट अर्जित किए     │
│                          │
│  ₹ 2,340 value           │
└──────────────────────────┘
```

---

## 4. Screen Layouts

### 4.1 Home Screen (PWA — Farmer View)

```
┌─────────────────────────────────┐
│  ☰     KisanShield    🔔  👤   │  ← Top bar: 56px
├─────────────────────────────────┤
│                                 │
│  नमस्ते, Ramu bhai 🌾           │  ← Personalised greeting
│  Bareilly, UP  |  Wheat Season  │
│                                 │
├─────────────────────────────────┤
│  ⚠️ ALERT — Heavy rain in 34h  │  ← Sticky alert if CRITICAL
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │  🌿  CropMind           │   │  ← Module cards
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │  ⛈️  ClimateGuard        │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │  🛡️  FraudSense          │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │  📊  MandiBridge         │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │  🌱  CarbonKisan         │   │
│  └─────────────────────────┘   │
│                                 │
│                      [🎤]      │  ← Floating voice button
└─────────────────────────────────┘
```

### 4.2 CropMind Screen

```
┌─────────────────────────────────┐
│  ←   CropMind — फसल जाँच       │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │    📷  Camera Preview   │   │  ← Full-width camera or upload
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  [📸 Take Photo]  [🖼️ Upload]  │  ← Large buttons, 56px height
│                                 │
│  ─── OR ───────────────────── │
│                                 │
│  Describe in voice:             │
│  [🎤 Speak about your crop]    │
│                                 │
├─────────────────────────────────┤
│  Recent Scans                   │
│  ┌─────────────────────────┐   │
│  │ Wheat | Iron Deficiency  │   │
│  │ 2 days ago | ✅ Treated  │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### 4.3 FraudSense Screen

```
┌─────────────────────────────────┐
│  ←   FraudSense — सुरक्षा       │
├─────────────────────────────────┤
│                                 │
│  🛡️  Protection: ACTIVE         │
│  ████████████████████  SECURE  │
│                                 │
├─────────────────────────────────┤
│  Today's Threats                │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🚨 Blocked Call         │   │
│  │ +91 98423 ■■■■■         │   │
│  │ Digital Arrest scam     │   │
│  │ 2 hours ago             │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ⚠️ Suspicious WA message │   │
│  │ Job offer phishing link  │   │
│  │ 5 hours ago  [View]      │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│  Family Protected               │
│  Suresh (Son) · Priya (Daughter)│
│  [+ Add Family Member]          │
└─────────────────────────────────┘
```

### 4.4 Admin Dashboard (Field Officer — Desktop)

```
┌────────────────────────────────────────────────────────────────┐
│  KisanShield Admin          Bareilly District    Logout  [EN] │
├──────────┬─────────────────────────────────────────────────────┤
│          │                                                      │
│  NAV     │  OVERVIEW                                           │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐ │
│  Overview│  │  2,847   │ │   94%    │ │  ₹4.2L   │ │  12   │ │
│  Farmers │  │ Farmers  │ │ Alert    │ │  Fraud   │ │ Active│ │
│  Alerts  │  │ Active   │ │ Delivery │ │ Prevented│ │ Alerts│ │
│  Fraud   │  └──────────┘ └──────────┘ └──────────┘ └───────┘ │
│  Markets │                                                      │
│  Carbon  │  LIVE ALERTS MAP (district heatmap)                 │
│  Reports │  ┌──────────────────────────────────────────────┐  │
│          │  │                                              │  │
│          │  │   [Interactive map: Bareilly district        │  │
│          │  │    Red dots = fraud alerts                   │  │
│          │  │    Yellow = weather warnings                 │  │
│          │  │    Green = crop health good]                 │  │
│          │  │                                              │  │
│          │  └──────────────────────────────────────────────┘  │
│          │                                                      │
│          │  RECENT ACTIVITY (real-time, Supabase live)         │
│          │  ─────────────────────────────────────────────────  │
│          │  🚨 Fraud blocked · Ramu Kaka · 2 min ago           │
│          │  🌿 Diagnosis done · Meera Devi · 4 min ago         │
│          │  ⛈️ Alert sent · 847 farmers · 8 min ago            │
└──────────┴─────────────────────────────────────────────────────┘
```

---

## 5. Motion & Animation

**Philosophy:** Motion serves communication, not decoration. One orchestrated moment per screen.

```css
/* Base transitions — all interactive elements */
.interactive {
  transition: transform 150ms ease, opacity 150ms ease, box-shadow 200ms ease;
}

/* Card tap feedback */
.module-card:active {
  transform: scale(0.97);
}

/* Alert slide-in (FraudSense emergency alerts) */
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);   opacity: 1; }
}
.alert-emergency {
  animation: slideUp 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Voice button pulse (listening state) */
@keyframes voicePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(232,117,10, 0.6); }
  50%       { box-shadow: 0 0 0 20px rgba(232,117,10, 0); }
}
.voice-btn.listening {
  animation: voicePulse 1.2s ease infinite;
}

/* Data count-up (prices, scores) */
/* Implemented via JS CountUp.js — no CSS animation */

/* Screen transitions */
/* Page enter: fade + translateY(8px) → translateY(0), 250ms */
/* Page exit:  fade out, 150ms */

/* Respect reduced motion always */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Elder Mode & Accessibility UI Rules

**When `accessibility_mode.elder = true`:**

```css
.elder-mode {
  --text-body:    22px;
  --text-heading: 28px;
  --text-title:   34px;

  /* Increased spacing */
  --space-4: 24px;
  --space-5: 36px;

  /* High contrast */
  --color-parchment: #FFFFFF;
  --color-muted:     #3A2A1A;
}

.elder-mode .module-card {
  min-height: 180px;   /* Bigger tap target */
  font-size: 22px;
}

.elder-mode .btn {
  min-height: 60px;
  font-size: 20px;
  padding: 16px 32px;
}
```

**When `accessibility_mode.deaf = true`:**
- All audio replaced with visual indicator
- ISL video thumbnail shown on every diagnostic result
- Captions on all voice responses
- No voice-only information — everything shown in text too

---

## 7. Iconography Rules

- **All module icons:** Custom SVG set, agriculture-themed. No generic Material icons.
- **Status icons:** Emoji for farmer-facing (universal, no literacy needed). SVG for admin.
- **Icon sizes:** 24px (inline), 32px (list items), 48px (module cards), 64px (hero states)
- **Never use icon alone without label** — except on module cards where the icon is decorative and label is always present below

**Module icon reference:**
```
CropMind      🌿  (leaf SVG — custom, not emoji on PWA)
ClimateGuard  ⛈️  (cloud-lightning SVG)
FraudSense    🛡️  (shield SVG — filled, not outline)
SaathiVoice  🎤  (microphone SVG)
MandiBridge   📊  (chart-up SVG)
CarbonKisan   🌱  (seedling SVG)
```

---

## 8. WhatsApp Bot UX Rules

The WhatsApp interface cannot be styled — but conversation design is UI.

**Message formatting conventions:**
```
✅ Correct crop diagnosis reply:

🌿 *CropMind Analysis*
━━━━━━━━━━━━━━━━━━━━

Disease: *Iron Deficiency* (लोहे की कमी)
Confidence: 94%

📋 *Treatment Steps:*
1. FeSO₄ (ferrous sulphate) spray करें
2. Dose: 500g per acre
3. Best time: अगले 2 दिन में
4. Cost: ₹120–180 (नजदीकी दुकान पर)

🔊 Voice explanation: [Audio file attached]
📞 Need expert? Reply EXPERT

━━━━━━━━━━━━━━━━━━━━
_KisanShield by Bharat Academix_
```

**WhatsApp bot rules:**
- Every reply under 500 characters if possible
- Hindi first, English in parentheses for technical terms
- Always include a voice note for low-literacy users
- Menu always available via "MENU" keyword
- Never more than 3 options in a single message
- Use emoji sparingly — one per section header only

---

## 9. Signature Design Element

**The one thing KisanShield will be remembered for visually:**

The **Crop Health Ring** — a circular progress indicator that appears on the home screen showing the farmer's overall farm health score (0–100). It is drawn in the visual language of a tawa (Indian flat griddle) — concentric circles in terracotta/clay, with a single saffron arc that fills based on the health score. It pulses slowly, like a heartbeat, suggesting life.

This is not decoration. The ring encodes: crop health, weather safety status, and fraud protection status — all in one glance, without any reading required.

```
      🌾
   ╭──────╮
  │  84   │   ← Score (large, centre)
  │       │
   ╰──────╯
    Good 👍    ← Single word status (colour-coded)
```

No other app in Indian agritech has this. It becomes the face of KisanShield.
