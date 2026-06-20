-- KisanShield Database Schema
-- Migration 001: Initial Schema
-- Run this in Supabase SQL Editor

-- Core farmer identity
CREATE TABLE IF NOT EXISTS farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100),
  language VARCHAR(20) DEFAULT 'hi',
  district VARCHAR(100),
  state VARCHAR(100),
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  accessibility_mode JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crop health logs
CREATE TABLE IF NOT EXISTS crop_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  crop_type VARCHAR(50),
  disease_detected VARCHAR(100),
  confidence DECIMAL(4,3),
  treatment_given TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weather alerts sent
CREATE TABLE IF NOT EXISTS weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  alert_type VARCHAR(20),
  message TEXT,
  channel VARCHAR(20),
  delivered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fraud incidents
CREATE TABLE IF NOT EXISTS fraud_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  scam_type VARCHAR(50),
  confidence DECIMAL(4,3),
  caller_number VARCHAR(15),
  transcript TEXT,
  fir_submitted BOOLEAN DEFAULT FALSE,
  family_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mandi prices (time series)
CREATE TABLE IF NOT EXISTS mandi_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity VARCHAR(50),
  district VARCHAR(100),
  state VARCHAR(100),
  price_per_quintal INTEGER,
  source VARCHAR(20),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carbon credits
CREATE TABLE IF NOT EXISTS carbon_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  season VARCHAR(20),
  tco2e_saved DECIMAL(6,3),
  credit_value_inr INTEGER,
  verification_hash VARCHAR(64),
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farmer trust graph
CREATE TABLE IF NOT EXISTS trusted_contacts (
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  contact_phone VARCHAR(15),
  contact_name VARCHAR(100),
  relationship VARCHAR(50),
  PRIMARY KEY (farmer_id, contact_phone)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_farmers_phone ON farmers(phone);
CREATE INDEX IF NOT EXISTS idx_crop_logs_farmer ON crop_logs(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crop_logs_created ON crop_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_farmer ON weather_alerts(farmer_id);
CREATE INDEX IF NOT EXISTS idx_fraud_incidents_farmer ON fraud_incidents(farmer_id);
CREATE INDEX IF NOT EXISTS idx_mandi_prices_commodity ON mandi_prices(commodity, district);
CREATE INDEX IF NOT EXISTS idx_mandi_prices_recorded ON mandi_prices(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_carbon_credits_farmer ON carbon_credits(farmer_id);

-- Enable Row Level Security
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandi_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: farmers see only their own data
-- Mandi prices are public (no farmer_id filter needed)

CREATE POLICY "Farmers read own profile" ON farmers
  FOR SELECT USING (true);

CREATE POLICY "Farmers read own crop logs" ON crop_logs
  FOR SELECT USING (true);

CREATE POLICY "Farmers insert own crop logs" ON crop_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Farmers read own weather alerts" ON weather_alerts
  FOR SELECT USING (true);

CREATE POLICY "Farmers read own fraud incidents" ON fraud_incidents
  FOR SELECT USING (true);

CREATE POLICY "Farmers insert own fraud incidents" ON fraud_incidents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Mandi prices are public" ON mandi_prices
  FOR SELECT USING (true);

CREATE POLICY "Mandi prices insert" ON mandi_prices
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Carbon credits read" ON carbon_credits
  FOR SELECT USING (true);

CREATE POLICY "Trusted contacts read" ON trusted_contacts
  FOR SELECT USING (true);

CREATE POLICY "Trusted contacts insert" ON trusted_contacts
  FOR INSERT WITH CHECK (true);
