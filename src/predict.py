import json
from pathlib import Path

import joblib
import pandas as pd

from .feature_extraction import extract_features


BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "phishing_url_model_bundle.pkl"
FEATURE_PATH = BASE_DIR / "models" / "feature_columns.json"


# Load model bundle
bundle = joblib.load(MODEL_PATH)

model = bundle["model"]

with open(FEATURE_PATH, "r", encoding="utf-8") as f:
    feature_columns = json.load(f)


def predict_url(url: str) -> dict:
    """
    Predict whether a URL is phishing or legitimate.
    """

    features = extract_features(url)

    # Ensure exact feature order expected by the model
    input_data = pd.DataFrame([features])
    input_data = input_data[feature_columns]

    prediction = int(model.predict(input_data)[0])

    probabilities = model.predict_proba(input_data)[0]

    confidence = float(max(probabilities))

    # Based on the dataset convention used in the project:
    # 0 = phishing
    # 1 = legitimate
    label = (
        "Legitimate"
        if prediction == 1
        else "Phishing"
    )

    return {
        "url": url,
        "prediction": prediction,
        "label": label,
        "confidence": round(confidence, 4),
    }