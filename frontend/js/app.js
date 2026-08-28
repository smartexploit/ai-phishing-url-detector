const API_URL = "http://127.0.0.1:8000";

const urlInput = document.getElementById("urlInput");
const analyzeBtn = document.getElementById("analyzeBtn");

const loading = document.getElementById("loading");
const result = document.getElementById("result");
const errorBox = document.getElementById("error");

const resultIcon = document.getElementById("resultIcon");
const resultLabel = document.getElementById("resultLabel");
const resultUrl = document.getElementById("resultUrl");
const resultPrediction = document.getElementById("resultPrediction");
const resultConfidence = document.getElementById("resultConfidence");


function show(element) {
    element.classList.remove("hidden");
}


function hide(element) {
    element.classList.add("hidden");
}


async function analyzeURL() {

    const url = urlInput.value.trim();

    hide(result);
    hide(errorBox);

    if (!url) {
        errorBox.textContent = "Please enter a URL.";
        show(errorBox);
        return;
    }

    show(loading);
    analyzeBtn.disabled = true;

    try {

        const response = await fetch(API_URL + "/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: url
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Unable to analyze the URL."
            );
        }

        resultUrl.textContent = data.url;
        resultPrediction.textContent = data.prediction;
        resultLabel.textContent = data.label;
        resultConfidence.textContent =
            (data.confidence * 100).toFixed(2) + "%";

        if (data.label === "Phishing") {

            resultIcon.textContent = "!";

            resultIcon.style.background = "#ffe2e2";
            resultIcon.style.color = "#b42318";

        } else {

            resultIcon.textContent = "✓";

            resultIcon.style.background = "#dff5e7";
            resultIcon.style.color = "#16803c";
        }

        show(result);

    } catch (error) {

        errorBox.textContent =
            error.message ||
            "Could not connect to the prediction API.";

        show(errorBox);

    } finally {

        hide(loading);
        analyzeBtn.disabled = false;
    }
}


analyzeBtn.addEventListener("click", analyzeURL);


urlInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        analyzeURL();
    }

});