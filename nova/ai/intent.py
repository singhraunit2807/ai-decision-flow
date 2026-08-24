from dataclasses import dataclass
import re


@dataclass
class AppointmentIntent:
    action: str
    service: str | None = None
    date: str | None = None
    time: str | None = None


def detect_intent(text: str) -> AppointmentIntent:
    """Small rule-based intent layer for the NOVA MVP."""
    value = text.lower().strip()

    if any(word in value for word in ["cancel", "cancellation"]):
        action = "cancel"
    elif any(word in value for word in ["reschedule", "change my appointment"]):
        action = "reschedule"
    else:
        action = "book"

    service = None
    for candidate in ["doctor", "dentist", "salon", "service", "consultation", "appointment"]:
        if candidate in value:
            service = candidate
            break

    match = re.search(r"\b(\d{1,2}:\d{2})\b", value)
    time = match.group(1) if match else None

    return AppointmentIntent(action=action, service=service, time=time)
