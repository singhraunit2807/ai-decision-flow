# NOVA Architecture

NOVA is a voice-first appointment scheduling workflow. The repository now contains a runnable local MVP plus integration points for the production stack described in the project documentation.

```text
Caller
  ↓
Twilio / local voice adapter
  ↓
Speech-to-Text (Twilio speech input or optional faster-whisper)
  ↓
Intent layer (deterministic fallback; LLM integration point)
  ↓
FastAPI action layer
  ↓
Scheduling engine + deterministic validation
  ↓
SQLite local persistence
  ↓
TwiML / API response
  ↓
Caller
```

## Production mapping

The local SQLite adapter can be replaced by Supabase/PostgreSQL. The deterministic intent layer can be connected to an LLM such as Llama 4 Scout for richer language understanding. The local TTS adapter can be replaced by Orpheus or another hosted TTS service.

## Key design decision

The language model or intent layer interprets the caller's request, but it does not directly modify appointment data. Booking, cancellation and rescheduling pass through the deterministic scheduling engine first. Conflicts and invalid slots are rejected before persistence.

## Why this structure matters

This separation makes the system easier to test and prevents a conversational model from becoming the final authority over real appointment state. It also allows the voice and AI providers to change without rewriting the scheduling rules.

## Implementation note

Because the original private source project was not available, this repository is a reconstructed, runnable MVP based on the documented NOVA specification. It is intended to demonstrate the architecture and core behavior without falsely claiming to be the original private codebase.
