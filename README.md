# 🎓 AI Study Assistant — Chrome Extension + Spring Boot Backend

> **100 Features** | **3 Input Modes** | **7 Categories** | **All Languages** | **Exam Ready**

---

## 🧭 Project Split

This project is built in two parts that work together.

| Part | Share | What It Does |
|---|---|---|
| Chrome Extension (Frontend) | 55% | The UI panel the student sees and uses inside Chrome |
| Spring Boot Backend | 45% | The brain — receives requests, builds prompts, calls Groq AI, returns answers |

The extension is what the student **sees**. The backend is what **thinks**.

---

## 🌟 What Makes This Different

Most study tools are boring and generic. This one is structured, beginner-friendly, and built for real student problems.

| Typical Tools | This Tool |
|---|---|
| Plain text only | Structured, formatted answers |
| No categories | 7 subject categories with 100 operations |
| Hard to understand | Simple words for beginners |
| One generic prompt | 100 unique prompts, each built differently |
| Copy-paste only | Type, speak with mic, or upload a file |
| Web only | Lives inside Chrome as a side panel |

---

## 🖥️ Frontend — Chrome Extension (35%)

The Chrome Extension is a **side panel** that opens inside the browser. The student never has to leave the page they are studying on.

### What the Extension Does

- 🪟 Opens as a side panel on the right side of Chrome
- ✍️ Lets the student give content in 3 ways
- 🔘 Shows 100 feature buttons organized in 7 category tabs
- 📡 Sends the content and chosen operation to the backend
- 💬 Displays the AI answer in a clean output box
- 📝 Has a notes panel to save answers

### 3 Input Modes

The student picks how they want to give content to the AI.

**Mode 1 — Type**
The student types or pastes their own text. There is a live character counter below the box. They can type a question, paste notes from a PDF, paste content from a website, or write anything they want to learn about.

**Mode 2 — Mic**
The student clicks the big circle mic button and speaks. Chrome converts their speech to text in real time using the built-in Web Speech API. The transcribed text appears in an editable box so the student can fix mistakes before sending. No external library is needed.

**Mode 3 — File Upload**
The student uploads a file from their computer. Supported formats are TXT, MD, CSV, PDF, and DOCX. The extension extracts the text from the file and shows it in a preview box. The student can then click any feature button to process that content.

### Webpage Selection (Bonus Input)

In addition to the 3 modes, the student can also highlight any text on the current webpage. The extension detects this selection automatically and shows a preview. If the student has not typed or uploaded anything, the webpage selection is used as the content.

### The 7 Category Tabs

At the top of the panel there are 7 tabs. Each tab shows a different group of feature buttons. The student clicks a tab to switch categories.

- 📚 Core Study
- 🎯 Exam Prep
- 💻 Coding
- 🤝 Interview Prep
- 🔢 Math and Science
- 🔬 Research and AI
- ✨ Extras

### Context Inputs

Above the feature buttons there are two small inputs.

- **Topic / Goal** — the student types what subject or goal this is about (optional but improves answers)
- **Language** — a dropdown to pick the programming language for coding features (Java, Python, JavaScript, C++, TypeScript, Go, Rust, SQL)

### Output Section

After clicking a feature button, the AI answer appears in the output box. The student can copy the answer to clipboard or send it to their notes panel with one click.

### Notes Panel

The notes panel is a persistent text area. It stays open between sessions. The student can save answers there, type their own notes, or receive AI results directly using the Send to Notes button. Notes are saved to Chrome storage so they survive closing and reopening the extension.

### Extension Files

| File | Purpose |
|---|---|
| manifest.json | Tells Chrome what the extension is and what permissions it needs |
| background.js | Opens the side panel when the student clicks the extension icon |
| side_panel.html | The structure of the entire UI |
| side_panel.css | All the visual styling, dark theme, layout |
| side_panel.js | All the logic — mode switching, mic, file reading, API calls, notes |

---

## ⚙️ Backend — Spring Boot (65%)

The backend is the core of the project. It receives the student's content and operation, builds a detailed prompt, sends it to the Groq AI API, and returns the answer.

### Technology Stack

- Java 17
- Spring Boot 3.2
- Spring WebFlux (WebClient for async HTTP calls)
- Groq API (llama-3.3-70b-versatile model)
- Lombok (reduces boilerplate code)
- Jackson (JSON parsing)
- Maven

### Backend Files

| File | Purpose |
|---|---|
| Application.java | Spring Boot entry point, starts the server |
| StudyAssistantController.java | REST controller, handles incoming HTTP requests |
| StudyAssistantService.java | Core logic — builds prompts, calls Groq, parses response |
| StudyRequest.java | Java model for the incoming request body |
| GroqResponse.java | Java model for parsing the Groq API JSON response |
| application.properties | Configuration for app name, Groq URL, and API key |

### How a Request Flows

1. 📤 The Chrome Extension sends a POST request to `/api/assist`
2. 🎛️ The controller receives it as a `StudyRequest` object
3. 🔍 The service reads the `operation` field to decide which prompt to build
4. 🧠 A detailed, structured prompt is built based on the operation and content
5. 🚀 The prompt is sent to Groq via WebClient
6. 💬 Groq returns a JSON response with the AI answer
7. 🔎 The service extracts the answer text from the JSON
8. 📨 The controller returns the answer as a plain string
9. ✅ The Chrome Extension displays it in the output box

### API Endpoints

| Endpoint | Method | What It Does |
|---|---|---|
| /api/assist | POST | Receives content and operation, returns AI answer |
| /api/operations | GET | Returns the full list of all 100 operation names |

### Request Fields

The POST body accepts these fields.

| Field | Type | Purpose |
|---|---|---|
| content | String | The text the student wants to process |
| operation | String | Which of the 100 features to run |
| researchGoal | String | The topic or goal (used in prompt building) |
| ProgrammingLanguage | String | Language for coding operations |
| subject | String | Subject context |
| studyTopic | String | Study topic context |

### Configuration

```
spring.application.name=ai.assistant
groq.api.url=https://api.groq.com/openai/v1/chat/completions
groq.api.key=${GROQ_KEY}
```

The API key is loaded from an environment variable called `GROQ_KEY`. Never put the real key in the code.

---

## ✨ All 100 Features

### Category 1 — Core Study (20 features)

| # | Operation | What It Does |
|---|---|---|
| 1 | summarize | Summarizes content in 2 clear sentences with key points |
| 2 | keypoints | Extracts exactly 10 exam-ready key points |
| 3 | notes | Creates structured study notes with headings and sections |
| 4 | define | Finds and defines all important terms with examples |
| 5 | examples | Gives 3 or more real-world examples with explanations |
| 6 | compare | Compares two topics across 5 dimensions with a verdict |
| 7 | formulas | Lists all formulas with variables, usage, and solved examples |
| 8 | diagram | Explains with an ASCII text diagram |
| 9 | timeline | Creates a chronological timeline with importance notes |
| 10 | pros_cons | Lists 4 pros and 4 cons with explanations and a verdict |
| 11 | why_how | Explains why something exists and how it works step by step |
| 12 | difficult | Simplifies the concept to a level a 10-year-old can follow |
| 13 | realworld | Lists 4 real-world applications across industries |
| 14 | related | Suggests 5 related topics in recommended study order |
| 15 | flashcards | Creates 10 question-and-answer flashcards |
| 16 | mnemonics | Creates 2 or more memory tricks with explanations |
| 17 | study_plan | Builds a 7-day study plan with daily tasks and time |
| 18 | check_understanding | Tests understanding with 3 questions and answers |
| 19 | quiz | Generates 5 multiple-choice questions with explanations |
| 20 | essay_write | Writes a full essay with intro, body paragraphs, and conclusion |

### Category 2 — Exam Prep (15 features)

| # | Operation | What It Does |
|---|---|---|
| 21 | exam_questions | Generates MCQ, short answer, and long answer exam questions |
| 22 | mistakes | Lists 5 common student mistakes with correct approaches |
| 23 | tricks | Gives 5 shortcuts that save time in exams |
| 24 | past_questions | Creates past-exam-style questions with model answers |
| 25 | answer_template | Shows the ideal structure for writing exam answers |
| 26 | score_predictor | Categorizes topics by HIGH, MEDIUM, LOW mark priority |
| 27 | highlights | Gives 5 must-know and 3 bonus exam points |
| 28 | quick_summary | Gives a 3-point one-minute revision |
| 29 | onepager | Creates a one-page cheat sheet for last-minute revision |
| 30 | revision | Builds a complete revision guide from basic to advanced |
| 31 | important | Ranks the 5 most important topics with study tips |
| 32 | weightage | Estimates mark weightage per topic with time advice |
| 33 | tips_exam | Gives 8 specific exam writing tips |
| 34 | time_mgmt | Creates a 3-hour exam time plan with section breakdown |
| 35 | stress | Gives 5 practical stress relief techniques for exam day |

### Category 3 — Coding (15 features)

| # | Operation | What It Does |
|---|---|---|
| 36 | code | Writes complete working code in the selected language |
| 37 | code_explain | Explains code line by line in simple words |
| 38 | optimize | Rewrites code to be faster with before/after complexity |
| 39 | debug | Finds all bugs and gives the corrected working code |
| 40 | convert | Converts code to the selected language |
| 41 | complexity | Analyzes time and space complexity for best, worst, average cases |
| 42 | test | Generates 8 test cases covering normal, edge, and error inputs |
| 43 | leetcode | Solves with brute force and optimal approach with dry run |
| 44 | algorithm | Explains algorithm steps, complexity, and shows code |
| 45 | datastructure | Explains structure, operations, and code implementation |
| 46 | code_compare | Compares two code approaches with a recommendation table |
| 47 | pattern | Identifies the coding pattern and gives a reusable template |
| 48 | pseudocode | Writes pseudocode then converts it to real code |
| 49 | project_idea | Suggests 5 portfolio project ideas with tech stack |
| 50 | roadmap | Creates a Beginner to Advanced learning roadmap |

### Language Support for Coding

All coding operations work in these languages selected from the dropdown.

| Language | Use Case |
|---|---|
| Java | Backend development, enterprise apps, Android |
| Python | Data science, ML, scripting, web |
| JavaScript | Web frontend, Node.js backend |
| C++ | Competitive programming, systems |
| TypeScript | Typed JavaScript for large projects |
| Go | Cloud services, microservices |
| Rust | Systems programming, performance |
| SQL | Database queries and design |

### Category 4 — Interview Prep (10 features)

| # | Operation | What It Does |
|---|---|---|
| 51 | interview_q | Gives 5 technical, 3 conceptual, 2 situational questions with answers |
| 52 | coding_pattern | Covers 10 key patterns like Sliding Window and Two Pointers |
| 53 | hr_questions | Gives 10 HR questions with what the interviewer really wants |
| 54 | system_design | Full system design with architecture diagram and components |
| 55 | resume_tips | Resume tips for each section with strong vs weak examples |
| 56 | answer_star | Writes a complete STAR method answer |
| 57 | mock_interview | Conducts a 5-question mock interview with feedback |
| 58 | company_prep | Company overview, tech stack, interview rounds, prep tips |
| 59 | salary_tips | Negotiation scripts and typical salary ranges |
| 60 | career_path | Entry to senior level progression with salaries |

### Category 5 — Math and Science (15 features)

| # | Operation | What It Does |
|---|---|---|
| 61 | math_solve | Solves step by step with formula and a practice problem |
| 62 | math_explain | Explains the concept, formula, and gives practice problems |
| 63 | derivatives | Finds derivative step by step naming the rule used |
| 64 | integrals | Evaluates integral step by step with technique named |
| 65 | graph | Explains domain, range, intercepts, shape, and key points |
| 66 | chemistry | Balances reactions and explains mechanisms |
| 67 | physics | Solves step by step with given, formula, units, concept |
| 68 | bio | Explains processes step by step with exam questions |
| 69 | stats | Calculates mean, median, mode, variance, standard deviation |
| 70 | probability | Identifies problem type, solves, and gives as fraction, decimal, percent |
| 71 | linear_algebra | Solves matrix operations with rule explanations |
| 72 | calculus | Identifies concept, solves with every step |
| 73 | geometry | Solves with formula, diagram, theorem named |
| 74 | trig | Solves with identities listed and both exact and decimal answer |
| 75 | number_theory | Proves theorem and explains number theory concept |

### Category 6 — Research and AI (15 features)

| # | Operation | What It Does |
|---|---|---|
| 76 | summarize_research | Breaks paper into Objective, Methodology, Findings, Conclusion |
| 77 | cite | Generates APA, MLA, IEEE, and Chicago citations |
| 78 | references | Suggests credible sources and search keywords |
| 79 | verify_citation | Gives credibility rating with red flags |
| 80 | related_research | Suggests 5 related research topics with questions |
| 81 | ai_explain | Explains AI concept with analogy, steps, applications |
| 82 | ml_model | Covers algorithm, when to use it, Python example |
| 83 | nn_arch | Explains layers, activations, loss function, architecture diagram |
| 84 | deep_learning | Covers math intuition, training, applications, key papers |
| 85 | nlp | Covers approaches, models, metrics, and Python example |
| 86 | cv | Covers algorithms, models, applications, and code example |
| 87 | data_viz | Recommends chart type and gives Python code example |
| 88 | ethics_ai | Covers bias, privacy, transparency, accountability, regulations |
| 89 | ai_trends | Lists top 5 AI trends for 2025 and 2026 with key labs |
| 90 | career_ai | Gives roles, skills, salaries, and a 6-month plan |

### Category 7 — Extras (10 features)

| # | Operation | What It Does |
|---|---|---|
| 91 | translate | Explains content in simple everyday English |
| 92 | voice_note | Organizes rough notes into clean structured material |
| 93 | ask_ai | Answers any open-ended question with examples |
| 94 | debate | Presents 4 strong arguments for and against a topic |
| 95 | story | Explains the concept as an engaging story |
| 96 | analogy | Creates 2 everyday analogies with breakdown |
| 97 | mindmap | Builds a text-based mind map with hierarchy |
| 98 | acronym | Creates 2 pronounceable acronyms for memorization |
| 99 | recommend | Lists best books, YouTube channels, courses, platforms |
| 100 | motivate | Gives a motivational message with 3 study tips |

---

## 📦 Installation

### Prerequisites

- ☕ Java 17 or higher
- 🔧 Maven 3.8 or higher
- 🔑 A Groq API key (free at console.groq.com)
- 🌐 Google Chrome (for the extension)

### Backend Setup

1. ⬇️ Clone or download the project
2. 🔐 Set your Groq API key as an environment variable named `GROQ_KEY`
3. ▶️ Run `mvn spring-boot:run` from the project root
4. ✅ The server starts on `http://localhost:8080`

### Extension Setup

1. 🌐 Open Chrome and go to `chrome://extensions/`
2. 🔀 Turn on Developer Mode in the top right
3. 📂 Click Load Unpacked
4. 📁 Select the extension folder
5. 📌 The extension icon appears in the Chrome toolbar
6. 🚀 Click it to open the side panel

---

## 🧪 Testing the API

Use Postman or curl to test the backend directly.

**Test summarize:**
Send a POST to `/api/assist` with content and operation set to `summarize`.

**Test coding:**
Send content with a problem description and operation set to `code`. Set `ProgrammingLanguage` to `Java` or `Python`.

**Get all operations:**
Send a GET to `/api/operations` to see all 100 operation names.

---

## 🔒 Security Note

The Groq API key is stored in an environment variable and never exposed in the code or the extension. The backend handles all AI communication. The extension only communicates with `localhost:8080`.

---

## 🚀 Roadmap

### ✅ Current Version
- 🎯 100 operations across 7 categories
- 🎙️ 3 input modes: type, mic, file upload
- 🤖 Groq AI integration with llama-3.3-70b-versatile
- 📝 Persistent notes panel
- 💻 Language selection for coding

### 🔮 Planned
- 👤 User accounts and saved history
- 📚 More subject categories
- 🛠️ Custom prompt builder
- 📄 Export answers as PDF
- 🧠 Personalized study paths based on weak areas

---

## 🙏 Credits

Built by **Rohith** — B.E. AI and Data Science, VSB Engineering College.

Made with focus and purpose for students who want to learn faster and stress less.

---

> 💡 **Stop googling. Start understanding. This tool was built so no student ever has to stare at a blank page again.**
