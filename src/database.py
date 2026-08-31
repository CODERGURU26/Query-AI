import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL


load_dotenv()


# ---------------------------------------------------------
# Database configuration
# ---------------------------------------------------------

DATABASE_URL = os.getenv("DATABASE_URL")


if DATABASE_URL:
    # Production / Render
    database_url = DATABASE_URL

else:
    # Local development
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "queryai")

    if not DB_USER:
        raise ValueError("DB_USER is not configured.")

    if not DB_PASSWORD:
        raise ValueError("DB_PASSWORD is not configured.")

    database_url = URL.create(
        drivername="postgresql+psycopg2",
        username=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=int(DB_PORT),
        database=DB_NAME,
    )


# ---------------------------------------------------------
# SQLAlchemy engine
# ---------------------------------------------------------

engine = create_engine(
    database_url,
    pool_pre_ping=True,
)


# ---------------------------------------------------------
# Connection test
# ---------------------------------------------------------

def test_connection():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        version = result.scalar()

        print("PostgreSQL connection successful!")
        print(version)


if __name__ == "__main__":
    test_connection()