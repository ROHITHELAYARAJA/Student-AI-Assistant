export type RouteName =
  | 'dashboard'
  | 'notes_learn'
  | 'notes_editor'
  | 'notes_quiz'
  | 'notes_flashcards'
  | 'notes_podcast'
  | 'notes_source'
  | 'notes_chat'
  | 'signup'
  | 'login';

export interface RouteState {
  routeName: RouteName;
  noteId?: string;
  fullPath: string;
}

export function parsePath(pathname: string): RouteState {
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '') || '/';

  if (cleanPath === '/signup') {
    return { routeName: 'signup', fullPath: '/signup' };
  }
  if (cleanPath === '/login' || cleanPath === '/signin') {
    return { routeName: 'login', fullPath: '/login' };
  }
  if (cleanPath === '/dashboard' || cleanPath === '/') {
    return { routeName: 'dashboard', fullPath: '/dashboard' };
  }

  const notesMatch = cleanPath.match(/^\/notes\/([^/]+)(\/(editor|quiz|flashcards|podcast|sources?|chat))?$/);
  if (notesMatch) {
    const noteId = notesMatch[1];
    const sub = notesMatch[3];
    if (sub === 'chat') return { routeName: 'notes_chat', noteId, fullPath: `/notes/${noteId}/chat` };
    if (sub === 'editor') {
      return { routeName: 'notes_editor', noteId, fullPath: `/notes/${noteId}/editor` };
    }
    if (sub === 'quiz') {
      return { routeName: 'notes_quiz', noteId, fullPath: `/notes/${noteId}/quiz` };
    }
    if (sub === 'flashcards') {
      return { routeName: 'notes_flashcards', noteId, fullPath: `/notes/${noteId}/flashcards` };
    }
    if (sub === 'podcast') {
      return { routeName: 'notes_podcast', noteId, fullPath: `/notes/${noteId}/podcast` };
    }
    if (sub === 'source' || sub === 'sources') {
      return { routeName: 'notes_source', noteId, fullPath: `/notes/${noteId}/source` };
    }
    return { routeName: 'notes_learn', noteId, fullPath: `/notes/${noteId}` };
  }

  return { routeName: 'dashboard', fullPath: '/dashboard' };
}

type RouteListener = (state: RouteState) => void;

class ClientRouter {
  private listeners: Set<RouteListener> = new Set();
  private currentState: RouteState;

  constructor() {
    this.currentState = typeof window !== 'undefined'
      ? parsePath(window.location.pathname)
      : { routeName: 'dashboard', fullPath: '/dashboard' };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        this.currentState = parsePath(window.location.pathname);
        this.notify();
      });
    }
  }

  public getState(): RouteState {
    return this.currentState;
  }

  public navigate(path: string, replace: boolean = false): void {
    if (typeof window === 'undefined') return;
    const newState = parsePath(path);
    if (replace) {
      window.history.replaceState({}, '', newState.fullPath);
    } else {
      window.history.pushState({}, '', newState.fullPath);
    }
    this.currentState = newState;
    this.notify();
  }

  public subscribe(listener: RouteListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.currentState);
    }
  }
}

export const router = new ClientRouter();
