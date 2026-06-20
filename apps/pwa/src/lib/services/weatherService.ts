import { supabase } from '../supabase';
import type { WeatherForecast, WeatherAlert, AlertLevel } from '../types';

export async function getWeatherForecast(lat: number, lng: number, district: string): Promise<WeatherForecast> {
  const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

  if (!apiKey || apiKey === 'ADD_YOUR_OWM_KEY') {
    return getMockWeather(district);
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&exclude=minutely,hourly,alerts&units=metric&appid=${apiKey}`
    );
    if (!res.ok) throw new Error(`OWM error: ${res.status}`);
    const data = await res.json();

    const current = data.current;
    const daily = data.daily.slice(0, 4);

    const alertLevel = classifyRisk(current, daily);
    const { action, action_hindi } = getActionAdvice(alertLevel, daily[0]);

    return {
      location: district,
      current: {
        condition: current.weather[0].main,
        condition_hindi: translateCondition(current.weather[0].main),
        icon: getWeatherEmoji(current.weather[0].id),
        temp: Math.round(current.temp),
        humidity: current.humidity,
        wind_speed: Math.round(current.wind_speed),
      },
      forecast: daily.map((d: Record<string, unknown>, i: number) => ({
        day: i === 0 ? 'Today' : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][(new Date().getDay() + i) % 7],
        icon: getWeatherEmoji((d.weather as Array<{id: number}>)[0].id),
        temp_max: Math.round(d.temp && typeof d.temp === 'object' ? (d.temp as {max: number}).max : 30),
        temp_min: Math.round(d.temp && typeof d.temp === 'object' ? (d.temp as {min: number}).min : 20),
        condition: (d.weather as Array<{main: string}>)[0].main,
      })),
      action_required: action,
      action_hindi: action_hindi,
      alert_level: alertLevel,
    };
  } catch (err) {
    console.error('[weatherService.getWeatherForecast]', err);
    return getMockWeather(district);
  }
}

function classifyRisk(current: Record<string, unknown>, daily: Array<Record<string, unknown>>): AlertLevel {
  const rain = (daily[0]?.rain as number) ?? 0;
  const windSpeed = (current?.wind_speed as number) ?? 0;
  if (rain > 50 || windSpeed > 20) return 'CRITICAL';
  if (rain > 20 || windSpeed > 12) return 'WARNING';
  return 'INFO';
}

function getActionAdvice(level: AlertLevel, today: Record<string, unknown>): { action: string | null; action_hindi: string | null } {
  if (level === 'CRITICAL') {
    return {
      action: 'Harvest rows 3–7 before 6 PM today. Heavy rain approaching.',
      action_hindi: 'आज शाम 6 बजे से पहले फसल काट लें। भारी बारिश आ रही है।',
    };
  }
  if (level === 'WARNING') {
    return {
      action: 'Rain expected in 36 hours. Cover stored grain.',
      action_hindi: '36 घंटे में बारिश की संभावना। अनाज ढक कर रखें।',
    };
  }
  const rain = (today?.rain as number) ?? 0;
  if (rain < 5) {
    return {
      action: 'Good time for irrigation today.',
      action_hindi: 'आज सिंचाई के लिए अच्छा समय है।',
    };
  }
  return { action: null, action_hindi: null };
}

function translateCondition(condition: string): string {
  const map: Record<string, string> = {
    'Clear': 'साफ आसमान', 'Clouds': 'बादल', 'Rain': 'बारिश',
    'Drizzle': 'हल्की बारिश', 'Thunderstorm': 'आंधी-तूफान',
    'Snow': 'बर्फ', 'Mist': 'धुंध', 'Haze': 'धुंध', 'Fog': 'कोहरा',
  };
  return map[condition] ?? condition;
}

function getWeatherEmoji(id: number): string {
  if (id >= 200 && id < 300) return '⛈️';
  if (id >= 300 && id < 400) return '🌦️';
  if (id >= 500 && id < 600) return '🌧️';
  if (id >= 600 && id < 700) return '❄️';
  if (id >= 700 && id < 800) return '🌫️';
  if (id === 800) return '☀️';
  if (id > 800) return '⛅';
  return '🌤️';
}

export async function saveWeatherAlert(farmerId: string, alert: Omit<WeatherAlert, 'id' | 'farmer_id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('weather_alerts').insert([{ farmer_id: farmerId, ...alert }]);
  if (error) console.error('[weatherService.saveWeatherAlert]', error.message);
}

export async function getWeatherAlerts(farmerId: string): Promise<WeatherAlert[]> {
  const { data, error } = await supabase
    .from('weather_alerts')
    .select('id, farmer_id, alert_type, message, channel, delivered, created_at')
    .eq('farmer_id', farmerId)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) { console.error('[weatherService.getWeatherAlerts]', error.message); return []; }
  return data ?? [];
}

function getMockWeather(district: string): WeatherForecast {
  return {
    location: district || 'Bareilly, UP',
    current: { condition: 'Thunderstorm', condition_hindi: 'आंधी-तूफान', icon: '⛈️', temp: 24, humidity: 82, wind_speed: 18 },
    forecast: [
      { day: 'Today', icon: '⛅', temp_max: 27, temp_min: 21, condition: 'Clouds' },
      { day: 'Fri',   icon: '🌧️', temp_max: 24, temp_min: 19, condition: 'Rain' },
      { day: 'Sat',   icon: '⛈️', temp_max: 22, temp_min: 18, condition: 'Thunderstorm' },
      { day: 'Sun',   icon: '☀️', temp_max: 29, temp_min: 22, condition: 'Clear' },
    ],
    action_required: 'Harvest rows 3–7 before 6 PM today. Heavy rain approaching.',
    action_hindi: 'आज शाम 6 बजे से पहले फसल काट लें। भारी बारिश आ रही है।',
    alert_level: 'CRITICAL',
  };
}
