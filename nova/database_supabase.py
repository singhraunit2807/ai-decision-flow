"""Optional Supabase/PostgreSQL persistence adapter.

The local MVP uses SQLite by default. Set SUPABASE_URL and SUPABASE_KEY to
use this adapter in a deployed environment.
"""
import os
from typing import Optional


def _client():
    try:
        from supabase import create_client
    except ImportError as exc:
        raise RuntimeError("Install supabase to use the Supabase adapter.") from exc

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_KEY are required.")
    return create_client(url, key)


def save_appointment(appointment: dict) -> dict:
    result = _client().table("appointments").upsert(appointment).execute()
    return result.data[0] if result.data else appointment


def get_appointment(appointment_id: str) -> Optional[dict]:
    result = _client().table("appointments").select("*").eq("id", appointment_id).limit(1).execute()
    return result.data[0] if result.data else None


def list_appointments() -> list[dict]:
    result = _client().table("appointments").select("*").eq("status", "booked").order("start").execute()
    return result.data or []


def cancel_appointment(appointment_id: str) -> bool:
    result = _client().table("appointments").update({"status": "cancelled"}).eq("id", appointment_id).execute()
    return bool(result.data)
