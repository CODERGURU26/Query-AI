import os
import re

from dotenv import load_dotenv

from schema_manager import get_schema_context


# -------------------------------------------------------------------
# ENVIRONMENT
# -------------------------------------------------------------------

load_dotenv()


# -------------------------------------------------------------------
# LLM CONFIGURATION
# -------------------------------------------------------------------

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError(
        "GEMINI_API_KEY is not configured in the .env file."
    )


# -------------------------------------------------------------------
# GEMINI CLIENT
# -------------------------------------------------------------------

from google import genai


client = genai.Client(
    api_key=API_KEY
)


MODEL_NAME = "gemini-2.5-flash"


# -------------------------------------------------------------------
# SQL GENERATION PROMPT
# -------------------------------------------------------------------

SYSTEM_PROMPT = """
You are QueryAI, an expert PostgreSQL SQL generation assistant.

Your job is to convert a user's natural-language question into
a correct PostgreSQL SQL query.

You are working with Brazilian Olist e-commerce data.

IMPORTANT RULES:

1. Generate PostgreSQL-compatible SQL only.

2. Use ONLY tables and columns provided in the database schema.

3. Never invent tables or columns.

4. Respect the relationships provided in the schema.

5. Use explicit JOIN conditions.

6. Prefer readable SQL.

7. Use meaningful aliases.

8. Do not use SELECT * unless the user explicitly asks for all columns.

9. For ranking questions such as "top 10", use ORDER BY and LIMIT.

10. For aggregation questions, use appropriate GROUP BY clauses.

11. Use SUM, COUNT, AVG, MIN, MAX and other aggregation functions
    when appropriate.

12. When calculating revenue from order items, normally use:
       SUM(price)
    unless the user explicitly asks to include freight.

13. When calculating order-item revenue, do not accidentally multiply
    rows by joining another one-to-many table unnecessarily.

14. When dates are stored as TEXT, cast them to timestamp when
    performing date operations.

15. Do not modify database data.

16. Never generate:
       INSERT
       UPDATE
       DELETE
       DROP
       ALTER
       TRUNCATE
       CREATE
       GRANT
       REVOKE

17. Only generate read-only SQL.

18. Return ONLY the SQL query.

Do not include:

- Markdown code fences
- Explanations
- Comments
- "Here is the SQL"
- Additional text
"""


# -------------------------------------------------------------------
# SQL CLEANING
# -------------------------------------------------------------------

def clean_sql(response_text: str) -> str:
    """
    Clean the LLM response so that only SQL is returned.
    """

    sql = response_text.strip()

    # Remove markdown code fences if the model ignores instructions.
    sql = re.sub(
        r"^```(?:sql)?\s*",
        "",
        sql,
        flags=re.IGNORECASE
    )

    sql = re.sub(
        r"\s*```$",
        "",
        sql
    )

    # Remove accidental leading/trailing whitespace.
    sql = sql.strip()

    return sql


# -------------------------------------------------------------------
# BASIC READ-ONLY CHECK
# -------------------------------------------------------------------

def is_read_only_sql(sql: str) -> bool:
    """
    Perform a basic safety check.

    Full SQL validation will be handled later by sql_validator.py.
    """

    normalized = sql.strip().lower()

    forbidden_keywords = [
        "insert",
        "update",
        "delete",
        "drop",
        "alter",
        "truncate",
        "create",
        "grant",
        "revoke",
    ]

    for keyword in forbidden_keywords:

        pattern = rf"\b{keyword}\b"

        if re.search(pattern, normalized):
            return False

    return normalized.startswith(
        ("select", "with")
    )


# -------------------------------------------------------------------
# SQL GENERATOR
# -------------------------------------------------------------------

def generate_sql(question: str) -> str:
    """
    Convert a natural-language question into PostgreSQL SQL.
    """

    if not question or not question.strip():
        raise ValueError(
            "Question cannot be empty."
        )

    schema_context = get_schema_context()

    prompt = f"""
{SYSTEM_PROMPT}

DATABASE SCHEMA:

{schema_context}

USER QUESTION:

{question}

Generate the PostgreSQL SQL query now.
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )

    sql = clean_sql(
        response.text
    )

    if not sql:
        raise ValueError(
            "The LLM returned an empty SQL query."
        )

    if not is_read_only_sql(sql):
        raise ValueError(
            "Generated SQL failed the basic read-only safety check."
        )

    return sql


# -------------------------------------------------------------------
# CLI TEST
# -------------------------------------------------------------------

def main():

    print("\n" + "=" * 80)
    print("QUERYAI SQL GENERATOR")
    print("=" * 80)

    question = input(
        "\nEnter your question: "
    ).strip()

    try:

        sql = generate_sql(question)

        print("\n" + "=" * 80)
        print("GENERATED SQL")
        print("=" * 80)

        print(sql)

    except Exception as error:

        print("\n" + "=" * 80)
        print("ERROR")
        print("=" * 80)

        print(error)


if __name__ == "__main__":
    main()