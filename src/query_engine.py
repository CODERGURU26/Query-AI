from src.sql_generator import generate_sql
from src.sql_executor import execute_sql
from src.result_interpreter import interpret_result

def process_question(question):
    """
    Complete QueryAI pipeline.

    Natural language question
        ↓
    SQL generation
        ↓
    SQL execution
        ↓
    Result interpretation

    Returns a structured dictionary.
    """

    if not question or not question.strip():
        raise ValueError("Question cannot be empty.")

    question = question.strip()

    # --------------------------------------------------
    # STEP 1: Generate SQL
    # --------------------------------------------------

    sql = generate_sql(question)

    # --------------------------------------------------
    # STEP 2: Handle unanswerable questions
    # --------------------------------------------------

    if sql.strip().upper() == "UNANSWERABLE":
        return {
            "question": question,
            "sql": None,
            "columns": [],
            "data": [],
            "answer": (
                "I cannot answer that question using the "
                "available database."
            ),
        }

    # --------------------------------------------------
    # STEP 3: Execute SQL
    # --------------------------------------------------

    result = execute_sql(sql)

    # --------------------------------------------------
    # STEP 4: Convert result to JSON-safe structures
    # --------------------------------------------------

    columns = result.columns.tolist()

    data = result.to_dict(orient="records")

    # Convert pandas/numpy values into normal Python values
    for row in data:
        for key, value in row.items():

            if hasattr(value, "item"):
                row[key] = value.item()

            elif hasattr(value, "isoformat"):
                row[key] = value.isoformat()

    # --------------------------------------------------
    # STEP 5: Interpret result
    # --------------------------------------------------

    answer = interpret_result(question, result)

    # --------------------------------------------------
    # STEP 6: Return structured response
    # --------------------------------------------------

    return {
        "question": question,
        "sql": sql,
        "columns": columns,
        "data": data,
        "answer": answer,
    }


if __name__ == "__main__":

    print("=" * 80)
    print("QUERYAI QUERY ENGINE")
    print("=" * 80)

    question = input("\nEnter your question: ").strip()

    try:

        response = process_question(question)

        print("\n" + "=" * 80)
        print("SQL")
        print("=" * 80)

        print(response["sql"])

        print("\n" + "=" * 80)
        print("ANSWER")
        print("=" * 80)

        print(response["answer"])

        print("\n" + "=" * 80)
        print("QUERY ENGINE SUCCESSFUL")
        print("=" * 80)

    except Exception as e:

        print("\n" + "=" * 80)
        print("ERROR")
        print("=" * 80)

        print(str(e))
