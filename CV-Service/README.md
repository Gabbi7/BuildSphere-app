# 🔍 BuildSphere Glass Panel Detection API

> Computer vision microservice for detecting and counting glass panels on construction site images using YOLOv8.

## 🏗 Architecture

```
POST /detect-panels (image upload)
        │
        ▼
  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
  │  FastAPI     │───▶│  YOLOv8m     │───▶│  JSON        │
  │  Validation  │    │  Inference   │    │  Response    │
  └─────────────┘    └──────────────┘    └──────────────┘
```

## 🚀 Quick Start

### 1. Setup Environment

```bash
cd cv-service

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure

```bash
# Copy environment template
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux
```

### 3. Start the Server

```bash
# Development (with auto-reload)
uvicorn app.main:app --reload --port 8000

# OR run directly
python -m app.main
```

### 4. Test the API

```bash
# Health check
curl http://localhost:8000/health

# Detect glass panels
curl -X POST http://localhost:8000/detect-panels \
  -F "file=@path/to/construction_photo.jpg"
```

### 5. Interactive Docs

Open http://localhost:8000/docs for the Swagger UI.

---

## 📡 API Reference

### `POST /detect-panels`

Upload a construction site photo and receive glass panel detections.

**Request:** `multipart/form-data` with `file` field (JPEG, PNG, BMP, or WebP)

**Response:**
```json
{
  "total_glass_panels": 12,
  "detections": [
    {
      "bounding_box": [120.5, 45.0, 340.2, 290.8],
      "confidence_score": 0.92,
      "label": "glass_panel"
    }
  ],
  "image_width": 1920,
  "image_height": 1080,
  "inference_time_ms": 45.2,
  "model_version": "yolov8m.pt",
  "confidence_threshold": 0.35,
  "nms_iou_threshold": 0.45
}
```

**Error Codes:**
| Code | Meaning |
|------|---------|
| 400 | No file or empty file |
| 413 | File too large (>15 MB) |
| 415 | Unsupported file type |
| 422 | Corrupt/unreadable image |
| 503 | Model not loaded |
| 504 | Inference timeout |

---

## 🎓 Training a Custom Model

### 1. Prepare Dataset

Organize your annotated images:

```
cv-service/datasets/glass_panels/
├── images/
│   ├── train/     ← 70% of images
│   ├── val/       ← 20% of images
│   └── test/      ← 10% of images
└── labels/
    ├── train/     ← Matching .txt files
    ├── val/
    └── test/
```

Each `.txt` label file (YOLO format):
```
0 0.45 0.32 0.12 0.28
0 0.72 0.55 0.15 0.30
```

### 2. Train

```bash
python training/train.py --epochs 150 --batch 16

# With GPU
python training/train.py --epochs 200 --batch 32 --device 0

# Resume from checkpoint
python training/train.py --resume
```

### 3. Deploy Trained Model

1. Training saves best weights to `models/best.pt`
2. Update `.env`:
   ```
   MODEL_PATH=models/best.pt
   USE_PRETRAINED_COCO=false
   ```
3. Restart the server

---

## 📊 Dataset Recommendations

| Size | Expected mAP@0.5 | Status |
|------|-------------------|--------|
| 200-500 images | 70-80% | Prototype |
| 1,000-1,500 | 88-93% | MVP |
| **2,000-3,000** | **95%+** | **Production** |
| 5,000+ | 97%+ | Enterprise |

---

## 🐳 Docker

```bash
# Build
docker build -t buildsphere-cv .

# Run (CPU)
docker run -p 8000:8000 buildsphere-cv

# Run (GPU)
docker run --gpus all -p 8000:8000 buildsphere-cv
```

---

## 🧪 Testing

```bash
pytest tests/test_api.py -v
```
