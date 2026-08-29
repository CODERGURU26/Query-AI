import os
import re

from dotenv import load_dotenv
from google import genai

from schema import get_llm_schema_context


load_dotenv()


API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY is not configured.")


client = genai.Client(api_key=API_KEY)

MODEL = "gemini-3.6-flash"


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
    Clean SQL returned by the model.
    """

    sql = response_text.strip()

    # Remove markdown code fences if the model still returns them.
    sql = re.sub(r"^```sql\s*", "", sql, flags=re.IGNORECASE)
    sql = re.sub(r"^```\s*", "", sql)
    sql = re.sub(r"\s*```$", "", sql)

    return sql.strip()


def validate_sql(sql):
    """
    Basic safety validation.
    """

    if not sql:
        raise ValueError("The model returned an empty response.")

    if sql.upper() == "UNANSWERABLE":
        return False

    normalized = sql.strip().upper()

    if not normalized.startswith("SELECT"):
        raise ValueError(
            "Generated SQL is not a SELECT statement."
        )

    forbidden = [
        "INSERT ",
        "UPDATE ",
        "DELETE ",
        "DROP ",
        "ALTER ",
        "TRUNCATE ",
        "CREATE ",
        "GRANT ",
        "REVOKE ",
    ]

    for keyword in forbidden:
        if keyword in normalized:
            raise ValueError(
                f"Unsafe SQL detected: {keyword.strip()}"
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

    interaction = client.interactions.create(
        model=MODEL,
        input=prompt,
    )

    sql = interaction.output_text

    sql = clean_sql(sql)

    validate_sql(sql)

    return sql


def main():

    print("=" * 80)
    print("QUERYAI SQL GENERATOR")
    print("=" * 80)

    question = input("\nEnter your question: ").strip()

    if not question:
        print("No question provided.")
        return

    try:

        sql = generate_sql(question)

        print("\n" + "=" * 80)
        print("GENERATED SQL")
        print("=" * 80)

        print(sql)

        print("\n" + "=" * 80)
        print("SQL GENERATION SUCCESSFUL")
        print("=" * 80)

    except Exception as e:

        print("\n" + "=" * 80)
        print("ERROR")
        print("=" * 80)

        print(str(e))


if __name__ == "__main__":
    main()