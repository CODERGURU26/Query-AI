from sqlalchemy import text
import pandas as pd

from database import engine


def execute_sql(sql_query):
    """
    Execute a SQL query against PostgreSQL
    and return the result as a pandas DataFrame.
    """

    if not sql_query or not sql_query.strip():
        raise ValueError("SQL query is empty.")

    with engine.connect() as connection:
        result = connection.execute(text(sql_query))

        if result.returns_rows:
            df = pd.DataFrame(
                result.fetchall(),
                columns=result.keys()
            )
            return df

        return pd.DataFrame()


def main():
    print("=" * 80)
    print("QUERYAI SQL EXECUTOR")
    print("=" * 80)

    sql_query = """
    SELECT
        COALESCE(
            t.product_category_name_english,
            p.product_category_name
        ) AS product_category,
        SUM(oi.price) AS total_sales
    FROM olist_order_items_dataset oi
    JOIN olist_products_dataset p
        ON oi.product_id = p.product_id
    LEFT JOIN product_category_name_translation t
        ON p.product_category_name = t.product_category_name
    WHERE p.product_category_name IS NOT NULL
    GROUP BY
        COALESCE(
            t.product_category_name_english,
            p.product_category_name
        )
    ORDER BY total_sales DESC
    LIMIT 10;
    """

    try:
        df = execute_sql(sql_query)

        print("\n" + "=" * 80)
        print("QUERY RESULT")
        print("=" * 80)

        if df.empty:
            print("Query returned no results.")
        else:
            print(df.to_string(index=False))

        print("\n" + "=" * 80)
        print("SQL EXECUTION SUCCESSFUL")
        print("=" * 80)

    except Exception as error:
        print("\n" + "=" * 80)
        print("SQL EXECUTION ERROR")
        print("=" * 80)
        print(error)


if __name__ == "__main__":
    main()