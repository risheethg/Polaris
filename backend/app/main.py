# backend/app/main.py

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
import time
import traceback
import logging
import inspect

# NEW: Import your logger instance
from app.core.logger import logs
from app.core.firebase import initialize_firebase
from app.routes.auth import router as auth_router
from app.routes.kmeans import router as kmeans_router
from app.routes.assessment import router as assessment_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # MODIFIED: Use the new logger for startup events
    logs.define_logger(level=logging.INFO, message="--- SERVER STARTING UP ---")
    try:
        initialize_firebase()
        logs.define_logger(level=logging.INFO, message="--- FIREBASE INITIALIZED SUCCESSFULLY ---")
    except Exception as e:
        logs.define_logger(
            level=logging.CRITICAL, 
            message=f"!!! FATAL STARTUP ERROR: {str(e)}",
            loggName=inspect.stack()[0]
        )
    yield


app = FastAPI(
    title="Polaris backend",
    description="This is the backend for my full-stack application.",
    version="1.0.0",
    lifespan=lifespan
)

#Middleware to log every request
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log the incoming request
    logs.define_logger(level=logging.INFO, request=request, message="Request received")
    
    response = await call_next(request)
    
    process_time = (time.time() - start_time) * 1000
    formatted_process_time = f'{process_time:.2f}ms'
    
    # Log the response
    logs.define_logger(
        level=logging.INFO,
        request=request,
        message=f"Request completed in {formatted_process_time} - Status: {response.status_code}",
    )
    
    return response

#Global exception handler to log uncaught errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the full traceback of the exception
    logs.define_logger(
        level=logging.CRITICAL,
        request=request,
        message=f"Unhandled exception: {str(exc)}\n{traceback.format_exc()}",
        loggName=inspect.stack()[0]
    )
    return JSONResponse(
        status_code=500,
        content={"message": "An internal server error occurred."},
    )

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/users")
app.include_router(kmeans_router, prefix="/api/v1/ml")
app.include_router(assessment_router, prefix="/api/v1/assessments")

@app.get("/")
def read_root():
    return {"status": "Polaris API is running"}