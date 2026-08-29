# 🛡️ AI Phishing URL Detector

An AI-powered cybersecurity application that uses machine learning to analyze URLs and identify potentially phishing websites.

## 🚀 Live Demo

**Web Application:**  
https://ai-phishing-url-detector.vercel.app/

**Backend API:**  
https://ai-phishing-url-detector-msrc.onrender.com/

---

## 🎯 Project Overview

The AI Phishing URL Detector is a machine-learning cybersecurity project designed to identify potentially malicious phishing URLs.

The application extracts security-related characteristics from a submitted URL and uses a trained Random Forest classifier to determine whether the URL is likely to be legitimate or phishing.

The project demonstrates a complete machine-learning application workflow:

**Dataset → Data Exploration → Feature Engineering → Model Training → Validation → API → Frontend → Testing → Deployment**

---

## ✨ Features

- 🔍 Phishing URL detection
- 🤖 Random Forest machine-learning model
- 📊 Prediction confidence score
- ⚡ FastAPI REST API
- 🌐 Web-based frontend
- 🔐 Production CORS configuration
- 🧪 Automated tests
- ☁️ Cloud deployment
- 💾 Git LFS model storage

---

## 🧠 Machine Learning

The prediction system uses a **Random Forest Classifier** trained on the **PhiUSIIL Phishing URL Dataset**.

The trained model analyzes URL characteristics and returns:

- URL
- Prediction
- Classification label
- Confidence score

Example response:

```json
{
  "url": "https://www.google.com",
  "prediction": 1,
  "label": "Legitimate",
  "confidence": 0.9977
}

🏗️ System Architecture
                    User
                     │
                     ▼
              Web Frontend
            HTML / CSS / JS
                     │
                     │ HTTPS
                     ▼
             FastAPI Backend
                     │
                     ▼
             URL Prediction
                     │
                     ▼
          Feature Extraction
                     │
                     ▼
          Random Forest Model
                     │
                     ▼
              Prediction
                     │
                     ▼
             Frontend Result
🛠️ Technology Stack
Area	Technology
Programming Language	Python
Machine Learning	Scikit-learn
Model	Random Forest Classifier
API Framework	FastAPI
Data Validation	Pydantic
Model Serialization	Joblib
Frontend	HTML, CSS, JavaScript
Testing	Pytest
Backend Deployment	Render
Frontend Deployment	Vercel
Version Control	Git / GitHub
Model Storage	Git LFS
🔌 API
Health Check
GET /health

Example:

{
  "status": "healthy",
  "model": "RandomForestClassifier"
}
URL Prediction
POST /predict

Request:

{
  "url": "https://www.google.com"
}

The API returns the URL prediction, classification label, and confidence score.

🧪 Testing

The project includes automated tests covering the prediction and API workflow.

The production API was also manually verified using:

GET /
GET /health
POST /predict
OPTIONS /predict

The deployed API successfully responds to requests from the production Vercel frontend.

🌐 Deployment
Frontend

The frontend is deployed on Vercel:

https://ai-phishing-url-detector.vercel.app/

Backend

The FastAPI backend is deployed on Render:

https://ai-phishing-url-detector-msrc.onrender.com/

The frontend communicates with the production API through HTTPS.

🔐 Cybersecurity Considerations

The application is designed as a cybersecurity-awareness and machine-learning demonstration.

The prediction should be treated as an additional security signal, not as an absolute determination that a website is safe or malicious.

Users should avoid visiting suspicious URLs simply to test them.

📌 Limitations

The model's prediction depends on patterns learned from its training data.

A high-confidence prediction does not guarantee that a URL is safe, and a phishing classification does not necessarily mean that a URL is malicious.

Real-world phishing detection can also benefit from additional sources such as:

Domain reputation
DNS information
Certificate information
Threat intelligence
Domain age
URL reputation databases
Continuous model evaluation
🚀 Future Improvements

Planned improvements include:

Improved URL feature engineering
Model performance optimization
Explainable predictions
Expanded automated test coverage
Threat-intelligence integration
Continuous model evaluation
Improved frontend UX
Additional security controls
More advanced phishing detection techniques
👨‍💻 Project

This project was developed as part of an AI + Cybersecurity learning journey, combining machine learning with practical cybersecurity application development.

The project demonstrates the progression from dataset analysis and model development to API development, frontend integration, testing, and cloud deployment.

⚠️ Disclaimer

This project is intended for educational, research, and cybersecurity-awareness purposes.

It should not be used as the sole mechanism for determining whether a website is safe.

📄 License

This project is provided for educational and portfolio purposes.


### Step 3 — Save

In Notepad:

**File → Save**

Then close Notepad.

### Step 4 — Check the change

Run:

```powershell
git status

You should see:

modified:   