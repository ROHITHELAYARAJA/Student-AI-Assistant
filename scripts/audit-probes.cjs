// Offline diagnostics: synthetic inputs only; never loads .env or calls AWS.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
process.env.AWS_BEARER_TOKEN_BEDROCK = '';
process.env.BEDROCK_API_KEY = '';
const service = require(path.join(root, 'backend/dist/services/turboService.js'));
const { ragEngine } = require(path.join(root, 'backend/dist/services/ragEngine.js'));
const results = [];
const record = (name, evidence) => results.push({ name, status: 'issue reproduced', evidence });

(async () => {
  const doc = ragEngine.ingestDocument('Synthetic audit paragraph', 'photosynthesis '.repeat(1000), 'pdf');
  assert.equal(doc.chunks.length, 1);
  assert.ok(doc.chunks[0].content.length > 800);
  record('Chunk limit not enforced for long paragraphs', { chunks: doc.chunks.length, characters: doc.chunks[0].content.length });

  const notes = await service.generateNotes('Photosynthesis');
  assert.ok(notes.sections[0].formulas.some(x => x.includes('O(n log n)')));
  record('Unavailable AI returns unrelated instructional content', { topic: notes.topic, formulas: notes.sections[0].formulas });

  const sources = await service.generateSources('Photosynthesis');
  assert.ok(sources.every(x => /search|results|scholar\?q=/i.test(x.sourceUrl)));
  record('Generated sources are search URLs, not supporting citations', sources.map(x => x.sourceUrl));

  // Stub the provider before enabling a synthetic token; no real request can leave.
  const prompts = [];
  global.fetch = async (_url, init) => {
    prompts.push(JSON.parse(init.body).messages[0].content[0].text);
    return { ok: true, json: async () => ({ output: { message: { content: [{ text: JSON.stringify({ questions: [{}] }) }] } } }) };
  };
  process.env.AWS_BEARER_TOKEN_BEDROCK = 'offline-audit-stub';
  const quiz = await service.generateQuiz('Photosynthesis', 5);
  assert.deepEqual(quiz.questions, [{}]);
  record('Invalid quiz schema and wrong question count accepted', { requested: 5, returned: quiz.questions });

  prompts.length = 0;
  await service.processTurboChat('Explain photosynthesis', undefined, [{ sender: 'user', text: 'AUDIT_HISTORY_MARKER_4281' }]);
  assert.ok(prompts.length > 0);
  assert.ok(prompts.every(x => !x.includes('AUDIT_HISTORY_MARKER_4281')));
  record('Chat history omitted from all provider prompts', { providerCalls: prompts.length, historyIncluded: false });

  const output = JSON.stringify({ mode: 'offline synthetic diagnostic', results }, null, 2);
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs/audit-probe-results.json'), output + '\n');
  console.log(output);
})().catch(error => { console.error(error); process.exitCode = 1; });
