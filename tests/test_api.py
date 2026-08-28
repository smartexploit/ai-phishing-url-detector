from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "running"


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"
    assert "model" in data


def test_predict_endpoint():
    response = client.post(
        "/predict",
        json={"url": "https://www.google.com"}
    )

    assert response.status_code == 200

    data = response.json()

    assert data["url"] == "https://www.google.com"
    assert data["label"] in ["Phishing", "Legitimate"]
    assert 0 <= data["confidence"] <= 1


def test_predict_endpoint_rejects_empty_url():
    response = client.post(
        "/predict",
        json={"url": ""}
    )

    assert response.status_code == 400