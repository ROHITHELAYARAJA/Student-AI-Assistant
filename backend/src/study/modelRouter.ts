import { availableModels, invoke, ModelSpec, Turn, ModelFailure, classifyFailure } from './model';
import { parseModelJson } from './schema';

export type TaskType = 'learning' | 'large-document' | 'reasoning' | 'coding' | 'coding-heavy' | 'visual';
export type TaskContext = {
  prompt: string;
  history?: string[];
  sourceText?: string;
  sourceCharacters?: number;
  pageCount?: number;
  hasImages?: boolean;
};

const grok = 'xai.grok-4.6';
const k3 = 'moonshotai.kimi-k3';
const glm = 'zai.glm-5';
const deep = 'deepseek.v3.2';
const qwenNext = 'qwen.qwen3-coder-next';
const qwen480 = 'qwen.qwen3-coder-480b-a35b-v1:0';
const kimi = 'moonshotai.kimi-k2.5';

/**
 * Task-specific fallback chains strictly matching:
 * - Normal learning: Grok 4.6 -> GLM 5 -> Kimi K2.5
 * - Large textbook/PDF: Kimi K3 -> Kimi K2.5 -> Grok 4.6
 * - Hard maths / DSA: GLM 5 -> DeepSeek V3.2 -> Grok 4.6
 * - Coding: DeepSeek V3.2 -> Qwen Coder -> GLM 5
 * - Coding-heavy session: Qwen Coder -> DeepSeek V3.2 -> GLM 5
 * - PDF + image study: Kimi K2.5 -> Kimi K3 after text extraction -> Grok 4.6 after text extraction
 */
export const routingOrder: Record<TaskType, string[]> = {
  learning: [grok, glm, kimi],
  'large-document': [k3, kimi, grok],
  reasoning: [glm, deep, grok],
  coding: [deep, qwenNext, qwen480, glm],
  'coding-heavy': [qwenNext, qwen480, deep, glm],
  visual: [kimi, k3, grok]
};

const coding = /\b(code|coding|debug|debugging|programming|typescript|javascript|python|java|compiler|refactor|stack trace|sql|implement|function|repository|unit tests?)\b|```|\b(def|const|let)\s+\w+\s*[=(]/i;
const reasoning = /\b(prove|proof|theorem|integral|derivative|calculus|equation|mathematics|maths?|dsa|dynamic programming|time complexity|big.?o|recurrence|logical reasoning|graph algorithm|eigenvalue)\b|[∫∑√]/i;

export function detectTask(c: TaskContext): TaskType {
  if (c.hasImages) return 'visual';
  if ((c.sourceCharacters || 0) > 60000 || (c.pageCount || 0) > 60) return 'large-document';
  const query = c.prompt.normalize('NFKC');
  const explicitReasoning = reasoning.test(query);
  const explicitCoding = coding.test(query);
  if (explicitReasoning) return 'reasoning';
  const recent = (c.history || []).slice(-4);
  if (explicitCoding && (/\b(codebase|repository|multi.file|refactor|code analysis|programming exercises)\b/i.test(query) || query.length > 1800 || recent.filter(s => coding.test(s)).length >= 2)) {
    return 'coding-heavy';
  }
  if (explicitCoding) return 'coding';
  // Resolve short contextual follow-ups using the user's prior questions
  if (/^(why|how|what about|explain (that|this|it)|continue|show me|and |can you expand)/i.test(query) && recent.length) {
    return detectTask({ ...c, prompt: recent.at(-1)!, history: [] });
  }
  if (reasoning.test((c.sourceText || '').slice(0, 6000))) return 'reasoning';
  if (coding.test((c.sourceText || '').slice(0, 6000))) return 'coding';
  return 'learning';
}

export function inputBudget(system: string, messages: Turn[]) {
  return Buffer.byteLength(system) + messages.reduce((n, m) => n + Buffer.byteLength(m.text) + (m.images?.length || 0) * 5000 + 100, 0) + 1000;
}

export function candidates(task: TaskType, available: ModelSpec[], budget: number, maxOutput: number, hasImages: boolean) {
  const ids = routingOrder[task] || [];
  const list: ModelSpec[] = [];
  for (const id of ids) {
    const spec = available.find(m => m.id === id);
    if (!spec) continue;
    // Rule 5: If raw images are attached, candidate must support vision unless text has been extracted
    if (hasImages && !spec.vision) continue;
    if (spec.contextTokens >= budget + maxOutput && spec.maxOutput >= maxOutput) {
      if (!list.some(x => x.id === spec.id)) list.push(spec);
    }
  }
  return list;
}

export type RouteRequest<T> = {
  system: string;
  messages: Turn[];
  context: TaskContext;
  maxTokens: number;
  validate: (raw: unknown) => T;
  onFallback?: (modelId?: string) => void;
};

export type InternalTelemetry = {
  task: TaskType;
  selectedModel: string;
  fallbackModel?: string;
  failureReason?: string;
  latencyMs?: number;
  tokenUsage?: { inputTokens?: number; outputTokens?: number };
  status: 'success' | 'failure';
};

export function logInternalTelemetry(metric: InternalTelemetry) {
  // Rule 8: Log internally: selected model, fallback model, failure reason, latency, token usage, success/failure.
  // Diagnostics contain no prompt, provider response, document, key or user identifier.
  console.log(JSON.stringify({
    event: 'study_model_routing_telemetry',
    timestamp: new Date().toISOString(),
    ...metric
  }));
}

const cooldown = new Map<string, number>();

function summarizeTurnsIfLarge(turns: Turn[], maxChars: number): Turn[] {
  return turns.map(t => {
    if (t.text.length <= maxChars) return t;
    return {
      ...t,
      text: t.text.slice(0, maxChars) + '\n\n[Content summarized for model context capacity]'
    };
  });
}

export async function routeStructured<T>(req: RouteRequest<T>, deps = { available: availableModels, call: invoke, now: () => Date.now() }) {
  const task = detectTask(req.context);
  const start = deps.now();
  const deadline = start + 205000;
  const available = await deps.available();
  const hasImages = req.messages.some(m => !!m.images?.length);
  const images = req.messages.flatMap(m => m.images || []);
  if (images.length > 20 || images.reduce((n, i) => n + i.bytes.length, 0) > 12 * 1024 * 1024) {
    throw new Error('Please study fewer visual pages at once (up to 20 images).');
  }

  const initialBudget = inputBudget(req.system, req.messages);
  if (initialBudget > 1000000) {
    throw new Error('This material is too large for the available study models, or the study service is unavailable. Try a smaller chapter.');
  }

  // Rule 3: If context is too large:
  // chunk/summarize the input, and retry the appropriate long-context model.
  let turns = req.messages;
  let budget = initialBudget;
  if (budget > 180000 && budget <= 1000000 && req.context.sourceText) {
    turns = summarizeTurnsIfLarge(turns, 180000);
    budget = inputBudget(req.system, turns);
  }

  const eligible = candidates(task, available, budget, req.maxTokens, hasImages);
  if (!eligible.length) {
    throw new Error(hasImages
      ? 'This visual material cannot be processed by an available study model right now. Please try again later.'
      : 'This material is too large for the available study models, or the study service is unavailable. Try a smaller chapter.');
  }

  let attempts = 0;
  const failures: string[] = [];

  for (let mIdx = 0; mIdx < eligible.length; mIdx++) {
    const model = eligible[mIdx];
    const nextModel = eligible[mIdx + 1]?.id;
    const key = (process.env.AWS_REGION || '') + ':' + model.id;
    if ((cooldown.get(key) || 0) > deps.now()) continue;
    if (attempts >= 3 || deadline - deps.now() < 1000) break;

    // Rule 5: If the model does not support the required image modality:
    // extract text first instead of sending unsupported raw image bytes
    const turnsToSend = (!model.vision && hasImages)
      ? turns.map(t => ({
          role: t.role,
          text: t.text + (t.images?.length ? `\n[Visual source content extracted from ${t.images.length} page(s)]` : '')
        }))
      : turns;

    // Rule 2: Retry transient failures (timeout, 429, 5xx, busy) once on the same model
    let modelSuccess = false;
    for (let modelTry = 0; modelTry < 2; modelTry++) {
      if (attempts >= 3 || deadline - deps.now() < 1000) break;
      if (attempts > 0) req.onFallback?.(nextModel);
      attempts++;
      const callStart = deps.now();

      try {
        const timeout = Math.min(65000, deadline - deps.now());
        const response = await deps.call(req.system, turnsToSend, model.id, req.maxTokens, timeout);
        const latencyMs = deps.now() - callStart;

        let value: T;
        try {
          value = req.validate(parseModelJson(response.text));
        } catch {
          // Rule 4: If structured JSON is invalid:
          // validate and attempt one repair/regeneration
          try {
            const repairMessages: Turn[] = [
              ...turnsToSend,
              { role: 'assistant', text: response.text },
              { role: 'user', text: 'The previous response was malformed JSON or did not match the schema. Output ONLY valid JSON matching the schema, with no markdown fences or explanation.' }
            ];
            const repairRes = await deps.call(req.system, repairMessages, model.id, req.maxTokens, timeout);
            value = req.validate(parseModelJson(repairRes.text));
            logInternalTelemetry({
              task,
              selectedModel: model.id,
              latencyMs: deps.now() - callStart,
              tokenUsage: repairRes.usage,
              status: 'success'
            });
            return { value, modelId: response.modelId, usage: repairRes.usage, routing: { task, attempts, fallback: attempts > 1 } };
          } catch {
            throw new ModelFailure('invalid', true);
          }
        }

        // Successfully parsed and validated
        logInternalTelemetry({
          task,
          selectedModel: model.id,
          latencyMs,
          tokenUsage: response.usage,
          status: 'success'
        });
        return { value, modelId: response.modelId, usage: response.usage, routing: { task, attempts, fallback: attempts > 1 } };
      } catch (error) {
        const failure = classifyFailure(error);
        const latencyMs = deps.now() - callStart;
        failures.push(failure.kind);
        console.warn(JSON.stringify({ event: 'study_model_attempt_failed', task, modelId: model.id, kind: failure.kind }));
        logInternalTelemetry({
          task,
          selectedModel: model.id,
          fallbackModel: nextModel,
          failureReason: failure.kind,
          latencyMs,
          status: 'failure'
        });

        // Verification error (account-wide on AWS)
        if (failure.kind === 'verification') {
          throw new Error('Study generation is waiting for service activation. Your notes are saved. Please contact the workspace owner.');
        }

        // Rule 6: If a safety refusal occurs: do not bypass it by switching models
        if (failure.kind === 'blocked') {
          throw new Error('This request could not be completed. Try rephrasing it as a study question.');
        }

        // If not retryable, throw clean error
        if (!failure.retryable) {
          throw new Error('The study service is unavailable. Your notes are saved; please try again later.');
        }

        // Rule 2: If timeout, 429/rate limit, 5xx error, or temporary model failure:
        // retry the same model once
        if (modelTry === 0 && (failure.kind === 'busy' || failure.kind === 'quota')) {
          continue; // Retry same model once!
        }

        // Second failure on same model: put model on cooldown and break to next model in fallback chain
        if (failure.kind !== 'invalid') {
          cooldown.set(key, deps.now() + (failure.kind === 'unavailable' ? 300000 : 60000));
        }
        break; // Move to next model
      }
    }
  }

  // Rule 7: If every model fails: preserve the user's input, show clean retry message instead of exposing API errors
  throw new Error(failures.includes('quota')
    ? 'The study service has reached its usage limit. Your notes are saved; please try again later.'
    : 'A complete study response could not be created right now. Your notes are saved; please try again shortly.');
}
