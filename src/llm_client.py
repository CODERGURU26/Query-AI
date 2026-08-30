import os
import time
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("QueryAI.LLMClient")

API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-20b:free")
TIMEOUT_SECONDS = 30
MAX_RETRIES = 2

def generate_response(prompt: str) -> str:
    """
    Send a prompt to OpenRouter and return the completion content.
    Includes exponential backoff retries for rate limits and server errors,
    strict timeout, and clear user-facing error translation.
    """
    if not API_KEY:
        raise ValueError("OPENROUTER_API_KEY is not configured.")

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0
    }

    attempt = 0
    backoff = 1.0

    while True:
        try:
            logger.info(f"Sending request to OpenRouter (model: {MODEL}), attempt {attempt + 1}")
            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=TIMEOUT_SECONDS
            )

            # Check status codes
            if response.status_code == 200:
                res_data = response.json()
                try:
                    content = res_data["choices"][0]["message"]["content"]
                    return content.strip()
                except (KeyError, IndexError, TypeError) as e:
                    logger.error(f"Malformed OpenRouter response: {res_data}. Error: {str(e)}")
                    raise ValueError("AI service returned an invalid response structure.")

            logger.warning(f"OpenRouter returned status code {response.status_code}: {response.text}")

            # Authentication failures
            if response.status_code in (401, 403):
                raise ValueError("OpenRouter authentication failed. Check OPENROUTER_API_KEY.")

            # Rate limit or server errors: check if we should retry
            is_temporary = response.status_code == 429 or (500 <= response.status_code <= 599)

            if is_temporary and attempt < MAX_RETRIES:
                attempt += 1
                sleep_time = backoff * (2 ** (attempt - 1))
                logger.info(f"Temporary failure (HTTP {response.status_code}). Retrying in {sleep_time}s...")
                time.sleep(sleep_time)
                continue

            # If no more retries or non-temporary error
            if response.status_code == 429:
                raise ValueError("OpenRouter rate limit or quota exceeded. Please try again later.")
            elif 500 <= response.status_code <= 599:
                raise ValueError("AI service is temporarily unavailable. Please try again.")
            else:
                raise ValueError(f"AI service returned unexpected error status: {response.status_code}")

        except requests.exceptions.Timeout as e:
            logger.error(f"OpenRouter request timed out: {str(e)}")
            if attempt < MAX_RETRIES:
                attempt += 1
                sleep_time = backoff * (2 ** (attempt - 1))
                logger.info(f"Timeout occurred. Retrying in {sleep_time}s...")
                time.sleep(sleep_time)
                continue
            raise ValueError("Unable to reach the AI service. Please try again.")

        except requests.exceptions.RequestException as e:
            logger.error(f"OpenRouter network error: {str(e)}")
            if attempt < MAX_RETRIES:
                attempt += 1
                sleep_time = backoff * (2 ** (attempt - 1))
                logger.info(f"Network error occurred. Retrying in {sleep_time}s...")
                time.sleep(sleep_time)
                continue
            raise ValueError("Unable to reach the AI service. Please try again.")

        except Exception as e:
            # Propagate ValueError exceptions (our mapped messages), else catch-all
            if isinstance(e, ValueError):
                raise e
            logger.exception("Unexpected error during OpenRouter call")
            raise ValueError("Unable to reach the AI service. Please try again.")
