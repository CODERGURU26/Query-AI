import os

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

Interpret the provided SQL query result and answer the user's
original question.

Rules:

1. Use ONLY the provided query result.
2. Never invent facts or numbers.
3. Answer the user's question directly.
4. Highlight the most important insights.
5. Use readable number formatting.
6. If the result is a ranking, identify the leaders.
7. You may calculate simple totals or comparisons using
   the provided numbers.
8. Keep the answer concise.
9. Do not output SQL.
10. Do not reproduce the entire table unless necessary.
"""


def interpret_result(question, dataframe):
    """
    Convert a DataFrame into a natural-language answer.
    """

    if dataframe is None or dataframe.empty:
        return "No data was found for your question."

    result_text = dataframe.to_string(index=False)

    prompt = f"""
{SYSTEM_PROMPT}

USER QUESTION:
{question}

QUERY RESULT:
{result_text}

Provide a concise, business-friendly answer.
"""

    interaction = client.interactions.create(
        model=MODEL,
        input=prompt,
    )

    return interaction.output_text.strip()