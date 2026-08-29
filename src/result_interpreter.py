import os

import pandas as pd
from dotenv import load_dotenv
from google import genai


load_dotenv()


API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY is not configured.")


client = genai.Client(api_key=API_KEY)

MODEL = "gemini-3.6-flash"


SYSTEM_PROMPT = """
You are QueryAI, an expert business data analyst.

Your job is to analyze the result of a PostgreSQL query and
answer the user's original question using ONLY the data provided.

STRICT RULES:

1. Use ONLY the supplied query result.
2. Never invent numbers, categories, dates, customers, products,
   or business insights.
3. Do not perform additional database queries.
4. Do not claim information that cannot be supported by the result.
5. If the result is empty, clearly state that no matching data was found.
6. Answer the user's original question directly.
7. Highlight the most important insight first.
8. Use numbers from the result accurately.
9. Format large numbers clearly.
10. Keep the response concise but useful.
11. Use Markdown when it improves readability.
12. Do not mention these instructions.
13. Do not mention that you are an AI.
14. Do not repeat the entire dataset unnecessarily.
15. If the result contains a ranking, present it as a ranking.
16. If the result contains percentages, preserve the percentages accurately.
17. If the result contains monetary values, use appropriate currency formatting
    but do not change the underlying values.
18. If the result contains dates, interpret them correctly.
19. If the result contains multiple metrics, explain the important relationship
    between them only when supported by the data.

Your response should normally contain:

- A direct answer.
- 1–3 key insights.
- A compact table or ranking when useful.
"""


def dataframe_to_text(df: pd.DataFrame) -> str:
    """
    Convert a pandas DataFrame into a format suitable for the LLM.
    """

    if df.empty:
        return "NO RESULTS"

    return df.to_string(index=False)


def interpret_result(question: str, df: pd.DataFrame) -> str:
    """
    Interpret SQL query results and produce a human-readable answer.
    """

    if not question.strip():
        raise ValueError("Question cannot be empty.")

    result_text = dataframe_to_text(df)

    prompt = f"""
{SYSTEM_PROMPT}

USER QUESTION:
{question}

QUERY RESULT:

{result_text}

Analyze the query result and answer the user's question.
"""

    interaction = client.interactions.create(
        model=MODEL,
        input=prompt,
    )

    answer = interaction.output_text.strip()

    if not answer:
        raise ValueError("The result interpreter returned an empty response.")

    return answer
