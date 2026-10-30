import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
api_key = os.getenv("FEATHERLESS_API_KEY")
model = os.getenv("FEATHERLESS_MODEL")

print("API key loaded:", bool(api_key))
print("Model loaded:", model)
if not api_key or not model:
    raise ValueError("API key or model ID is missing in .env")
client = OpenAI(
    base_url="https://api.featherless.ai/v1",
    api_key=api_key
)

response = client.chat.completions.create(
    model=model,
    messages=[
        {
            "role": "user",
            "content": "Explain a Python login function."
        }
    ],
    max_tokens=300
)

print(response.choices[0].message.content)