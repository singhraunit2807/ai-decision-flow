from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from nova.scheduling.engine import find_slots

app = FastAPI(title="NOVA", version="1.0.0")


class AppointmentRequest(BaseModel):
    service: str
    preferred_date: str
    preferred_time: Optional[str] = None
    duration_minutes: int = 30


@app.get("/")
def health():
    return {"name": "NOVA", "status": "ready"}


@app.post("/suggest-slots")
def suggest_slots(request: AppointmentRequest):
    slots = find_slots(
        preferred_date=request.preferred_date,
        preferred_time=request.preferred_time,
        duration_minutes=request.duration_minutes,
    )
    return {
        "service": request.service,
        "suggested_slots": slots,
    }
