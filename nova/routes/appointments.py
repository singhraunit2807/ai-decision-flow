"""Appointment actions used by the NOVA reference API."""
from datetime import datetime
from nova.database import save_appointment, get_appointment, list_appointments, delete_appointment
from nova.scheduling.engine import is_available, suggest_slot


def book(name: str, start: datetime, duration_minutes: int = 30) -> dict:
    if not is_available(start, duration_minutes, list_appointments()):
        return {"status": "unavailable", "suggested_slot": suggest_slot(start, duration_minutes, list_appointments())}
    return save_appointment({"name": name, "start": start.isoformat(), "duration_minutes": duration_minutes, "status": "booked"})


def cancel(appointment_id: str) -> dict:
    appointment = get_appointment(appointment_id)
    if not appointment:
        return {"status": "not_found"}
    delete_appointment(appointment_id)
    return {"status": "cancelled", "id": appointment_id}


def reschedule(appointment_id: str, new_start: datetime) -> dict:
    appointment = get_appointment(appointment_id)
    if not appointment:
        return {"status": "not_found"}
    duration = int(appointment.get("duration_minutes", 30))
    if not is_available(new_start, duration, [a for a in list_appointments() if a.get("id") != appointment_id]):
        return {"status": "unavailable", "suggested_slot": suggest_slot(new_start, duration, list_appointments())}
    appointment["start"] = new_start.isoformat()
    return save_appointment(appointment)
