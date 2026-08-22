# AI Decision Flow

Visual AI decision workflow builder for the Backend AI Engineering assignment.

## Stack
- Next.js + React + TypeScript
- React Flow
- Inngest
- OpenAI SDK with Groq-compatible endpoint

## Features
- Visual workflow editor
- AI decision nodes with editable prompts
- YES / NO branching
- Dynamic workflow traversal
- Inngest execution
- Execution logs and node status
- Local save/load
- JSON import/export
- Error handling and retry-friendly execution

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `GROQ_API_KEY` in `.env.local`.

For Inngest development:

```bash
npx inngest-cli@latest dev
```

Then open http://localhost:3000.

## Security
Never commit `.env.local` or an actual API key. Use `.env.example` only.
