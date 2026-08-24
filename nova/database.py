"""SQLite persistence used by the runnable NOVA local MVP."""
import os
import sqlite3
from datetime import datetime, timezone
from typing import List

DB_PATH = os.getenv("NOVA_DB_PATH", os.path.join(os.path.dirname(__file__), "nova.db"))


def _connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.execute(
            """CREATE TABLE IF NOT EXISTS appointments (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                service TEXT NOT NULL,
                start TEXT NOT NULL,
                duration_minutes INTEGER NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            )"""
        )
        conn.commit()


def save_appointment(appointment: dict) -> dict:
    init_db()
    appointment_id = appointment.get("id") or f"apt-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}"
    appointment["id"] = appointment_id
    appointment.setdefault("created_at", datetime.now(timezone.utc).isoformat())
    appointment.setdefault("service", "appointment")
    with _connect() as conn:
        conn.execute(
            """INSERT INTO appointments(id,name,service,start,duration_minutes,status,created_at)
               VALUES(?,?,?,?,?,?,?)
               ON CONFLICT(id) DO UPDATE SET
                 name=excluded.name, service=excluded.service, start=excluded.start,
                 duration_minutes=excluded.duration_minutes, status=excluded.status""",
            (appointment_id, appointment["name"], appointment["service"], appointment["start"],
             int(appointment["duration_minutes"]), appointment["status"], appointment["created_at"]),
        )
        conn.commit()
    return appointment


def get_appointment(appointment_id: str) -> dict | None:
    init_db()
    with _connect() as conn:
        row = conn.execute("SELECT * FROM appointments WHERE id=?", (appointment_id,)).fetchone()
    return dict(row) if row else None


def list_appointments() -> List[dict]:
    init_db()
    with _connect() as conn:
        rows = conn.execute("SELECT * FROM appointments WHERE status='booked' ORDER BY start").fetchall()
    return [dict(row) for row in rows]


def delete_appointment(appointment_id: str) -> bool:
    init_db()
    with _connect() as conn:
        cur = conn.execute("UPDATE appointments SET status='cancelled' WHERE id=?", (appointment_id,))
        conn.commit()
    return cur.rowcount > 0
