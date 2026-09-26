import { BlastMascot } from './BlastMascot';
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Mic, Youtube, ArrowUp, ArrowUpRight, ArrowRight, ArrowLeft, Plus, Search, Home, Library, Star, BookOpen, FileText, Layers, Headphones, Check, X, ChevronRight, Download, Upload, Sparkles, Menu, CheckCircle2, HelpCircle, Settings2, Loader2, Compass, AlertCircle } from 'lucide-react';
import { router, RouteState } from '../../services/router';
import { TurboStudyPack } from '../../types/turbo';
import { AccountPanel } from './AccountPanel';
import { request, createStudy, followStudy, saveRemote, StudySettings, sendChat, ChatResponse } from '../../services/studyApi';
import { examplePack } from './example';
import { StudyTools, StudyTab, progress, readLocal } from './StudyTools';
import './workspace.css';
import './astra-theme.css';
import './astra-layout.css';
import { welcomeReply, isGreeting, isNotebookIntent } from './welcome';
import { RichMarkdown } from '../turbo/RichMarkdown';
import { UserProfile, getStoredProfile, logInUser, logOutUser } from '../../services/auth';
import { UserProfileMenu } from './UserProfileMenu';
import { SettingsModal } from './SettingsModal';
import { UpgradeModal } from './UpgradeModal';
import ModernLoginSignup from '../ui/modern-login-signup';

type Page = 'home' | 'library' | 'favorites';
const tabs: { id: StudyTab; label: string; icon: typeof BookOpen; suffix: string }[] = [
  { id: 'chat', label: 'Ask Blast', icon: Sparkles, suffix: '/chat' },
  { id: 'learn', label: 'Learn', icon: Compass, suffix: '' }, { id: 'notes', label: 'Notes', icon: FileText, suffix: '/editor' },
  { id: 'cards', label: 'Flashcards', icon: Layers, suffix: '/flashcards' }, { id: 'quiz', label: 'Quiz', icon: HelpCircle, suffix: '/quiz' },
  { id: 'audio', label: 'Listen', icon: Headphones, suffix: '/podcast' }, { id: 'sources', label: 'Sources', icon: BookOpen, suffix: '/source' }
];
function Mascot() { return <div className="supplied-mascot" aria-hidden="true"><img src="/blast-wordmark.png" alt="" /></div>; }

export function StudyWorkspace() {
  const [session,setSession]=useState<any>(null);

  const settings:StudySettings={questionCount:5,cardCount:8,difficulty:'beginner',language:'English'};
  const [conversation,setConversation]=useState<{role:'user'|'assistant';text:string;suggestedAction?:{type:'create_notebook';topic:string;label:string};quickPrompts?:string[]}[]>([]);
  const [connectionError,setConnectionError]=useState('');
  const [generationPhase,setGenerationPhase]=useState('Getting started');
  const [documentIds,setDocumentIds]=useState<string[]>([]);
  const [uploading,setUploading]=useState(false);
  const [youtube,setYoutube]=useState('');
  const [recording,setRecording]=useState(false);
  const recognition=useRef<any>(null);
  const [folder,setFolder]=useState('');
  const [route, setRoute] = useState<RouteState>(router.getState());
  const [page, setPage] = useState<Page>('home');
  const [packs, setPacks] = useState<TurboStudyPack[]>([]);
  const booted = useRef(false);
  const [favorites, setFavorites] = useState<string[]>(() => readLocal('blast_favorites', []));
  const [query, setQuery] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState<'import' | 'settings' | 'upgrade' | 'auth' | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getStoredProfile());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('blast_theme') as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });
  const [importTitle, setImportTitle] = useState('');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [name, setName] = useState<string>(() => userProfile.name || readLocal('blast_display_name', 'Rohith E'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'progress' | 'completed'>('all');
  const [sort, setSort] = useState('recent');
  const fileRef = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const active = route.noteId ? packs.find(p => p.id === route.noteId) || (route.noteId === examplePack.id ? examplePack : undefined) : undefined;
  const studyTab: StudyTab = ({ notes_chat: 'chat', notes_editor: 'notes', notes_flashcards: 'cards', notes_quiz: 'quiz', notes_podcast: 'audio', notes_source: 'sources' } as Record<string, StudyTab>)[route.routeName] || 'learn';
  const inStudy = !!route.noteId;
  const allPacks = packs.some(p=>p.id===examplePack.id) ? packs : [...packs,examplePack];
  const visiblePacks = allPacks.filter(p => (page !== 'favorites' || favorites.includes(p.id)) && p.topic.toLowerCase().includes(query.toLowerCase()) && (!folder || p.folder === folder) && (filter === 'all' || (filter === 'completed' ? progress(p) === 100 : progress(p) < 100))).sort((a, b) => sort === 'name' ? a.topic.localeCompare(b.topic) : b.createdAt.localeCompare(a.createdAt));
  async function refreshWorkspace(){
    try { const current=await request('/session');setSession(current);setConnectionError('');const data=await request('/notebooks');const sample=readLocal('blast_example',examplePack) as TurboStudyPack;const loaded=[...data.notebooks,sample];setPacks(loaded);setFavorites(loaded.filter((p:TurboStudyPack)=>p.favorite).map((p:TurboStudyPack)=>p.id)); }
    catch(e:any){setConnectionError(e.message);setSession(null);}
  }
  useEffect(()=>{if(booted.current)return;booted.current=true;void refreshWorkspace();const job=sessionStorage.getItem('blast_active_job');if(job){setGenerating(true);followStudy(job,setGenerationPhase).then(pack=>{setPacks(prev=>[pack,...prev.filter(p=>p.id!==pack.id)]);openPack(pack,'notes');}).catch(e=>setError(e.message)).finally(()=>setGenerating(false));}},[]);
  useEffect(()=>()=>recognition.current?.stop(),[]);
  useEffect(()=>{if(!modal){recognition.current?.stop();setRecording(false);}},[modal]);
  useEffect(() => router.subscribe(next => { setRoute(next); setMobileOpen(false); window.scrollTo({ top: 0 }); }), []);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 3500); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement | null;
    modalRef.current?.querySelector<HTMLElement>('button, input, textarea')?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal(null);
      if (e.key === 'Tab') { const controls = Array.from(modalRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not([hidden]), textarea') || []); const first = controls[0], last = controls[controls.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); } }
    };
    document.addEventListener('keydown', handleKey); return () => { document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, [modal]);
  function goHome(next: Page = 'home') { setConversation([]);setError('');setPage(next); setQuery(''); setFilter('all'); setFolder(''); router.navigate('/dashboard'); }
  function openPack(pack: TurboStudyPack, tab: StudyTab = 'learn') { router.navigate(`/notes/${pack.id}${tabs.find(t => t.id === tab)?.suffix || ''}`); }
  async function persist(pack:TurboStudyPack){
    if(pack.id==='blast-example'){localStorage.setItem('blast_example',JSON.stringify(pack));setPacks(prev=>[pack,...prev.filter(p=>p.id!==pack.id)]);return;}
    const saved=await saveRemote(pack);setPacks(prev=>[saved,...prev.filter(p=>p.id!==saved.id)]);
  }
  async function toggleFavorite(id:string){const p=allPacks.find(p=>p.id===id);if(!p)return;const favorite=!favorites.includes(id);try{await persist({...p,favorite});setFavorites(prev=>favorite?[...prev,id]:prev.filter(x=>x!==id));}catch(e:any){setToast(e.message);}}
  async function createNotebookForTopic(topic: string, title?: string) {
    const raw = topic.trim();
    if (!raw || generating) return;
    setGenerating(true);
    setError('');
    setGenerationPhase('Connecting to model');
    try {
      const ids = title ? active?.documentIds || [] : documentIds;
      const pack = await createStudy(ids.length ? 'Create a study set for ' + (title || raw) : raw, ids, settings, setGenerationPhase);
      setPacks(prev => [pack, ...prev.filter(p => p.id !== pack.id)]);
      setPrompt('');
      openPack(pack, 'notes');
      setToast('Your study notebook is ready.');
    } catch (e: any) {
      setError(e.message || 'Study generation is temporarily unavailable. Please try again.');
    } finally {
      setGenerating(false);
    }
  }
  async function generate(topic: string, title?: string) {
    const raw = topic.trim();
    if (!raw || generating) return;

    if (title || (isNotebookIntent(raw) && !isGreeting(raw)) || (documentIds.length > 0 && isNotebookIntent(raw))) {
      await createNotebookForTopic(raw, title);
      return;
    }

    if (raw.length < 2) {
      setError('Tell me a little more about what you’d like to learn.');
      return;
    }

    const currentHistory = conversation.map(c => ({ role: c.role, text: c.text }));
    setConversation(prev => [...prev, { role: 'user', text: raw }]);
    setPrompt('');
    setGenerating(true);
    setError('');
    setGenerationPhase('Connecting to model');

    try {
      const chatRes = await sendChat(raw, currentHistory);
      setConversation(prev => [
        ...prev,
        {
          role: 'assistant',
          text: chatRes.reply,
          suggestedAction: chatRes.suggestedAction,
          quickPrompts: chatRes.quickPrompts
        }
      ]);
    } catch (e: any) {
      const fallback = welcomeReply(raw);
      if (fallback) {
        setConversation(prev => [
          ...prev,
          {
            role: 'assistant',
            text: fallback,
            suggestedAction: {
              type: 'create_notebook',
              topic: 'Flask commands',
              label: 'Create notebook on Flask commands'
            },
            quickPrompts: [
              'Create study notebook on Flask commands',
              'Explain Flask routes and decorators',
              'How do I run a Flask app in debug mode?'
            ]
          }
        ]);
      } else {
        setError('A response could not be reached right now. Please try again shortly.');
      }
    } finally {
      setGenerating(false);
    }
  }
  async function importFile(file?:File){if(!file)return;setImportError('');setUploading(true);try{const body=new FormData();body.append('file',file);const doc=await request('/documents',{method:'POST',body});setDocumentIds([doc.id]);setImportTitle(file.name.replace(/\.[^.]+$/,''));setImportText(doc.text);setToast(doc.notice||doc.pageCount+' source pages ready.');}catch(e:any){setImportError(e.message);}finally{setUploading(false);}}
  async function saveImport(){if(!importTitle.trim()||!importText.trim())return;setUploading(true);try{const pack=await request<TurboStudyPack>('/notebooks',{method:'POST',body:JSON.stringify({topic:importTitle.trim(),text:importText.trim(),documentIds})});setPacks(prev=>[pack,...prev]);setModal(null);setImportText('');setImportTitle('');setDocumentIds([]);openPack(pack,'notes');setToast('Your source notebook is saved.');}catch(e:any){setImportError(e.message);}finally{setUploading(false);}}
  async function importYoutube(){setUploading(true);setImportError('');try{const doc=await request('/documents/youtube',{method:'POST',body:JSON.stringify({url:youtube})});setDocumentIds([doc.id]);setImportTitle(doc.title);setImportText(doc.text);}catch(e:any){setImportError(e.message);}finally{setUploading(false);}}
  function recordLecture(){if(recording){recognition.current?.stop();return;}const Speech=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;if(!Speech){setImportError('Live transcription is not supported by this browser. Open Blast in Chrome or Edge, or paste a transcript.');return;}const rec=new Speech();rec.continuous=true;rec.interimResults=false;rec.lang='en-US';rec.onresult=(e:any)=>{let text='';for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)text+=e.results[i][0].transcript+' ';setImportText(prev=>prev+' '+text);setDocumentIds([]);};rec.onerror=()=>{setImportError('Microphone transcription stopped. Check browser permission or paste your transcript.');setRecording(false);};rec.onend=()=>setRecording(false);recognition.current=rec;rec.start();setRecording(true);}
  function exportNotes(pack: TurboStudyPack) { const content = `# ${pack.notes.title}\n\n${pack.notes.summary}\n\n${pack.notes.sections.map(s => `## ${s.heading}\n\n${s.content}\n${(s.bulletPoints || []).map(b => `- ${b}`).join('\n')}\n${(s.formulas || []).join('\n')}\n${s.codeSnippet ? '\n```' + s.codeSnippet.language + '\n' + s.codeSnippet.code + '\n```' : ''}`).join('\n\n')}`; const url = URL.createObjectURL(new Blob([content], { type: 'text/markdown' })); const a = document.createElement('a'); a.href = url; a.download = `${pack.topic.replace(/[^a-z0-9]/gi, '-').slice(0, 70)}.md`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  const motionProps = reducedMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };
  const composer=<form className={`topic-composer ${generating?'busy':''}`} onSubmit={e=>{e.preventDefault();generate(prompt);}}>
    <label className="sr-only" htmlFor="study-topic">What would you like to learn?</label><textarea id="study-topic" ref={promptRef} value={prompt} onChange={e=>setPrompt(e.target.value)} disabled={generating} maxLength={4000} placeholder={conversation.length?'Ask a question, or tell me what you want to learn…':'Explain eigenvalues simply…'} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();generate(prompt);}}}/>
    <div className="composer-toolbar"><button type="button" className="attachment-button" onClick={()=>{setModal('import');setImportError('');}}><Mic size={17}/>Record</button><button type="button" className="attachment-button" onClick={()=>{setModal('import');setImportError('');}}><Upload size={17}/>Upload</button><button type="button" className="attachment-button" onClick={()=>{setModal('import');setImportError('');setTimeout(()=>document.getElementById('youtube-url')?.focus(),0);}}><Youtube size={17}/>YouTube</button><button className="send-button" aria-label="Send message" disabled={generating||!prompt.trim()}>{generating?<Loader2 className="spin" size={21}/>:<ArrowUp size={23}/>}</button></div>
  </form>;
  return <div className={`studio astra-studio ${inStudy?'lesson-mode':'home-mode'} ${conversation.length&&!inStudy?'conversation-mode':''}`}>
    <header className="astra-header">
      <button className="astra-brand" onClick={()=>goHome()} aria-label="Blast AI home">
        <BlastMascot size="avatar" decorative/>
        <strong>blast ai</strong>
      </button>
      {inStudy&&<div className="astra-breadcrumb"><button onClick={()=>goHome()}><Home size={16}/>Home</button><ChevronRight size={14}/><span>{active?.topic||'Lesson'}</span></div>}
      <div className="astra-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button className="text-button" onClick={()=>goHome('library')}>My lessons</button>
        <UserProfileMenu
          profile={userProfile}
          onOpenSettings={() => setModal('settings')}
          onOpenUpgrade={() => setModal('upgrade')}
          onOpenSignIn={() => setModal('auth')}
          onLogOut={() => {
            const updated = logOutUser();
            setUserProfile(updated);
            setName('');
            setToast('Logged out successfully.');
          }}
          currentTheme={theme === 'dark' ? 'Dark' : 'Light'}
          onToggleTheme={() => {
            const next = theme === 'dark' ? 'light' : 'dark';
            setTheme(next);
            try { localStorage.setItem('blast_theme', next); } catch {}
            setToast(`Switched to ${next} theme.`);
          }}
        />
      </div>
    </header>
    {inStudy&&<aside className="lesson-rail"><nav aria-label="Study tools">{tabs.map(t=><button key={t.id} className={studyTab===t.id?'active':''} aria-current={studyTab===t.id?'page':undefined} onClick={()=>active&&openPack(active,t.id)}><t.icon size={23}/><span>{t.label}</span></button>)}</nav></aside>}
    <div className="studio-main">
    <main className="studio-content">{!inStudy&&conversation.length>0?<div className="welcome-conversation"><button className="back-link" onClick={()=>goHome()}><ArrowLeft size={17}/>Back</button><div className="welcome-messages" aria-live="polite">{conversation.map((m,i)=><div key={i} className={m.role==='user'?'welcome-user':'welcome-assistant'}>{m.role==='assistant'&&<span className="reply-spark"><BlastMascot size="small" decorative/></span>}<div className="welcome-message-body">{m.role==='assistant'?<div className="assistant-rich-text"><RichMarkdown content={m.text}/></div>:<p>{m.text}</p>}{m.suggestedAction&&<div className="suggested-action-box" style={{marginTop:'14px'}}><button type="button" className="dark-button create-node-action" onClick={()=>createNotebookForTopic(m.suggestedAction!.topic)} style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'12px 20px',borderRadius:'14px',fontWeight:600,fontSize:'15px',cursor:'pointer'}}><Sparkles size={16}/><span>{m.suggestedAction.label}</span><ArrowRight size={15}/></button></div>}{m.quickPrompts&&m.quickPrompts.length>0&&<div className="quick-prompts-row" style={{display:'flex',flexWrap:'wrap',gap:'8px',marginTop:'12px'}}>{m.quickPrompts.map((qp,qi)=><button key={qi} type="button" className="subtle-button quick-prompt-pill" onClick={()=>isNotebookIntent(qp)?createNotebookForTopic(qp):generate(qp)} style={{fontSize:'13px',padding:'6px 14px',borderRadius:'20px',cursor:'pointer'}}>{qp}</button>)}</div>}</div></div>)}{generating&&<div className="welcome-assistant generation-status" role="status"><BlastMascot pose="working" size="small" decorative/>{generationPhase}…</div>}{error&&<div className="conversation-error" role="alert"><p>{error}</p><button className="text-button" onClick={()=>{const last=conversation.filter(m=>m.role==='user').slice(-1)[0];if(last){setPrompt(last.text);setError('');promptRef.current?.focus();}}}>Edit and try again</button></div>}</div><div className="conversation-input">{composer}</div></div>:!inStudy ? <motion.div key={page} {...motionProps}>
      {page==='home'?<section className="astra-welcome"><div className="astra-start"><span className="workspace-kicker"><span/> YOUR PERSONAL LEARNING SPACE</span><h1>Make room for<br/><em>your next idea.</em></h1><p className="astra-intro">Bring your curiosity. Turn a question, a document, or a lecture into something you understand.</p>{composer}{error&&<p className="conversation-error" role="alert">{error}</p>}<div className="prompt-starters"><span>Try a starting point</span>{['Explain a difficult concept','Help me prepare for an exam','Create a study plan'].map(text=><button key={text} onClick={()=>{setPrompt(text);promptRef.current?.focus();}}>{text}<ArrowUpRight size={13}/></button>)}</div></div><aside className="astra-focus"><div className="focus-heading"><span>THE LEARNING STUDIO</span><Sparkles size={19}/></div><div className="focus-companion"><BlastMascot pose="reading" size="hero"/></div><h2>A little focus.<br/>A lasting difference.</h2><p>One place to understand, practise, and make it stick.</p><div className="study-methods"><span><FileText size={18}/><strong>Understand</strong><small>Notes with context</small></span><span><Layers size={18}/><strong>Remember</strong><small>Active recall</small></span><span><Headphones size={18}/><strong>Revisit</strong><small>Listen and reflect</small></span></div>{packs.length>0&&<button className="resume-lesson" onClick={()=>openPack(packs.find(p=>p.id!==examplePack.id)||examplePack)}><span className="resume-caption">PICK UP WHERE YOU LEFT OFF</span><strong>{(packs.find(p=>p.id!==examplePack.id)||examplePack).topic}</strong><span>Continue learning <ArrowRight size={16}/></span></button>}</aside></section>:<div className="page-heading"><h1>{page==='favorites'?'Your favorites':'Your lessons'}</h1><button className="subtle-button" onClick={()=>goHome()}>New lesson <Plus size={16}/></button></div>}
      <section className="library-section"><div className="section-heading"><h2>{page === 'favorites' ? 'Your favorites' : page === 'home' ? 'Your collection' : 'All lessons'}<span className="count-badge">{visiblePacks.length}</span></h2>{page === 'home' ? <button className="text-button" onClick={() => goHome('library')}>View library <ArrowRight size={14} /></button> : <button className="subtle-button" onClick={() => setModal('import')}><Plus size={15} /> Add notes</button>}</div><div className={`library-toolbar ${page==='home'?'home-library-toolbar':''}`}><div className="filter-tabs" aria-label="Filter notebooks">{(['all', 'progress', 'completed'] as const).map(f => <button key={f} aria-pressed={filter === f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f === 'all' ? 'All notebooks' : f === 'progress' ? 'In progress' : 'Completed'}</button>)}</div><div className="library-tools"><select aria-label="Filter by folder" value={folder} onChange={e=>setFolder(e.target.value)}><option value="">All folders</option>{[...new Set(packs.map(p=>p.folder).filter(Boolean))].map(f=><option key={f}>{f}</option>)}</select><label className="library-search"><Search size={15} /><input ref={searchRef} aria-label="Search notebooks" placeholder="Search notebooks" value={query} onChange={e => setQuery(e.target.value)} /></label><select aria-label="Sort notebooks" value={sort} onChange={e => setSort(e.target.value)}><option value="recent">Recent first</option><option value="name">A–Z</option></select></div></div><div className="notebook-grid astra-lesson-list">{visiblePacks.map((p, index) => <motion.article {...motionProps} key={p.id} className="notebook-card"><div className="notebook-card-top"><span className={`notebook-icon tone-${index % 3}`}><BookOpen size={21} /></span><button className={`favorite-button ${favorites.includes(p.id) ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(p.id)} aria-label={`${favorites.includes(p.id) ? 'Unfavorite' : 'Favorite'} ${p.topic}`} aria-pressed={favorites.includes(p.id)}><Star size={17} fill={favorites.includes(p.id) ? 'currentColor' : 'none'} /></button></div><button className="notebook-open" onClick={() => openPack(p)}>{p.id === examplePack.id && <span className="sample-label">EXAMPLE NOTEBOOK</span>}<h3>{p.topic}</h3><p>{p.notes.summary || 'A fresh space for your next discovery.'}</p></button><div className="notebook-meta"><span><FileText size={12} />{p.notes.sections.length} sections</span><span><Layers size={12} />{p.flashcards.cards.length} cards</span></div><div className="card-progress"><span style={{ width: `${progress(p)}%` }} /></div><div className="notebook-footer"><span>{progress(p) ? `${progress(p)}% explored` : 'Ready when you are'}</span><button aria-label={`Open ${p.topic}`} onClick={() => openPack(p)}><ArrowUpRight size={17} /></button></div></motion.article>)}{!query && page !== 'favorites' && filter === 'all' && <button className="new-card" onClick={() => setModal('import')}><span><Plus size={23} /></span><strong>Room for your next idea</strong><p>Add your notes and make<br />something of them.</p></button>}</div>{visiblePacks.length === 0 && <div className="empty-state"><Search size={28} /><h3>{page === 'favorites' ? 'Your favorites start here' : 'Nothing here just yet'}</h3><p>{page === 'favorites' ? 'Tap the star on a notebook to keep it close.' : 'Try another search or add a new notebook.'}</p><button className="subtle-button" onClick={() => goHome('library')}>See all notebooks</button></div>}</section>{connectionError&&<p className="connection-note">Your saved lessons couldn’t be loaded. <button onClick={()=>refreshWorkspace()}>Reconnect</button></p>}
    </motion.div> : !active ? <div className="empty-state"><BookOpen size={32} /><h1>Notebook not found</h1><p>This notebook isn’t saved on this device.</p><button className="dark-button" onClick={() => goHome()}>Back to your workspace</button></div> : <motion.div key={active.id} {...motionProps}>
      <button className="back-link" onClick={() => goHome('library')}><ArrowLeft size={15} />Back to library</button><div className="study-heading"><div className="lesson-cat"><BlastMascot pose={progress(active)===100?"graduate":"explorer"} size="small" decorative/></div><div><p className="eyebrow">{active.id === examplePack.id ? 'EXAMPLE NOTEBOOK · EXPLORE THE EXPERIENCE' : 'YOUR STUDY NOTEBOOK'}</p><h1>{active.topic}</h1><p>{active.id === examplePack.id ? 'A small introduction to learning better. Try any activity below.' : 'Your personal learning space'}</p></div><div className="notebook-actions"><input aria-label="Notebook folder" placeholder="Add to folder…" value={active.folder||''} maxLength={60} onChange={e=>setPacks(prev=>prev.map(p=>p.id===active.id?{...p,folder:e.target.value}:p))} onBlur={()=>{persist(active).catch(e=>setToast(e.message));}} /><button className="subtle-button" onClick={() => exportNotes(active)}><Download size={16} />Export notes</button></div></div><nav className="study-tabs duplicate-study-tabs" aria-label="Study tools">{tabs.map(t => <button key={t.id} className={studyTab === t.id ? 'active' : ''} aria-current={studyTab === t.id ? 'page' : undefined} onClick={() => openPack(active, t.id)}><t.icon size={17} />{t.label}</button>)}</nav>
      {studyTab==='learn'&&active.roadmap.stages.length>0&&<div className="lesson-continue"><button className="dark-button" onClick={()=>openPack(active,'notes')}>Continue <ArrowRight size={20}/></button><div><small>UP NEXT</small><strong>{active.roadmap.stages.flatMap(s=>s.milestones).find(m=>!m.completed)?.title||'Review what you’ve learned'}</strong></div><span>{progress(active)}% complete</span></div>}<motion.section key={`${active.id}-${studyTab}`} {...motionProps} className="study-panel"><StudyTools key={`${active.id}-${studyTab}`} pack={active} tab={studyTab} save={persist} notify={setToast} />{!active.roadmap.stages.length && studyTab !== 'sources' && <div className="generate-tools"><button className="dark-button" disabled={generating} onClick={() => { const text = active.notes.sections.map(s => s.content).join('\n'); if (!active.documentIds?.length && text.length > 12000) { setError('For now, generate activities from a notebook with fewer than 12,000 characters. Your full notes are still saved.'); return; } generate(`Create study materials from these notes: ${text}`, active.topic); }}>{generating ? <Loader2 className="spin" size={16} /> : <Sparkles size={16} />}Generate study activities</button>{error && <p className="inline-error" role="alert">{error}</p>}</div>}</motion.section><div className="bottom-note"><BookOpen size={14} /><span>Learning is a journey. Make this space your own.</span></div>
    </motion.div>}</main></div>
    <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="studio-toast" role="status"><CheckCircle2 size={17} />{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={14} /></button></motion.div>}</AnimatePresence>
    {modal === 'settings' && (
      <SettingsModal
        profile={userProfile}
        onClose={() => setModal(null)}
        onUpdateProfile={(updated) => {
          setUserProfile(updated);
          setName(updated.name);
          setToast('Profile updated');
        }}
        onOpenUpgrade={() => setModal('upgrade')}
        onOpenLibrary={() => {
          setModal(null);
          goHome('library');
        }}
        onOpenDraftUploads={() => {
          setModal('import');
          setToast('Draft recordings and uploads');
        }}
        onLogOut={() => {
          const updated = logOutUser();
          setUserProfile(updated);
          setName('');
          setModal(null);
          setToast('Logged out successfully.');
        }}
      />
    )}

    {modal === 'upgrade' && (
      <UpgradeModal
        profile={userProfile}
        onClose={() => setModal(null)}
        onPlanUpgraded={(updated) => {
          setUserProfile(updated);
          setToast('Welcome to Blast AI Pro!');
        }}
      />
    )}

    {modal === 'auth' && (
      <div
        className="modal-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'rgba(5, 5, 8, 0.88)',
          backdropFilter: 'blur(8px)',
          overflowY: 'auto'
        }}
      >
        <ModernLoginSignup
          onSuccess={(user) => {
            const updated = logInUser(user?.name, user?.email);
            setUserProfile(updated);
            setName(updated.name);
            setModal(null);
            setToast(`Welcome back, ${updated.name}!`);
          }}
          onCancel={() => setModal(null)}
        />
      </div>
    )}

    {modal === 'import' && (
      <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null); }}>
        <div ref={modalRef} className="studio-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <button className="modal-close icon-button" aria-label="Close dialog" onClick={() => setModal(null)}>
            <X size={20} />
          </button>
          <span className="modal-icon">
            <FileText size={25} />
          </span>
          <h2 id="modal-title">Bring your notes along.</h2>
          <p>
            Paste your text or import a text file. Your sources are saved privately on the study server and sent to the model only when you generate or ask a question.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,.md,.png,.jpg,.jpeg,application/pdf,text/plain,text/markdown,image/png,image/jpeg"
            hidden
            onChange={e => {
              importFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button
            className="file-drop"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              importFile(e.dataTransfer.files[0]);
            }}
          >
            <Upload size={21} />
            <strong>{uploading ? 'Reading your source…' : 'Choose a file or drop it here'}</strong>
            <small>PDF, TXT, Markdown or image · up to 10 MB</small>
          </button>
          <div className="import-alternatives">
            <button type="button" className="subtle-button" onClick={recordLecture}>
              {recording ? 'Stop transcription' : 'Record a lecture'}
            </button>
            <small>{recording ? 'Listening… your transcript appears below.' : 'Live speech transcription where supported'}</small>
          </div>
          <label className="field-label" htmlFor="youtube-url">Or import a YouTube transcript</label>
          <div className="youtube-input">
            <input
              id="youtube-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=…"
              value={youtube}
              onChange={e => setYoutube(e.target.value)}
            />
            <button className="subtle-button" disabled={uploading || !youtube} onClick={importYoutube}>
              Import
            </button>
          </div>
          <label className="field-label" htmlFor="import-title">Notebook title</label>
          <input
            id="import-title"
            placeholder="e.g. Biology · Chapter 3"
            value={importTitle}
            maxLength={120}
            onChange={e => setImportTitle(e.target.value)}
          />
          <label className="field-label" htmlFor="import-text">Your notes</label>
          <textarea
            id="import-text"
            placeholder="Paste something worth learning…"
            value={importText}
            maxLength={600000}
            onChange={e => {
              setImportText(e.target.value);
              setDocumentIds([]);
            }}
          />
          {importError && <p className="inline-error" role="alert">{importError}</p>}
          <button
            className="dark-button modal-submit"
            disabled={uploading || !importTitle.trim() || !importText.trim()}
            onClick={saveImport}
          >
            Add to my library <ArrowRight size={17} />
          </button>
        </div>
      </div>
    )}
  </div>;
}
