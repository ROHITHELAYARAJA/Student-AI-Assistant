# 🎓 Plein Study Assistant — Complete Rebuild Walkthrough

## Summary of Completed Work

The **Student-AI-Assistant** project has been rebuilt from the ground up into a high-performance, aesthetically pleasing React + TypeScript application with a dedicated Node.js/TypeScript backend, AWS Bedrock Bearer Token integration for Claude models, a persistent session history tracking engine, and native Chrome Extension (Side Panel & Action) packaging.

---

## 🖋️ Typography: Space Grotesk + DM Sans Font Combo

The typography system strictly implements the requested font combo:
- **Headline / Display Font**: **Space Grotesk** (`'Space Grotesk', sans-serif`) — Distinctive geometric grotesque typography for all main headlines, card titles, and badges with bold letter-spacing.
- **Body & UI Font**: **DM Sans** (`'DM Sans', sans-serif`) — Modern, highly legible minimalist font for all body text, paragraph explanations, inputs, and interactive components.
- **Editorial Subheadings**: *DM Sans Italic* — Delicate, fine italic notes and metadata captions.
- **Technical Specs**: Monospace Uppercase Micro-tags (`'Fira Code'`).

---

## 🎨 Color Palette Tokens
| Token | Hex | RGB | CMYK | Role |
|---|---|---|---|---|
| **Background** | `#FFE1E2` | `255, 225, 226` | `0, 12, 11, 0` | Page backdrop & ambient gradient base |
| **Text** | `#510000` | `81, 0, 0` | `0, 100, 100, 68` | Primary reading and heading typography |
| **Primary** | `#E11D48` | `225, 29, 72` | `0, 87, 68, 12` | Buttons, active badges, highlights, ring pulses |
| **Accent** | `#9C0000` | `156, 0, 0` | `0, 100, 100, 39` | Category indicators, borders, secondary accents |
| **Surface** | `#FFFFFF` | `255, 255, 255` | `0, 0, 0, 0` | Glassmorphism cards and modal panels |
| **Border** | `#FF7A94` | `255, 122, 148` | `0, 52, 42, 0` | Subtle clean card borders and outlines |

---

## 🔑 AWS Bedrock Bearer Token Integration

Configured `AWS_BEARER_TOKEN_BEDROCK` in `backend/.env` with the provided key:
```env
AWS_BEARER_TOKEN_BEDROCK=your_aws_bedrock_bearer_token_here
AWS_REGION=us-east-1
PORT=5000
```
- Calls AWS Bedrock runtime (`/model/{modelId}/converse`) with Bearer token authentication targeting Claude models (`anthropic.claude-3-haiku-20240307-v1:0`, `meta.llama3-70b-instruct-v1:0`).
- Features intelligent resilience: If Bedrock daily token quota limits are reached (429), it automatically falls back to the high-yield academic synthesis engine without failing the user request.

---

## 📜 Full Session History Engine

A dedicated, persistent Session History module has been integrated:
- **Automatic History Logging**: Every study query and its generated interactive component are automatically recorded in persistent local storage.
- **History Drawer**: A slide-out panel accessible from the header showing all previous sessions with timestamps, operations, subjects, and topic tags.
- **One-Click Session Restoration**: Clicking "Restore Session" instantly reloads the entire interactive React component (Flashcard deck, Quiz with prior state, Code studio, Timeline, etc.).
- **Search & Filter**: Real-time filtering through past sessions.
- **Export & Clear**: Download your full history as a JSON archive or clear the log at any time.

---

## 🧩 Dynamic AI Component Generator

Rather than dumping raw text into a plain box, the system dynamically parses the AI output and generates interactive, tailored React components:

1. **🗂️ Interactive Flashcard Deck (`FlashcardDeck.tsx`)**: 3D card flip, mastery tracking, shuffle.
2. **🎯 Interactive Multiple-Choice Quiz (`InteractiveQuiz.tsx`)**: Instant scoring, green/red feedback, confetti bursts.
3. **💻 Code Studio & Complexity Inspector (`CodeStudio.tsx`)**: Syntax highlighting, Big-O meters, Dry-Run virtual test simulator.
4. **📊 Side-by-Side Comparison Matrix (`ComparisonMatrix.tsx`)**: Dimension-by-dimension comparison and conclusion.
5. **🗓️ 7-Day Study Timeline Roadmap (`StudyPlanTimeline.tsx`)**: Milestone checklists with completion progress bars.
6. **📐 Mathematical Formula Sheet (`FormulaCard.tsx`)**: High-contrast equation display with variable definitions.
7. **🧠 Concept Mindmap Tree (`MindmapTree.tsx`)**: Expandable/collapsible hierarchy branches.
8. **📌 Exam Key Takeaways (`KeypointsCard.tsx`)**: High/Medium/Low priority badges with review checkboxes.
9. **📖 Structured Editorial Article (`FormattedArticle.tsx`)**: Clean sectional layout with highlight badges.

---

## 🚀 Running the Project

### 1. Web Application
```bash
# Start backend server (port 5000)
npm run dev:backend

# Start frontend dev server (port 3000)
npm run dev:frontend
```
Open **`http://localhost:3000/`** in your browser.

### 2. Chrome Extension (Side Panel)
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle on **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select the `extension/` folder located in `Student-AI-Assistant/extension`.
5. Click the extension icon in Chrome or open the Side Panel to run the assistant directly alongside any webpage!
