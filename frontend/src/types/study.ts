export type OperationCategory =
  | 'Core Study'
  | 'Exam Prep'
  | 'Coding'
  | 'Interview Prep'
  | 'Math and Science'
  | 'Research and AI'
  | 'Extras';

export type OutputComponentType =
  | 'flashcards'
  | 'quiz'
  | 'code'
  | 'matrix'
  | 'timeline'
  | 'formula'
  | 'mindmap'
  | 'keypoints'
  | 'article';

export interface OperationMeta {
  id: string;
  name: string;
  category: OperationCategory;
  description: string;
  outputComponent: OutputComponentType;
  icon: string;
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  category?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CodeBlockData {
  language: string;
  code: string;
  explanation: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  testCases?: Array<{ input: string; output: string; status?: string }>;
}

export interface ComparisonRow {
  aspect: string;
  itemA: string;
  itemB: string;
  verdict?: string;
}

export interface TimelineDay {
  day: number;
  title: string;
  duration: string;
  tasks: string[];
  tips?: string;
}

export interface FormulaItem {
  name: string;
  formula: string;
  variables: Array<{ symbol: string; meaning: string }>;
  example: string;
  calculationStep?: string;
}

export interface MindmapNode {
  id: string;
  label: string;
  children?: MindmapNode[];
}

export interface KeypointItem {
  id: number;
  point: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  examTip?: string;
}

export interface StructuredAiResponse {
  operation: string;
  componentType: OutputComponentType;
  title: string;
  summary: string;
  rawMarkdown: string;
  data: {
    flashcards?: FlashcardItem[];
    quiz?: QuizQuestion[];
    code?: CodeBlockData;
    comparison?: {
      entityA: string;
      entityB: string;
      rows: ComparisonRow[];
      verdict: string;
    };
    timeline?: TimelineDay[];
    formulas?: FormulaItem[];
    mindmap?: MindmapNode;
    keypoints?: KeypointItem[];
    article?: {
      sections: Array<{ heading: string; body: string; highlights?: string[] }>;
    };
  };
  metadata: {
    model: string;
    processingTimeMs: number;
    timestamp: string;
  };
}

export interface StudyRequest {
  content: string;
  operation: string;
  researchGoal?: string;
  programmingLanguage?: string;
  subject?: string;
  studyTopic?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  componentType: OutputComponentType;
}

export type InputMode = 'text' | 'voice' | 'file';
