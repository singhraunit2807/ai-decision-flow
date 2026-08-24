from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import Response
from pydantic import BaseModel, Field

from nova.ai.intent import detect_intent
from nova.database import init_db, list_appointments
from nova.routes.appointments import book, cancel, reschedule
from nova.scheduling.engine import find_slots
from nova.voice.twilio_handler import start_call_response, handle_speech, twilio_greeting, twilio_speech_response

app = FastAPI(title="NOVA - Natural Voice Appointment Assistant", version="2.0.0")


class AppointmentRequest(BaseModel):
    name: str = Field(min_length=1)
    service: str = Field(min_length=1)
    preferred_date: str
    preferred_time: Optional[str] = None
    duration_minutes: int = Field(default=30, ge=15, le=180)


class BookRequest(BaseModel):
    name: str = Field(min_length=1)
    service: str = Field(min_length=1)
    start: datetime
    duration_minutes: int = Field(default=30, ge=15, le=180)


class RescheduleRequest(BaseModel):
    new_start: datetime


class IntentRequest(BaseModel):
    text: str = Field(min_length=1)


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/")
def health():
    return {"name": "NOVA", "status": "ready", "version": "2.0.0"}


@app.post("/intent")
def intent(request: IntentRequest):
    return detect_intent(request.text).__dict__


@app.post("/suggest-slots")
def suggest_slots(request: AppointmentRequest):
    slots = find_slots(request.preferred_date, request.preferred_time, request.duration_minutes, list_appointments())
    return {"service": request.service, "suggested_slots": slots}


@app.post("/appointments")
def create_appointment(request: BookRequest):
    return book(request.name, request.service, request.start, request.duration_minutes)


@app.get("/appointments")
def appointments():
    return {"appointments": list_appointments()}


@app.post("/appointments/{appointment_id}/cancel")
def cancel_appointment(appointment_id: str):
    result = cancel(appointment_id)
    if result["status"] == "not_found":
        raise HTTPException(status_code=404, detail="Appointment not found")
    return result


@app.post("/appointments/{appointment_id}/reschedule")
def reschedule_appointment(appointment_id: str, request: RescheduleRequest):
    result = reschedule(appointment_id, request.new_start)
    if result["status"] == "not_found":
        raise HTTPException(status_code=404, detail="Appointment not found")
    return result


@app.post("/voice/start")
def voice_start():
    return start_call_response()


@app.post("/voice/speech")
def voice_speech(text: str):
    return handle_speech(text)


@app.post("/voice/twilio")
def twilio_voice():
    return Response(content=twilio_greeting(), media_type="application/xml")


@app.post("/voice/twilio/speech")
async def twilio_speech(request: Request):
    form = await request.form()
    transcript = str(form.get("SpeechResult") or "")
    return Response(content=twilio_speech_response(transcript), media_type="application/xml")
