from sqlalchemy import inspect, text

from src.database import engine


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


def get_llm_schema_context():
    """
    Return the database schema in a format suitable for the LLM.
    """

    return """
You are working with a PostgreSQL database containing Brazilian Olist e-commerce data.

AVAILABLE TABLES:

TABLE: olist_customers_dataset
DESCRIPTION: Customer information including location.
COLUMNS: customer_id, customer_unique_id, customer_zip_code_prefix, customer_city, customer_state

TABLE: olist_geolocation_dataset
DESCRIPTION: Geographical coordinates for Brazilian zip code prefixes.
COLUMNS: geolocation_zip_code_prefix, geolocation_lat, geolocation_lng, geolocation_city, geolocation_state

TABLE: olist_order_items_dataset
DESCRIPTION: Individual products purchased within orders.
COLUMNS: order_id, order_item_id, product_id, seller_id, shipping_limit_date, price, freight_value

TABLE: olist_order_payments_dataset
DESCRIPTION: Payment information associated with orders.
COLUMNS: order_id, payment_sequential, payment_type, payment_installments, payment_value

TABLE: olist_order_reviews_dataset
DESCRIPTION: Customer reviews and ratings for orders.
COLUMNS: review_id, order_id, review_score, review_comment_title, review_comment_message, review_creation_date, review_answer_timestamp

TABLE: olist_orders_dataset
DESCRIPTION: Order lifecycle and delivery information.
COLUMNS: order_id, customer_id, order_status, order_purchase_timestamp, order_approved_at, order_delivered_carrier_date, order_delivered_customer_date, order_estimated_delivery_date

TABLE: olist_products_dataset
DESCRIPTION: Product information and physical characteristics.
COLUMNS: product_id, product_category_name, product_name_lenght, product_description_lenght, product_photos_qty, product_weight_g, product_length_cm, product_height_cm, product_width_cm

TABLE: olist_sellers_dataset
DESCRIPTION: Seller information and location.
COLUMNS: seller_id, seller_zip_code_prefix, seller_city, seller_state

TABLE: product_category_name_translation
DESCRIPTION: Portuguese to English product category translation.
COLUMNS: product_category_name, product_category_name_english

TABLE RELATIONSHIPS:

olist_orders_dataset.customer_id = olist_customers_dataset.customer_id

olist_order_items_dataset.order_id = olist_orders_dataset.order_id

olist_order_items_dataset.product_id = olist_products_dataset.product_id

olist_order_items_dataset.seller_id = olist_sellers_dataset.seller_id

olist_order_payments_dataset.order_id = olist_orders_dataset.order_id

olist_order_reviews_dataset.order_id = olist_orders_dataset.order_id

olist_products_dataset.product_category_name = product_category_name_translation.product_category_name
"""