"""Simple persistence adapter for the NOVA reference MVP.

The production design can replace this in-memory store with Supabase/PostgreSQL.
"""
from datetime import datetime
from typing import Dict, List

appointments: Dict[str, dict] = {}


def save_appointment(appointment: dict) -> dict:
    appointment_id = appointment.get("id") or f"apt-{len(appointments)+1:04d}"
    appointment["id"] = appointment_id
    appointment.setdefault("created_at", datetime.utcnow().isoformat())
    appointments[appointment_id] = appointment
    return appointment


def get_appointment(appointment_id: str) -> dict | None:
    return appointments.get(appointment_id)


def list_appointments() -> List[dict]:
    return list(appointments.values())


def delete_appointment(appointment_id: str) -> bool:
    return appointments.pop(appointment_id, None) is not None
