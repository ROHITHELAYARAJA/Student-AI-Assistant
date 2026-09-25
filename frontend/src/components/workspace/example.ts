import { TurboStudyPack } from '../../types/turbo';

export function notePack(title: string, text: string): TurboStudyPack {
  return { id: `note-${Date.now()}`, topic: title, createdAt: new Date().toISOString(),
    notes: { topic: title, title, summary: 'Your imported notes', lastUpdated: new Date().toISOString(), keyTakeaways: [], sections: [{ heading: 'Your notes', content: text }] },
    roadmap: { topic: title, targetGoal: '', totalStages: 0, totalMilestones: 0, overallProgress: 0, stages: [] },
    quiz: { topic: title, title, timeLimitMinutes: 0, questions: [] }, flashcards: { topic: title, cards: [] },
    podcast: { topic: title, title, overview: '', audioDurationEstimate: '', segments: [] }, sources: [] };
}

export const examplePack: TurboStudyPack = {
  ...notePack('The science of learning', ''), id: 'blast-example', createdAt: '2026-09-25T00:00:00Z',
  roadmap: { topic: 'The science of learning', targetGoal: 'Build a study routine that sticks.', totalStages: 2, totalMilestones: 4, overallProgress: 0, stages: [
    { id: 's1', stageName: 'Understand your memory', description: 'A little science. A better way to study.', progressPercent: 0, milestones: [
      { id: 'm1', title: 'Meet active recall', duration: '4 min', completed: false, keyConcepts: ['Retrieval practice'], tasks: ['Read the notes, close them, and explain active recall in your own words.'] },
      { id: 'm2', title: 'Make room for spacing', duration: '5 min', completed: false, keyConcepts: ['Spaced practice'], tasks: ['Schedule two short review sessions on different days.'] }
    ] },
    { id: 's2', stageName: 'Put it into practice', description: 'Turn understanding into a repeatable habit.', progressPercent: 0, milestones: [
      { id: 'm3', title: 'Mix up your practice', duration: '5 min', completed: false, keyConcepts: ['Interleaving'], tasks: ['Alternate two related types of practice problems.'] },
      { id: 'm4', title: 'Check what you know', duration: '3 min', completed: false, keyConcepts: ['Feedback'], tasks: ['Take the quiz. Review the explanation for each answer.'] }
    ] }
  ] },
  notes: { topic: 'The science of learning', title: 'Small habits. Lasting knowledge.', lastUpdated: 'Example', summary: 'Effective studying is about what you do with information. Retrieve it, revisit it, and use feedback to find the gaps.', keyTakeaways: ['Try to recall before you reread.', 'Spread practice across several sessions.', 'Use feedback to correct misunderstandings.'], sections: [
    { heading: '01 · Retrieve, don’t just reread', content: 'Active recall means bringing information to mind without looking at the answer. Close your notes and explain a concept, answer a question, or sketch a process from memory. Then check your work.', bulletPoints: ['Start with a short question.', 'Attempt an answer before revealing it.', 'Correct mistakes with the source in front of you.'] },
    { heading: '02 · Give learning some space', content: 'Spaced practice distributes learning across time. Instead of repeating the same material in one long sitting, return to it in shorter sessions. The right interval depends on the material and when you need to remember it.' },
    { heading: '03 · Learn to choose the method', content: 'Interleaving mixes related problem types. It can help you practice identifying which method a problem needs. Begin with a basic understanding, then alternate problems and explain why each method fits.' }
  ] },
  flashcards: { topic: 'The science of learning', cards: [
    { id: 'c1', front: 'What is active recall?', back: 'Retrieving information from memory without looking at the answer, then checking it.', category: 'Memory', masteryLevel: 'new' },
    { id: 'c2', front: 'How does spaced practice differ from cramming?', back: 'Practice is distributed across separate sessions rather than concentrated into one sitting.', category: 'Practice', masteryLevel: 'new' },
    { id: 'c3', front: 'What does interleaving help you practice?', back: 'Choosing the appropriate method by mixing related problem types.', category: 'Practice', masteryLevel: 'new' },
    { id: 'c4', front: 'Why check your answer after recall?', back: 'Feedback helps you identify and correct gaps or misunderstandings.', category: 'Feedback', masteryLevel: 'new' }
  ] },
  quiz: { topic: 'The science of learning', title: 'A quick knowledge check', timeLimitMinutes: 3, questions: [
    { id: 'q1', question: 'Which activity is an example of active recall?', options: ['Highlighting every paragraph', 'Explaining a concept with your notes closed', 'Copying the same sentence repeatedly', 'Watching a lesson without pausing'], correctIndex: 1, explanation: 'Explaining from memory requires retrieval. Check the explanation against your notes afterward.' },
    { id: 'q2', question: 'What is the central idea of spaced practice?', options: ['Study everything in one session', 'Avoid revisiting old material', 'Distribute practice across time', 'Only study immediately before a test'], correctIndex: 2, explanation: 'Spaced practice means returning to material over multiple sessions.' },
    { id: 'q3', question: 'What should you do after discovering a mistake in your recall?', options: ['Check the source and correct your understanding', 'Ignore it and move on', 'Assume your memory is always right', 'Stop practicing the topic'], correctIndex: 0, explanation: 'Feedback helps you correct errors and get more from retrieval practice.' }
  ] },
  podcast: { topic: 'The science of learning', title: 'A better way to remember', audioDurationEstimate: 'About 1 min', overview: 'A short audio recap, read aloud by your browser.', segments: [
    { speaker: 'Host', line: 'A better study session starts with a question. What can you explain without looking at your notes?' },
    { speaker: 'Guide', line: 'That is active recall. Try an answer, then check it. Mistakes tell you where to focus next.' },
    { speaker: 'Host', line: 'Next, give your learning some space. Return to it across several sessions, rather than one long sitting.' },
    { speaker: 'Guide', line: 'And mix related practice problems when you understand the basics. You are learning to choose a method, not just repeat one.' }
  ] }
};
