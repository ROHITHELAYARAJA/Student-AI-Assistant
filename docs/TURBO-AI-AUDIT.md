# Turbo AI comparison and project audit

Audit date: 25 September 2026. Scope: analysis first, as requested. Application source was not changed. This report, an offline diagnostic script, and its results were added.

## Verdict

This is a working study-app prototype with several useful screens and real Bedrock invocation code. It is not yet a complete Turbo-equivalent product. The largest problems are disconnected input workflows, simulated educational content presented as intelligence, missing authentication and data isolation, and insufficient validation of model responses. A successful build does not establish that these workflows work.

## What Turbo publicly offers

Turbo describes a workflow of lecture/audio, PDF, slides, YouTube, or notes input followed by organized notes, flashcards, quizzes, contextual chat, and podcasts. Its Learn Mode can turn a topic into a structured course. These are vendor descriptions, not an independent quality benchmark:

- [Official product overview](https://www.turbo.ai/)
- [Official upload-to-study workflow](https://www.turbo.ai/blog/best-chatgpt-alternatives)
- [Official Learn Mode announcement](https://www.turbo.ai/blog/july-2026-announcement-10-million-users)

Your saved September 3 screenshots also show onboarding, a dashboard with Record / Upload / YouTube controls, folders, and a less technical interface. The current dashboard instead emphasizes model settings, a flame mascot, and chat. It is visibly different. The screenshot comparison was a spot check of onboarding and dashboard, not a pixel-by-pixel audit of every screen.

Public evidence does not reveal Turbo's private prompts, model weights, training data, retrieval implementation, or all internal quality checks. Functional and visual parity can be specified and tested; identical internal machine learning cannot be claimed from this research.

## Feature comparison

| Capability | Current implementation | Assessment |
|---|---|---|
| Topic to study pack | Bedrock calls for roadmap, notes, quiz, cards, podcast | Implemented path; output quality and failure handling need repair |
| PDF / slides upload | Upload menu without dashboard callback; JSON text ingestion endpoint | No complete file ingestion workflow |
| Lecture transcription | Dictation inserts demo transcripts; microphone orb analyzes audio | No real lecture-to-transcript pipeline |
| YouTube import | Generated YouTube search URL | No video transcript import |
| Notes | Structured editor, local saving, plain-text export | Markdown edits are not saved into the note model |
| Contextual tutor | Three different reply paths | History ignored; notes tutor simulated; document context incomplete |
| Quizzes | Generated MCQs and interactive answering | Weak response validation; no durable attempt history |
| Learn mode | Roadmap and locally saved milestone completion | Same hard-coded comprehension question for every milestone |
| Flashcards | Flip cards and rating buttons | Memory score changes; no persistent review scheduling |
| Podcasts | Script and browser speech synthesis | Basic playback; no generated audio file or true pause/resume |
| Sources / citations | Search links and local source cards | No verified claim-to-page citations |
| Users and storage | Browser localStorage plus server-memory documents | No real identity, user isolation, or cross-device persistence |
| Upgrade | Modal closes on trial button | No subscription or entitlement workflow |

## Prioritized findings

P1 means fix before real users or trusting study output. P2 means a significant functional or reliability gap. These are priorities for this project, not external security severity ratings.

### 1. P1 — Authentication is only a UI simulation

Evidence: `frontend/src/components/turbo/AuthView.tsx:21` checks for nonempty values, then signs in locally. Google sign-in assigns a fixed sample user. `frontend/src/App.tsx:18` defaults to a signed-in student. `backend/src/server.ts:41` exposes generation and document routes without authentication middleware.

Impact: anyone who can reach the backend can invoke model generation, enumerate document contents, and delete documents. CORS is wildcard; CORS would not replace authentication even if restricted.

Repair: real sessions or verified identity tokens; server-side ownership checks for every document, pack, conversation, and deletion; per-user generation limits. Acceptance: user B cannot list, retrieve, search, or delete user A's material, and unauthenticated generation is rejected.

### 2. P1 — The PDF-to-AI path does not exist end to end

Evidence: `DashboardView.tsx:332` renders the composer without `onUploadFile`. `ai-prompt-input.tsx:1673` invokes that optional callback. Browser verification: clicking Upload Document / Notes only closes the menu. The server accepts JSON text, not uploaded PDF bytes; there is no PDF parser, OCR, file store, or extraction job in the inspected code.

Repair: file selection, upload validation, durable file storage, extraction, page metadata, OCR for image-only PDFs, processing status, and document IDs attached to the study request. Acceptance: upload a synthetic PDF containing a unique fact and retrieve that fact with the correct page citation. Reject unsupported or unreadable files visibly.

### 3. P1 — Sources added in the UI never reach retrieval

Evidence: `SourcesKnowledgeView.tsx:98` only updates component state. Add/delete do not call `ingestDocument`, `deleteDocument`, or save the updated pack. `RagSourcesView.tsx` and ingestion API helpers exist, but this is not the view mounted in App.

Impact: source additions disappear on navigation and cannot ground the next answer. Repair: persist additions, associate them with user and notebook, ingest their contents, and query only the selected documents. Acceptance: a source survives reload and affects an answer; deletion removes it from future retrieval.

### 4. P1 — Provider failures silently become misleading study material

Evidence: `turboService.ts:248` returns an empty string on missing credentials or exhausted model attempts. Generators then substitute generic templates. `aiService.ts:89` labels fallback content as a neural synthesis engine. The dashboard records the selected model label instead of the returned actual provider information (`DashboardView.tsx:182`).

Reproduced offline: Photosynthesis notes included `Cost = O(n log n) average traversal bound` and memory-footprint advice. The chat fallback described photosynthesis as solving a computational problem.

Repair: return explicit provider-unavailable / generation-failed states. Keep sample content in an explicitly labeled demo mode. Track the actual successful model and per-module status. Acceptance: invalid credentials, timeout, throttling, and malformed JSON never display a successful fabricated lesson.

### 5. P1 — The tutor is not consistently conversational or document-grounded

Evidence: `turboService.ts:1147` takes `_history` but omits it from all provider requests. Its initial chat explanation prompt contains the message, not retrieved document chunks. `NotesEditorView.tsx:222` generates a fixed response after a timer. The floating tutor uses `/api/assist`, whose service does not retrieve documents.

Impact: follow-ups such as “explain that equation” lose context. The notes tutor can appear to read a document while returning a generic response. Repair: one shared chat contract with conversation history, notebook ID, selected document IDs, retrieved evidence, and citations. Acceptance: follow-up questions resolve against the previous answer and selected source pages.

### 6. P1 — Parsed JSON is treated as a valid educational object

Evidence: `turboService.ts:832` only checks that `questions` is a nonempty array; other generators use similarly shallow checks. Offline mock provider response `{"questions":[{}]}` was accepted when five questions were requested.

Repair: runtime schemas for every output type; nonempty strings, exact counts, valid answer indices, allowed enums, maximum sizes, and citation IDs that exist. Repair or reject invalid outputs. Validate request types and bound `questionCount` and `topK` too; an arbitrarily large question count can create substantial synchronous fallback work.

Acceptance: malformed objects, missing options, out-of-range answers, and incorrect counts produce controlled failures instead of broken screens or invalid tests.

### 7. P2 — Retrieval is lexical, global, and temporary

Evidence: `ragEngine.ts:20` stores documents in a process-local Map. Search at line 125 uses token-set Jaccard overlap plus an exact-match bonus. This is not embeddings, BM25, or cosine vector search as the README suggests. It has no user or notebook filter, page numbers, chunk overlap, or persistent index. The tokenizer strips non-ASCII text and short words.

Reproduced: a 14,999-character paragraph remains one chunk despite the apparent 800-character target.

Repair: persistent scoped storage, hard chunk bounds, page/source metadata, and retrieval quality tests. Add semantic embeddings or hybrid retrieval if semantic matching is a requirement. Lexical retrieval itself is a legitimate baseline; mislabeling and lack of isolation are the problems. Retrieval does not guarantee hallucination-free answers.

### 8. P2 — Markdown editor changes are lost on Save

Evidence: `NotesEditorView.tsx:505` updates `rawMarkdown`; `handleSaveNotes` at line 133 saves title, summary, takeaways, and sections only. There is no conversion of edited markdown into those fields.

Repair: one canonical note representation, or a tested conversion between representations. Acceptance: edit markdown, save, reload, switch modes, and export; content must be retained consistently.

### 9. P2 — Several learning features are demonstrations

- `ai-prompt-input.tsx:2167`: dictation falls back to `DEMO_STUDY_TRANSCRIPTS`; Dashboard supplies no transcription callback. The orb reads microphone amplitude but does not transcribe lectures.
- `LearnRoadmapView.tsx:425`: every milestone uses the same two-option comprehension question, with option zero treated as correct.
- `FlashcardsGeneratorView.tsx:47`: memory score starts at 85 and rating changes only local state; there are no due dates or retained review history.
- `QuizPlayerView.tsx:45`: answers are local state, not durable attempts.
- `PodcastLectureView.tsx:139`: pause cancels speech; restarting speaks the current segment from its beginning. Speaker pitch changes are not independently generated speaker audio.

Repair these against explicit behavioral requirements. A correct-looking control is not sufficient evidence of a learning feature.

### 10. P2 — Research controls and citations overstate what runs

Evidence: `ai-prompt-input.tsx:2164` submits text and model selection; research/search flags are not passed. Dashboard sends only the model ID, ignoring effort/context/thinking/fast settings. `generateSources` at `turboService.ts:1045` constructs search URLs and labels some as verified without fetching their contents.

Repair: connect controls to implemented backend behavior or remove unsupported controls. Separate suggested further-reading links from citations supporting an answer. Show source document, page, and excerpt beneath the relevant output.

### 11. P2 — Deployment and navigation have concrete faults

- `frontend/src/services/turboApi.ts:13` hardcodes `http://localhost:5000`. A deployed browser will call the visitor's computer; HTTPS hosting can also block mixed content. Use deployment configuration or same-origin `/api`.
- `router.ts:29` accepts `/source`, but several views link to `/sources`, which falls back to the dashboard.
- `frontend/vite.config.ts:6` uses relative asset paths with history-based nested routes. Verify direct nested-route reloads in the production host; a root-page build is insufficient.
- Study packs live in localStorage and source documents in server memory. They do not survive the same events or synchronize across devices.
- The README claims embeddings, hallucination-free answers, live transcription, and spaced repetition beyond the implementation. Its default AWS Region must be replaced with the project's verified selected Region before deployment.

### 12. P2 — Generation is expensive and difficult to diagnose

Every study chat produces an explanation and five model-backed modules. Each call can try five models sequentially, with a 25-second fetch timeout per attempt. There is no overall request deadline, job queue, streaming response, or useful provider-error reporting. The selected model may differ from the model that succeeds. No test script or existing test files were found in the inspected application sources.

Repair: separate chat from requested module generation, cache by source version and settings, support cancellable jobs and explicit per-module statuses, report structured errors, and add quality evaluations. The production bundle also has a 623.72 kB JavaScript chunk; optimize after the correctness blockers.

## The correct PDF and AI workflow for this project

This is a proposed architecture, not a claim about Turbo's internals:

```text
Authenticated student + notebook
    -> upload PDF / slides / audio, or import transcript
    -> validate file and save original
    -> extract text by page; OCR or transcribe when needed
    -> persist extraction status and source metadata
    -> split into bounded chunks and index
    -> retrieve only the student's selected source material
    -> invoke an existing language model with question + history + evidence
    -> validate structured output and source references
    -> save notes / quiz / cards / lesson / podcast script
    -> render output with filename, page and excerpt citations
    -> persist attempts, progress and review scheduling
```

For whole-document notes, process all relevant sections rather than expecting a few topic-matched chunks to cover a large textbook. For questions, retrieve relevant chunks. Preserve the original PDF so a citation can open the correct page.

You do not need to train a new deep-learning model to implement this workflow. Existing model inference is already present in the code. `deepKnowledgeEngine.ts` contains handwritten reference text and conditional explanations, not a neural-network training pipeline. If “machine learning and deep learning” means subjects to teach, use accurate source material and the same grounded output contract for those subjects. Custom training should only follow evidence that prompting and retrieval cannot meet measured requirements.

Recommended output contract: schema version, status, actual model, document IDs, answer sections, citations with page/chunk references, and a typed module payload. A quiz needs options, a valid correct index, explanations, and source references; notes need headings, content, takeaways, and optional formulas. Render these according to module type and show supporting PDF references beneath the answer.

## Repair order and acceptance gate

1. **Trust and security:** real authentication, ownership isolation, bounded requests, honest failures and model labels.
2. **One complete document workflow:** PDF upload through extraction, persistent retrieval, page citations, and a source-grounded answer.
3. **Validated study outputs:** notes, quiz, cards, and lessons generated from the same selected material; no silent template substitution.
4. **Durable learning:** saved edits, conversations, attempts, review dates, and progress; fix route/deployment bugs.
5. **Additional inputs and audio:** real recording/transcription, YouTube transcript import, and audio playback requirements.
6. **Visual parity:** inventory every reference screen and state; match layout, spacing, typography, navigation, and responsive behavior while keeping consistent product branding.

Before calling the core workflow complete, test a text PDF, a scanned PDF, a long PDF, two users with similarly titled private documents, an unsupported question, a malformed model response, provider failure, reload/restart persistence, and a production nested-route reload. Check source coverage, citation correctness, quiz validity, and latency separately from whether a screen renders.

## Validation performed and limits

- Full root build passed: backend TypeScript, frontend TypeScript, and Vite production build. Initial sandbox build failed with an environment process-spawn restriction; rerun with approved permissions passed. The remaining build warning concerns chunk size.
- Opened the local dashboard in the in-app browser, inspected the rendered layout, and confirmed the dead upload action.
- Compared two supplied Turbo screenshots and researched the official pages linked above. No authenticated Turbo product session was tested.
- Five offline synthetic diagnostics reproduced chunk overflow, unrelated fallback notes, search-only sources, malformed quiz acceptance, and ignored chat history. See `docs/audit-probe-results.json`.
- Reproduce after building with `node scripts/audit-probes.cjs`. This script characterizes current defects; it is not a passing correctness suite and its expectations must change when defects are repaired. It mocks provider calls, does not load `.env`, and performs no AWS inference.
- Live Bedrock access, actual selected Region, production hosting, real microphone transcription, complete browser flows, and real PDF quality were not validated. No cloud resources were provisioned and no application fixes were applied during this audit.
