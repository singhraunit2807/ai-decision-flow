"""Twilio-facing voice flow placeholder for the NOVA reference MVP.

A real deployment would connect this handler to a public webhook endpoint,
receive the call audio/event, pass the utterance through STT + intent logic,
and return a TwiML response.
"""


def start_call() -> str:
    return "Hello, you are connected to NOVA. How can I help with your appointment?"


def handle_transcript(transcript: str) -> dict:
    from nova.ai.intent import classify_intent
    return {"transcript": transcript, "intent": classify_intent(transcript)}
