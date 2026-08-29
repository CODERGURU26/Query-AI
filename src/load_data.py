from pathlib import Path

import pandas as pd
from sqlalchemy import text

from database import engine


DATA_DIR = Path(r"C:\QueryAI\data")


def clean_table_name(filename):
    """
    Convert CSV filename into a PostgreSQL-friendly table name.
    """
    name = Path(filename).stem.lower()

    name = name.replace("-", "_")
    name = name.replace(" ", "_")

    return name


def load_csv(file_path):
    print("\n" + "=" * 80)
    print(f"Loading: {file_path.name}")
    print("=" * 80)

    df = pd.read_csv(file_path)

    table_name = clean_table_name(file_path.name)

    print(f"Rows: {len(df):,}")
    print(f"Columns: {len(df.columns)}")
    print(f"Table: {table_name}")

    # Upload dataframe to PostgreSQL
    df.to_sql(
        table_name,
        engine,
        if_exists="replace",
        index=False,
        method="multi"
    )

    print(f"✓ Successfully loaded into table: {table_name}")

    return table_name


def verify_tables():
    print("\n" + "=" * 80)
    print("DATABASE TABLES")
    print("=" * 80)

    query = text("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)

    with engine.connect() as connection:
        result = connection.execute(query)

        tables = [row[0] for row in result]

    if not tables:
        print("No tables found.")
        return

    for table in tables:
        print(f"✓ {table}")


def main():
    csv_files = sorted(DATA_DIR.glob("*.csv"))

    if not csv_files:
        print(f"No CSV files found in {DATA_DIR}")
        return

    print(f"Found {len(csv_files)} CSV files.")

    loaded_tables = []

    for file_path in csv_files:
        try:
            table_name = load_csv(file_path)
            loaded_tables.append(table_name)

        except Exception as e:
            print(f"✗ Failed to load {file_path.name}")
            print(f"Error: {e}")

    verify_tables()

    print("\n" + "=" * 80)
    print("DATA LOADING COMPLETE")
    print("=" * 80)

    print(f"Successfully loaded: {len(loaded_tables)}/{len(csv_files)} files")


if __name__ == "__main__":
    main()