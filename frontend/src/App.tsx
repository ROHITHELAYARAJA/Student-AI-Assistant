import React, { useState, useEffect } from 'react';
import { router, RouteState } from './services/router.js';
import { AuthView } from './components/turbo/AuthView.js';
import { DashboardView } from './components/turbo/DashboardView.js';
import { LearnRoadmapView } from './components/turbo/LearnRoadmapView.js';
import { NotesEditorView } from './components/turbo/NotesEditorView.js';
import { QuizPlayerView } from './components/turbo/QuizPlayerView.js';
import { FlashcardsGeneratorView } from './components/turbo/FlashcardsGeneratorView.js';
import { PodcastLectureView } from './components/turbo/PodcastLectureView.js';
import { SourcesKnowledgeView } from './components/turbo/SourcesKnowledgeView.js';
import { BlastTutorDrawer } from './components/turbo/BlastTutorDrawer.js';
import { getStudyPack } from './services/turboApi.js';
import { Sparkles, X, Check } from 'lucide-react';

export const App: React.FC = () => {
  const [routeState, setRouteState] = useState<RouteState>(() => router.getState());
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => {
    const saved = localStorage.getItem('turbo_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { name: 'Student', email: 'student@example.com' };
      }
    }
    return { name: 'Student', email: 'student@example.com' };
  });

  const [activeTopic, setActiveTopic] = useState('How to learn Java');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isBlastOpen, setIsBlastOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = router.subscribe((state) => {
      setRouteState(state);
      if (state.noteId) {
        const pack = getStudyPack(state.noteId);
        if (pack) {
          setActiveTopic(pack.topic);
        }
      }
      window.scrollTo(0, 0);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (user: { name: string; email: string }) => {
    setCurrentUser(user);
    localStorage.setItem('turbo_user', JSON.stringify(user));
  };

  const handleStartNewLesson = (prompt: string) => {
    setActiveTopic(prompt);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-body antialiased select-none relative transition-colors duration-200">
      {routeState.routeName === 'signup' && (
        <AuthView initialMode="signup" onAuthSuccess={handleAuthSuccess} />
      )}

      {routeState.routeName === 'login' && (
        <AuthView initialMode="login" onAuthSuccess={handleAuthSuccess} />
      )}

      {routeState.routeName === 'dashboard' && (
        <DashboardView
          userName={currentUser?.name || 'Sarthak'}
          onStartNewLesson={handleStartNewLesson}
          onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
          onOpenEmma={() => setIsBlastOpen(true)}
          onOpenBlast={() => setIsBlastOpen(true)}
        />
      )}

      {routeState.routeName === 'notes_learn' && (
        <LearnRoadmapView
          noteId={routeState.noteId}
          topicTitle={activeTopic}
          onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
          onOpenEmma={() => setIsBlastOpen(true)}
          onOpenBlast={() => setIsBlastOpen(true)}
        />
      )}

      {routeState.routeName === 'notes_editor' && (
        <NotesEditorView
          noteId={routeState.noteId}
          topicTitle={activeTopic}
          onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
        />
      )}

      {routeState.routeName === 'notes_quiz' && (
        <QuizPlayerView
          noteId={routeState.noteId}
          topicTitle={activeTopic}
          onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
          onOpenEmma={() => setIsBlastOpen(true)}
          onOpenBlast={() => setIsBlastOpen(true)}
        />
      )}

      {routeState.routeName === 'notes_flashcards' && (
        <FlashcardsGeneratorView
          noteId={routeState.noteId}
          topicTitle={activeTopic}
          onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
          onOpenEmma={() => setIsBlastOpen(true)}
          onOpenBlast={() => setIsBlastOpen(true)}
        />
      )}

      {routeState.routeName === 'notes_podcast' && (
        <PodcastLectureView
          noteId={routeState.noteId}
          topicTitle={activeTopic}
          onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
          onOpenEmma={() => setIsBlastOpen(true)}
          onOpenBlast={() => setIsBlastOpen(true)}
        />
      )}

      {routeState.routeName === 'notes_source' && (
        <SourcesKnowledgeView
          noteId={routeState.noteId}
          topicTitle={activeTopic}
          onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
          onOpenEmma={() => setIsBlastOpen(true)}
          onOpenBlast={() => setIsBlastOpen(true)}
        />
      )}

      <BlastTutorDrawer
        isOpen={isBlastOpen}
        onClose={() => setIsBlastOpen(false)}
        activeTopic={activeTopic}
      />

      {isUpgradeModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181824] border border-[#2B2B40] rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center text-black font-black text-xs">
                  ★
                </span>
                <h2 className="text-lg font-bold text-white">Upgrade to Turbo Pro</h2>
              </div>
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Unlock unlimited audio lectures, infinite RAG document uploads, automated quiz generation, and priority Bedrock AI inference.
            </p>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2.5">
                <Check size={14} className="text-emerald-400" />
                <span>Unlimited AI Podcasts & Lecture Transcripts</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check size={14} className="text-emerald-400" />
                <span>Multi-GB PDF, Slides, and Textbook RAG Indexing</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check size={14} className="text-emerald-400" />
                <span>Smart Spaced-Repetition Review Scheduling</span>
              </div>
            </div>

            <button
              onClick={() => setIsUpgradeModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-yellow-400 transition-all active:scale-[0.98]"
            >
              Start 7-Day Free Trial
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
