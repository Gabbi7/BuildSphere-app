"""
BuildSphere CV Service — YOLO Glass Panel Detector.

Wraps the Ultralytics YOLO model with glass-panel-specific
preprocessing, inference, and post-processing logic.
"""

import time
import logging
from pathlib import Path

import numpy as np
from PIL import Image
from ultralytics import YOLO

from app.config import settings
from app.models import Detection, DetectionResponse

logger = logging.getLogger(__name__)


class GlassPanelDetector:
    """
    Encapsulates the YOLO model for glass panel detection.

    Handles:
    - Model loading (GPU with CPU fallback)
    - Image preprocessing
    - Inference with configurable thresholds
    - Result formatting into the API response schema
    """

    def __init__(self) -> None:
        self.model: YOLO | None = None
        self.device: str = "cpu"
        self.model_path: str = settings.MODEL_PATH
        self._is_loaded: bool = False

    def load_model(self) -> None:
        """
        Load the YOLO model into memory.
        Attempts GPU (CUDA) first, falls back to CPU.
        """
        logger.info(f"Loading YOLO model: {self.model_path}")

        try:
            self.model = YOLO(self.model_path)

            # Attempt GPU inference; silently fall back to CPU
            try:
                import torch

                if torch.cuda.is_available():
                    self.device = "cuda"
                    logger.info(
                        f"CUDA available — using GPU: {torch.cuda.get_device_name(0)}"
                    )
                else:
                    self.device = "cpu"
                    logger.info("CUDA not available — using CPU")
            except ImportError:
                self.device = "cpu"
                logger.info("PyTorch CUDA not installed — using CPU")

            self._is_loaded = True
            logger.info(
                f"✅ Model loaded successfully on {self.device} "
                f"({self.model_path})"
            )

        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            raise RuntimeError(f"Model loading failed: {e}") from e

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded

    def detect(self, image: Image.Image) -> DetectionResponse:
        """
        Run glass panel detection on a PIL Image.

        Args:
            image: PIL Image in RGB format.

        Returns:
            DetectionResponse with bounding boxes, counts, and metadata.
        """
        if not self._is_loaded or self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        original_width, original_height = image.size

        # ── Run YOLO inference ────────────────────────────────────────
        start_time = time.perf_counter()

        results = self.model.predict(
            source=image,
            conf=settings.CONFIDENCE_THRESHOLD,
            iou=settings.NMS_IOU_THRESHOLD,
            imgsz=settings.INFERENCE_IMAGE_SIZE,
            max_det=settings.MAX_DETECTIONS,
            device=self.device,
            verbose=False,
        )

        inference_ms = (time.perf_counter() - start_time) * 1000

        # ── Parse results ─────────────────────────────────────────────
        detections: list[Detection] = []
        valid_panel_count = 0
        
        # Convert PIL to cv2 image for drawing
        import cv2
        import base64
        cv_img = np.array(image.convert('RGB'))
        cv_img = cv_img[:, :, ::-1].copy()  # RGB to BGR for OpenCV

        if results and len(results) > 0:
            result = results[0]  # Single image → single result

            if result.boxes is not None and len(result.boxes) > 0:
                boxes = result.boxes
                
                # Extract all raw detections first to sort them
                raw_detections = []
                for i in range(len(boxes)):
                    xyxy = boxes.xyxy[i].cpu().numpy()
                    confidence = float(boxes.conf[i].cpu().numpy())
                    class_id = int(boxes.cls[i].cpu().numpy())
                    
                    class_name = (
                        result.names[class_id]
                        if result.names and class_id in result.names
                        else "glass_panel"
                    )
                    
                    if settings.USE_PRETRAINED_COCO and class_id == 0:
                        # Skip 'person' class in COCO model
                        continue
                        
                    raw_detections.append({
                        "xyxy": xyxy,
                        "conf": confidence,
                        "class_name": class_name
                    })
                
                # Sort by confidence (highest first)
                raw_detections.sort(key=lambda d: d["conf"], reverse=True)
                
                # Process and draw
                for det in raw_detections:
                    xyxy = det["xyxy"]
                    confidence = det["conf"]
                    class_name = det["class_name"]
                    
                    x_min, y_min, x_max, y_max = map(int, xyxy)
                    
                    # Heuristic for Class B (partial/obscured)
                    is_class_b = False
                    if class_name == "partial_or_obscured":
                        is_class_b = True
                    else:
                        margin = 5
                        if (x_min <= margin or y_min <= margin or 
                            x_max >= original_width - margin or y_max >= original_height - margin):
                            is_class_b = True
                            class_name = "partial_or_obscured"
                        else:
                            class_name = "full_glass_panel"
                            
                    # Add to JSON detections list
                    detection = Detection(
                        bounding_box=[
                            round(float(xyxy[0]), 1),
                            round(float(xyxy[1]), 1),
                            round(float(xyxy[2]), 1),
                            round(float(xyxy[3]), 1),
                        ],
                        confidence_score=round(confidence, 4),
                        label=class_name,
                    )
                    detections.append(detection)

                    if not is_class_b:
                        # Class A: Fully visible (GREEN)
                        valid_panel_count += 1
                        color = (0, 255, 0) # BGR for Green
                        
                        overlay = cv_img.copy()
                        cv2.rectangle(overlay, (x_min, y_min), (x_max, y_max), color, -1)
                        cv2.addWeighted(overlay, 0.3, cv_img, 0.7, 0, cv_img)
                        cv2.rectangle(cv_img, (x_min, y_min), (x_max, y_max), color, 2)
                        
                        label_text = f"PANEL #{valid_panel_count}"
                        (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                        cv2.rectangle(cv_img, (x_min, y_min - th - 10), (x_min + tw + 10, y_min), color, -1)
                        cv2.putText(cv_img, label_text, (x_min + 5, y_min - 7), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                    else:
                        # Class B: Partial/Obscured (RED)
                        color = (0, 0, 255) # BGR for Red
                        cv2.rectangle(cv_img, (x_min, y_min), (x_max, y_max), color, 2)
                        
                        label_text = "This part of the photo is not fully visible"
                        (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
                        # Ensure text is not drawn outside image top bounds
                        y_text = y_min if y_min > th + 10 else y_min + th + 10
                        cv2.rectangle(cv_img, (x_min, y_text - th - 10), (x_min + tw + 10, y_text), color, -1)
                        cv2.putText(cv_img, label_text, (x_min + 5, y_text - 7), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

        # Encode annotated image to Base64
        _, buffer = cv2.imencode('.jpg', cv_img, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
        encoded_image = base64.b64encode(buffer).decode('utf-8')
        annotated_image_base64 = f"data:image/jpeg;base64,{encoded_image}"

        logger.info(
            f"Detected {valid_panel_count} valid panels out of {len(detections)} total in {inference_ms:.1f}ms "
            f"(image: {original_width}x{original_height})"
        )

        return DetectionResponse(
            total_valid_panels=valid_panel_count,
            detections=detections,
            annotated_image_base64=annotated_image_base64,
            image_width=original_width,
            image_height=original_height,
            inference_time_ms=round(inference_ms, 1),
            model_version=self.model_path,
            confidence_threshold=settings.CONFIDENCE_THRESHOLD,
            nms_iou_threshold=settings.NMS_IOU_THRESHOLD,
        )


    def draw_fallback_boxes(self, image: Image.Image, gemini_boxes: list[list[int]], inference_ms: float) -> DetectionResponse:
        import cv2
        import base64
        import numpy as np

        original_width, original_height = image.size
        cv_img = np.array(image.convert('RGB'))
        cv_img = cv_img[:, :, ::-1].copy()

        detections: list[Detection] = []
        valid_panel_count = 0
        raw_detections = []

        for box in gemini_boxes:
            if len(box) != 4:
                continue
            ymin_norm, xmin_norm, ymax_norm, xmax_norm = box
            y_min = int((ymin_norm / 1000.0) * original_height)
            x_min = int((xmin_norm / 1000.0) * original_width)
            y_max = int((ymax_norm / 1000.0) * original_height)
            x_max = int((xmax_norm / 1000.0) * original_width)
            
            raw_detections.append({
                "xyxy": [x_min, y_min, x_max, y_max],
                "conf": 0.99,
                "class_name": "glass_panel"
            })

        for det in raw_detections:
            xyxy = det["xyxy"]
            confidence = det["conf"]
            class_name = det["class_name"]

            x_min, y_min, x_max, y_max = map(int, xyxy)

            is_class_b = False
            margin = 5
            if (x_min <= margin or y_min <= margin or 
                x_max >= original_width - margin or y_max >= original_height - margin):
                is_class_b = True
                class_name = "partial_or_obscured"
            else:
                class_name = "full_glass_panel"

            detection = Detection(
                bounding_box=[float(x_min), float(y_min), float(x_max), float(y_max)],
                confidence_score=confidence,
                label=class_name,
            )
            detections.append(detection)

            if not is_class_b:
                valid_panel_count += 1
                color = (0, 255, 0)
                overlay = cv_img.copy()
                cv2.rectangle(overlay, (x_min, y_min), (x_max, y_max), color, -1)
                cv2.addWeighted(overlay, 0.3, cv_img, 0.7, 0, cv_img)
                cv2.rectangle(cv_img, (x_min, y_min), (x_max, y_max), color, 2)

                label_text = f"PANEL #{valid_panel_count}"
                (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                cv2.rectangle(cv_img, (x_min, y_min - th - 10), (x_min + tw + 10, y_min), color, -1)
                cv2.putText(cv_img, label_text, (x_min + 5, y_min - 7), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            else:
                color = (0, 0, 255)
                cv2.rectangle(cv_img, (x_min, y_min), (x_max, y_max), color, 2)

                label_text = "This part of the photo is not fully visible"
                (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
                y_text = y_min if y_min > th + 10 else y_min + th + 10
                cv2.rectangle(cv_img, (x_min, y_text - th - 10), (x_min + tw + 10, y_text), color, -1)
                cv2.putText(cv_img, label_text, (x_min + 5, y_text - 7), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

        _, buffer = cv2.imencode('.jpg', cv_img, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
        encoded_image = base64.b64encode(buffer).decode('utf-8')
        annotated_image_base64 = f"data:image/jpeg;base64,{encoded_image}"

        return DetectionResponse(
            total_valid_panels=valid_panel_count,
            detections=detections,
            annotated_image_base64=annotated_image_base64,
            image_width=original_width,
            image_height=original_height,
            inference_time_ms=round(inference_ms, 1),
            model_version="gemini-vision-fallback",
            confidence_threshold=0.0,
            nms_iou_threshold=0.0,
        )

# ── Singleton instance ────────────────────────────────────────────────
detector = GlassPanelDetector()
