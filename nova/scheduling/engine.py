from datetime import datetime, timedelta
from typing import Optional


WORKING_HOUR_START = 9
WORKING_HOUR_END = 17


def find_slots(
    preferred_date: str,
    preferred_time: Optional[str] = None,
    duration_minutes: int = 30,
):
    """Return simple appointment suggestions for a working day.

    This MVP does not connect to a real calendar. It generates candidate
    slots that can later be replaced by a database/calendar availability check.
    """
    date = datetime.strptime(preferred_date, "%Y-%m-%d")
    requested = None
    if preferred_time:
        requested = datetime.strptime(preferred_time, "%H:%M").time()

    candidates = []
    current = date.replace(hour=WORKING_HOUR_START, minute=0)
    end = date.replace(hour=WORKING_HOUR_END, minute=0)

    while current + timedelta(minutes=duration_minutes) <= end:
        if requested is None or abs(
            (current.hour * 60 + current.minute)
            - (requested.hour * 60 + requested.minute)
        ) <= 120:
            candidates.append(current.strftime("%Y-%m-%d %H:%M"))
        current += timedelta(minutes=30)

    return candidates[:5]
