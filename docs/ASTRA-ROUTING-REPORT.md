# Blast Astra: incremental model routing

## 1. Existing features
The active React workspace, Express API, SQLite ownership/session storage, PDF/text import, notebook tutor, structured notes, quizzes, flashcards, learning milestones and browser read-aloud already work together. Generation validates content before persisting it. No separate Workbench component exists: the current notebook workspace is the study surface and will be retained.

## 2. Missing features at inspection
No automatic task classifier, model capability catalog, model fallback chain or image transport existed. The frontend exposed a model selector. Chat pinned follow-ups to the notebook's original model. PDF generation rejected sources above 85,000 characters, independently of model context capacity. Images and scanned pages were not accepted.

## 3. Routing changes needed
Centralize classification, availability/capability filtering, bounded fallback and structured-output validation. Keep the requested ordering as a preference, not a claim that one model always performs best. Resolve “Qwen Coder” to Qwen3 Coder Next. Exclude unavailable, cross-Region and insufficient-context candidates. Never send images to a text-only model or silently discard diagrams. Remove only the manual model control from the existing UI.

Read-only discovery in the app's configured us-east-1 found ON_DEMAND IDs for Kimi K2.5, GLM 5, DeepSeek V3.2 and Qwen3 Coder Next. Grok 4.6 and Kimi K3 were INFERENCE_PROFILE-only there and cannot be invoked under the project's no-cross-Region rule. Catalog presence is not proof of key access or available quota. The CLI Region is ap-south-1, conflicting with the app configuration; selected Region confirmation is pending. No Region is silently changed.

## 4. Files to modify
- Add `backend/src/study/modelRouter.ts` for routing policy, classification and fallback.
- Extend `backend/src/study/model.ts` for catalog discovery and multimodal transport.
- Update `generation.ts` so both generation and tutor use the router and existing validators.
- Extend `store.ts` / `api.ts` for owner-scoped visual inputs and source limits without replacing storage.
- Update `schema.ts`, frontend `studyApi.ts` and `StudyWorkspace.tsx` to remove manual model selection and retain learning preferences.
- Add routing regression tests; preserve and run the existing integration suite.

## 5. Implementation status
Inspection and model discovery complete. Implementation and verification in progress. Live model execution remains subject to the previously observed quota and selected-Region confirmation.

References: [AWS model catalog](https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards.html), [Grok access](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-xai-grok-4-6.html), [GLM 5](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-zai-glm-5.html), [DeepSeek V3.2](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-deepseek-deepseek-v3-2.html), [Qwen3 Coder Next](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-qwen-qwen3-coder-next.html).

## Completed implementation

- Confirmed selected Region: **ap-south-1 (Mumbai)**. Corrected the local backend configuration without exposing the existing key or changing the AWS plan.
- Added one central `modelRouter.ts`, shared by study generation and tutor turns. Deterministic task detection considers the current request, short follow-ups, coding history, document size and actual image attachments. This is a transparent heuristic, not a trained classifier or a benchmark proving one provider best.
- Removed the manual model dropdown and client model override. The existing UI, routes, session storage, notebook database and learning components remain in place.
- Added five-minute catalog caching. Only known, direct ON_DEMAND models in the selected Region are eligible. Model availability is checked again after cache expiry. Discovery failures fail safely.
- Added up to three total invocation attempts, per-attempt timeouts, temporary cooldowns, sanitized errors and schema/citation validation before returning or persisting output. Invalid JSON can fall back; invalid credentials, AWS verification restrictions and safety refusals stop the chain.
- Added owner-scoped image storage using an additive table. PNG/JPEG inputs are decoded and normalized. PDFs of up to 12 pages include rendered page images, including scanned pages. No original documents were migrated or removed.
- Expanded searchable-text ingestion to 400 PDF pages / 600,000 characters. Generation checks a conservative context budget (UTF-8 bytes plus output/image allowance) against each candidate. Oversized requests are rejected with a chapter-splitting message, not truncated. This does not yet provide unlimited-book processing or hierarchical whole-book synthesis.

### Effective Mumbai routing

The user's preferred Grok/K3 slots are retained in policy, but filtered out by direct-model availability. Qwen3 Coder Next is absent from Mumbai's catalog; Qwen3 Coder 480B is used instead.

| Task | First eligible choice | Subsequent candidates, subject to capacity/access |
| --- | --- | --- |
| Normal learning | GLM 5 | Kimi K2.5, GPT OSS 120B |
| Large text/PDF | Kimi K2.5 | GLM 5 if the full request fits |
| Maths / DSA | GLM 5 | DeepSeek V3.2, Kimi K2.5, GPT OSS 120B |
| Coding | DeepSeek V3.2 | Qwen3 Coder 480B, GLM 5, Kimi K2.5 |
| Coding-heavy | Qwen3 Coder 480B | DeepSeek V3.2, GLM 5, Kimi K2.5 |
| Actual images / visual PDF pages | Kimi K2.5 | Qwen3 VL if capacity permits |

Only three candidates can actually be invoked for one response. Visual input takes precedence over task keywords. A text-only fallback is not used for an image because OCR is not guaranteed to preserve diagrams; another vision-capable model is the appropriate fallback. Larger searchable PDFs use extracted text, with an import notice explaining that diagrams require a separate short section. Older stored PDFs are not automatically rasterized; reimport to add visual pages.

### Validation results

- Frontend and backend build passed.
- **18 tests passed**, including the existing full workflow integration case with 25+ assertions.
- Tests cover classification, follow-up history, subject changes, context limits, model availability, cross-Region exclusion, three-attempt fallback bounds, malformed JSON, credential/verification stop conditions, safety stop conditions, PDF page rendering, PNG upload and user isolation.
- Live catalog discovery in Mumbai succeeded. A bounded routed smoke check failed. A small diagnostic identified HTTP 403 AccessDeniedException: **AWS project verification is still in progress**. The plan check reported FREE / ACTIVE. This replaces the earlier us-east-1 quota observation as the current Mumbai blocker. No quota increases, subscriptions, plan changes or cloud resources were created.
- Live generation quality, vision interpretation and per-model latency cannot yet be verified. The original release gaps in IMPLEMENTATION-STATUS.md (account recovery, production operations, durable workers and other product features) remain; routing does not by itself finish production certification.
- Built app health, dashboard and notebook deep links return HTTP 200 at http://127.0.0.1:5000. Port 3000 was occupied by an unrelated project and was left untouched. Browser visual regression was not rerun in this increment.

AWS's diagnostic says verification normally takes less than two hours and directs the owner to AWS verification support if it persists beyond that. No external message was sent. Once verification is complete, run `node scripts/check-routing-inference.cjs` for a bounded live connection check, then evaluate real study sets before release.

Additional references: [Kimi K2.5 input limits](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-moonshot-ai-kimi-k2-5.html), [Kimi K3 cross-Region access](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-moonshot-ai-kimi-k3.html), [new AWS experience restrictions](https://docs.aws.amazon.com/accounts/latest/reference/supported-services-sign-up-new.html).
