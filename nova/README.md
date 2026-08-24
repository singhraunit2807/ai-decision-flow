# NOVA — Natural Voice Appointment Assistant

NOVA is a voice-first appointment scheduling assistant designed around a simple idea: a caller should be able to explain what they need in normal language, while the backend validates the scheduling action before changing appointment data.

## What is implemented

- Natural-language intent detection for booking, cancellation, rescheduling and availability
- Optional Llama 4 Scout response adapter through Groq
- Deterministic scheduling and conflict checking
- Real SQLite persistence for local development
- FastAPI REST API for appointment operations
- Slot suggestion based on working hours and existing appointments
- Twilio-compatible voice webhook returning TwiML
- Optional local Whisper speech-to-text adapter
- Optional local TTS adapter
- Automated scheduling and API tests

## Architecture

```text
Caller
  ↓
Twilio-compatible webhook / local voice adapter
  ↓
Speech-to-Text
  ↓
Intent / Llama 4 Scout adapter
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

The production architecture can replace the local persistence and voice adapters with Supabase/PostgreSQL, hosted Whisper, Llama 4 Scout through Groq, and Orpheus TTS without changing the core scheduling rules.

## Run locally

Run these commands from the **repository root**, not from inside the `nova` directory:

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r nova/requirements.txt
uvicorn nova.app:app --reload
```

Open `http://127.0.0.1:8000/docs` for the interactive API documentation.

## Optional voice dependencies

```bash
pip install -r nova/requirements-voice.txt
```

Local audio transcription uses faster-whisper. For a phone workflow, Twilio can provide the speech transcript through its speech gathering flow.

## Optional Llama 4 Scout integration

Set `GROQ_API_KEY` in the local environment and use the adapter in `nova/ai/llm.py`. The adapter uses Groq's `meta-llama/llama-4-scout-17b-16e-instruct` model.

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

## Testing

From the repository root:

```bash
pytest nova/tests -q
```

## Project evaluation

The project documentation reports 15 functional scenarios covering booking, cancellation, rescheduling, invalid slots, ambiguity, urgency, silence handling and escalation. Reported project-level results are 81% interaction accuracy, 0.86 precision, 0.79 recall and 0.82 F1-score. These are documented project evaluation figures, not a production benchmark.

## Demo

YouTube: https://youtube.com/watch?v=LVLwIuHN0OE&t=32&feature=shared

## Transparency

This repository is a **reconstructed, runnable MVP/reference implementation** based on the NOVA project specification and documentation because the original source repository was not available. It is not presented as a copy of an original private codebase. The external production providers are intentionally kept behind adapters/configuration points.

## Security

Never commit API keys, passwords, tokens or real customer data. Use `.env` locally and keep secrets out of Git.
