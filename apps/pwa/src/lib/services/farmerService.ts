import { supabase } from '../supabase';
import type { FarmerProfile } from '../types';

export async function getFarmerByPhone(phone: string): Promise<FarmerProfile | null> {
  const { data, error } = await supabase
    .from('farmers')
    .select('id, phone, name, language, district, state, lat, lng, accessibility_mode, created_at')
    .eq('phone', phone)
    .single();

  if (error) {
    console.error('[farmerService.getFarmerByPhone]', error.message);
    return null;
  }
  return data;
}

export async function createFarmer(phone: string, name?: string, district?: string, state?: string): Promise<FarmerProfile | null> {
  const { data, error } = await supabase
    .from('farmers')
    .insert([{ phone, name: name ?? null, district: district ?? null, state: state ?? null }])
    .select()
    .single();

  if (error) {
    console.error('[farmerService.createFarmer]', error.message);
    return null;
  }
  return data;
}

export async function upsertFarmer(phone: string, updates: Partial<FarmerProfile>): Promise<FarmerProfile | null> {
  const { data, error } = await supabase
    .from('farmers')
    .upsert({ phone, ...updates })
    .select()
    .single();

  if (error) {
    console.error('[farmerService.upsertFarmer]', error.message);
    return null;
  }
  return data;
}

export async function getAllFarmers(): Promise<FarmerProfile[]> {
  const { data, error } = await supabase
    .from('farmers')
    .select('id, phone, name, language, district, state, lat, lng, accessibility_mode, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[farmerService.getAllFarmers]', error.message);
    return [];
  }
  return data ?? [];
}
