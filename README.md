# Blast AI

A branded study workspace built with React, TypeScript, Express and AWS Bedrock. The active app turns source documents or topics into structured notes, flashcards, quizzes, learning milestones and an audio recap script. A document-aware tutor uses source excerpts and conversation history.

Read [implementation status](docs/IMPLEMENTATION-STATUS.md) for verified capabilities, original defects, AWS quota blockage and release gaps. This is a working local implementation, not a certification of full Turbo AI parity or production readiness.

## Run locally

Requires Node.js 24 or newer (uses built-in SQLite).

1. Run `npm --prefix backend ci` and `npm --prefix frontend ci`.
2. Copy `backend/.env.example` to `backend/.env` only if no configuration exists. Set your selected AWS Region and Bedrock API key. Never place the key in frontend variables or commit it.
3. In separate terminals, run `npm run dev:backend` and `npm run dev:frontend`.
4. Open http://127.0.0.1:3000/dashboard.

The local workspace starts with a private guest session. Register through profile settings to attach that guest's notebooks to an account. Production mode requires an account and HTTPS cookies. Keep the local session cookie or register before clearing browser data.

## Build and test

- `npm run build` compiles both applications.
- `npm test` builds the backend and tests the workflow using a temporary database and mocked AI. It does not spend AWS credits.
- `npm run start:backend` serves the built API and frontend at http://127.0.0.1:5000. Build first.
- `npm run preview` previews frontend assets only; use the backend server for an integrated built preview.

## Inputs and learning tools

Searchable PDF (up to 10 MB / 80 pages), TXT and Markdown are supported. Scans are rejected when OCR is required. YouTube import depends on accessible public captions. Live lecture transcription depends on browser speech recognition. Uploaded audio transcription is not configured.

Generated content is validated before saving. Notes, questions, cards and audio dialogue are rendered as separate study tools. The tutor displays a summary, explanation sections, source links and a check-your-understanding question. Audio playback uses browser speech synthesis.

## Storage and deployment

SQLite data is stored under `backend/data` by default. `BLAST_DATA_DIR` selects a persistent private directory. Back up the database consistently, including SQLite's WAL state; do not deploy to ephemeral filesystem storage. Current job execution assumes one backend process. An interrupted server job is marked failed and must be retried.

For deployment, configure HTTPS, `NODE_ENV=production`, an exact `APP_ORIGINS`, and appropriate `HOST` behind a trusted reverse proxy. Review backup, account recovery, monitoring, worker durability and storage needs in the implementation status before public release. Do not expose a development guest server publicly.

## Model configuration

The server allows in-Region Nova Pro, Nova Lite and OpenAI GPT OSS 120B IDs. Model catalog presence does not guarantee available invocation quotas. The supplied key is loaded only on the backend. No cross-Region inference profile is substituted.

During verification AWS rejected invocation with a daily token-quota error despite remaining promotional credits. Live generation quality remains unverified until that quota becomes available. The example notebook is explicitly labelled and is never presented as model-generated output.

## Code layout

- `frontend/src/components/workspace`: active UI and study tools
- `frontend/src/services/studyApi.ts`: authenticated requests and job reconnection
- `backend/src/study`: sessions, SQLite, PDF ingestion, generation schemas, model calls and tutor
- `scripts/study-integration.test.cjs`: current integration suite
- `docs/TURBO-AI-AUDIT.md`: historical audit of the original code

Legacy components and services remain for reference but their API routes are not mounted. Historical audit probes assert previous defects and are not the current test suite. Previously saved browser-local packs are left intact but not automatically imported into an account.
