
import os
from dotenv import load_dotenv
from openai import OpenAI, APIError, APIConnectionError, RateLimitError, AuthenticationError
from openai import APITimeoutError

# Load environment variables
load_dotenv()

API_KEY = os.getenv("FEATHERLESS_API_KEY")
MODEL = os.getenv("FEATHERLESS_MODEL")

client = None

if API_KEY and MODEL:
    client = OpenAI(
        base_url="https://api.featherless.ai/v1",
        api_key=API_KEY,
        timeout=30.0,
        max_retries=2
    )


def generate_ai_response(user_prompt, repository_context=""):

    if not user_prompt or not user_prompt.strip():
        return "Please enter a question."

    if not API_KEY or not MODEL or client is None:
        return "AI configuration is missing. Please check your .env file."

    system_prompt = """
    You are CodeLens AI, an expert software repository assistant.

    IMPORTANT RULES:
    1. Answer using only the repository context provided.
    2. Never invent file names, functions, classes, or code.
    3. Mention exact file and function names when available.
    4. Explain code in simple language.
    5. If information is unavailable, clearly say so.
    6. Distinguish facts from explanations.
    7. Never claim a feature exists without evidence.

    Keep answers clear, accurate, and beginner-friendly.
    """

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": f"""
Repository Context:
{repository_context}

Developer Question:
{user_prompt}

Explain using the provided repository context.
"""
                }
            ],
            max_tokens=700,
            temperature=0.1
        )

        answer = response.choices[0].message.content

        if not answer:
            return "The AI service returned an empty response."

        return answer

    except AuthenticationError:
        return "Authentication failed. Please check your Featherless API key."

    except RateLimitError:
        return "AI service rate limit reached. Please try again later."

    except APITimeoutError:
        return "The AI request timed out. Please try again."

    except APIConnectionError:
        return "Unable to connect to the AI service. Check your internet connection."

    except APIError as e:
        print(f"Featherless API error: {e}")
        return "The AI service encountered an error. Please try again."

    except Exception as e:
        print(f"Unexpected AI error: {e}")
        return "Something went wrong while generating the AI response."


if __name__ == "__main__":

    answer = generate_ai_response(
        "What is CodeLens AI?",
        "CodeLens AI is a repository exploration tool."
    )

    print("\nCodeLens AI Response:\n")
    print(answer)
