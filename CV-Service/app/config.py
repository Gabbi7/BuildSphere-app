"""
BuildSphere CV Service — Configuration & Constants.

Centralizes all tunable parameters for YOLO inference,
file upload validation, and server settings.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# ─── Resolve project paths ───────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    with sensible defaults for development.
    """

    # ── Server ────────────────────────────────────────────────────────
    APP_NAME: str = "BuildSphere Glass Panel Detector"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ── YOLO Model ────────────────────────────────────────────────────
    # Path to the trained YOLO weights file.
    # Default: use the pre-trained YOLOv8m from Ultralytics (COCO classes).
    # Replace with "models/best.pt" after training on custom glass data.
    MODEL_PATH: str = "yolov8m.pt"

    # Target class names to filter from COCO detections.
    # When using the pre-trained model, we look for "window" as a proxy
    # for glass panels. After custom training, this becomes ["glass_panel"].
    TARGET_CLASSES: list[str] = ["glass_panel"]

    # Set to True when using pre-trained COCO model (filters for "window" class)
    USE_PRETRAINED_COCO: bool = True
    COCO_PROXY_CLASSES: list[str] = ["window", "glass"]

    # ── Inference Thresholds ──────────────────────────────────────────
    # Confidence threshold — lower than typical (0.5) because glass edges
    # are subtle, transparent, and produce softer activations.
    # Use a very low threshold for untrained data to catch subtle glass edges
    CONFIDENCE_THRESHOLD: float = 0.15

    # NMS IoU threshold — prevents merging adjacent but distinct panels.
    # 0.45 is a balanced value; lower = more aggressive suppression.
    NMS_IOU_THRESHOLD: float = 0.45

    # Maximum detections per image.
    # Construction facades can have 100+ panels; 300 gives headroom.
    MAX_DETECTIONS: int = 300

    # Inference image size (pixels). Must match training imgsz.
    INFERENCE_IMAGE_SIZE: int = 640

    # ── Upload Constraints ────────────────────────────────────────────
    ALLOWED_EXTENSIONS: set[str] = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    MAX_UPLOAD_SIZE_MB: int = 15
    MAX_UPLOAD_SIZE_BYTES: int = 15 * 1024 * 1024  # 15 MB

    # ── Timeout ───────────────────────────────────────────────────────
    INFERENCE_TIMEOUT_SECONDS: int = 30

    # ── AI Integrations ───────────────────────────────────────────────
    GEMINI_API_KEY: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


# Singleton settings instance
settings = Settings()
