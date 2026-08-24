# NOVA - Natural Voice Appointment Assistant

NOVA is a voice-first AI appointment assistant concept designed to make scheduling easier through natural conversation.

## What NOVA does

- Accepts appointment requests in natural language
- Identifies the user's intent and important details
- Suggests suitable time slots
- Handles booking, rescheduling and cancellation flows
- Keeps the conversation simple and human-friendly

## Suggested architecture

```text
User Voice
   ↓
Speech-to-Text
   ↓
NLP / Intent Detection
   ↓
NOVA Scheduling Engine
   ↓
Appointment Store
   ↓
Text-to-Speech
   ↓
User
```

## Project status

This repository contains an assumed MVP/reference implementation prepared from the NOVA project concept. It is intended as a portfolio and learning artifact; production integrations such as live telephony, external calendars and real credentials are not included.

## Demo

YouTube demo: https://youtube.com/watch?v=LVLwIuHN0OE&t=32&feature=shared

## Security

Never commit API keys, passwords, tokens or real customer data. Use `.env` locally and keep secrets out of Git.
