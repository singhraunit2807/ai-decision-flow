"""Small Twilio-compatible voice layer for NOVA.

The webhook returns TwiML directly, so a Twilio number can point at /voice/twilio
without requiring the rest of the application to know Twilio internals.
"""
from xml.sax.saxutils import escape

from nova.ai.intent import detect_intent


GREETING = "Hello, you are connected to NOVA. How can I help with your appointment?"


def start_call_response() -> dict:
    return {"message": GREETING, "next": "/voice/speech"}


def handle_speech(transcript: str) -> dict:
    intent = detect_intent(transcript)
    message = {
        "book": "I can help you book an appointment.",
        "cancel": "I can help you cancel an appointment.",
        "reschedule": "I can help you reschedule an appointment.",
        "availability": "I can check available appointment slots.",
    }[intent.action]
    return {"transcript": transcript, "intent": intent.__dict__, "response": message}


def twilio_greeting() -> str:
    prompt = escape(GREETING)
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Response><Gather input="speech" method="POST" action="/voice/twilio/speech">'
        f'<Say>{prompt}</Say></Gather><Say>Goodbye.</Say></Response>'
    )


def twilio_speech_response(transcript: str) -> str:
    result = handle_speech(transcript)
    text = escape(result["response"] + " Please provide the date and time if you want to continue.")
    return f'<?xml version="1.0" encoding="UTF-8"?><Response><Say>{text}</Say><Hangup/></Response>'
