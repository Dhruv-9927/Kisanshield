import { supabase } from '../supabase';
import type { CropLog, CropDiagnosis } from '../types';

// Roboflow SERVERLESS Classification API
// Uses serverless.roboflow.com (as shown in your Roboflow project dashboard)
export async function detectCropDisease(imageBase64: string): Promise<CropDiagnosis | null> {
  const apiKey = import.meta.env.VITE_ROBOFLOW_API_KEY;
  const modelId = import.meta.env.VITE_ROBOFLOW_MODEL_ID ?? 'amira-nvps5/plant-disease-classification-dvfsj/1';
  const baseUrl = (import.meta.env.VITE_ROBOFLOW_API_URL ?? 'https://serverless.roboflow.com').replace(/\/$/, '');

  if (!apiKey || apiKey === 'ADD_YOUR_ROBOFLOW_KEY_HERE') {
    console.warn('[cropService] Roboflow key not set — using mock diagnosis');
    return getMockDiagnosis();
  }

  try {
    // Strip the "data:image/jpeg;base64," prefix from the image string
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    // Serverless inference — base URL read from env
    const response = await fetch(
      `${baseUrl}/${modelId}?api_key=${apiKey}`,
      {
        method: 'POST',
        body: base64Data,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Roboflow error ${response.status}: ${errText}`);
    }

    const result = await response.json();
    console.log('[cropService] Roboflow serverless response:', result);

    // Determine the top class and confidence based on various Roboflow JSON formats
    let topClass = 'Unknown';
    let topConfidence = 0.5;

    if (result.top) {
      topClass = result.top;
      topConfidence = result.confidence ?? 0.5;
    } else if (result.predicted_classes && result.predicted_classes.length > 0) {
      topClass = result.predicted_classes[0];
      // Sometimes confidence is stored in predictions dict
      if (result.predictions && result.predictions[topClass]) {
        topConfidence = result.predictions[topClass].confidence ?? 0.5;
      }
    } else if (result.predictions && Array.isArray(result.predictions) && result.predictions.length > 0) {
      topClass = result.predictions[0].class;
      topConfidence = result.predictions[0].confidence ?? 0.5;
    } else {
      // Missing predictions completely
      return {
        disease: `DEBUG: ${JSON.stringify(result).substring(0, 500)}`,
        disease_hindi: 'त्रुटि (Error)',
        confidence: 0,
        crop_type: 'unknown',
        treatment_steps: [{ step: 1, instruction: 'API returned empty predictions.', instruction_hindi: 'API ने खाली प्रेडिक्शन लौटाया।' }],
        cost_estimate: '₹0',
      };
    }

    // Parse Roboflow class name format: "Tomato__Late_blight" → { crop: "Tomato", disease: "Late blight" }
    const { crop, disease } = parseClassName(topClass);

    // Check if healthy
    if (disease.toLowerCase().includes('healthy')) {
      return {
        disease: 'Healthy',
        disease_hindi: 'स्वस्थ फसल',
        confidence: topConfidence,
        crop_type: crop.toLowerCase(),
        treatment_steps: [{ step: 1, instruction: 'Your crop looks healthy! Keep monitoring weekly.', instruction_hindi: 'आपकी फसल स्वस्थ दिखती है! हर हफ्ते जाँचते रहें।' }],
        cost_estimate: '₹0',
      };
    }

    // Enrich with Groq treatment advice
    return await enrichWithGroq(disease, crop, topConfidence);

  } catch (err) {
    console.error('[cropService.detectCropDisease]', err);
    return getMockDiagnosis();
  }
}

// Parse Roboflow class names like "Tomato__Late_blight", "Apple___Apple_scab", "Grape___healthy"
function parseClassName(className: string): { crop: string; disease: string } {
  // Handle double underscore format
  const parts = className.split(/_{2,}/);
  if (parts.length >= 2) {
    return {
      crop: parts[0].replace(/_/g, ' ').trim(),
      disease: parts.slice(1).join(' ').replace(/_/g, ' ').trim(),
    };
  }
  // Handle single underscore
  const singleParts = className.split('_');
  if (singleParts.length >= 2) {
    return { crop: singleParts[0], disease: singleParts.slice(1).join(' ') };
  }
  return { crop: 'Crop', disease: className };
}

// Use Groq to generate treatment advice in Hindi + English
async function enrichWithGroq(disease: string, crop: string, confidence: number): Promise<CropDiagnosis> {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!groqKey || groqKey === 'ADD_YOUR_GROQ_KEY_HERE') {
    return {
      disease,
      disease_hindi: disease,
      confidence,
      crop_type: crop.toLowerCase(),
      treatment_steps: [
        { step: 1, instruction: `Treat ${disease} on your ${crop} crop immediately.`, instruction_hindi: `अपनी ${crop} फसल पर ${disease} का उपचार तुरंत करें।` },
        { step: 2, instruction: 'Consult your local agronomist for specific dosage.', instruction_hindi: 'सही खुराक के लिए अपने स्थानीय कृषि विशेषज्ञ से सलाह लें।' },
      ],
      cost_estimate: '₹150–₹400',
    };
  }

  try {
    const prompt = `A farmer's ${crop} crop has been diagnosed with: "${disease}" (${Math.round(confidence * 100)}% confidence).

Respond ONLY with valid JSON in this exact format:
{
  "disease": "English disease name (short)",
  "disease_hindi": "हिंदी में रोग का नाम",
  "treatment_steps": [
    { "step": 1, "instruction": "Short English instruction (max 12 words)", "instruction_hindi": "हिंदी निर्देश (max 12 words)" },
    { "step": 2, "instruction": "Short English instruction", "instruction_hindi": "हिंदी निर्देश" },
    { "step": 3, "instruction": "Short English instruction", "instruction_hindi": "हिंदी निर्देश" }
  ],
  "cost_estimate": "₹XX–₹XX at local agri shop"
}

Rules: Keep instructions simple for a farmer with basic literacy. Max 3 steps. Include specific chemical/organic treatment names.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) throw new Error(`Groq error: ${response.status}`);
    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    return { ...parsed, confidence, crop_type: crop.toLowerCase() };
  } catch (err) {
    console.error('[cropService.enrichWithGroq]', err);
    return getMockDiagnosis();
  }
}

// Save crop diagnosis to Supabase
export async function saveCropLog(farmerId: string, diagnosis: CropDiagnosis, imageUrl?: string): Promise<void> {
  const { error } = await supabase.from('crop_logs').insert([{
    farmer_id: farmerId,
    crop_type: diagnosis.crop_type,
    disease_detected: diagnosis.disease,
    confidence: diagnosis.confidence,
    treatment_given: diagnosis.treatment_steps.map(s => s.instruction).join(' | '),
    image_url: imageUrl ?? null,
  }]);

  if (error) console.error('[cropService.saveCropLog]', error.message);
}

// Get farmer's crop history from Supabase
export async function getCropHistory(farmerId: string): Promise<CropLog[]> {
  const { data, error } = await supabase
    .from('crop_logs')
    .select('id, farmer_id, crop_type, disease_detected, confidence, treatment_given, image_url, created_at')
    .eq('farmer_id', farmerId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('[cropService.getCropHistory]', error.message);
    return [];
  }
  return data ?? [];
}

function getMockDiagnosis(): CropDiagnosis {
  return {
    disease: 'Iron Deficiency (Chlorosis)',
    disease_hindi: 'लोहे की कमी (क्लोरोसिस)',
    confidence: 0.91,
    crop_type: 'wheat',
    treatment_steps: [
      { step: 1, instruction: 'Spray FeSO₄ (Ferrous Sulphate) solution on leaves', instruction_hindi: 'पत्तों पर FeSO₄ (फेरस सल्फेट) का छिड़काव करें' },
      { step: 2, instruction: 'Use 500g per acre, diluted in 200L water', instruction_hindi: '500 ग्राम प्रति एकड़, 200 लीटर पानी में मिलाकर' },
      { step: 3, instruction: 'Repeat after 10 days if yellowing continues', instruction_hindi: 'यदि पीलापन जारी रहे तो 10 दिन बाद दोबारा करें' },
    ],
    cost_estimate: '₹120–₹180',
  };
}
