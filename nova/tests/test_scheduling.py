from datetime import datetime

from nova.ai.intent import detect_intent
from nova.scheduling.engine import find_slots, is_available


def test_empty_calendar_is_available():
    start = datetime(2026, 1, 1, 10, 0)
    assert is_available(start, 30, []) is True


def test_conflicting_slot_is_rejected():
    start = datetime(2026, 1, 1, 10, 0)
    existing = [{"start": "2026-01-01T10:00:00", "duration_minutes": 30}]
    assert is_available(start, 30, existing) is False


def test_slot_suggestions_skip_conflict():
    existing = [{"start": "2026-01-01T09:00:00", "duration_minutes": 30}]
    slots = find_slots("2026-01-01", "09:00", 30, existing)
    assert "2026-01-01 09:00" not in slots
    assert slots[0] == "2026-01-01 09:30"


def test_intent_detection():
    intent = detect_intent("Please reschedule my doctor appointment")
    assert intent.action == "reschedule"
    assert intent.service == "doctor"
