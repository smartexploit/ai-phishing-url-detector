from src.predict import predict_url


def test_predict_url_returns_expected_structure():
    result = predict_url("https://www.google.com")

    assert isinstance(result, dict)

    assert "url" in result
    assert "prediction" in result
    assert "label" in result
    assert "confidence" in result


def test_predict_url_prediction_is_valid():
    result = predict_url("https://www.google.com")

    assert result["prediction"] in [0, 1]
    assert result["label"] in ["Phishing", "Legitimate"]
    assert 0 <= result["confidence"] <= 1


def test_known_legitimate_url():
    result = predict_url("https://www.southbankmosaics.com")

    assert result["label"] == "Legitimate"


def test_suspicious_url():
    result = predict_url(
        "http://paypal-security-login-example.com"
    )

    assert result["label"] == "Phishing"