-- KisanShield — Fix RLS Policies
-- Run this in Supabase SQL Editor if you get "policy already exists" error

-- Drop existing policies first, then recreate
DROP POLICY IF EXISTS "Farmers read own profile" ON farmers;
DROP POLICY IF EXISTS "Farmers read own crop logs" ON crop_logs;
DROP POLICY IF EXISTS "Farmers insert own crop logs" ON crop_logs;
DROP POLICY IF EXISTS "Farmers read own weather alerts" ON weather_alerts;
DROP POLICY IF EXISTS "Farmers read own fraud incidents" ON fraud_incidents;
DROP POLICY IF EXISTS "Farmers insert own fraud incidents" ON fraud_incidents;
DROP POLICY IF EXISTS "Mandi prices are public" ON mandi_prices;
DROP POLICY IF EXISTS "Mandi prices insert" ON mandi_prices;
DROP POLICY IF EXISTS "Carbon credits read" ON carbon_credits;
DROP POLICY IF EXISTS "Trusted contacts read" ON trusted_contacts;
DROP POLICY IF EXISTS "Trusted contacts insert" ON trusted_contacts;

-- Recreate policies
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

CREATE POLICY "Carbon credits insert" ON carbon_credits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Trusted contacts read" ON trusted_contacts
  FOR SELECT USING (true);

CREATE POLICY "Trusted contacts insert" ON trusted_contacts
  FOR INSERT WITH CHECK (true);
