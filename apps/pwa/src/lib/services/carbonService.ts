import { supabase } from '../supabase';
import type { CarbonCredit } from '../types';


interface CarbonInputs {
  fertiliser_type: 'organic' | 'chemical' | 'mixed';
  fertiliser_kg_per_acre: number;
  irrigation_method: 'drip' | 'flood' | 'rain-fed';
  crop_rotation: boolean;
  stubble_burning: boolean;
  farm_acres: number;
}

// IPCC Tier 1 emission factors
const EMISSION_FACTORS = {
  fertiliser: { organic: 0.01, chemical: 0.08, mixed: 0.045 },
  irrigation: { drip: 0.5, flood: 2.1, 'rain-fed': 0.0 },
  crop_rotation_bonus: 0.3,
  stubble_burning_penalty: 1.8,
};

export function calculateCarbonScore(inputs: CarbonInputs): { tco2e_saved: number; credit_value_inr: number; breakdown: string } {
  const baseline_tco2e = inputs.farm_acres * 2.5; // avg Indian farm baseline

  const fertiliser_emissions = inputs.fertiliser_kg_per_acre * EMISSION_FACTORS.fertiliser[inputs.fertiliser_type] * inputs.farm_acres;
  const irrigation_emissions = EMISSION_FACTORS.irrigation[inputs.irrigation_method] * inputs.farm_acres;
  const stubble_penalty = inputs.stubble_burning ? EMISSION_FACTORS.stubble_burning_penalty * inputs.farm_acres : 0;
  const rotation_bonus = inputs.crop_rotation ? EMISSION_FACTORS.crop_rotation_bonus * inputs.farm_acres : 0;

  const actual_emissions = fertiliser_emissions + irrigation_emissions + stubble_penalty - rotation_bonus;
  const tco2e_saved = Math.max(0, parseFloat((baseline_tco2e - actual_emissions).toFixed(3)));
  const credit_value_inr = Math.floor(tco2e_saved * 390); // ~₹390/tCO2e (Gold Standard)

  return {
    tco2e_saved,
    credit_value_inr,
    breakdown: `Fertiliser: ${fertiliser_emissions.toFixed(2)}t | Irrigation: ${irrigation_emissions.toFixed(2)}t | Rotation bonus: ${rotation_bonus.toFixed(2)}t`,
  };
}

export async function issueCarbonCredit(farmerId: string, season: string, inputs: CarbonInputs): Promise<CarbonCredit | null> {
  const { tco2e_saved, credit_value_inr } = calculateCarbonScore(inputs);

  if (tco2e_saved < 0.5) {
    console.warn('[carbonService] Threshold not met:', tco2e_saved);
    return null;
  }

  const verification_hash = Math.random().toString(36).substring(2, 66).padEnd(64, '0');

  const { data, error } = await supabase
    .from('carbon_credits')
    .insert([{ farmer_id: farmerId, season, tco2e_saved, credit_value_inr, verification_hash }])
    .select()
    .single();

  if (error) { console.error('[carbonService.issueCarbonCredit]', error.message); return null; }
  return data;
}

export async function getCarbonCredits(farmerId: string): Promise<CarbonCredit[]> {
  const { data, error } = await supabase
    .from('carbon_credits')
    .select('id, farmer_id, season, tco2e_saved, credit_value_inr, verification_hash, issued_at')
    .eq('farmer_id', farmerId)
    .order('issued_at', { ascending: false });
  if (error) { console.error('[carbonService.getCarbonCredits]', error.message); return []; }
  return data ?? [];
}
