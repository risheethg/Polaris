from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.core.firebase import initialize_firebase
from app.routes import auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_firebase()
    yield
    print("Shutting down...")

app = FastAPI(
    title="FastAPI Backend with Firebase Auth",
    description="This is the backend for my full-stack application.",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(auth.router, prefix="/api/v1/users", tags=["Users"])

@app.get("/")
def read_root():
    return {"status": "Polaris API is running"}