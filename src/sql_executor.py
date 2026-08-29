from sqlalchemy import text

from database import engine


FORBIDDEN_KEYWORDS = [
    "INSERT",
    "UPDATE",
    "DELETE",
    "DROP",
    "ALTER",
    "TRUNCATE",
    "CREATE",
    "GRANT",
    "REVOKE",
]


def validate_sql(sql: str):
    """
    Ensure only read-only SQL is executed.
    """

    if not sql or not sql.strip():
        raise ValueError("SQL query is empty.")

    normalized_sql = sql.strip().upper()

    if not normalized_sql.startswith("SELECT"):
        raise ValueError(
            "Only SELECT queries are allowed."
        )

    for keyword in FORBIDDEN_KEYWORDS:
        if f"{keyword} " in normalized_sql:
            raise ValueError(
                f"Unsafe SQL detected: {keyword}"
            )


def execute_sql(sql: str):
    """
    Execute a validated SQL query and return the results.
    """

    validate_sql(sql)

    with engine.connect() as connection:
        result = connection.execute(text(sql))

        columns = list(result.keys())
        rows = result.fetchall()

    return columns, rows


def print_results(columns, rows):
    """
    Display query results in a readable format.
    """

    print("\n" + "=" * 80)
    print("QUERY RESULTS")
    print("=" * 80)

    if not rows:
        print("No results found.")
        return

    print("\n" + " | ".join(columns))
    print("-" * 80)

    for row in rows:
        print(" | ".join(str(value) for value in row))

    print("\n" + "=" * 80)
    print(f"Rows returned: {len(rows)}")
    print("=" * 80)


def main():

    print("=" * 80)
    print("QUERYAI SQL EXECUTOR")
    print("=" * 80)

    sql = input("\nEnter SQL query: ").strip()

    try:

        columns, rows = execute_sql(sql)

        print_results(columns, rows)

    except Exception as e:

        print("\n" + "=" * 80)
        print("ERROR")
        print("=" * 80)

        print(str(e))


if __name__ == "__main__":
    main()