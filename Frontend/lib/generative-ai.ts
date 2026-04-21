import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

const withRetry = async <T>(fn: () => Promise<T>, retries = 2, delay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.message?.includes('503') || error.message?.includes('429'))) {
      await new Promise((res) => setTimeout(res, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const countGlassPanels = async (base64Image: string, mimeType: string) => {
  console.log('DEBUG: High-Precision Coordinate Detection Mode Engaged');
  try {
    return await withRetry(async () => {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Using Bounding Box Detection Prompt for maximum accuracy
      const prompt = `
                You are a high-precision object detection system for BuildSphere construction audits.
                
                OBJECTIVE: Detect every INDIVIDUAL glass panel in the image.
                
                DETECTION RULES:
                1. Look for the physical frame of each glass pane.
                2. For mullioned/grid windows, count the large functional sections, NOT the decorative tiny internal squares.
                3. Return the bounding box for EACH panel in [ymin, xmin, ymax, xmax] format.
                
                Return ONLY JSON:
                {
                    "panels": [
                        {"label": "glass_panel", "box_2d": [ymin, xmin, ymax, xmax]},
                        ...
                    ],
                    "count": <total number of detected boxes>,
                    "explanation": "Summarize how you separated panels from reflections."
                }
            `;

      const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Image, mimeType: mimeType } },
      ]);

      const response = await result.response;
      let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(text);
      
      // Ensure count is actually based on the length of panels array if not provided correctly
      if (parsed.panels && !parsed.count) {
        parsed.count = parsed.panels.length;
      }
      
      return parsed;
    });
  } catch (error: any) {
    console.error('DETECTION_ERROR:', error);
    if (error.message?.includes('429')) {
      throw new Error('QUOTA_LIMIT: Please wait 30 seconds.');
    }
    throw new Error(`AI_UNAVAILABLE: ${error.message}`);
  }
};

export const hybridGlassAudit = async (base64Image: string, mimeType: string) => {
  console.log('DEBUG: Hybrid AI Audit Commencing (Roboflow + Gemini)');
  
  // FALLBACK HARDCODED KEY (Verified to work in test script)
  const ROBOFLOW_KEY = process.env.EXPO_PUBLIC_ROBOFLOW_API_KEY || "9Q996Y4PkYBZPNuYJ3AP";
  const WORKSPACE = "gavin-ralph-rama";
  const WORKFLOW = "general-segmentation-api";

  if (!ROBOFLOW_KEY) {
    throw new Error('CONFIG_ERROR: Roboflow API Key missing in .env');
  }

  try {
    // 1. STEP ONE: Get precise count from Roboflow
    console.log('DEBUG: Calling Roboflow Workflow...');
    const roboflowResponse = await fetch(`https://detect.roboflow.com/infer/workflows/${WORKSPACE}/${WORKFLOW}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: ROBOFLOW_KEY,
        inputs: {
          image: { type: "base64", value: base64Image },
          classes: "0, 1, 2, Glass, glassss"
        }
      })
    });

    if (!roboflowResponse.ok) {
        const errText = await roboflowResponse.text();
        console.error('ROBOFLOW_API_ERROR:', roboflowResponse.status, errText);
        throw new Error(`Roboflow Error (${roboflowResponse.status}): ${errText.substring(0, 100)}`);
    }

    const roboflowData = await roboflowResponse.json();
    let count = 0;
    
    if (roboflowData.outputs && roboflowData.outputs.length > 0) {
        const out = roboflowData.outputs[0];
        let preds = out.predictions;
        if (preds && preds.predictions && Array.isArray(preds.predictions)) {
            preds = preds.predictions;
        }
        if (Array.isArray(preds)) {
            // FILTER: Only count high-confidence, significant glass panels
            const filtered = preds.filter(p => {
                const label = (p.class || '').toLowerCase();
                const isGlassLabel = label.includes('glass') || p.class_id === 0 || label === ''; 
                
                const conf = p.confidence || 0;
                const w = p.width || 0;
                const h = p.height || 0;

                // Thresholds to ignore reflections/noise
                const isConfident = conf > 0.6;
                const isSignificant = w > 30 && h > 30; // Ignore tiny segments

                return isGlassLabel && isConfident && isSignificant;
            });
            
            count = filtered.length;
            console.log(`DEBUG: Raw Detections: ${preds.length}, Filtered Panels: ${count}`);
        }
    }

    console.log(`DEBUG: Roboflow detected ${count} panels.`);

    // 2. STEP TWO: Summarize with Gemini Flash (Smart Fallback)
    console.log('DEBUG: Generating Gemini Summary...');
    let summary = '';
    
    // Try multiple model IDs to avoid 404 issues
    const modelOptions = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-pro'];
    let geminiSuccess = false;

    for (const modelName of modelOptions) {
        if (geminiSuccess) break;
        try {
            console.log(`DEBUG: Trying Gemini Model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const prompt = `
                You are a Glazing Auditor. 
                A vision system detected ${count} glass surfaces, but it might be over-counting reflections.
                
                TASK: Look at the photo yourself. If ${count} panels seems like an over-count (e.g. counting reflections), provide the CORRECT count based on your visual reasoning.
                
                Write a 2-sentence professional summary for the site supervisor. State the final, accurate count clearly.
            `;

            const geminiResult = await model.generateContent([
                prompt,
                { inlineData: { data: base64Image, mimeType: mimeType } },
            ]);

            summary = await geminiResult.response.text();
            geminiSuccess = true;
            console.log(`DEBUG: Result obtained with ${modelName}`);
        } catch (geminiError: any) {
            console.warn(`DEBUG: ${modelName} failed:`, geminiError.message);
            // If it's not a 404, we don't want to keep trying other models (e.g. 429)
            if (!geminiError.message?.includes('404')) {
                break;
            }
        }
    }

    if (!geminiSuccess) {
        summary = `Site Audit Complete. Roboflow detected ${count} glass panels with high precision. (AI Summary temporarily unavailable).`;
    }

    return {
      count,
      summary,
      rawDetections: roboflowData
    };

  } catch (error: any) {
    console.error('HYBRID_AUDIT_ERROR:', error);
    // Return a more descriptive error for the UI
    throw new Error(`Hybrid Audit Failed: ${error.message || 'Unknown Error'}`);
  }
};

export const getBuildsphereAI = async (p: string) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(p);
  return result.response.text();
};

export const analyzeBuildsphereImage = async (p: string, b: string, m: string) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent([p, { inlineData: { data: b, mimeType: m } }]);
  return result.response.text();
};

export default genAI;
