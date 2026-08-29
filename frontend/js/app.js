const API_URL =
"https://ai-phishing-url-detector-msrc.onrender.com";

/* =========================================================
DOM ELEMENTS
========================================================= */

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

const exampleUrl =
document.getElementById("exampleUrl");

/* =========================================================
UI HELPERS
========================================================= */

function show(element) {
element.classList.remove("hidden");
}

function hide(element) {
element.classList.add("hidden");
}

/* =========================================================
NORMALIZE URL
========================================================= */

function normalizeURL(value) {

```
let url = value.trim();

if (!url) {
    return "";
}

/*
 * The API expects a URL string.
 * If the user enters example.com instead of
 * https://example.com, add the scheme.
 */
if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
}

return url;
```

}

/* =========================================================
RESET RESULT COLORS
========================================================= */

function resetResultStyle() {

```
resultIcon.style.background =
    "rgba(72,215,165,0.12)";

resultIcon.style.color =
    "#48d7a5";

resultLabel.style.color =
    "#f2f7fc";

confidenceBar.style.background =
    "#48d7a5";

resultConfidence.style.color =
    "#48d7a5";
```

}

/* =========================================================
DISPLAY RESULT
========================================================= */

function displayResult(data) {

```
const confidence =
    Number(data.confidence || 0);

const confidencePercent =
    Math.max(
        0,
        Math.min(
            confidence * 100,
            100
        )
    );


resultUrl.textContent =
    data.url || "Unknown";

resultPrediction.textContent =
    data.prediction || "Unknown";

resultLabel.textContent =
    data.label || "Unknown";

resultConfidence.textContent =
    confidencePercent.toFixed(2) + "%";


resetResultStyle();


if (
    String(data.label).toLowerCase()
    === "phishing"
) {

    resultIcon.textContent = "!";

    resultIcon.style.background =
        "rgba(255,104,117,0.12)";

    resultIcon.style.color =
        "#ff6875";

    resultLabel.style.color =
        "#ff6875";

    confidenceBar.style.background =
        "#ff6875";

    resultConfidence.style.color =
        "#ff6875";

} else {

    resultIcon.textContent = "✓";
}


/*
 * Animate the confidence meter.
 */
confidenceBar.style.width = "0%";

requestAnimationFrame(() => {

    setTimeout(() => {

        confidenceBar.style.width =
            confidencePercent + "%";

    }, 80);

});


show(result);
```

}

/* =========================================================
ANALYZE URL
========================================================= */

async function analyzeURL() {

```
const rawURL =
    urlInput.value.trim();


hide(result);
hide(errorBox);


if (!rawURL) {

    errorBox.textContent =
        "Please enter a URL to analyze.";

    show(errorBox);

    urlInput.focus();

    return;
}


const url =
    normalizeURL(rawURL);


show(loading);

analyzeBtn.disabled = true;

analyzeBtn.querySelector("span:first-child")
    .textContent = "Analyzing...";


try {

    const response =
        await fetch(
            API_URL + "/predict",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    url: url
                })
            }
        );


    let data;

    try {

        data =
            await response.json();

    } catch {

        throw new Error(
            "The prediction service returned an invalid response."
        );
    }


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "Unable to analyze the URL."
        );
    }


    displayResult(data);


} catch (error) {

    console.error(
        "Prediction error:",
        error
    );


    errorBox.textContent =
        error.message ||
        "Could not connect to the prediction API.";


    show(errorBox);


} finally {

    hide(loading);

    analyzeBtn.disabled = false;

    analyzeBtn.querySelector("span:first-child")
        .textContent = "Analyze URL";
}
```

}

/* =========================================================
ANALYZE BUTTON
========================================================= */

analyzeBtn.addEventListener(
"click",
analyzeURL
);

/* =========================================================
ENTER KEY
========================================================= */

urlInput.addEventListener(
"keydown",
function(event) {

```
    if (event.key === "Enter") {

        event.preventDefault();

        analyzeURL();
    }
}
```

);

/* =========================================================
EXAMPLE URL
========================================================= */

if (exampleUrl) {

```
exampleUrl.addEventListener(
    "click",
    function() {

        urlInput.value =
            "https://www.google.com";

        urlInput.focus();
    }
);
```

}

/* =========================================================
INITIAL STATE
========================================================= */

hide(result);
hide(loading);
hide(errorBox);
resetResultStyle();
