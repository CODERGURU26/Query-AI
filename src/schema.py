from sqlalchemy import inspect, text

from database import engine


def inspect_database():

    inspector = inspect(engine)

    tables = inspector.get_table_names()

    print("\n" + "=" * 80)
    print("QUERYAI DATABASE SCHEMA")
    print("=" * 80)

    print(f"\nTables found: {len(tables)}")

    for table in tables:

        print("\n" + "-" * 80)
        print(f"TABLE: {table}")
        print("-" * 80)

        columns = inspector.get_columns(table)

        for column in columns:

            column_name = column["name"]
            data_type = column["type"]
            nullable = column["nullable"]

            print(
                f"  {column_name:<45} "
                f"{str(data_type):<20} "
                f"nullable={nullable}"
            )

        primary_key = inspector.get_pk_constraint(table)

        if primary_key["constrained_columns"]:
            print("\n  Primary Key:")
            print(
                f"    {primary_key['constrained_columns']}"
            )

        foreign_keys = inspector.get_foreign_keys(table)

        if foreign_keys:

            print("\n  Foreign Keys:")

            for fk in foreign_keys:

                print(
                    f"    {fk['constrained_columns']} "
                    f"→ "
                    f"{fk['referred_table']}"
                    f".{fk['referred_columns']}"
                )

        # Show sample rows
        with engine.connect() as connection:

            query = text(
                f'SELECT * FROM "{table}" LIMIT 3'
            )

            result = connection.execute(query)

            rows = result.fetchall()

        if rows:

            print("\n  Sample Data:")

            for row in rows:

                print(f"    {row}")


if __name__ == "__main__":
    inspect_database()