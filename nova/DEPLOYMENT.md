# NOVA Deployment

## Docker

From the repository root:

```bash
docker build -f nova/Dockerfile -t nova-assistant .
docker run -p 8000:8000 --env-file .env nova-assistant
```

Then open `/docs` on the deployed URL.

## Render

`render.yaml` is included for a Docker-based web service. Connect the repository to Render and add the required secret environment variables in the dashboard.

## Twilio

After deployment, configure the Twilio phone-number incoming-call webhook as:

`POST https://YOUR-DOMAIN/voice/twilio`

The URL must be public HTTPS. Do not commit Twilio credentials.

## Groq / Llama 4 Scout

Add `GROQ_API_KEY` as a deployment secret. The Llama adapter is in `nova/ai/llm.py`.

## Supabase

For a persistent hosted database, create the table using `nova/supabase/schema.sql`, then add `SUPABASE_URL` and `SUPABASE_KEY` as deployment secrets. The adapter is in `nova/database_supabase.py`.

## Important limitation

A real public URL, Twilio number, Supabase project and AI API credentials require access to the relevant external accounts. This repository contains the deployment configuration and integration code, but it does not fabricate credentials or claim a deployment that has not actually been created.
