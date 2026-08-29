/* =========================================================
   PHISHGUARD AI
   URL Detection Frontend
========================================================= */


const API_URL =
    "https://ai-phishing-url-detector-msrc.onrender.com";


/* =========================================================
   DOM ELEMENTS
========================================================= */

const scanForm =
    document.getElementById("scanForm");

const urlInput =
    document.getElementById("urlInput");

const analyzeBtn =
    document.getElementById("analyzeBtn");

const loading =
    document.getElementById("loading");

const result =
    document.getElementById("result");

const errorBox =
    document.getElementById("error");

const errorMessage =
    document.getElementById("errorMessage");

const resultIcon =
    document.getElementById("resultIcon");

const resultLabel =
    document.getElementById("resultLabel");

const resultUrl =
    document.getElementById("resultUrl");

const resultPrediction =
    document.getElementById("resultPrediction");

const resultConfidence =
    document.getElementById("resultConfidence");

const confidenceBar =
    document.getElementById("confidenceBar");

const exampleButtons =
    document.querySelectorAll(".example-btn");


/* =========================================================
   BASIC UI HELPERS
========================================================= */

function show(element) {

    if (element) {
        element.classList.remove("hidden");
    }

}


function hide(element) {

    if (element) {
        element.classList.add("hidden");
    }

}


/* =========================================================
   RESET UI
========================================================= */

function resetUI() {

    hide(result);

    hide(errorBox);

    confidenceBar.style.width = "0%";

    resultLabel.textContent = "Legitimate";

    resultPrediction.textContent = "—";

    resultUrl.textContent = "—";

    resultConfidence.textContent = "0%";

}


/* =========================================================
   RESULT THEME
========================================================= */

function setResultTheme(label) {

    const normalizedLabel =
        String(label || "").toLowerCase();


    if (normalizedLabel === "phishing") {

        resultIcon.textContent = "!";

        resultIcon.style.background =
            "rgba(239, 68, 68, 0.12)";

        resultIcon.style.color =
            "#f87171";

        result.style.borderColor =
            "rgba(239, 68, 68, 0.28)";

        result.style.background =
            "rgba(239, 68, 68, 0.035)";

        confidenceBar.style.background =
            "#ef4444";

        resultLabel.style.color =
            "#f87171";

        return;
    }


    resultIcon.textContent = "✓";

    resultIcon.style.background =
        "rgba(34, 197, 94, 0.12)";

    resultIcon.style.color =
        "#45e981";

    result.style.borderColor =
        "rgba(34, 197, 94, 0.20)";

    result.style.background =
        "rgba(34, 197, 94, 0.025)";

    confidenceBar.style.background =
        "#2edb6b";

    resultLabel.style.color =
        "#e8f2eb";

}


/* =========================================================
   BUTTON STATE
========================================================= */

function setScanningState(isScanning) {

    analyzeBtn.disabled =
        isScanning;


    const buttonText =
        analyzeBtn.querySelector(".button-text");


    if (!buttonText) {
        return;
    }


    if (isScanning) {

        buttonText.textContent =
            "SCANNING...";

    } else {

        buttonText.textContent =
            "SCAN URL";

    }

}


/* =========================================================
   ERROR HANDLING
========================================================= */

function showError(message) {

    errorMessage.textContent =
        message ||
        "Could not connect to the prediction API.";

    show(errorBox);

}


/* =========================================================
   URL NORMALIZATION
========================================================= */

function normalizeURL(value) {

    let url =
        String(value || "").trim();


    if (!url) {
        return "";
    }


    /*
     * The backend accepts URL strings.
     *
     * If the user enters:
     *
     * google.com
     *
     * we turn it into:
     *
     * https://google.com
     *
     * This makes the scanner more forgiving.
     */

    if (
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ) {

        url =
            "https://" + url;

    }


    return url;

}


/* =========================================================
   MAIN ANALYSIS FUNCTION
========================================================= */

async function analyzeURL() {

    const rawURL =
        urlInput.value.trim();


    resetUI();


    if (!rawURL) {

        showError(
            "Please enter a URL to analyze."
        );

        urlInput.focus();

        return;

    }


    const url =
        normalizeURL(rawURL);


    show(loading);

    setScanningState(true);


    try {

        /*
         * AbortController prevents the interface
         * from waiting forever if the API does not respond.
         */

        const controller =
            new AbortController();


        const timeout =
            setTimeout(() => {

                controller.abort();

            }, 30000);


        let response;


        try {

            response =
                await fetch(
                    `${API_URL}/predict`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                url: url
                            }),

                        signal:
                            controller.signal
                    }
                );

        } finally {

            clearTimeout(timeout);

        }


        /*
         * Read the response safely.
         */

        let data;


        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                "The prediction API returned an invalid response."
            );

        }


        /*
         * Handle HTTP errors.
         */

        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to analyze the submitted URL."
            );

        }


        /*
         * Convert confidence from:
         *
         * 0.95
         *
         * into:
         *
         * 95%
         */

        const confidence =
            Number(data.confidence || 0);


        const confidencePercent =
            Math.max(
                0,
                Math.min(
                    100,
                    confidence * 100
                )
            );


        /*
         * Populate result.
         */

        resultUrl.textContent =
            data.url || url;


        resultPrediction.textContent =
            data.prediction || "N/A";


        resultLabel.textContent =
            data.label || "Unknown";


        resultConfidence.textContent =
            `${confidencePercent.toFixed(2)}%`;


        setResultTheme(
            data.label
        );


        show(result);


        /*
         * Animate confidence bar.
         */

        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                confidenceBar.style.width =
                    `${confidencePercent}%`;

            });

        });


        /*
         * Scroll the result into view
         * on smaller screens.
         */

        if (
            window.innerWidth <= 700
        ) {

            setTimeout(() => {

                result.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });

            }, 150);

        }

    } catch (error) {

        console.error(
            "PhishGuard AI:",
            error
        );


        if (
            error.name === "AbortError"
        ) {

            showError(
                "The prediction API took too long to respond. Please try again."
            );

        } else if (
            error instanceof TypeError
        ) {

            showError(
                "Unable to reach the prediction API. Please check your connection and try again."
            );

        } else {

            showError(
                error.message ||
                "Could not connect to the prediction API."
            );

        }

    } finally {

        hide(loading);

        setScanningState(false);

    }

}


/* =========================================================
   FORM SUBMISSION
   Handles:
   - Button click
   - Enter key
========================================================= */

if (scanForm) {

    scanForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            analyzeURL();

        }
    );

}


/* =========================================================
   EXAMPLE URL BUTTONS
========================================================= */

exampleButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const url =
                    button.dataset.url;


                if (!urlInput || !url) {
                    return;
                }


                urlInput.value =
                    url;


                urlInput.focus();

            }
        );

    }
);


/* =========================================================
   KEYBOARD SUPPORT
========================================================= */

if (urlInput) {

    urlInput.addEventListener(
        "keydown",
        function (event) {

            /*
             * The form already handles Enter.
             * This simply prevents accidental browser
             * behavior from interfering.
             */

            if (event.key === "Enter") {

                event.preventDefault();

                if (!analyzeBtn.disabled) {

                    analyzeURL();

                }

            }

        }
    );

}


/* =========================================================
   INITIAL STATE
========================================================= */

resetUI();

console.log(
    "PhishGuard AI frontend initialized."
);

console.log(
    "Prediction API:",
    API_URL
);