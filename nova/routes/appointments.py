"""Validated appointment actions for NOVA."""
from datetime import datetime
from nova.database import save_appointment, get_appointment, list_appointments, delete_appointment
from nova.scheduling.engine import is_available, suggest_slot


def book(name: str, service: str, start: datetime, duration_minutes: int = 30) -> dict:
    appointments = list_appointments()
    if not is_available(start, duration_minutes, appointments):
        return {"status": "unavailable", "suggested_slot": suggest_slot(start, duration_minutes, appointments)}
    return save_appointment({
        "name": name,
        "service": service,
        "start": start.isoformat(),
        "duration_minutes": duration_minutes,
        "status": "booked",
    })


def cancel(appointment_id: str) -> dict:
    appointment = get_appointment(appointment_id)
    if not appointment or appointment.get("status") == "cancelled":
        return {"status": "not_found"}
    delete_appointment(appointment_id)
    return {"status": "cancelled", "id": appointment_id}


def reschedule(appointment_id: str, new_start: datetime) -> dict:
    appointment = get_appointment(appointment_id)
    if not appointment or appointment.get("status") == "cancelled":
        return {"status": "not_found"}
    duration = int(appointment.get("duration_minutes", 30))
    others = [a for a in list_appointments() if a.get("id") != appointment_id]
    if not is_available(new_start, duration, others):
        return {"status": "unavailable", "suggested_slot": suggest_slot(new_start, duration, others)}
    appointment["start"] = new_start.isoformat()
    appointment["status"] = "booked"
    return save_appointment(appointment)
