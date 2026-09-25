# Blast AI implementation status

Updated 25 September 2026. This supersedes the initial findings in TURBO-AI-AUDIT.md for the active application. It is not a claim of complete Turbo AI parity or production certification.

## What changed

The active application now uses the supplied Blast wordmark and mascot, a responsive study workspace, and a single authenticated study API. Imported documents and notebooks are stored in SQLite, scoped to the current user. The old demonstration routes are no longer mounted.

| Workflow | Current implementation | Verification / limitation |
| --- | --- | --- |
| Branding and workspace | Original supplied PNG, animated hero, library, folders, favorites, reduced motion | Built and visually inspected locally |
| Searchable PDF / text | 10 MB file limit, 80-page PDF limit, page-preserving text extraction, original-file links | Real two-page PDF integration test; scanned pages rejected honestly |
| Notes | Structured sections, takeaways, editable text, Markdown export | Import and reload checked in browser; persistence tested |
| AI study generation | Notes, quizzes, cards, roadmap, audio script in one validated response | Tested with isolated model fixtures; live AWS blocked by daily quota |
| Model choice | In-Region Nova Pro, Nova Lite, OpenAI GPT OSS 120B | Catalog access confirmed; availability and invocation quotas are separate |
| Contextual tutor | Document excerpts, recent conversation history, structured answer, source references | History and source isolation tested with mocked inference |
| Source grounding | Page/chunk IDs checked against uploaded sources | Reference validity is checked, not factual entailment; retrieval uses lexical ranking, not embeddings |
| Quiz | Immediate feedback, explanations, saved answers | API progress tested; sample available in UI |
| Flashcards | Flip, ratings, increasing review intervals | Review persistence tested; simple deterministic scheduler, not a trained ML model |
| Learn | Milestones and completion progress | Saved completion tested |
| Audio recap | Model-written dialogue read by browser speech synthesis | Browser voice quality varies; no downloadable generated podcast |
| Lecture input | Browser speech recognition where available | No uploaded audio/video transcription service configured |
| YouTube | Public transcript import | Caption availability and platform access can fail; no live success claimed |
| Authentication | Salted scrypt passwords, hashed session tokens, HttpOnly cookies, production Secure cookies | Login, owner isolation and guest-to-account upgrade tested; old guest sessions revoked |
| Jobs | Status persisted; browser can reconnect after reload | A server restart marks unfinished jobs failed; this is not a distributed durable worker queue |

## Main original mistakes corrected

1. Authentication was simulated and data ownership was not enforced across the learning flow. The active API now checks the session and notebook/document owner.
2. Uploading a file did not establish a reliable source-to-generation path. Extracted pages now travel through authenticated document IDs, generation and source references.
3. Generic fallback content could appear to be successful AI output. Failed model calls now fail visibly; malformed output is repaired once and otherwise rejected.
4. Chat did not reliably carry notebook context and prior turns. The tutor now receives scoped excerpts, notes and recent persisted history.
5. Model JSON and requested activity counts were not rigorously validated. Schemas now enforce shape, counts, option indices, unique IDs and allowed source IDs.
6. Learning data depended on browser-only state. Real notebooks, answers, reviews and messages are stored on the server. The explicitly labelled sample remains local.
7. Branding, spacing and navigation were inconsistent. The active frontend was replaced with a coherent workspace using the provided logo.

## AWS verification and blocker

Read-only AWS checks reported an ACTIVE FREE plan with approximately $179.90 credits remaining. No AWS resources were created and no plan upgrade was made. The existing configuration points to us-east-1; the selected project Region still needs confirmation before provisioning.

Bedrock catalog access succeeded. Direct model invocation returned HTTP 429: **Too many tokens per day, please wait before trying again.** Nova Pro, GPT OSS and Nova Lite could not be used for live output verification during this run. Credits do not bypass a service quota. Check the Bedrock quota in AWS Service Quotas; billing and spend status are in AWS Settings. No cross-Region inference profile is silently substituted.

## Remaining release work

- Verify actual generated content and latency once inference is available, including adversarial document instructions, non-English material, mathematical content and long documents. Current fixture tests prove orchestration, not model quality.
- Configure OCR for scans and transcription for uploaded recordings if those inputs are required.
- Add email verification/password recovery, retention and document cleanup, backup/restore exercises, monitoring, HTTPS hosting and deployment-specific rate limiting.
- Move generation to a durable worker/queue and external storage before multiple server replicas. SQLite currently targets one persistent server.
- Add semantic embeddings if needed for long-document relevance; no custom model training or proprietary Turbo algorithm is reproduced.
- Define and implement sharing, collaboration, billing, mobile applications and downloadable audio if required. They are not shipped here.
- Old browser-local study packs are not automatically assigned to authenticated accounts. Their existing local storage is untouched; a deliberate migration flow is still needed.

## Research boundary

[Turbo AI](https://www.turbo.ai/) describes document/lecture study workflows and structured study tools. Its [product comparison](https://www.turbo.ai/blog/turbo-ai-vs-studley) and [July announcement](https://www.turbo.ai/blog/july-2026-announcement-10-million-users) describe additional capabilities. Public pages do not reveal private model weights, training data, prompts or a full internal architecture. Blast implements comparable visible workflows with its own backend; it is not an exact reproduction of those internals.

## Validation

- Full frontend and backend production build passed.
- `npm test` runs an isolated temporary SQLite database and mocked model invocation, with 25+ assertions spanning PDFs, ownership, generation, malformed output, saved activities, chat history and accounts. It makes no AWS calls.
- The original `scripts/audit-probes.cjs` and its JSON results document the previous application's behavior and must not be treated as the new acceptance suite.
