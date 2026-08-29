import pandas as pd
from sqlalchemy import text

from database import engine


def execute_sql(sql_query: str) -> pd.DataFrame:
    """
    Execute a read-only SQL query and return the result as a DataFrame.
    """

    if not sql_query or not sql_query.strip():
        raise ValueError("SQL query is empty.")

    with engine.connect() as connection:
        result = connection.execute(text(sql_query))

        if not result.returns_rows:
            return pd.DataFrame()

        return pd.DataFrame(
            result.fetchall(),
            columns=result.keys()
        )