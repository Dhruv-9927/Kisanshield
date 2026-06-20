// KisanShield — Shared TypeScript Types
// Single source of truth for all types

export const LANGUAGE_CODES = ['hi', 'te', 'ta', 'bn', 'mr', 'pa', 'gu', 'kn', 'ml', 'or', 'as', 'ur'] as const;
export type BhashiniLanguageCode = typeof LANGUAGE_CODES[number];

export const ALERT_LEVELS = ['CRITICAL', 'WARNING', 'INFO'] as const;
export type AlertLevel = typeof ALERT_LEVELS[number];

export const SCAM_TYPES = ['digital_arrest', 'upi_fraud', 'fake_kyc', 'job_scam', 'legitimate'] as const;
export type ScamType = typeof SCAM_TYPES[number];

export const CROP_TYPES = ['wheat', 'rice', 'mustard', 'sugarcane', 'cotton', 'maize', 'soybean', 'potato'] as const;
export type CropType = typeof CROP_TYPES[number];

export interface AccessibilityMode {
  elder?: boolean;
  deaf?: boolean;
  low_literacy?: boolean;
}

export interface FarmerProfile {
  id: string;
  phone: string;
  name: string | null;
  language: BhashiniLanguageCode;
  district: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  accessibility_mode: AccessibilityMode;
  created_at: string;
}

export interface CropDiagnosis {
  disease: string;
  disease_hindi: string;
  confidence: number;
  crop_type: string;
  treatment_steps: TreatmentStep[];
  cost_estimate: string;
  image_url?: string;
}

export interface TreatmentStep {
  step: number;
  instruction: string;
  instruction_hindi: string;
}

export interface CropLog {
  id: string;
  farmer_id: string;
  crop_type: string | null;
  disease_detected: string | null;
  confidence: number | null;
  treatment_given: string | null;
  image_url: string | null;
  created_at: string;
}

export interface WeatherAlert {
  id: string;
  farmer_id: string;
  alert_type: AlertLevel;
  message: string;
  channel: string;
  delivered: boolean;
  created_at: string;
}

export interface WeatherForecast {
  location: string;
  current: {
    condition: string;
    condition_hindi: string;
    icon: string;
    temp: number;
    humidity: number;
    wind_speed: number;
  };
  forecast: DayForecast[];
  action_required: string | null;
  action_hindi: string | null;
  alert_level: AlertLevel;
}

export interface DayForecast {
  day: string;
  icon: string;
  temp_max: number;
  temp_min: number;
  condition: string;
}

export interface FraudIncident {
  id: string;
  farmer_id: string;
  scam_type: ScamType;
  confidence: number;
  caller_number: string | null;
  transcript: string | null;
  fir_submitted: boolean;
  family_notified: boolean;
  created_at: string;
}

export interface MandiPrice {
  id: string;
  commodity: string;
  district: string;
  state: string;
  price_per_quintal: number;
  source: string;
  recorded_at: string;
  predicted_price?: number;
  best_sell_window?: string;
  trend_percent?: number;
}

export interface CarbonCredit {
  id: string;
  farmer_id: string;
  season: string;
  tco2e_saved: number;
  credit_value_inr: number;
  verification_hash: string;
  issued_at: string;
}

export interface TrustedContact {
  farmer_id: string;
  contact_phone: string;
  contact_name: string;
  relationship: string;
}

export interface FarmHealthScore {
  overall: number;
  crop_health: number;
  weather_safety: number;
  fraud_protection: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  status_hindi: string;
}
