from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from src.query_engine import process_question


app = FastAPI(
    title="QueryAI API",
    description="Natural language to SQL analytics API",
    version="1.0.0",
)


class QueryRequest(BaseModel):
    question: str


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
            detail=str(e)
        )