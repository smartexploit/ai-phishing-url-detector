import json
from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
)

from .feature_extraction import extract_features


BASE_DIR = Path(__file__).resolve().parent.parent

RAW_DATA_PATH = (
    BASE_DIR
    / "data"
    / "raw"
    / "phiusiil"
    / "PhiUSIIL_Phishing_URL_Dataset.csv"
)

MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


print("Loading raw PhiUSIIL dataset...")

raw_df = pd.read_csv(RAW_DATA_PATH)

print(f"Raw dataset: {raw_df.shape}")


# ---------------------------------------------------------
# Extract URL-only features
# ---------------------------------------------------------

print("\nExtracting URL-only features...")

feature_rows = []

for i, url in enumerate(raw_df["URL"]):

    if i % 25000 == 0:
        print(f"Processed: {i:,} / {len(raw_df):,}")

    try:
        feature_rows.append(extract_features(url))
    except Exception:
        feature_rows.append({})


features_df = pd.DataFrame(feature_rows)

features_df["label"] = raw_df["label"].values

print("\nURL-only feature dataset:")
print(features_df.shape)

print("\nLabel distribution:")
print(features_df["label"].value_counts())


# ---------------------------------------------------------
# Remove rows with extraction failures
# ---------------------------------------------------------

features_df = features_df.dropna().reset_index(drop=True)

X = features_df.drop(columns=["label"])
y = features_df["label"]


print("\nFinal training dataset:")
print("X:", X.shape)
print("y:", y.shape)


# ---------------------------------------------------------
# Train/test split
# ---------------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# ---------------------------------------------------------
# Train Random Forest
# ---------------------------------------------------------

print("\nTraining URL-only Random Forest...")

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    n_jobs=-1,
    class_weight="balanced",
)

model.fit(X_train, y_train)

print("Training complete.")


# ---------------------------------------------------------
# Evaluate
# ---------------------------------------------------------

y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print("\nMODEL PERFORMANCE")
print("=" * 50)
print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1 Score : {f1:.4f}")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        target_names=["Phishing", "Legitimate"],
    )
)


# ---------------------------------------------------------
# Save model bundle
# ---------------------------------------------------------

feature_columns = X.columns.tolist()

model_bundle = {
    "model": model,
    "features": feature_columns,
}

bundle_path = MODEL_DIR / "phishing_url_model_bundle.pkl"

joblib.dump(model_bundle, bundle_path)


with open(
    MODEL_DIR / "feature_columns.json",
    "w",
    encoding="utf-8",
) as f:
    json.dump(feature_columns, f, indent=4)


print("\nMODEL SAVED")
print("=" * 50)
print(f"Model bundle : {bundle_path}")
print(f"Feature count: {len(feature_columns)}")
print("\nTraining pipeline completed successfully.")