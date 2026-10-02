from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = BACKEND_ROOT / "data"
MODELS_DIR = BACKEND_ROOT / "models"

DATASET_ORIGINAL = DATA_DIR / "dataset_original.csv"
DATASET_PREPARADO = DATA_DIR / "dataset_preparado.csv"
MODELS_PATH = MODELS_DIR / "models.joblib"
RULES_PATH = MODELS_DIR / "association_rules.json"
