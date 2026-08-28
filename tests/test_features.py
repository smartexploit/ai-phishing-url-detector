from src.feature_extraction import extract_features


def test_extract_features_returns_54_features():
    features = extract_features("https://www.google.com")

    assert isinstance(features, dict)
    assert len(features) == 54


def test_extract_features_contains_expected_features():
    features = extract_features("https://www.google.com")

    expected = [
        "URLLength",
        "DomainLength",
        "IsDomainIP",
        "IsHTTPS",
        "HasObfuscation",
        "Pay",
        "Crypto",
        "SecurityRiskScore",
    ]

    for feature in expected:
        assert feature in features


def test_extract_features_rejects_empty_url():
    try:
        extract_features("")
        assert False
    except ValueError:
        assert True