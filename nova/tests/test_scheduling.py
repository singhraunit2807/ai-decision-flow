from datetime import datetime
from nova.scheduling.engine import is_available


def test_empty_calendar_is_available():
    start = datetime(2026, 1, 1, 10, 0)
    assert is_available(start, 30, []) is True
