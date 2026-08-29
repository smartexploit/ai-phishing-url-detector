const API_URL = "https://ai-phishing-url-detector-msrc.onrender.com";

const urlInput = document.getElementById("urlInput");
const analyzeBtn = document.getElementById("analyzeBtn");

const loading = document.getElementById("loading");
const result = document.getElementById("result");
const errorBox = document.getElementById("error");
const errorMessage = document.getElementById("errorMessage");

const resultIcon = document.getElementById("resultIcon");
const resultLabel = document.getElementById("resultLabel");
const resultUrl = document.getElementById("resultUrl");
const resultPrediction = document.getElementById("resultPrediction");
const resultConfidence = document.getElementById("resultConfidence");
const confidenceBar = document.getElementById("confidenceBar");

function show(element) {
element.classList.remove("hidden");
}

function hide(element) {
element.classList.add("hidden");
}

function resetResult() {
hide(result);
hide(errorBox);

```
confidenceBar.style.width = "0%";
```

}

function setResultTheme(label) {

```
if (label === "Phishing") {

    resultIcon.textContent = "!";

    resultIcon.style.background = "rgba(239, 68, 68, 0.12)";
    resultIcon.style.color = "#f87171";

    result.style.borderColor = "rgba(239, 68, 68, 0.22)";
    result.style.background = "rgba(239, 68, 68, 0.025)";

    confidenceBar.style.background = "#ef4444";

    resultLabel.style.color = "#f87171";

} else {

    resultIcon.textContent = "✓";

    resultIcon.style.background = "rgba(34, 197, 94, 0.12)";
    resultIcon.style.color = "#4ade80";

    result.style.borderColor = "rgba(34, 197, 94, 0.17)";
    result.style.background = "rgba(34, 197, 94, 0.025)";

    confidenceBar.style.background = "#22c55e";

    resultLabel.style.color = "#f1f5f9";
}
```

}

async function analyzeURL() {

```
const url = urlInput.value.trim();

resetResult();

if (!url) {

    errorMessage.textContent = "Please enter a URL to analyze.";

    show(errorBox);

    urlInput.focus();

    return;
}


show(loading);

analyzeBtn.disabled = true;


try {

    const response = await fetch(`${API_URL}/predict`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            url: url
        })

    });


    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("The prediction API returned an invalid response.");
    }


    if (!response.ok) {

        throw new Error(
            data.detail || "Unable to analyze the submitted URL."
        );
    }


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


    resultUrl.textContent =
        data.url || url;


    resultPrediction.textContent =
        data.prediction || "N/A";


    resultLabel.textContent =
        data.label || "Unknown";


    resultConfidence.textContent =
        `${confidencePercent.toFixed(2)}%`;


    setResultTheme(data.label);


    show(result);


    requestAnimationFrame(() => {

        confidenceBar.style.width =
            `${confidencePercent}%`;

    });

}


catch (error) {

    errorMessage.textContent =
        error.message ||
        "Could not connect to the prediction API.";

    show(errorBox);

}


finally {

    hide(loading);

    analyzeBtn.disabled = false;

}
```

}

analyzeBtn.addEventListener(
"click",
analyzeURL
);

urlInput.addEventListener(
"keydown",
(event) => {

```
    if (event.key === "Enter") {

        event.preventDefault();

        analyzeURL();

    }

}
```

);
