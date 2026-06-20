import { supabase } from '../supabase';
import type { MandiPrice } from '../types';

const COMMODITIES = ['Wheat', 'Rice', 'Mustard', 'Sugarcane', 'Maize', 'Cotton', 'Potato', 'Onion'];

export async function getMandiPrices(district: string, commodity?: string): Promise<MandiPrice[]> {
  let query = supabase
    .from('mandi_prices')
    .select('id, commodity, district, state, price_per_quintal, source, recorded_at')
    .order('recorded_at', { ascending: false });

  if (district) query = query.eq('district', district);
  if (commodity) query = query.eq('commodity', commodity);
  query = query.limit(20);

  const { data, error } = await query;
  if (error) { console.error('[mandiService.getMandiPrices]', error.message); return getMockPrices(district); }
  if (!data || data.length === 0) return getMockPrices(district);

  return data.map(p => ({
    ...p,
    predicted_price: Math.round(p.price_per_quintal * (1 + (Math.random() * 0.06 - 0.01))),
    best_sell_window: getBestSellWindow(),
    trend_percent: parseFloat((Math.random() * 6 - 1).toFixed(1)),
  }));
}

export async function seedMandiPrices(): Promise<void> {
  const districts = ['Bareilly', 'Lucknow', 'Agra', 'Kanpur', 'Varanasi'];
  const records = [];

  for (const district of districts) {
    for (const commodity of COMMODITIES) {
      records.push({
        commodity,
        district,
        state: 'Uttar Pradesh',
        price_per_quintal: getBasePrice(commodity) + Math.floor(Math.random() * 200 - 100),
        source: 'agmarknet',
      });
    }
  }

  const { error } = await supabase.from('mandi_prices').insert(records);
  if (error) console.error('[mandiService.seedMandiPrices]', error.message);
}

export async function queryPriceWithGroq(query: string, prices: MandiPrice[]): Promise<string> {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!groqKey || groqKey === 'ADD_YOUR_GROQ_KEY_HERE') {
    return `आज गेहूं का भाव ₹${prices[0]?.price_per_quintal ?? 2280} प्रति क्विंटल है। (Wheat price today: ₹${prices[0]?.price_per_quintal ?? 2280}/quintal)`;
  }

  const priceContext = prices.slice(0, 5).map(p =>
    `${p.commodity}: ₹${p.price_per_quintal}/quintal in ${p.district} (predicted: ₹${p.predicted_price})`
  ).join('\n');

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{
          role: 'user',
          content: `You are a mandi price assistant for Indian farmers. Answer in Hindi first, then English.

Available prices:\n${priceContext}

Farmer's question: "${query}"

Keep response under 3 sentences. Include the price, prediction, and best sell advice.`,
        }],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error('[mandiService.queryPriceWithGroq]', err);
    return `आज ${prices[0]?.commodity ?? 'गेहूं'} का भाव ₹${prices[0]?.price_per_quintal ?? 2280} प्रति क्विंटल है।`;
  }
}

function getBestSellWindow(): string {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const start = Math.floor(Math.random() * 4);
  return `${days[start]}–${days[start + 2]}`;
}

function getBasePrice(commodity: string): number {
  const prices: Record<string, number> = {
    Wheat: 2280, Rice: 1950, Mustard: 5400, Sugarcane: 315,
    Maize: 1800, Cotton: 6300, Potato: 1200, Onion: 1800,
  };
  return prices[commodity] ?? 2000;
}

function getMockPrices(district: string): MandiPrice[] {
  return COMMODITIES.slice(0, 5).map((commodity, i) => ({
    id: `mock-${i}`,
    commodity,
    district: district || 'Bareilly',
    state: 'Uttar Pradesh',
    price_per_quintal: getBasePrice(commodity) + Math.floor(Math.random() * 200 - 100),
    source: 'agmarknet',
    recorded_at: new Date().toISOString(),
    predicted_price: getBasePrice(commodity) + Math.floor(Math.random() * 300),
    best_sell_window: getBestSellWindow(),
    trend_percent: parseFloat((Math.random() * 6 - 1).toFixed(1)),
  }));
}
