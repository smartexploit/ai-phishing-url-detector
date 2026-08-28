import re
import math
from urllib.parse import urlparse


def _safe_ratio(numerator, denominator):
    if denominator == 0:
        return 0.0
    return numerator / denominator


def extract_features(url: str) -> dict:
    """
    Extract the 54 features expected by the trained phishing URL model.

    The model was trained using PhiUSIIL-derived URL features plus
    six engineered security features.

    Parameters
    ----------
    url : str
        URL to analyze.

    Returns
    -------
    dict
        Dictionary containing all 54 model features.
    """

    if not isinstance(url, str):
        raise TypeError("URL must be a string.")

    url = url.strip()

    if not url:
        raise ValueError("URL cannot be empty.")

    # Add a scheme when the user enters something like example.com
    parse_url = url
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", parse_url):
        parse_url = "http://" + parse_url

    parsed = urlparse(parse_url)

    hostname = parsed.hostname or ""
    path = parsed.path or ""
    query = parsed.query or ""
    fragment = parsed.fragment or ""

    domain = hostname
    full_url = url

    # ---------------------------------------------------------
    # Basic URL characteristics
    # ---------------------------------------------------------

    url_length = len(full_url)
    domain_length = len(domain)

    is_domain_ip = int(
        bool(
            re.fullmatch(
                r"(?:\d{1,3}\.){3}\d{1,3}",
                domain
            )
        )
    )

    # TLD
    tld = ""
    if "." in domain:
        tld = domain.rsplit(".", 1)[-1]

    tld_length = len(tld)

    subdomain_parts = domain.split(".") if domain else []
    no_of_subdomain = max(len(subdomain_parts) - 2, 0)

    # ---------------------------------------------------------
    # Character-level URL features
    # ---------------------------------------------------------

    letters = sum(c.isalpha() for c in full_url)
    digits = sum(c.isdigit() for c in full_url)

    equals_count = full_url.count("=")
    question_count = full_url.count("?")
    ampersand_count = full_url.count("&")

    special_chars = sum(
        not c.isalnum() and c not in "/:.-_"
        for c in full_url
    )

    letter_ratio = _safe_ratio(letters, url_length)
    digit_ratio = _safe_ratio(digits, url_length)

    special_ratio = _safe_ratio(special_chars, url_length)

    # ---------------------------------------------------------
    # Obfuscation indicators
    # ---------------------------------------------------------

    suspicious_patterns = [
        r"%[0-9a-fA-F]{2}",
        r"\\x[0-9a-fA-F]{2}",
        r"@", 
        r"//.*//",
        r"\.\.",
    ]

    obfuscated_char_count = 0

    for pattern in suspicious_patterns:
        matches = re.findall(pattern, full_url)
        obfuscated_char_count += len(matches)

    has_obfuscation = int(obfuscated_char_count > 0)

    obfuscation_ratio = _safe_ratio(
        obfuscated_char_count,
        url_length
    )

    # ---------------------------------------------------------
    # HTTPS
    # ---------------------------------------------------------

    is_https = int(parsed.scheme.lower() == "https")

    # ---------------------------------------------------------
    # Redirect / reference approximations
    # ---------------------------------------------------------

    redirect_count = full_url.count("http://") + full_url.count("https://")
    redirect_count = max(redirect_count - 1, 0)

    self_redirect = int(
        hostname.lower() in query.lower()
        if hostname
        else False
    )

    # ---------------------------------------------------------
    # Suspicious keyword indicators
    # ---------------------------------------------------------

    url_lower = full_url.lower()

    has_external_form_submit = int(
        any(
            word in url_lower
            for word in [
                "form",
                "submit",
                "login",
                "signin",
                "verify"
            ]
        )
    )

    has_social_net = int(
        any(
            site in url_lower
            for site in [
                "facebook",
                "instagram",
                "twitter",
                "linkedin",
                "tiktok"
            ]
        )
    )

    has_submit_button = int(
        any(
            word in url_lower
            for word in [
                "submit",
                "login",
                "signin",
                "checkout"
            ]
        )
    )

    has_hidden_fields = int(
        any(
            word in url_lower
            for word in [
                "hidden",
                "token",
                "session"
            ]
        )
    )

    has_password_field = int(
        any(
            word in url_lower
            for word in [
                "password",
                "passwd",
                "pwd"
            ]
        )
    )

    # ---------------------------------------------------------
    # Brand / financial keywords
    # ---------------------------------------------------------

    bank = int(
        any(
            word in url_lower
            for word in [
                "bank",
                "banking",
                "securebank",
                "onlinebank"
            ]
        )
    )

    pay = int(
        any(
            word in url_lower
            for word in [
                "paypal",
                "payment",
                "pay",
                "checkout"
            ]
        )
    )

    crypto = int(
        any(
            word in url_lower
            for word in [
                "bitcoin",
                "crypto",
                "ethereum",
                "wallet",
                "binance"
            ]
        )
    )

    # ---------------------------------------------------------
    # URL-derived approximations for page-dependent features
    #
    # These features originally come from the PhiUSIIL dataset
    # and some require webpage/page-content information.
    # For URL-only inference we use conservative defaults.
    # ---------------------------------------------------------

    has_copyright_info = 0
    has_favicon = 0
    robots = 0
    is_responsive = 0
    has_title = 0
    has_description = 0

    domain_title_match_score = 0.0
    url_title_match_score = 0.0

    no_of_popup = 0
    no_of_iframe = 0
    no_of_image = 0
    no_of_css = 0
    no_of_js = 0

    no_of_self_ref = 0
    no_of_empty_ref = 0
    no_of_external_ref = 0

    # ---------------------------------------------------------
    # URL similarity / character probability approximations
    # ---------------------------------------------------------

    # Long URLs and unusual character distributions tend to
    # increase suspicion.
    url_similarity_index = 100.0 if domain else 0.0

    continuation_chars = sum(
        1 for i in range(1, len(full_url))
        if full_url[i] == full_url[i - 1]
    )

    char_continuation_rate = _safe_ratio(
        continuation_chars,
        max(url_length - 1, 1)
    )

    # Conservative URL-character probability estimate.
    normal_chars = sum(
        c.isalnum() or c in "/:.-_?=&%"
        for c in full_url
    )

    url_char_prob = _safe_ratio(
        normal_chars,
        max(url_length, 1)
    )

    # Conservative TLD legitimacy estimate.
    common_tlds = {
        "com",
        "org",
        "net",
        "edu",
        "gov",
        "co",
        "uk",
        "io",
        "ng"
    }

    tld_legitimate_prob = (
        1.0 if tld.lower() in common_tlds else 0.5
    )

    # ---------------------------------------------------------
    # Engineered security features
    # ---------------------------------------------------------

    suspicious_character_density = _safe_ratio(
        special_chars,
        url_length
    )

    digit_density = _safe_ratio(
        digits,
        url_length
    )

    subdomain_density = _safe_ratio(
        no_of_subdomain,
        max(domain_length, 1)
    )

    redirect_density = _safe_ratio(
        redirect_count,
        url_length
    )

    external_reference_ratio = 0.0

    security_risk_score = (
        is_domain_ip
        + has_obfuscation
        + has_external_form_submit
        + has_hidden_fields
        + has_password_field
        + int(redirect_count > 0)
        + int(no_of_subdomain > 2)
    )

    # ---------------------------------------------------------
    # Final 54-feature dictionary
    # ---------------------------------------------------------

    features = {
        "URLLength": url_length,
        "DomainLength": domain_length,
        "IsDomainIP": is_domain_ip,
        "URLSimilarityIndex": url_similarity_index,
        "CharContinuationRate": char_continuation_rate,
        "TLDLegitimateProb": tld_legitimate_prob,
        "URLCharProb": url_char_prob,
        "TLDLength": tld_length,
        "NoOfSubDomain": no_of_subdomain,
        "HasObfuscation": has_obfuscation,
        "NoOfObfuscatedChar": obfuscated_char_count,
        "ObfuscationRatio": obfuscation_ratio,
        "NoOfLettersInURL": letters,
        "LetterRatioInURL": letter_ratio,
        "NoOfDegitsInURL": digits,
        "DegitRatioInURL": digit_ratio,
        "NoOfEqualsInURL": equals_count,
        "NoOfQMarkInURL": question_count,
        "NoOfAmpersandInURL": ampersand_count,
        "NoOfOtherSpecialCharsInURL": special_chars,
        "SpacialCharRatioInURL": special_ratio,
        "IsHTTPS": is_https,
        "NoOfURLRedirect": redirect_count,
        "NoOfSelfRedirect": self_redirect,
        "HasExternalFormSubmit": has_external_form_submit,
        "HasSocialNet": has_social_net,
        "HasSubmitButton": has_submit_button,
        "HasHiddenFields": has_hidden_fields,
        "HasPasswordField": has_password_field,
        "Bank": bank,
        "Pay": pay,
        "Crypto": crypto,
        "HasCopyrightInfo": has_copyright_info,
        "HasFavicon": has_favicon,
        "Robots": robots,
        "IsResponsive": is_responsive,
        "HasTitle": has_title,
        "DomainTitleMatchScore": domain_title_match_score,
        "URLTitleMatchScore": url_title_match_score,
        "HasDescription": has_description,
        "NoOfPopup": no_of_popup,
        "NoOfiFrame": no_of_iframe,
        "NoOfImage": no_of_image,
        "NoOfCSS": no_of_css,
        "NoOfJS": no_of_js,
        "NoOfSelfRef": no_of_self_ref,
        "NoOfEmptyRef": no_of_empty_ref,
        "NoOfExternalRef": no_of_external_ref,
        "SuspiciousCharacterDensity": suspicious_character_density,
        "DigitDensity": digit_density,
        "SubdomainDensity": subdomain_density,
        "RedirectDensity": redirect_density,
        "ExternalReferenceRatio": external_reference_ratio,
        "SecurityRiskScore": security_risk_score,
    }

    return features