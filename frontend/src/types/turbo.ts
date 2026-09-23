export type TurboTab =
  | 'roadmap'
  | 'learn'
  | 'notes'
  | 'quiz'
  | 'flashcards'
  | 'podcast'
  | 'rag';

export interface TurboRoadmapMilestone {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  keyConcepts: string[];
  tasks: string[];
}

export interface TurboRoadmapStage {
  id: string;
  stageName: string;
  description: string;
  progressPercent: number;
  milestones: TurboRoadmapMilestone[];
}

export interface TurboRoadmap {
  topic: string;
  examDate?: string;
  targetGoal: string;
  totalStages: number;
  totalMilestones: number;
  overallProgress: number;
  stages: TurboRoadmapStage[];
}

export interface TurboQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'fill_in_the_blank';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  conceptTag: string;
}

export interface TurboLesson {
  id: string;
  title: string;
  topic: string;
  estimatedMinutes: number;
  summary: string;
  questions: TurboQuestion[];
}

export interface TurboNotesSection {
  heading: string;
  content: string;
  bulletPoints?: string[];
  codeSnippet?: {
    language: string;
    code: string;
  };
  formulas?: string[];
}

export interface TurboNotes {
  topic: string;
  title: string;
  lastUpdated: string;
  summary: string;
  keyTakeaways: string[];
  sections: TurboNotesSection[];
}

export interface TurboFlashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  masteryLevel: 'new' | 'learning' | 'mastered';
}

export interface TurboFlashcardDeck {
  topic: string;
  cards: TurboFlashcard[];
}

export interface TurboQuizItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TurboQuiz {
  topic: string;
  title: string;
  timeLimitMinutes: number;
  questions: TurboQuizItem[];
}

export interface TurboPodcastSegment {
  speaker: 'Blast (AI Host)' | 'Emma (Host)' | 'Alex (Student)' | string;
  line: string;
}

export interface TurboPodcastScript {
  topic: string;
  title: string;
  audioDurationEstimate: string;
  overview: string;
  segments: TurboPodcastSegment[];
}

export interface DocumentChunk {
  id: string;
  docId: string;
  title: string;
  content: string;
  tokenCount: number;
  score?: number;
}

export interface IngestedDocument {
  id: string;
  title: string;
  sourceType: 'text' | 'pdf' | 'slides' | 'notes';
  rawContent: string;
  chunks: DocumentChunk[];
  createdAt: string;
}

export interface TurboSourceItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  keyTakeaways: string[];
  relevance: string;
  sourceUrl?: string;
}

export interface TurboStudyPack {
  id: string;
  topic: string;
  createdAt: string;
  roadmap: TurboRoadmap;
  notes: TurboNotes;
  quiz: TurboQuiz;
  flashcards: TurboFlashcardDeck;
  podcast: TurboPodcastScript;
  sources: TurboSourceItem[];
}
