import { supabase } from '../supabase';
import type { FraudIncident, ScamType } from '../types';

const SCAM_KEYWORDS: Record<ScamType, string[]> = {
  digital_arrest: ['cbi', 'police', 'arrest', 'fir', 'गिरफ्तार', 'सीबीआई', 'court', 'अदालत', 'custody'],
  upi_fraud: ['upi', 'pin', 'otp', 'send money', 'पैसे भेजो', 'account block', 'kyc', 'verify', 'पिन'],
  fake_kyc: ['kyc', 'aadhar', 'आधार', 'pan card', 'update account', 'bank', 'बैंक', 'expire'],
  job_scam: ['job offer', 'salary', 'work from home', 'registration fee', 'नौकरी', 'फीस', 'fee'],
  legitimate: [],
};

export function classifyMessageAsScam(message: string): { scam_type: ScamType; confidence: number; is_scam: boolean } {
  const lower = message.toLowerCase();
  const scores: Partial<Record<ScamType, number>> = {};

  for (const [type, keywords] of Object.entries(SCAM_KEYWORDS)) {
    if (type === 'legitimate') continue;
    const hits = keywords.filter(k => lower.includes(k)).length;
    if (hits > 0) scores[type as ScamType] = hits / keywords.length;
  }

  const entries = Object.entries(scores) as [ScamType, number][];
  if (entries.length === 0) return { scam_type: 'legitimate', confidence: 0.05, is_scam: false };

  entries.sort((a, b) => b[1] - a[1]);
  const [topType, topScore] = entries[0];
  const confidence = Math.min(0.95, 0.5 + topScore * 2);

  return { scam_type: topType, confidence, is_scam: confidence > 0.55 };
}

// Use Groq for deeper semantic analysis
export async function analyzeMessageWithGroq(message: string): Promise<{ scam_type: ScamType; confidence: number; explanation: string; explanation_hindi: string }> {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!groqKey || groqKey === 'ADD_YOUR_GROQ_KEY_HERE') {
    const local = classifyMessageAsScam(message);
    return { ...local, explanation: 'Local keyword analysis performed.', explanation_hindi: 'स्थानीय कीवर्ड विश्लेषण किया गया।' };
  }

  try {
    const prompt = `You are a fraud detection system protecting Indian farmers from cyber scams.

Analyze this message and respond ONLY with valid JSON:
"${message}"

Respond in this exact format:
{
  "scam_type": "digital_arrest" | "upi_fraud" | "fake_kyc" | "job_scam" | "legitimate",
  "confidence": 0.0 to 1.0,
  "explanation": "One sentence in English explaining why",
  "explanation_hindi": "एक वाक्य हिंदी में"
}`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) throw new Error(`Groq error: ${res.status}`);
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (err) {
    console.error('[fraudService.analyzeMessageWithGroq]', err);
    const local = classifyMessageAsScam(message);
    return { ...local, explanation: 'Analysis failed — keyword detection used.', explanation_hindi: 'विश्लेषण विफल — कीवर्ड जांच की गई।' };
  }
}

export async function saveFraudIncident(farmerId: string, incident: Omit<FraudIncident, 'id' | 'farmer_id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('fraud_incidents').insert([{ farmer_id: farmerId, ...incident }]);
  if (error) console.error('[fraudService.saveFraudIncident]', error.message);
}

export async function getFraudIncidents(farmerId: string): Promise<FraudIncident[]> {
  const { data, error } = await supabase
    .from('fraud_incidents')
    .select('id, farmer_id, scam_type, confidence, caller_number, transcript, fir_submitted, family_notified, created_at')
    .eq('farmer_id', farmerId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) { console.error('[fraudService.getFraudIncidents]', error.message); return []; }
  return data ?? [];
}

export async function getAllFraudIncidents(): Promise<FraudIncident[]> {
  const { data, error } = await supabase
    .from('fraud_incidents')
    .select('id, farmer_id, scam_type, confidence, caller_number, transcript, fir_submitted, family_notified, created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) { console.error('[fraudService.getAllFraudIncidents]', error.message); return []; }
  return data ?? [];
}

export function formatScamType(type: ScamType): { label: string; label_hindi: string; color: string } {
  const map: Record<ScamType, { label: string; label_hindi: string; color: string }> = {
    digital_arrest: { label: 'Digital Arrest', label_hindi: 'नकली गिरफ्तारी', color: '#C0392B' },
    upi_fraud: { label: 'UPI Fraud', label_hindi: 'UPI धोखाधड़ी', color: '#E8750A' },
    fake_kyc: { label: 'Fake KYC', label_hindi: 'नकली KYC', color: '#D4A017' },
    job_scam: { label: 'Job Scam', label_hindi: 'नौकरी धोखा', color: '#6B2D0F' },
    legitimate: { label: 'Legitimate', label_hindi: 'सुरक्षित', color: '#1F6B45' },
  };
  return map[type];
}
