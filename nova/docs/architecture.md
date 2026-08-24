# NOVA Architecture

NOVA is designed as a voice-first appointment scheduling workflow.

```text
Caller
  ↓
Twilio
  ↓
Speech-to-Text (Whisper)
  ↓
Intent / LLM layer (Llama 4 Scout)
  ↓
FastAPI action layer
  ↓
Scheduling engine + validation
  ↓
Supabase / PostgreSQL persistence
  ↓
Text-to-Speech (Orpheus)
  ↓
Caller
```

## Design decision

The language model interprets the caller's request, but it does not directly modify appointment data. Scheduling actions pass through deterministic validation so conflicts and invalid slots can be rejected before a change is stored.

## Reference implementation note

This repository contains an assumed MVP/reference implementation created from the documented NOVA design. External provider integrations are represented by adapters/placeholders unless credentials and deployed services are supplied.
