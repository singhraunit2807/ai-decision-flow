# AI Decision Flow

A visual AI YES/NO decision workflow builder using Next.js, React Flow, Groq/OpenAI-compatible chat completions, and Inngest.

## What is included

- Complete support + sales workflow with all decision nodes prebuilt
- Customer request input is sent to every AI decision
- Deterministic YES/NO classification
- Dynamic graph traversal
- Terminal `END` node that does not call the model
- Inngest execution
- Execution logs
- Local workflow save
- JSON export
- No API key committed to the repository

## Run locally

```bash
npm install
```

Create `.env.local` from `.env.example` and set only your secret key:

```env
GROQ_API_KEY=your_groq_api_key
```

Optional OpenAI-compatible override:

```env
MODEL_ENDPOINT=https://api.groq.com/openai/v1/chat/completions
MODEL_API_KEY=your_api_key
MODEL_NAME=llama-3.3-70b-versatile
```

Start Next.js:

```bash
npm run dev
```

Start Inngest in a second terminal:

```bash
npx inngest-cli@latest dev
```

Open `http://localhost:3000`.

## Test requests

Support test:

`My laptop is broken and I need urgent technical support.`

Sales test:

`I want to buy a new laptop.`

The workflow uses the customer request as context and stops at `END` after the matching branch completes.

## Important

Do not commit `.env.local` or any API key. The repository is already configured so code changes are not required just to change the secret key.
