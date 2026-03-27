from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routes import router

# Create DB tables (in-memory/actual pg based on database.py)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SustainX Innovation Challenge Backend",
    description="Transforms energy data into structured digital value through rigid logic.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"message": "SustainX Backend is running."}
