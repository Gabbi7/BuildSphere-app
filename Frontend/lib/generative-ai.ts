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

export const hybridGlassAudit = async (base64Image: string, mimeType: string, photoUri?: string) => {
  console.log('DEBUG: Hybrid AI Audit Commencing (Local YOLO + Gemini)');
  
  // Use your local IP address (port 8000 for Python CV Service)
  const API_URL = "http://192.168.0.69:8000/detect-panels";

  try {
    let count = 0;
    let summary = '';
    let annotatedImage = null;
    let rawDetections = null;

    if (!photoUri) {
        throw new Error('Photo URI is required for local CV Service.');
    }

    console.log('DEBUG: Calling Local CV Service...');
    
    const formData = new FormData();
    const filename = photoUri.split('/').pop() || 'photo.jpg';
    
    formData.append('file', {
      uri: photoUri,
      name: filename,
      type: mimeType,
    } as any);

    const cvResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!cvResponse.ok) {
        const errText = await cvResponse.text();
        console.error('CV_API_ERROR:', cvResponse.status, errText);
        throw new Error(`CV Service Error (${cvResponse.status}): ${errText.substring(0, 100)}`);
    }

    const cvData = await cvResponse.json();
    count = cvData.total_valid_panels || 0;
    summary = cvData.summary_text || `Site Audit Complete. CV API detected ${count} valid panels.`;
    annotatedImage = cvData.annotated_image_base64;
    rawDetections = cvData.detections;
    
    console.log(`DEBUG: CV Service returned ${count} panels and summary.`);

    return {
      count,
      summary,
      annotatedImage,
      rawDetections
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
