"""Optional Groq/Llama 4 Scout integration for NOVA.

The core scheduling path remains deterministic. This adapter can be used when
GROQ_API_KEY is configured to turn free-form conversation into a cleaner
assistant response before the request reaches validated actions.
"""
import os

MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"


def generate_response(user_text: str) -> str:
    try:
        from groq import Groq
    except ImportError as exc:
        raise RuntimeError("Install groq to enable the Llama 4 Scout adapter.") from exc

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not configured.")

    client = Groq(api_key=api_key)
    completion = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are NOVA, a concise appointment assistant. "
                    "Understand the caller's request, ask only for missing scheduling details, "
                    "and never claim an appointment is booked unless the backend confirms it."
                ),
            },
            {"role": "user", "content": user_text},
        ],
        temperature=0.2,
    )
    return completion.choices[0].message.content or "I need a little more information to continue."
