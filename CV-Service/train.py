from ultralytics import YOLO
import os

def train_glass_model():
    # 1. Load a base model (Medium is a good balance)
    model = YOLO("yolov8m.pt")

    # 2. Start Training
    # You will need a 'data.yaml' file from Roboflow
    model.train(
        data="path/to/your/dataset/data.yaml", 
        epochs=50, 
        imgsz=640, 
        plots=True,
        device="cpu" # Change to 0 if you have an NVIDIA GPU
    )

    print("✅ Training Complete! Your new model is in 'runs/detect/train/weights/best.pt'")

if __name__ == "__main__":
    train_glass_model()
