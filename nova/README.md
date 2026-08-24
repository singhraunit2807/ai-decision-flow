# NOVA — Natural Voice Appointment Assistant

NOVA is a voice-first appointment scheduling assistant designed around a simple idea: a caller should be able to explain what they need in normal language, while the backend validates the scheduling action before changing appointment data.

## What is implemented

- Natural-language intent detection for booking, cancellation, rescheduling and availability
- Deterministic scheduling and conflict checking
- Real SQLite persistence for local development
- FastAPI REST API for appointment operations
- Slot suggestion based on working hours and existing appointments
- Twilio-compatible voice webhook returning TwiML
- Basic voice conversation adapter that can be connected to an STT provider
- Automated scheduling tests

## Architecture

```text
Caller
  ↓
Twilio-compatible webhook
  ↓
Speech / transcript
  ↓
Intent detection
  ↓
FastAPI action layer
  ↓
Scheduling engine + validation
  ↓
SQLite (local MVP)
  ↓
Response / TwiML
  ↓
Caller
```

The documented production architecture can replace the local persistence and voice adapters with Supabase/PostgreSQL, Whisper, an LLM such as Llama 4 Scout, and Orpheus TTS without changing the core scheduling rules.

## Run locally

```bash
cd nova
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

Open `http://127.0.0.1:8000/docs` for the interactive API documentation.

## Useful API calls

### Check health

`GET /`

### Detect intent

`POST /intent`

```json
{"text":"I want to reschedule my doctor appointment"}
```

### Suggest available slots

`POST /suggest-slots`

```json
{
  "name":"Demo User",
  "service":"doctor",
  "preferred_date":"2026-09-01",
  "preferred_time":"10:00",
  "duration_minutes":30
}
```

### Book

`POST /appointments`

```json
{
  "name":"Demo User",
  "service":"doctor",
  "start":"2026-09-01T10:00:00",
  "duration_minutes":30
}
```

### List appointments

`GET /appointments`

### Cancel

`POST /appointments/{appointment_id}/cancel`

### Reschedule

`POST /appointments/{appointment_id}/reschedule`

### Twilio-compatible entry point

Configure the Twilio incoming-call webhook to point to:

`POST /voice/twilio`

The endpoint returns TwiML and uses speech gathering for the first turn. A public HTTPS deployment is required for a real phone call.

## Project evaluation

The project documentation reports 15 functional scenarios covering booking, cancellation, rescheduling, invalid slots, ambiguity, urgency, silence handling and escalation. Reported project-level results are 81% interaction accuracy, 0.86 precision, 0.79 recall and 0.82 F1-score. These are documented project evaluation figures, not a production benchmark.

## Demo

YouTube: https://youtube.com/watch?v=LVLwIuHN0OE&t=32&feature=shared

## Transparency

This repository is a **reconstructed, runnable MVP/reference implementation** based on the NOVA project specification and documentation because the original source repository was not available. It is not presented as a copy of an original private codebase. The external production providers are intentionally kept behind adapters/configuration points.

## Security

Never commit API keys, passwords, tokens or real customer data. Use `.env` locally and keep secrets out of Git.
