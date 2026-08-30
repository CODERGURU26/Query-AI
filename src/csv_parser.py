import os
import csv
import io
import re
from typing import Any, Dict, List, Optional, Tuple
from dotenv import load_dotenv

load_dotenv()

# Configurable limits via environment variables
MAX_CSV_SIZE_MB = int(os.getenv("MAX_CSV_SIZE_MB", "50"))
MAX_COLUMNS = int(os.getenv("MAX_CSV_COLUMNS", "50"))
MAX_ROWS_PREVIEW = int(os.getenv("MAX_ROWS_PREVIEW", "1000"))
MAX_ROWS_DATASET = int(os.getenv("MAX_ROWS_DATASET", "100000"))


class CSVValidationError(Exception):
    """Raised when CSV validation fails."""
    pass


class CSVParsingError(Exception):
    """Raised when CSV parsing fails."""
    pass


def validate_file(
    filename: str,
    content: bytes,
) -> Tuple[bool, str]:
    """
    Validate an uploaded CSV file.

    Checks:
    - Extension is .csv
    - File size within limit
    - Not empty
    - Valid UTF-8 encoding
    - Has headers
    - No duplicate headers
    """

    # Check extension
    if not filename.lower().endswith(".csv"):
        return False, "File must have a .csv extension."

    # Check file size
    size_mb = len(content) / (1024 * 1024)
    if size_mb > MAX_CSV_SIZE_MB:
        return False, f"File is {size_mb:.1f} MB, exceeding the {MAX_CSV_SIZE_MB} MB limit."

    # Check empty file
    if len(content) == 0:
        return False, "The uploaded file is empty."

    # Try to decode as UTF-8
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text = content.decode("latin-1")
        except UnicodeDecodeError:
            return False, "Could not decode the file. Please ensure it is UTF-8 or Latin-1 encoded."

    # Parse and check for headers
    try:
        reader = csv.reader(io.StringIO(text))
        rows = list(reader)
    except csv.Error:
        return False, "The file contains malformed CSV."

    if len(rows) == 0:
        return False, "The CSV file has no content."

    if len(rows) < 2:
        return False, "The CSV file must have at least one header row and one data row."

    headers = rows[0]

    # Check for headers
    if not headers or all(h.strip() == "" for h in headers):
        return False, "The CSV file must have headers in the first row."

    # Check for duplicate headers
    if len(headers) != len(set(h.strip().lower() for h in headers)):
        return False, "The CSV file has duplicate column headers."

    # Check column count limit
    if len(headers) > MAX_COLUMNS:
        return False, f"Too many columns ({len(headers)}). Maximum allowed is {MAX_COLUMNS}."

    return True, ""


def infer_column_types(
    rows: List[List[str]],
) -> Tuple[List[str], Dict[str, str]]:
    """
    Infer data types for each column in the CSV.

    Returns:
        - list of column names
        - dict mapping column name to inferred type ("numeric", "date", "text")
    """
    if not rows or len(rows) < 2:
        return [], {}

    headers = rows[0]
    data_rows = rows[1:]

    # Limit rows for type inference
    sampled_rows = data_rows[:50]

    col_names = headers
    col_types: Dict[str, str] = {}

    for i, col_name in enumerate(col_names):
        values = []
        for row in sampled_rows:
            if i < len(row):
                values.append(row[i].strip())
            else:
                values.append("")

        # Determine type
        if all(is_numeric(v) for v in values if v):
            col_types[col_name] = "numeric"
        elif all(is_date_like(v) for v in values if v):
            col_types[col_name] = "date"
        else:
            col_types[col_name] = "text"

    return col_names, col_types


def is_numeric(value: str) -> bool:
    """Check if a string represents a numeric value."""
    if not value:
        return False
    try:
        float(value)
        return True
    except ValueError:
        return False


def is_date_like(value: str) -> bool:
    """Check if a string looks like a date."""
    if not value:
        return False
    # Match YYYY-MM-DD or similar patterns
    if re.match(r"^\d{4}-\d{2}-\d{2}$", value):
        return True
    try:
        parse_date(value)
        return True
    except (ValueError, OverflowError):
        return False


def parse_date(value: str) -> str:
    """Attempt to parse a date string. Returns the normalized form or raises ValueError."""
    from datetime import datetime

    # Try common formats
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d-%m-%Y", "%Y/%m/%d"):
        try:
            dt = datetime.strptime(value, fmt)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue
    raise ValueError(f"Could not parse date: {value}")


def count_missing_values(rows: List[List[str]], headers: List[str]) -> Dict[str, int]:
    """Count missing/empty values per column."""
    counts: Dict[str, int] = {}
    for i, header in enumerate(headers):
        count = 0
        for row in rows[1:]:  # skip header row
            if i < len(row) and (row[i].strip() == "" or row[i] == ""):
                count += 1
        counts[header] = count
    return counts


def parse_csv_content(
    content: bytes,
    filename: str = "upload.csv",
) -> Dict[str, Any]:
    """
    Parse CSV content and return structured metadata.

    Returns dict with:
    - filename: original filename
    - rows: total row count (excluding header)
    - columns: total column count
    - column_names: list of column names
    - column_types: dict mapping column name to inferred type
    - missing_values: dict mapping column name to missing count
    - preview_data: first few rows as list of dicts
    """
    # Validate first
    valid, message = validate_file(filename, content)
    if not valid:
        raise CSVValidationError(message)

    # Decode
    text = content.decode("utf-8")

    # Parse
    reader = csv.reader(io.StringIO(text))
    rows = list(reader)

    headers = rows[0]
    data_rows = rows[1:]

    # Infer types
    col_names, col_types = infer_column_types(rows)

    # Count missing values
    missing = count_missing_values(rows, headers)

    # Preview data (first 5 rows, limited columns)
    preview_rows = []
    for row in data_rows[:5]:
        row_dict = {}
        for i, header in enumerate(headers):
            if i < len(row):
                row_dict[header] = row[i].strip()
            else:
                row_dict[header] = None
        preview_rows.append(row_dict)

    return {
        "filename": filename,
        "rows": len(data_rows),
        "columns": len(headers),
        "column_names": col_names,
        "column_types": col_types,
        "missing_values": missing,
        "preview_data": preview_rows,
    }