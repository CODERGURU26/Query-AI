import os
import io
import hashlib
import pandas as pd
from typing import List, Dict, Any

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.query_engine import process_question
from src.csv_parser import parse_csv_content, CSVValidationError
from src.csv_engine import (
    initialize_csv_dataset,
    process_csv_question,
    cleanup_expired_datasets,
    dataset_exists,
)

app = FastAPI(
    title="QueryAI API",
    description="Natural language to SQL analytics API",
    version="1.0.0",
)

cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    question: str


class CSVUploadResponse(BaseModel):
    dataset_id: str
    filename: str
    rows: int
    columns: int
    schema: List[Dict[str, str]]


class CSVQueryRequest(BaseModel):
    question: str
    dataset_id: str


class CSVQueryResponse(BaseModel):
    question: str
    source: str
    dataset_id: str
    sql: str | None
    answer: str
    columns: List[str]
    data: List[Dict[str, Any]]
    summary: Dict[str, Any]
    visualization: Dict[str, Any]


@app.get("/")
def root():
    return {
        "name": "QueryAI",
        "status": "running",
        "message": "Natural language analytics API",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/query")
def query_database(request: QueryRequest):
    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    try:
        result = process_question(question)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="QueryAI couldn't answer this question."
        )


@app.post("/csv/upload")
async def csv_upload(file: UploadFile = File(...)):
    """
    Upload and parse a CSV file.
    Returns dataset metadata and ID for subsequent queries.
    """
    try:
        content = await file.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read uploaded file.")

    filename = file.filename or "upload.csv"

    # Validate and parse
    try:
        parsed = parse_csv_content(content, filename)
    except CSVValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail="Could not parse the uploaded CSV file.")

    # Create dataset ID
    dataset_id = hashlib.sha256(
        f"{parsed['filename']}_{content[:20]}_{len(content)}".encode()
    ).hexdigest()[:12]

    # Initialize the dataset in memory
    try:
        df = pd.read_csv(io.BytesIO(content))
        initialize_csv_dataset(dataset_id, parsed["filename"], df)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not initialize CSV dataset.")

    return CSVUploadResponse(
        dataset_id=dataset_id,
        filename=parsed["filename"],
        rows=parsed["rows"],
        columns=parsed["columns"],
        schema=[{"name": col, "type": col_type} for col, col_type in parsed["column_types"].items()]
    )


@app.post("/csv/query", response_model=CSVQueryResponse)
def csv_query(request: CSVQueryRequest):
    """
    Ask a question against an uploaded CSV dataset.
    Returns the same structured response format as PostgreSQL queries.
    """
    dataset_id = request.dataset_id
    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    if not dataset_exists(dataset_id):
        raise HTTPException(
            status_code=404,
            detail="CSV dataset is no longer available."
        )

    try:
        result = process_csv_question(question, dataset_id)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="QueryAI couldn't answer this question."
        )


def cleanup_old_datasets():
    """Cleanup expired CSV datasets. Call periodically."""
    cleanup_expired_datasets()