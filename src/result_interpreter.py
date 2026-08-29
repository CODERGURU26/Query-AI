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

Your job is to interpret SQL query results and explain them
in simple, useful business language.

Rules:

1. Base your answer ONLY on the provided query result.
2. Do not invent facts.
3. Do not invent numbers.
4. Do not perform unsupported assumptions.
5. Highlight the most important insights.
6. Use appropriate number formatting.
7. Keep the explanation concise but useful.
8. If the result contains rankings, identify the top results.
9. If percentages or comparisons can be directly calculated
   from the provided data, you may calculate them.
10. Do not mention SQL, databases, tables, or internal implementation
    unless necessary.
11. Answer the user's original question directly.
"""


def interpret_result(question, dataframe):
    """
    Convert SQL query results into a natural-language explanation.
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

Provide a concise business-friendly answer.
"""

    interaction = client.interactions.create(
        model=MODEL,
        input=prompt,
    )

    return interaction.output_text.strip()