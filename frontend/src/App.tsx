import React, { useState, useEffect } from 'react';
import { TurboTab, TurboRoadmap, TurboLesson, TurboNotes, TurboFlashcardDeck, TurboQuiz, TurboPodcastScript, IngestedDocument, TurboQuestion } from './types/turbo.js';
import { TurboSidebar } from './components/turbo/TurboSidebar.js';
import { TurboTopBar } from './components/turbo/TurboTopBar.js';
import { RoadmapView } from './components/turbo/RoadmapView.js';
import { LearnPlayer } from './components/turbo/LearnPlayer.js';
import { NotesView } from './components/turbo/NotesView.js';
import { QuizView } from './components/turbo/QuizView.js';
import { FlashcardsView } from './components/turbo/FlashcardsView.js';
import { PodcastView } from './components/turbo/PodcastView.js';
import { RagSourcesView } from './components/turbo/RagSourcesView.js';
import { EmmaTutorDrawer } from './components/turbo/EmmaTutorDrawer.js';
import { CreateTopicModal } from './components/turbo/CreateTopicModal.js';
import {
  fetchRoadmap,
  fetchLesson,
  fetchNotes,
  fetchFlashcards,
  fetchQuiz,
  fetchPodcast,
  ingestDocument,
  fetchDocuments,
  deleteDocument,
  queryRag
} from './services/turboApi.js';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TurboTab>('learn');
  const [activeTopic, setActiveTopic] = useState<string>(() => {
    return localStorage.getItem('turbo_active_topic') || 'Graph Algorithms & Dynamic Programming';
  });
  const [examDate, setExamDate] = useState<string>('In 2 Weeks');
  const [streakCount, setStreakCount] = useState<number>(5);

  const [roadmap, setRoadmap] = useState<TurboRoadmap | null>(null);
  const [lesson, setLesson] = useState<TurboLesson | null>(null);
  const [notes, setNotes] = useState<TurboNotes | null>(null);
  const [deck, setDeck] = useState<TurboFlashcardDeck | null>(null);
  const [quiz, setQuiz] = useState<TurboQuiz | null>(null);
  const [podcast, setPodcast] = useState<TurboPodcastScript | null>(null);
  const [documents, setDocuments] = useState<IngestedDocument[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isEmmaOpen, setIsEmmaOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [externalPrompt, setExternalPrompt] = useState<string>('');

  const loadAllModules = async (topic: string, examTimeline: string = 'In 2 Weeks') => {
    setIsLoading(true);
    try {
      localStorage.setItem('turbo_active_topic', topic);
      setActiveTopic(topic);
      setExamDate(examTimeline);

      const [rMap, lsn, nts, fCards, qz, pCast, docs] = await Promise.allSettled([
        fetchRoadmap(topic, examTimeline),
        fetchLesson(topic),
        fetchNotes(topic),
        fetchFlashcards(topic),
        fetchQuiz(topic),
        fetchPodcast(topic),
        fetchDocuments()
      ]);

      if (rMap.status === 'fulfilled') setRoadmap(rMap.value);
      if (lsn.status === 'fulfilled') setLesson(lsn.value);
      if (nts.status === 'fulfilled') setNotes(nts.value);
      if (fCards.status === 'fulfilled') setDeck(fCards.value);
      if (qz.status === 'fulfilled') setQuiz(qz.value);
      if (pCast.status === 'fulfilled') setPodcast(pCast.value);
      if (docs.status === 'fulfilled') setDocuments(docs.value);
    } catch {
      console.error('Error loading Turbo modules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllModules(activeTopic, examDate);
  }, []);

  const handleCreateNewTopic = async (newTopic: string, targetExam: string, sourceText?: string) => {
    if (sourceText) {
      try {
        await ingestDocument(`${newTopic} Notes`, sourceText, 'notes');
      } catch {}
    }
    await loadAllModules(newTopic, targetExam);
    setCurrentTab('learn');
  };

  const handleOpenEmmaWithPrompt = (prompt: string) => {
    setExternalPrompt(prompt);
    setIsEmmaOpen(true);
  };

  const handleExplainInChat = (q: TurboQuestion, studentAnswer: string, isCorrect: boolean) => {
    const prompt = `Hi Emma! In the interactive lesson on ${activeTopic}, I was asked: "${q.question}". I answered: "${studentAnswer}" (which was ${isCorrect ? 'correct' : 'incorrect'}). Can you explain the underlying concept and the common exam traps associated with this?`;
    handleOpenEmmaWithPrompt(prompt);
  };

  const handleToggleMilestone = (stageId: string, milestoneId: string) => {
    if (!roadmap) return;
    const updatedStages = roadmap.stages.map((stage) => {
      if (stage.id !== stageId) return stage;
      const updatedMilestones = stage.milestones.map((m) => {
        if (m.id !== milestoneId) return m;
        return { ...m, completed: !m.completed };
      });
      const finished = updatedMilestones.filter((m) => m.completed).length;
      const progressPercent = Math.round((finished / updatedMilestones.length) * 100);
      return {
        ...stage,
        milestones: updatedMilestones,
        progressPercent
      };
    });

    setRoadmap({
      ...roadmap,
      stages: updatedStages
    });
  };

  const handleIngestDoc = async (title: string, content: string, sourceType: 'text' | 'pdf' | 'slides' | 'notes') => {
    const res = await ingestDocument(title, content, sourceType);
    setDocuments((prev) => [res.document, ...prev]);
  };

  const handleDeleteDoc = async (id: string) => {
    await deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0C0C11] text-zinc-100 font-sans">
      <TurboSidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        activeTopic={activeTopic}
        streakCount={streakCount}
        examDate={examDate}
        onOpenCreate={() => setIsTopicModalOpen(true)}
        onToggleEmma={() => setIsEmmaOpen(!isEmmaOpen)}
        isEmmaOpen={isEmmaOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#0F0F14]">
        <TurboTopBar
          activeTopic={activeTopic}
          onOpenTopicModal={() => setIsTopicModalOpen(true)}
          onRefreshData={() => loadAllModules(activeTopic, examDate)}
          isLoading={isLoading}
          onToggleEmma={() => setIsEmmaOpen(!isEmmaOpen)}
          isEmmaOpen={isEmmaOpen}
          ragDocCount={documents.length}
        />

        <main className="flex-1 overflow-hidden flex flex-col relative">
          {currentTab === 'learn' && (
            <LearnPlayer
              lesson={lesson}
              isLoading={isLoading}
              onExplainInChat={handleExplainInChat}
              onRestartLesson={() => fetchLesson(activeTopic).then((l) => setLesson(l))}
            />
          )}

          {currentTab === 'roadmap' && (
            <RoadmapView
              roadmap={roadmap}
              isLoading={isLoading}
              onStartLesson={() => setCurrentTab('learn')}
              onOpenEmmaWithPrompt={handleOpenEmmaWithPrompt}
              onToggleMilestone={handleToggleMilestone}
            />
          )}

          {currentTab === 'notes' && (
            <NotesView
              notes={notes}
              isLoading={isLoading}
              onOpenEmmaWithPrompt={handleOpenEmmaWithPrompt}
            />
          )}

          {currentTab === 'quiz' && (
            <QuizView
              quiz={quiz}
              isLoading={isLoading}
              onOpenEmmaWithPrompt={handleOpenEmmaWithPrompt}
              onRetakeQuiz={() => fetchQuiz(activeTopic).then((q) => setQuiz(q))}
            />
          )}

          {currentTab === 'flashcards' && (
            <FlashcardsView
              deck={deck}
              isLoading={isLoading}
              onOpenEmmaWithPrompt={handleOpenEmmaWithPrompt}
            />
          )}

          {currentTab === 'podcast' && (
            <PodcastView
              podcast={podcast}
              isLoading={isLoading}
              onOpenEmmaWithPrompt={handleOpenEmmaWithPrompt}
            />
          )}

          {currentTab === 'rag' && (
            <RagSourcesView
              documents={documents}
              isLoading={isLoading}
              onIngest={handleIngestDoc}
              onDelete={handleDeleteDoc}
              onQueryRag={(q) => queryRag(q)}
            />
          )}
        </main>
      </div>

      <EmmaTutorDrawer
        isOpen={isEmmaOpen}
        onClose={() => setIsEmmaOpen(false)}
        activeTopic={activeTopic}
        externalPrompt={externalPrompt}
        onClearExternalPrompt={() => setExternalPrompt('')}
      />

      <CreateTopicModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onCreate={handleCreateNewTopic}
        isLoading={isLoading}
      />
    </div>
  );
};
