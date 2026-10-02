import json

import joblib
import pandas as pd

from app.paths import DATASET_PREPARADO, MODELS_PATH, RULES_PATH


def load_resources():
    try:
        models = joblib.load(MODELS_PATH)

        rules = []
        if RULES_PATH.exists():
            with RULES_PATH.open("r", encoding="utf-8") as f:
                rules = json.load(f)

        df = pd.read_csv(DATASET_PREPARADO)
        return models, rules, df
    except Exception as e:
        print(f"Error cargando modelos: {e}")
        return None, [], pd.DataFrame()
