from sqlalchemy import inspect

from database import engine


# -------------------------------------------------------------------
# QUERYAI SEMANTIC DATABASE SCHEMA
# -------------------------------------------------------------------

SCHEMA = {

    "olist_customers_dataset": {
        "description": "Customer information including location.",
        "columns": [
            "customer_id",
            "customer_unique_id",
            "customer_zip_code_prefix",
            "customer_city",
            "customer_state"
        ]
    },

    "olist_geolocation_dataset": {
        "description": "Geographical coordinates for Brazilian zip code prefixes.",
        "columns": [
            "geolocation_zip_code_prefix",
            "geolocation_lat",
            "geolocation_lng",
            "geolocation_city",
            "geolocation_state"
        ]
    },

    "olist_order_items_dataset": {
        "description": "Individual products purchased within orders.",
        "columns": [
            "order_id",
            "order_item_id",
            "product_id",
            "seller_id",
            "shipping_limit_date",
            "price",
            "freight_value"
        ]
    },

    "olist_order_payments_dataset": {
        "description": "Payment information associated with orders.",
        "columns": [
            "order_id",
            "payment_sequential",
            "payment_type",
            "payment_installments",
            "payment_value"
        ]
    },

    "olist_order_reviews_dataset": {
        "description": "Customer reviews and ratings for orders.",
        "columns": [
            "review_id",
            "order_id",
            "review_score",
            "review_comment_title",
            "review_comment_message",
            "review_creation_date",
            "review_answer_timestamp"
        ]
    },

    "olist_orders_dataset": {
        "description": "Order lifecycle and delivery information.",
        "columns": [
            "order_id",
            "customer_id",
            "order_status",
            "order_purchase_timestamp",
            "order_approved_at",
            "order_delivered_carrier_date",
            "order_delivered_customer_date",
            "order_estimated_delivery_date"
        ]
    },

    "olist_products_dataset": {
        "description": "Product information and physical characteristics.",
        "columns": [
            "product_id",
            "product_category_name",
            "product_name_lenght",
            "product_description_lenght",
            "product_photos_qty",
            "product_weight_g",
            "product_length_cm",
            "product_height_cm",
            "product_width_cm"
        ]
    },

    "olist_sellers_dataset": {
        "description": "Seller information and location.",
        "columns": [
            "seller_id",
            "seller_zip_code_prefix",
            "seller_city",
            "seller_state"
        ]
    },

    "product_category_name_translation": {
        "description": "Portuguese to English product category translation.",
        "columns": [
            "product_category_name",
            "product_category_name_english"
        ]
    }
}


# -------------------------------------------------------------------
# RELATIONSHIPS
# -------------------------------------------------------------------

RELATIONSHIPS = [

    {
        "from_table": "olist_orders_dataset",
        "from_column": "customer_id",
        "to_table": "olist_customers_dataset",
        "to_column": "customer_id"
    },

    {
        "from_table": "olist_order_items_dataset",
        "from_column": "order_id",
        "to_table": "olist_orders_dataset",
        "to_column": "order_id"
    },

    {
        "from_table": "olist_order_items_dataset",
        "from_column": "product_id",
        "to_table": "olist_products_dataset",
        "to_column": "product_id"
    },

    {
        "from_table": "olist_order_items_dataset",
        "from_column": "seller_id",
        "to_table": "olist_sellers_dataset",
        "to_column": "seller_id"
    },

    {
        "from_table": "olist_order_payments_dataset",
        "from_column": "order_id",
        "to_table": "olist_orders_dataset",
        "to_column": "order_id"
    },

    {
        "from_table": "olist_order_reviews_dataset",
        "from_column": "order_id",
        "to_table": "olist_orders_dataset",
        "to_column": "order_id"
    },

    {
        "from_table": "olist_products_dataset",
        "from_column": "product_category_name",
        "to_table": "product_category_name_translation",
        "to_column": "product_category_name"
    }
]


# -------------------------------------------------------------------
# SCHEMA VALIDATION
# -------------------------------------------------------------------

def validate_schema():

    inspector = inspect(engine)

    database_tables = set(
        inspector.get_table_names()
    )

    defined_tables = set(
        SCHEMA.keys()
    )

    missing_tables = defined_tables - database_tables

    extra_tables = database_tables - defined_tables

    print("\n" + "=" * 80)
    print("QUERYAI SCHEMA VALIDATION")
    print("=" * 80)

    print(f"\nDatabase tables : {len(database_tables)}")
    print(f"Defined tables  : {len(defined_tables)}")
    print(f"Relationships   : {len(RELATIONSHIPS)}")

    if missing_tables:

        print("\nMissing tables:")

        for table in missing_tables:
            print(f"  ✗ {table}")

    else:

        print("\n✓ All defined tables exist in PostgreSQL.")

    if extra_tables:

        print("\nAdditional database tables:")

        for table in extra_tables:
            print(f"  + {table}")

    print("\nRelationships:")

    for relationship in RELATIONSHIPS:

        print(
            f"  {relationship['from_table']}."
            f"{relationship['from_column']}"
            f" → "
            f"{relationship['to_table']}."
            f"{relationship['to_column']}"
        )


# -------------------------------------------------------------------
# SCHEMA CONTEXT FOR LLM
# -------------------------------------------------------------------

def get_schema_context():

    context = []

    context.append(
        "You are working with a PostgreSQL database containing "
        "Brazilian Olist e-commerce data."
    )

    context.append("\nAVAILABLE TABLES:")

    for table, metadata in SCHEMA.items():

        context.append(
            f"\nTABLE: {table}"
        )

        context.append(
            f"DESCRIPTION: {metadata['description']}"
        )

        context.append(
            "COLUMNS: " +
            ", ".join(metadata["columns"])
        )

    context.append("\nTABLE RELATIONSHIPS:")

    for relationship in RELATIONSHIPS:

        context.append(
            f"{relationship['from_table']}."
            f"{relationship['from_column']}"
            f" = "
            f"{relationship['to_table']}."
            f"{relationship['to_column']}"
        )

    return "\n".join(context)


# -------------------------------------------------------------------
# MAIN
# -------------------------------------------------------------------

if __name__ == "__main__":

    validate_schema()

    print("\n" + "=" * 80)
    print("LLM SCHEMA CONTEXT")
    print("=" * 80)

    print(get_schema_context())