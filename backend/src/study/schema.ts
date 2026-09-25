import { z } from 'zod';
const text = z.string().trim().min(1).max(16000);
const refs = z.array(z.string().max(120)).max(30).default([]);
const section = z.object({ heading: text, content: text, bulletPoints: z.array(text).max(15).default([]), formulas: z.array(text).max(10).default([]), codeSnippet: z.object({ language: text, code: text }).optional(), sourceIds: refs });
const question = z.object({ id: text, question: text, options: z.array(text).length(4), correctIndex: z.number().int().min(0).max(3), explanation: text, sourceIds: refs });
const card = z.object({ id: text, front: text, back: text, category: text, masteryLevel: z.enum(['new', 'learning', 'mastered']).default('new'), sourceIds: refs });
const milestone = z.object({ id: text, title: text, duration: text, completed: z.boolean().default(false), keyConcepts: z.array(text).min(1).max(8), tasks: z.array(text).min(1).max(8) });
export const GeneratedSchema = z.object({
  topic: z.string().trim().min(2).max(160),
  notes: z.object({ title: text.max(200), summary: text, keyTakeaways: z.array(text.max(4000)).min(2).max(10), sections: z.array(section).min(2).max(10) }),
  quiz: z.object({ title: text, timeLimitMinutes: z.number().int().min(1).max(120), questions: z.array(question).min(1).max(20) }),
  flashcards: z.object({ cards: z.array(card).min(1).max(30) }),
  roadmap: z.object({ targetGoal: text, stages: z.array(z.object({ id: text, stageName: text, description: text, milestones: z.array(milestone).min(1).max(6) })).min(1).max(6) }),
  podcast: z.object({ title: text, overview: text, audioDurationEstimate: text, segments: z.array(z.object({ speaker: text, line: text, sourceIds: refs })).min(2).max(24) })
});
export const GenerateRequest = z.object({ topic: z.string().trim().min(3).max(12000), documentIds: z.array(z.string().uuid()).max(8).default([]), questionCount: z.number().int().min(3).max(15).default(5), cardCount: z.number().int().min(4).max(20).default(8), difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'), language: z.string().trim().min(2).max(40).default('English') });
export type GenerateInput = z.infer<typeof GenerateRequest>;
export const TutorRequest = z.object({ message: z.string().trim().min(1).max(4000) });
export const TutorAnswer = z.object({ title: text, summary: text, sections: z.array(z.object({ heading: text, content: text, sourceIds: refs })).min(1).max(6), checkQuestion: text, sourceIds: refs });
export type SourcePage = { page: number; text: string };
export type Citation = { id: string; documentId: string; title: string; page: number; excerpt: string };
export function parseModelJson(raw: string) { const clean = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''); try { return JSON.parse(clean); } catch { throw new Error('The model returned incomplete study material. Please retry.'); } }
export function validateGenerated(raw: unknown, input: GenerateInput, citations: Citation[]) {
  const parsed = GeneratedSchema.parse(raw);
  if (parsed.quiz.questions.length !== input.questionCount || parsed.flashcards.cards.length !== input.cardCount) throw new Error('The model did not produce the requested number of questions and cards.');
  for (const group of [parsed.quiz.questions, parsed.flashcards.cards, parsed.roadmap.stages, parsed.roadmap.stages.flatMap(s=>s.milestones)]) if (new Set(group.map(x => x.id)).size !== group.length) throw new Error('The model returned duplicate item IDs.');
  const allowed = new Set(citations.map(c => c.id));
  const items = [...parsed.notes.sections, ...parsed.quiz.questions, ...parsed.flashcards.cards, ...parsed.podcast.segments];
  for (const item of items) { if (item.sourceIds.some(id => !allowed.has(id))) throw new Error('The model referenced a source that was not provided.'); }
  if (citations.length && parsed.notes.sections.some(s => !s.sourceIds.length)) throw new Error('Some generated notes are missing source references.');
  return parsed;
}
