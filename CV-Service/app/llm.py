"""
BuildSphere CV Service — Gemini AI Integration.

Handles generating natural language summaries from detection statistics.
"""

import logging
import google.generativeai as genai

from app.config import settings

logger = logging.getLogger(__name__)

# Configure Gemini if the key is available
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)


def generate_audit_summary(total_valid_panels: int, avg_confidence: float) -> str:
    """
    Generate a professional site audit summary using Gemini.
    """
    if not settings.GEMINI_API_KEY:
        return f"Site Audit Complete. YOLO API detected {total_valid_panels} glass panels. (AI Summary temporarily unavailable)."

    models_to_try = [
        'models/gemini-2.5-flash-lite',
        'models/gemini-flash-latest', 
        'models/gemini-pro-latest'
    ]
    
    model = None
    last_error = None
    
    for model_name in models_to_try:
        try:
            m = genai.GenerativeModel(model_name)
            # Quick test for quota
            m.generate_content("test")
            model = m
            break
        except Exception as e:
            last_error = e
            continue

    if not model:
        error_msg = str(last_error).lower()
        if "429" in error_msg or "quota" in error_msg:
            return f"Site Audit: {total_valid_panels} panels. (Daily AI Limit Reached)."
        return f"Site Audit Complete: {total_valid_panels} panels. (AI Unavailable)."

    try:
        prompt = (
            f"Based on the image, {total_valid_panels} fully visible glass panels were counted. "
            "Some areas of the photo were obstructed or not fully visible and were excluded from the count. "
            "Write a concise, 1-sentence professional summary reflecting this."
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except:
        return f"Site Audit: {total_valid_panels} panels."


def vision_box_fallback(image_bytes: bytes) -> list[list[int]]:
    """
    Fallback: Use Gemini Vision to detect bounding boxes of panels if YOLO fails.
    Returns a list of boxes in [ymin, xmin, ymax, xmax] format (0-1000 scale).
    """
    if not settings.GEMINI_API_KEY:
        return []
        
    try:
        models_to_try = [
            'models/gemini-flash-latest', 
            'models/gemini-2.5-flash-lite', 
            'models/gemini-pro-latest'
        ]
        model = None
        for m_name in models_to_try:
            try:
                model = genai.GenerativeModel(m_name)
                model.generate_content("test")
                break
            except:
                continue
                
        if not model:
            return []
            
        prompt = (
            "You are a high-precision object detection system for construction audits.\n"
            "OBJECTIVE: Detect every individual glass panel in the image.\n"
            "Return ONLY a JSON array of bounding boxes in this exact format:\n"
            "[\n"
            "  [ymin, xmin, ymax, xmax],\n"
            "  ...\n"
            "]\n"
            "The coordinates must be integers normalized between 0 and 1000."
        )
        
        response = model.generate_content([
            prompt,
            {"mime_type": "image/jpeg", "data": image_bytes}
        ])
        
        text = response.text.strip().replace("```json", "").replace("```", "").strip()
        import json
        boxes = json.loads(text)
        if isinstance(boxes, list):
            return boxes
        return []
    except Exception as e:
        error_msg = str(e).lower()
        if "429" in error_msg or "quota" in error_msg:
            logger.error("Vision box fallback hit Quota Limit (429).")
            raise Exception("AI Rate Limit: Please wait a minute before analyzing another photo.")
        logger.error(f"Vision box fallback failed: {e}")
        return []
