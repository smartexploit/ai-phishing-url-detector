from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.predict import predict_url


app = FastAPI(
    title="AI Phishing URL Detector API",
    description="Machine-learning API for phishing URL detection",
    version="1.0.0"
)


# Allow the local frontend to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class URLRequest(BaseModel):
    url: str


@app.get("/")
def root():
    return {
        "message": "AI Phishing URL Detector API",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": type(predict_url.__globals__["model"]).__name__
    }


@app.post("/predict")
def predict(request: URLRequest):

    try:
        result = predict_url(request.url)
        return result

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )