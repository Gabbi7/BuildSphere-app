"""
Pytest configuration — ensures the cv-service root is in sys.path
so that `from app.main import app` works in test modules.
"""

import sys
from pathlib import Path

# Add the cv-service root to the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent))
