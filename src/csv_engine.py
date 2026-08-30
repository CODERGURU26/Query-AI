import os
import io
import time
from typing import Any, Dict, List, Optional, Tuple, Union

import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv

from src.sql_generator import validate_sql, clean_sql
from src.result_interpreter import interpret_result
from src.llm_client import generate_response

load_dotenv()

# Configurable limits
CSV_RETENTION_SECONDS = int(os.getenv("CSV_RETENTION_SECONDS", "3600"))  # 1 hour default
MAX_CSV_DATASET_COUNT = int(os.getenv("MAX_CSV_DATASET_COUNT", "5"))

# In-memory dataset store: dataset_id -> {"df": DataFrame, "created_at": timestamp, "filename": str}
_dataSets: Dict[str, Dict[str, Any]] = {}

# SQLite in-memory engine for CSV datasets
_csv_engine = create_engine(
    "sqlite://",
    echo=False,
    pool_pre_ping=True,
)


def _generate_csv_schema_context(column_names: List[str], column_types: Dict[str, str]) -> str:
    """
    Generate a schema context string for the LLM describing CSV columns.
    Uses a generic table name "csv_data" since CSV data is loaded into
    an in-memory SQLite table with that name.
    """
    lines = [
        "You are working with a CSV dataset.",
        "",
        "CSV DATASET: a CSV file loaded into an in-memory SQLite table named 'csv_data'.",
        "",
        "CSV COLUMNS:",
    ]

    for col in column_names:
        col_type = column_types.get(col, "text")
        lines.append(f"  - {col} ({col_type})")

    lines.extend([
        "",
        "RULES:",
        "1. Generate standard SQL SELECT queries only.",
        "2. Use column names from the list above.",
        "3. Reference the table 'csv_data' in FROM clauses.",
        "4. Never generate INSERT, UPDATE, DELETE, DROP, ALTER, CREATE,",
        "   TRUNCATE, GRANT, or REVOKE statements.",
        "5. Only generate read-only SELECT queries.",
        "6. Use WHERE, ORDER BY, LIMIT, GROUP BY as needed.",
        "7. If the question cannot be answered, return exactly: UNANSWERABLE",
        "",
        "USER QUESTION:",
    ])

    return "\n".join(lines)


def _execute_sql_against_csv(sql: str, dataset_id: str) -> pd.DataFrame:
    """
    Execute a SQL query against a CSV dataset stored in an in-memory SQLite database.
    """
    dataset = _dataSets.get(dataset_id)
    if not dataset:
        raise ValueError("CSV dataset not found.")

    df = dataset["df"]

    # Create SQLite in-memory database with the DataFrame
    conn = _csv_engine.connect()

    # Register the DataFrame as a SQL table named 'csv_data'
    df.to_sql("csv_data", conn, if_exists="replace", index=False)

    try:
        result = pd.read_sql_query(sql, conn)
        return result
    finally:
        conn.close()


def _generate_csv_sql(question: str, column_names: List[str], column_types: Dict[str, str]) -> Tuple[Optional[str], bool]:
    """
    Generate SQL for a CSV dataset using the LLM with a CSV schema context.

    Returns (sql, is_unanswerable) tuple.
    """
    schema_context = _generate_csv_schema_context(column_names, column_types)

    prompt = (
        schema_context
        + "\n\nUSER QUESTION:\n"
        + question
    )

    try:
        response_text = generate_response(prompt)
    except ValueError:
        return None, True

    sql = clean_sql(response_text)

    if sql.strip().upper() == "UNANSWERABLE":
        return "UNANSWERABLE", True

    # Validate SQL safety (same validation as PostgreSQL)
    try:
        validate_sql(sql)
    except ValueError:
        return None, True  # Treat validation failure as unanswerable

    return sql, False


def process_csv_question(
    question: str,
    dataset_id: str,
) -> Dict[str, Any]:
    """
    Process a user question against a CSV dataset.
    """
    dataset = _dataSets.get(dataset_id)
    if not dataset:
        raise ValueError("CSV dataset not found.")

    df = dataset["df"]
    column_names = list(df.columns)
    column_types = {col: "numeric" if pd.api.types.is_numeric_dtype(df[col]) else "text" for col in column_names}

    # Step 1: Generate SQL
    sql, is_unanswerable = _generate_csv_sql(question, column_names, column_types)

    if is_unanswerable or sql is None:
        return {
            "question": question,
            "sql": None,
            "columns": [],
            "data": [],
            "answer": (
                "I cannot answer that question using the "
                "available CSV data."
            ),
            "summary": {},
            "source": "csv",
            "dataset_id": dataset_id,
            "visualization": {"type": "table"},
        }

    # Step 2: Execute SQL
    try:
        result_df = _execute_sql_against_csv(sql, dataset_id)
    except Exception:
        return {
            "question": question,
            "sql": sql,
            "columns": [],
            "data": [],
            "answer": "The query could not be executed against the CSV dataset.",
            "summary": {},
            "source": "csv",
            "dataset_id": dataset_id,
            "visualization": {"type": "table"},
        }

    # Step 3: Convert result to structured data
    columns = result_df.columns.tolist()
    data = result_df.to_dict(orient="records")

    # Convert pandas/numpy values to Python natives
    for row in data:
        for key, value in row.items():
            if hasattr(value, "item"):
                row[key] = value.item()
            elif hasattr(value, "isoformat"):
                row[key] = value.isoformat()

    # Step 4: Interpret result
    answer = interpret_result(question, result_df)

    # Step 5: Generate visualization configuration
    viz_config = _generate_visualization_config(sql, columns, data, column_names)

    # Step 6: Build summary
    summary = _build_summary(result_df, columns)

    return {
        "question": question,
        "sql": sql,
        "columns": columns,
        "data": data,
        "answer": answer,
        "summary": summary,
        "source": "csv",
        "dataset_id": dataset_id,
        "visualization": viz_config,
    }


def _generate_visualization_config(
    sql: str,
    columns: List[str],
    data: List[Dict[str, Any]],
    column_names: List[str],
) -> Dict[str, Any]:
    """
    Generate visualization configuration from the query result.
    Uses rule-based chart type detection for CSV data.
    """
    if not data or len(data) < 2:
        return {"type": "table"}

    # Classify columns
    numeric_cols: List[str] = []
    date_cols: List[str] = []
    categorical_cols: List[str] = []

    for col in column_names:
        # Get sample values from data
        values = [row.get(col) for row in data if row.get(col) is not None]
        if not values:
            categorical_cols.append(col)
            continue

        # Check if all numeric
        all_num = all(
            isinstance(v, (int, float)) and not isinstance(v, bool) for v in values
        )
        # Check if all date-like (YYYY-MM-DD)
        all_date = all(
            isinstance(v, str) and (len(v) >= 10 and v[4] == '-' and v[7] == '-') for v in values
        )

        if all_num:
            numeric_cols.append(col)
        elif all_date:
            date_cols.append(col)
        else:
            categorical_cols.append(col)

    # Rule 1: Date + numeric → line chart
    if date_cols and numeric_cols:
        return {
            "type": "line",
            "xKey": date_cols[0],
            "yKey": numeric_cols[0],
            "title": f"Sales by {date_cols[0]}",
            "format": "currency",
        }

    # Rule 2: 1 categorical + multiple numeric → grouped bar
    if len(categorical_cols) == 1 and len(numeric_cols) > 1:
        return {
            "type": "grouped-bar",
            "xKey": categorical_cols[0],
            "yKey": numeric_cols,
            "title": f"Comparison by {categorical_cols[0]}",
        }

    # Rule 3: 1 categorical + 1 numeric
    if len(categorical_cols) >= 1 and len(numeric_cols) >= 1:
        category_key = categorical_cols[0]
        value_key = numeric_cols[0]

        # Small number of categories → pie chart
        if len(data) <= 6 and len(data) >= 2:
            # Check if it's a ranking query
            if "top" in sql.lower() or "rank" in sql.lower() or "highest" in sql.lower():
                return {
                    "type": "horizontal-bar",
                    "xKey": value_key,
                    "yKey": category_key,
                    "title": f"Top categories by {value_key}",
                    "format": "currency",
                }
            return {
                "type": "pie",
                "xKey": category_key,
                "yKey": value_key,
                "title": f"Distribution of {value_key}",
            }

        # Many categories or ranking → horizontal bar
        if len(data) > 6 or "top" in sql.lower() or "rank" in sql.lower() or "highest" in sql.lower():
            return {
                "type": "horizontal-bar",
                "xKey": value_key,
                "yKey": category_key,
                "title": f"Top {value_key} by category",
                "format": "currency",
            }

        # Default categorical → bar chart
        return {
            "type": "bar",
            "xKey": category_key,
            "yKey": value_key,
            "title": f"{value_key} by {category_key}",
        }

    # Default to table
    return {"type": "table"}


def _build_summary(df: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
    """
    Build a summary of the query result for KPI cards.
    """
    summary: Dict[str, Any] = {}

    numeric_cols = [col for col in columns if col in df.columns and pd.api.types.is_numeric_dtype(df[col])]

    if numeric_cols:
        primary_col = numeric_cols[0]
        try:
            total = df[primary_col].sum()
            summary["total"] = float(total) if not pd.isna(total) else 0
            summary["count"] = len(df)
        except (TypeError, ValueError):
            pass

    # Row count always
    summary["row_count"] = len(df)

    return summary


def cleanup_expired_datasets():
    """
    Remove CSV datasets that have exceeded the retention period.
    """
    now = time.time()
    expired_ids = []

    for dataset_id, dataset in _dataSets.items():
        age = now - dataset["created_at"]
        if age > CSV_RETENTION_SECONDS:
            expired_ids.append(dataset_id)

    for dataset_id in expired_ids:
        _cleanup_dataset(dataset_id)


def _cleanup_dataset(dataset_id: str):
    """Remove a dataset from memory."""
    if dataset_id in _dataSets:
        del _dataSets[dataset_id]


def dataset_exists(dataset_id: str) -> bool:
    """Check if a dataset ID still exists and is valid."""
    return dataset_id in _dataSets


# Alias for the API module
csv_datasets = _dataSets


def initialize_csv_dataset(
    dataset_id: str,
    filename: str,
    df_or_data: Union[pd.DataFrame, bytes, Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Initialize a CSV dataset in the in-memory store.
    """
    if isinstance(df_or_data, pd.DataFrame):
        df = df_or_data
    elif isinstance(df_or_data, bytes):
        df = pd.read_csv(io.BytesIO(df_or_data))
    elif isinstance(df_or_data, dict) and "preview_data" in df_or_data:
        df = pd.DataFrame(df_or_data["preview_data"])
    else:
        df = pd.DataFrame(df_or_data)

    if dataset_id in _dataSets:
        _cleanup_dataset(dataset_id)

    _dataSets[dataset_id] = {
        "df": df,
        "created_at": time.time(),
        "filename": filename,
    }

    return {
        "dataset_id": dataset_id,
        "filename": filename,
        "rows": len(df),
        "columns": list(df.columns),
    }