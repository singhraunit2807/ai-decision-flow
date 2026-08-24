from datetime import datetime, timedelta
from typing import Optional

WORKING_HOUR_START = 9
WORKING_HOUR_END = 17
SLOT_MINUTES = 30


def _overlaps(start: datetime, duration_minutes: int, existing: dict) -> bool:
    existing_start = datetime.fromisoformat(existing["start"])
    existing_end = existing_start + timedelta(minutes=int(existing.get("duration_minutes", 30)))
    new_end = start + timedelta(minutes=duration_minutes)
    return start < existing_end and new_end > existing_start


def is_available(start: datetime, duration_minutes: int, appointments: list[dict]) -> bool:
    if start.hour < WORKING_HOUR_START:
        return False
    if start + timedelta(minutes=duration_minutes) > start.replace(hour=WORKING_HOUR_END, minute=0, second=0, microsecond=0):
        return False
    return not any(_overlaps(start, duration_minutes, item) for item in appointments)


def suggest_slot(start: datetime, duration_minutes: int, appointments: list[dict]) -> Optional[str]:
    for offset in range(1, 9):
        candidate = start + timedelta(minutes=offset * SLOT_MINUTES)
        if candidate.date() != start.date():
            break
        if is_available(candidate, duration_minutes, appointments):
            return candidate.isoformat()
    return None


def find_slots(
    preferred_date: str,
    preferred_time: Optional[str] = None,
    duration_minutes: int = 30,
    appointments: Optional[list[dict]] = None,
):
    date = datetime.strptime(preferred_date, "%Y-%m-%d")
    requested = datetime.strptime(preferred_time, "%H:%M").time() if preferred_time else None
    appointments = appointments or []
    candidates = []
    current = date.replace(hour=WORKING_HOUR_START, minute=0)
    end = date.replace(hour=WORKING_HOUR_END, minute=0)

    while current + timedelta(minutes=duration_minutes) <= end:
        within_preference = requested is None or abs(
            (current.hour * 60 + current.minute) - (requested.hour * 60 + requested.minute)
        ) <= 120
        if within_preference and is_available(current, duration_minutes, appointments):
            candidates.append(current.strftime("%Y-%m-%d %H:%M"))
        current += timedelta(minutes=SLOT_MINUTES)
    return candidates[:5]
