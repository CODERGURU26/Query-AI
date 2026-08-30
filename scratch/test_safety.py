import unittest
from src.sql_generator import validate_sql

class TestSQLSafety(unittest.TestCase):
    def test_valid_queries(self):
        # Normal SELECT
        self.assertTrue(validate_sql("SELECT * FROM product_category;"))
        # SELECT with whitespace and casing
        self.assertTrue(validate_sql("  select  id, name  from  users  "))
        # CTE query
        self.assertTrue(validate_sql("WITH top_categories AS (SELECT * FROM categories) SELECT * FROM top_categories;"))

    def test_multi_statement_rejection(self):
        # Semicolon separating statements
        with self.assertRaises(ValueError) as ctx:
            validate_sql("SELECT * FROM categories; DROP TABLE users;")
        self.assertIn("Multiple SQL statements are not allowed.", str(ctx.exception))

        with self.assertRaises(ValueError) as ctx:
            validate_sql("SELECT * FROM categories; SELECT * FROM products;")
        self.assertIn("Multiple SQL statements are not allowed.", str(ctx.exception))

    def test_non_select_with_rejection(self):
        # Starting with other keywords
        with self.assertRaises(ValueError) as ctx:
            validate_sql("INSERT INTO categories VALUES (1, 'beauty');")
        self.assertIn("SQL query must start with SELECT or WITH.", str(ctx.exception))

        with self.assertRaises(ValueError) as ctx:
            validate_sql("DROP TABLE categories;")
        self.assertIn("SQL query must start with SELECT or WITH.", str(ctx.exception))

    def test_forbidden_keywords_rejection(self):
        # Contains forbidden keyword
        with self.assertRaises(ValueError) as ctx:
            validate_sql("SELECT * FROM categories WHERE name = 'CREATE';")
        # Since word boundary regex checks are case-insensitive and match whole word,
        # it should catch CREATE
        self.assertIn("Unsafe SQL detected: CREATE", str(ctx.exception))

        with self.assertRaises(ValueError) as ctx:
            validate_sql("SELECT * FROM categories; -- ALTER TABLE users;")
        # Since it's split by semicolon, it raises Multiple SQL statements
        self.assertIn("Multiple SQL statements", str(ctx.exception))

        with self.assertRaises(ValueError) as ctx:
            validate_sql("SELECT * FROM categories WHERE id = 1 or (select count(*) from (delete from users))")
        # Catch forbidden delete keyword
        self.assertIn("Unsafe SQL detected: DELETE", str(ctx.exception))

if __name__ == "__main__":
    unittest.main()
