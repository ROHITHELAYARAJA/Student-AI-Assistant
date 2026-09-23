# ⚡ Turbo AI — Master Study Platform

> **Modern AI-Powered Study & Learning Web Application inspired by [Turbo AI](https://www.turbo.ai/)**  
> Complete with interactive roadmap tracks, live audio lecture podcasts, spaced-repetition flashcards, intelligent quizzes, RAG knowledge indexing, and Emma AI Tutor.

---

## 🧭 System Overview

Turbo AI is a full-stack, standalone web application that transforms lecture notes, syllabi, PDFs, and YouTube transcripts into dynamic, interactive study materials.

```
┌────────────────────────────────────────────────────────┐
│               Frontend: React 18 + Vite                │
│    Turbo Dark UI • Client Router • Web Speech Audio    │
├──────────────────────────┬─────────────────────────────┤
│   Study Hub Modules      │   Emma AI Study Copilot     │
│   • Learn Roadmaps       │   • 8-Expression Avatar     │
│   • Rich Notes Editor    │   • Context-Aware Chat      │
│   • Interactive Quiz     │   • Instant Prompt Actions  │
│   • 3D Flashcards Deck   │                             │
│   • Audio Podcast Stream │                             │
│   • Multi-Source RAG     │                             │
└──────────────────────────┴─────────────────────────────┘
                           │ HTTP / REST
                           ▼
┌────────────────────────────────────────────────────────┐
│            Backend: Node.js + TypeScript               │
│    Express REST API • Semantic RAG • Bedrock AI        │
├────────────────────────────────────────────────────────┤
│  • AWS Bedrock Bearer Token Runtime (Claude 3 Haiku)   │
│  • Local In-Memory BM25/Cosine Semantic RAG Engine    │
│  • High-Yield Academic Fallback Synthesis Engine       │
└────────────────────────────────────────────────────────┘
```

---

## 🌟 Core Features & Modules

### 1. 🏠 Interactive Dashboard (`/dashboard`)
- **Lecture Capture**: Record speech in real time with live microphone transcription.
- **Multi-Modal Input**: Drop documents, paste syllabus notes, or import YouTube lectures.
- **Progress Tracking**: View active courses, chapters, and recent completion percentages.

### 2. 🗺️ Guided Learning Roadmap (`/notes/:id`)
- Step-by-step sequential study checkpoints.
- Chapter tracking with visual completion statuses (Completed, Current, Checkpoint, Locked).
- Instant jump-in to resume studying where you left off.

### 3. 📝 Smart Notes Studio (`/notes/:id/editor`)
- Rich typography with Space Grotesk and DM Sans font pairings.
- Built-in formatting toolbar (Font family, size, bold, italic, lists, formulas, tables).
- Embedded side-drawer AI copilot to ask questions directly alongside your document.

### 4. 🎯 Interactive Quiz Player (`/notes/:id/quiz`)
- Multiple-choice questions categorized by topic and difficulty.
- Hints, real-time score tracking, and immediate feedback.
- Settings modal to customize quiz parameters.

### 5. 🗂️ Active Recall Flashcards (`/notes/:id/flashcards`)
- 3D card flipping for spaced-repetition memorization.
- Flexible deck sizes: Quick review (10), Standard (20), Comprehensive (30), Deep dive (50).
- Keyboard shortcuts and navigation.

### 6. 🎧 Audio Podcast Lecture Stream (`/notes/:id/podcast`)
- Dual-speaker dialogue format: Emma (Host) & Alex (Student).
- **Web Speech Synthesis Audio Engine**: Play/pause voice playback, dynamic speaker switching, and synchronised audio node highlights.

### 7. 📚 Knowledge Sources & RAG Indexing (`/notes/:id/source`)
- Ingest PDFs, slides, and notes into semantic chunk embeddings.
- Full vector retrieval engine for grounded, hallucination-free AI answers.

### 8. 👩‍🏫 Global Emma AI Copilot
- Available on every screen via the floating mascot button.
- Dynamic 8-state emotional reactions (Teaching, Thinking, Celebrating, Coding, Reading, Loving, Sleeping, Waving).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/ROHITHELAYARAJA/Student-AI-Assistant.git
cd Student-AI-Assistant

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### Environment Configuration

In `backend/.env`:
```env
PORT=5000
AWS_REGION=us-east-1
AWS_BEARER_TOKEN_BEDROCK=your_bearer_token_here
```
*(Note: If no Bedrock token is provided or rate limits are reached, the system automatically runs with the built-in resilient academic synthesis engine.)*

---

## 🏃 Running the Application

### Option A: Run Both Servers Simultaneously
```bash
# Start backend server (port 5000)
npm run dev:backend

# In a second terminal, start frontend dev server (port 3000)
npm run dev:frontend
```

Open **`http://localhost:3000/`** in your browser.

### Option B: Build for Production
```bash
# Build both frontend and backend
npm run build

# Start backend
npm run start:backend
```

---

## 📂 Project Structure

```
Student-AI-Assistant/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── assistController.ts     # Legacy & study assistant router
│   │   │   └── turboController.ts      # Turbo AI endpoints (roadmap, quiz, notes, RAG)
│   │   ├── services/
│   │   │   ├── aiService.ts            # AWS Bedrock Claude integration
│   │   │   ├── ragEngine.ts            # Semantic chunking and vector index
│   │   │   └── turboService.ts         # High-yield study generation engine
│   │   └── server.ts                   # Express application entry point
│   ├── .env                            # Environment variables
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── turbo/
│   │   │       ├── AuthView.tsx                # Sign up & login screens
│   │   │       ├── DashboardView.tsx           # Main Turbo study dashboard
│   │   │       ├── LearnRoadmapView.tsx        # Structured learning roadmap
│   │   │       ├── NotesEditorView.tsx         # Rich notes studio with copilot
│   │   │       ├── QuizPlayerView.tsx          # Interactive quiz engine
│   │   │       ├── FlashcardsGeneratorView.tsx # 3D flashcard player
│   │   │       ├── PodcastLectureView.tsx      # Dual-speaker audio player
│   │   │       ├── SourcesKnowledgeView.tsx    # RAG document management
│   │   │       └── EmmaTutorDrawer.tsx         # Global AI mascot tutor drawer
│   │   ├── services/
│   │   │   ├── router.ts               # Client-side hashless URL router
│   │   │   └── turboApi.ts             # API client connecting frontend to backend
│   │   ├── App.tsx                     # Main application component
│   │   └── main.tsx                    # React DOM entry
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── package.json                        # Root workspace scripts
└── walkthrough.md                      # Architecture and design documentation
```

---

## 🛡️ License

MIT License. Built for students, self-learners, and engineers everywhere.
