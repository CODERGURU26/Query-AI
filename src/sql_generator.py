import os
import re
from dotenv import load_dotenv

from src.schema import get_llm_schema_context
from src.sql_executor import execute_sql
from src.result_interpreter import interpret_result
from src.llm_client import generate_response

load_dotenv()

SYSTEM_PROMPT = """
You are QueryAI, an expert PostgreSQL SQL generator.

Your job is to convert a user's natural-language question
into a valid PostgreSQL SQL query.

You have access ONLY to the database schema provided below.

Rules:

1. Generate PostgreSQL SQL only.
2. Use only tables and columns that exist in the schema.
3. Respect the relationships between tables.
4. Never invent tables or columns.
5. Never generate INSERT, UPDATE, DELETE, DROP, ALTER, CREATE,
   TRUNCATE, or other destructive SQL.
6. Only generate read-only SELECT queries.
7. Use appropriate JOIN conditions.
8. Use meaningful aliases.
9. Prefer clear and efficient SQL.
10. Return ONLY the SQL query.
11. Do not wrap the query in markdown code fences.
12. If the question cannot be answered using the available schema,
    return exactly:

UNANSWERABLE

DATABASE SCHEMA:

"""


def clean_sql(response_text):
    """
    Clean SQL returned by the model. Extracts SQL from markdown blocks,
    removes conversational preamble/postamble, and strips leading comments.
    """
    if not response_text:
        return ""

    text = response_text.strip()

    if text.upper() == "UNANSWERABLE":
        return "UNANSWERABLE"

    # 1. Extract from markdown code block if present
    match = re.search(r"```(?:sql)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
    if match:
        text = match.group(1).strip()

    # 2. Strip leading SQL comments (-- ... or /* ... */)
    text = re.sub(r"^\s*--.*?\n", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\s*/\*[\s\S]*?\*/\s*", "", text)

    # 3. If text doesn't start with SELECT or WITH, find the first occurrence
    if not re.match(r"^(SELECT|WITH)\b", text.strip(), re.IGNORECASE):
        find_stmt = re.search(r"\b(SELECT|WITH)\b[\s\S]*", text, re.IGNORECASE)
        if find_stmt:
            text = find_stmt.group(0).strip()

    # Strip trailing semicolon and whitespace
    return text.strip().rstrip(";").strip()


def validate_sql(sql):
    """
    Enhanced safety validation.
    """
    if not sql:
        raise ValueError("The model returned an empty response.")

    if sql.upper() == "UNANSWERABLE":
        return False

    # Remove comments for validation check
    clean_check = re.sub(r"--.*?\n", "\n", sql)
    clean_check = re.sub(r"/\*[\s\S]*?\*/", "", clean_check).strip()
    normalized = clean_check.upper()

    # Reject multiple statements
    semicolon_split = [p.strip() for p in clean_check.split(";") if p.strip()]
    if len(semicolon_split) > 1:
        raise ValueError("Multiple SQL statements are not allowed.")

    # Reject queries starting with anything other than SELECT or WITH
    if not (normalized.startswith("SELECT") or normalized.startswith("WITH")):
        raise ValueError("SQL query must start with SELECT or WITH.")

    forbidden = [
        "INSERT",
        "UPDATE",
        "DELETE",
        "DROP",
        "ALTER",
        "TRUNCATE",
        "CREATE",
        "GRANT",
        "REVOKE",
        "REPLACE",
        "MERGE",
    ]

    for keyword in forbidden:
        pattern = r"\b" + keyword + r"\b"
        if re.search(pattern, normalized):
            raise ValueError(
                f"Unsafe SQL detected: {keyword}"
            )

    return True


def generate_sql(question):
    """
    Convert natural-language question into SQL.
    """
    schema_context = get_llm_schema_context()

    prompt = (
        SYSTEM_PROMPT
        + schema_context
        + "\n\nUSER QUESTION:\n"
        + question
    )

    response_text = generate_response(prompt)
    sql = clean_sql(response_text)

    if sql.upper() == "UNANSWERABLE":
        return "UNANSWERABLE"

    validate_sql(sql)

    return sql


def main():
    print("=" * 80)
    print("QUERYAI")
    print("=" * 80)

    question = input("\nEnter your question: ").strip()

    if not question:
        print("No question provided.")
        return

    try:
        # --------------------------------------------------
        # STEP 1: Generate SQL
        # --------------------------------------------------
        sql = generate_sql(question)

        print("\n" + "=" * 80)
        print("GENERATED SQL")
        print("=" * 80)
        print(sql)

        if sql.upper() == "UNANSWERABLE":
            print("\nThis question cannot be answered using the database schema.")
            return

        # --------------------------------------------------
        # STEP 2: Execute SQL
        # --------------------------------------------------
        print("\n" + "=" * 80)
        print("EXECUTING SQL")
        print("=" * 80)
        result = execute_sql(sql)

        # --------------------------------------------------
        # STEP 3: Display raw query result
        # --------------------------------------------------
        print("\n" + "=" * 80)
        print("QUERY RESULT")
        print("=" * 80)

        if result.empty:
            print("No results found.")
        else:
            print(result.to_string(index=False))

        # --------------------------------------------------
        # STEP 4: Interpret result
        # --------------------------------------------------
        print("\n" + "=" * 80)
        print("QUERYAI ANSWER")
        print("=" * 80)
        answer = interpret_result(question, result)
        print(answer)

        print("\n" + "=" * 80)
        print("QUERY EXECUTION SUCCESSFUL")
        print("=" * 80)

    except Exception as e:
        print("\n" + "=" * 80)
        print("ERROR")
        print("=" * 80)
        print(str(e))


if __name__ == "__main__":
    main()