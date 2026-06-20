# KisanShield — Project Context
**Version:** 1.0.0  
**Read this before writing a single line of code.**

---

## 1. What Is KisanShield?

KisanShield is a multi-channel rural intelligence platform built for India's most underserved citizens — smallholder farmers, first-time digital users, the elderly, and people with disabilities living in India's tier-2, tier-3 cities and villages.

It is not a startup. It is not a product looking for a market. It is infrastructure for people who have been failed by every previous wave of Indian tech.

It delivers six capabilities through three channels:
- A WhatsApp bot (primary — requires no app download)
- A Progressive Web App with offline support (secondary — for connected users)
- An IVR voice system (tertiary — for feature phone users with no internet)

All six modules share one database, one farmer identity, and one design language.

---

## 2. Why This Exists — The Real Numbers

These are not made up for a pitch. Every number has a source.

| Problem | Fact | Source |
|---|---|---|
| Agriculture | 58% of rural India depends on farming. 60% of farmland faces climate-linked productivity loss | Farmonaut 2025 |
| Cybercrime | ₹22,495 crore lost in 2025. Only 6% recovered. UPI fraud up 85% in FY24 | NCRB / I4C 2025 |
| Accessibility | 120 million Indians live with disabilities. Supreme Court declared digital access a fundamental right in April 2025 | WHO 2024 / SC judgment |
| Climate | Farmers have no hyperlocal early warning. They plant by calendar, not data | IMD / ICRISAT |
| Language | 45% of rural India has no access to digital advisory in their language | Farmonaut 2025 |

---

## 3. Who We Are Building For

### Primary User: The Farmer (Ramu Kaka)

> Ramu Kaka, 58. Bareilly, Uttar Pradesh. Wheat and mustard farmer on 2.3 acres. Has a basic Android phone (Redmi 9). Uses WhatsApp to send voice notes to his son in Delhi. Has never downloaded an app from the Play Store. Reads Hindi slowly. Arthritic fingers. Received his first Kisan Credit Card in 2023 and doesn't fully understand it. Lost ₹34,000 to a fake "KYC update" call in 2024.

**What Ramu needs from us:**
- Tell him when his crop is sick, in Hindi, in under 60 seconds
- Warn him about the hailstorm before it destroys his wheat
- Stop the scam call before he picks up
- Tell him when to sell his wheat for the best price
- Do all of this without requiring him to learn anything new

**What Ramu cannot deal with:**
- English text
- Registration forms
- App downloads
- More than 3 options at once
- Small text
- Loading screens longer than 4 seconds

### Secondary User: The Admin / Field Officer

> Priya Sharma, 28. Works at the Bareilly Krishi Vigyan Kendra. Manages outreach for 3,000 farmers across 12 villages. Uses a laptop at the office and a mid-range Android in the field. Fluent in Hindi and English. Needs to see which farmers are in distress, which got alerts, and whether the alerts were delivered.

**What Priya needs from us:**
- A real-time map of her district with farmer health signals
- Fraud incident logs she can escalate to the police
- Crop disease trend data across her cluster
- Weather alert delivery confirmation
- Carbon credit status per farmer for government reporting

### Tertiary User: The Disabled / Elderly Farmer

> Suresh, 72. Visually impaired. Relies on his granddaughter to read him WhatsApp messages. Or Meera, 45, deaf since birth, communicates via Indian Sign Language. Both are farmers. Neither can use any existing agritech app.

**What they need:**
- Full voice interaction (Suresh)
- ISL video responses (Meera)
- Zero reading required for any function
- High contrast + large text for low vision users

---

## 4. The Six Modules — Purpose & Priority

| Module | Core Purpose | Delivery Channels | Build Priority |
|---|---|---|---|
| CropMind | Crop disease detection + treatment advice | WhatsApp, PWA | P0 — Demo must show this |
| FraudSense | Scam interception + reporting | Android App, WhatsApp | P0 — Demo must show this |
| ClimateGuard | Hyperlocal weather alerts | WhatsApp, IVR | P1 — Should work at demo |
| MandiBridge | Market price intelligence + sell timing | WhatsApp, PWA | P1 — Should work at demo |
| SaathiVoice | Accessibility layer (not standalone) | All channels | P0 — Underpins everything |
| CarbonKisan | Carbon credit tracking | PWA, WhatsApp | P2 — Roadmap demo only |

**For the hackathon build: make P0 modules work end-to-end before touching P1 or P2.**

---

## 5. What KisanShield Is NOT

This clarity prevents scope creep during build.

- **Not a social network** — farmers don't post, they query
- **Not a marketplace** — MandiBridge connects to FPOs, it doesn't run a marketplace itself
- **Not a bank** — we don't handle money, we protect the money farmer's have
- **Not a satellite company** — we consume ISRO/IMD data, we don't generate it
- **Not an insurance product** — crop loss data feeds into advisory, not underwriting
- **Not a government scheme portal** — we surface relevant schemes contextually, we are not e-Disha or CSC

---

## 6. Technology Decisions & Why

Every decision here was made deliberately. Do not change these without a team discussion.

### Why WhatsApp as Primary Channel?
India has 800+ million WhatsApp users. Rural penetration is deep. Farmers already trust it — they use it daily. No app download means zero friction. WhatsApp Business API supports image, audio, and interactive buttons. This was not a convenience choice — it is the difference between reaching 10 users and reaching 10 million.

### Why n8n for Orchestration?
We are a hackathon team, not a funded startup with backend engineers. n8n lets us wire together 15+ APIs visually, debug in real-time, and deploy without writing a custom server. It handles webhooks, CRON jobs, API chains, and conditional logic. Self-hosted on Railway costs ₹0. The alternative (writing a Node.js backend) would consume 60% of our build time for infrastructure instead of features.

### Why Supabase?
Free PostgreSQL with Row-Level Security, realtime subscriptions, built-in auth (OTP via phone number — perfect for farmers), and a storage bucket for images. The admin dashboard can subscribe to live farmer activity without polling. No Firebase (Google ecosystem lock-in), no MongoDB (wrong data model for relational farmer data).

### Why Roboflow for CropMind?
Training a CNN from scratch requires GPU time we don't have. Roboflow hosts pre-labelled Indian crop disease datasets (we supplement with our own photos). Free inference tier gives 1,000 API calls/month — enough for demo and early pilot. The model deploys as an API endpoint in hours, not weeks.

### Why Bhashini (MeitY)?
It's free. It's government-backed. It covers 22 Indian languages including dialects. It has TTS (text-to-speech) built in. The alternative (Google Translate API) costs money and doesn't support Awadhi, Bhojpuri, or Maithili — which is exactly where our farmers live.

### Why NOT React Native?
We chose PWA over React Native for four reasons: no Play Store approval required, instant updates without user action, installable via WhatsApp link share, and lighter build. Our farmers won't find us in a search — they'll get a link from a field officer or a WhatsApp forward. PWA handles that. React Native doesn't.

---

## 7. Constraints We Accept

These are real constraints. We build within them.

**Technical:**
- n8n free tier: 5 active workflows. Use sub-workflow pattern to stay within limit.
- Roboflow free tier: 1,000 inferences/month. Enough for pilot, needs upgrade at scale.
- Supabase free tier: 500MB database, 1GB storage, 50,000 monthly active users.
- Twilio free trial: Limited IVR minutes. Use for demo only, document cost at scale.
- Hugging Face free inference: Rate limited. Whisper classification may queue under load.

**Time:**
- Demo must work in 4 weeks from kickoff.
- Full platform is a 6-month roadmap item.
- Hackathon goal: CropMind + FraudSense working live. Everything else: shown via dashboard mock.

**Legal:**
- We do not store scam call audio beyond the classification process. Only transcript stored.
- We do not intercept carrier calls. FraudSense operates on WhatsApp VoIP + number screening only.
- Farmer data is stored in Supabase Mumbai region (India-resident data).
- No farmer data is sent to non-Indian servers without explicit consent — Bhashini (Indian govt), IMD (Indian govt), Agmarknet (Indian govt) are all India-resident.

---

## 8. Build Sequence (4-Week Hackathon Plan)

### Week 1: Foundation
```
Day 1–2:
  □ Supabase project created, schema from architecture.md applied
  □ n8n instance running on Railway
  □ WhatsApp Business API sandbox connected to n8n webhook
  □ Twilio sandbox configured
  □ All API keys in .env.local, team members onboarded

Day 3–4:
  □ wa-inbound-router workflow built in n8n
  □ Farmer registration flow: send phone → OTP → profile created in Supabase
  □ "MENU" keyword returns module list in Hindi + English

Day 5–7:
  □ CropMind: photo received → Roboflow → diagnosis text → Bhashini translation → WhatsApp reply
  □ Basic PWA shell deployed on Vercel (home screen, module cards, no data yet)
```

### Week 2: Core Modules
```
Day 8–10:
  □ ClimateGuard: n8n CRON → OpenWeatherMap → risk classification → WhatsApp alert
  □ IVR: Twilio TwiML script for weather alerts in Hindi

Day 11–12:
  □ MandiBridge: Agmarknet scraper → Supabase → price query via WhatsApp
  □ Simple price chart in PWA

Day 13–14:
  □ FraudSense Layer 1: number screening database populated (1930 portal data)
  □ FraudSense Layer 2: WhatsApp message scam keyword classifier
  □ Family alert SMS via Twilio
```

### Week 3: Intelligence + Accessibility
```
Day 15–17:
  □ SaathiVoice: Bhashini TTS integrated, every WhatsApp reply gets audio note attached
  □ Voice input: Web Speech API in PWA for Hindi voice queries

Day 18–19:
  □ LSTM price prediction model trained, hosted on HF Spaces
  □ MandiBridge: predicted price shown alongside live price

Day 20–21:
  □ Admin dashboard: farmer count, alert log, fraud incidents, live Supabase feed
  □ CarbonKisan: form flow in WhatsApp, score calculation, credit shown in PWA
```

### Week 4: Polish + Demo Prep
```
Day 22–24:
  □ 10 real farmers onboarded in Bareilly (family / community network)
  □ End-to-end testing: real leaf photo, real weather data, real mandi prices
  □ All edge cases handled: bad photo, no connectivity, unknown language

Day 25–26:
  □ PWA Lighthouse audit → fix to 90+ score
  □ Accessibility audit: screen reader, keyboard nav, elder mode
  □ Load test: 100 simultaneous WhatsApp messages

Day 27–28:
  □ Demo script written and rehearsed 10 times
  □ Seed data loaded: Supabase shows realistic 500-farmer activity
  □ Backup demo plan prepared (if internet fails: screen recording of live demo)
```

---

## 9. Demo Day Script (The Exact Flow)

This is what you demonstrate live. Every step is rehearsed. No improvising.

**Step 1 — CropMind (90 seconds)**
Show a real diseased wheat leaf photo on your phone. Send it to the KisanShield WhatsApp number. In 8–12 seconds, a diagnosis arrives in Hindi with a voice note. Play the voice note. Say: *"No agronomist. No app. Just WhatsApp. In Hindi."*

**Step 2 — FraudSense (60 seconds)**
Send a pre-prepared WhatsApp message: *"Namaskar, main CBI officer hun. Aapke account mein suspicious activity hai. Abhi UPI PIN share karo."* Show the system flagging it within seconds. Show the family alert SMS firing. Say: *"This message would have cost Ramu Kaka ₹34,000. It cost him nothing."*

**Step 3 — Dashboard (60 seconds)**
Open the admin dashboard. Show live farmer activity feed updating in real-time (Supabase Realtime). Show the district weather alert that went to 847 farmers. Show the fraud log. Say: *"This is what a field officer sees. One screen. Real-time. Every district."*

**Step 4 — The Number (30 seconds)**
Point at the screen: *"₹22,495 crore. Lost to cyber fraud. Last year. In India. We built the first protection layer that works on a feature phone, in Hindi, for free."*

---

## 10. Post-Hackathon Roadmap

**Month 1–3: Bareilly Pilot**
- 500 farmers onboarded through UP Krishi Vigyan Kendra
- CropMind accuracy measured against agronomist ground truth
- FraudSense false positive rate tracked and model refined

**Month 3–6: UP State Scale**
- Partnership with 50 FPOs across UP for MandiBridge
- IVR rollout to 10 districts for non-smartphone farmers
- Apply: MeitY Startup Hub grant + Digital India agritech program

**Month 6–12: National**
- 5 states (UP, Bihar, MP, Rajasthan, Maharashtra)
- Bhashini integration for 8 more languages
- CarbonKisan: Verra registry integration for real carbon credit issuance
- Revenue: ₹49/month FPO subscription for MandiBridge premium data

**The vision in one line:**
*Every farmer in India, on every phone, in every language, protected from every threat — by infrastructure the government already built, connected for the first time.*
