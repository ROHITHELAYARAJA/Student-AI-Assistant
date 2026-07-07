/*
  side_panel.js
  ─────────────
  This file contains ALL the logic (behaviour) of the extension.
  JavaScript makes the UI interactive — buttons work, API gets called,
  results appear, etc.

  HOW JS RUNS IN A CHROME EXTENSION SIDE PANEL:
  ─────────────────────────────────────────────
  The side panel is basically a mini webpage.
  Chrome loads side_panel.html, which loads this JS file.
  This JS can use special "chrome.*" APIs that normal websites cannot.
  For example: chrome.storage.local (save data), chrome.tabs (read tab info),
  chrome.scripting.executeScript (run code inside the webpage).
*/


/* ═══════════════════════════════════════════════════════
   SECTION 1: CONSTANTS
   These never change during the app's lifetime.
   Writing them at the top makes them easy to find and edit.
═════════════════════════════════════════════════════════ */

/*
  API_URL: the address of your Spring Boot backend.
  When user clicks a feature button, we send a POST request here.
  Your Spring Boot server must be running at localhost:8080.
*/
const API_URL = "http://localhost:8080/api/assist";

/*
  OP_LABELS: a lookup table (object) that maps operation codes
  to human-readable names shown in the output header.
  Example: OP_LABELS["summarize"] → "Summarize"
  We use this so the header says "SUMMARIZE" not "summarize".
*/
const OP_LABELS = {
  summarize: "Summarize", keypoints: "Key Points", notes: "Study Notes",
  define: "Definitions", examples: "Examples", compare: "Compare",
  formulas: "Formulas", diagram: "Diagram", timeline: "Timeline",
  pros_cons: "Pros & Cons", why_how: "Why & How", difficult: "Simplify",
  realworld: "Real World", related: "Related Topics", flashcards: "Flashcards",
  mnemonics: "Mnemonics", study_plan: "Study Plan",
  check_understanding: "Check Understanding", quiz: "Quiz",
  essay_write: "Write Essay", exam_questions: "Exam Questions",
  mistakes: "Common Mistakes", tricks: "Shortcuts & Tricks",
  past_questions: "Past Questions", answer_template: "Answer Template",
  score_predictor: "Score Predictor", highlights: "Highlights",
  quick_summary: "Quick Summary", onepager: "One Pager",
  revision: "Revision Guide", important: "Most Important",
  weightage: "Mark Weightage", tips_exam: "Exam Tips",
  time_mgmt: "Time Management", stress: "Stress Relief",
  code: "Write Code", code_explain: "Explain Code", optimize: "Optimize",
  debug: "Debug", convert: "Convert Language", complexity: "Complexity",
  test: "Test Cases", leetcode: "LeetCode Solve", algorithm: "Algorithm",
  datastructure: "Data Structure", code_compare: "Compare Code",
  pattern: "Identify Pattern", pseudocode: "Pseudocode",
  project_idea: "Project Ideas", roadmap: "Learning Roadmap",
  interview_q: "Interview Q&A", coding_pattern: "Coding Patterns",
  hr_questions: "HR Questions", system_design: "System Design",
  resume_tips: "Resume Tips", answer_star: "STAR Answer",
  mock_interview: "Mock Interview", company_prep: "Company Prep",
  salary_tips: "Salary Tips", career_path: "Career Path",
  math_solve: "Solve Math", math_explain: "Explain Math",
  derivatives: "Derivatives", integrals: "Integrals", graph: "Graph",
  chemistry: "Chemistry", physics: "Physics", bio: "Biology",
  stats: "Statistics", probability: "Probability",
  linear_algebra: "Linear Algebra", calculus: "Calculus",
  geometry: "Geometry", trig: "Trigonometry", number_theory: "Number Theory",
  summarize_research: "Research Summary", cite: "Generate Citation",
  references: "References", verify_citation: "Verify Citation",
  related_research: "Related Research", ai_explain: "Explain AI",
  ml_model: "ML Model", nn_arch: "Neural Network",
  deep_learning: "Deep Learning", nlp: "NLP", cv: "Computer Vision",
  data_viz: "Data Visualization", ethics_ai: "AI Ethics",
  ai_trends: "AI Trends", career_ai: "AI Career",
  translate: "Simplify English", voice_note: "Clean Notes",
  ask_ai: "Ask AI", debate: "Debate Both Sides", story: "Explain as Story",
  analogy: "Analogy", mindmap: "Mind Map", acronym: "Acronym",
  recommend: "Recommend Resources", motivate: "Motivate Me"
};


/* ═══════════════════════════════════════════════════════
   SECTION 2: DOM REFERENCES
   "DOM" = Document Object Model = the HTML elements on the page.
   document.getElementById("someId") finds an element by its id="someId".
   We store these in variables so we don't have to search the DOM
   every time we need them (it's faster and cleaner).
═════════════════════════════════════════════════════════ */

// Header buttons
const notesToggleBtn = document.getElementById("notesToggleBtn");
const clearBtn       = document.getElementById("clearBtn");

// Tab navigation bar
const tabBar         = document.getElementById("tabBar");

// Mode toggle buttons (the label elements)
const modeTypeLabel  = document.getElementById("modeTypeLabel");
const modeMicLabel   = document.getElementById("modeMicLabel");
const modeFileLabel  = document.getElementById("modeFileLabel");

// The three input panels (only one visible at a time)
const panelType      = document.getElementById("panelType");
const panelMic       = document.getElementById("panelMic");
const panelFile      = document.getElementById("panelFile");

// Type panel elements
const userTextArea   = document.getElementById("userTextArea");
const clearTextBtn   = document.getElementById("clearTextBtn");
const charCount      = document.getElementById("charCount");

// Mic panel elements
const micBtn         = document.getElementById("micBtn");
const micStatus      = document.getElementById("micStatus");
const micTranscript  = document.getElementById("micTranscript");
const clearMicBtn    = document.getElementById("clearMicBtn");
const micWarning     = document.getElementById("micWarning");

// File panel elements
const fileInput      = document.getElementById("fileInput");
const fileDropZone   = document.getElementById("fileDropZone");
const filePreview    = document.getElementById("filePreview");
const fileName       = document.getElementById("fileName");
const fileTextContent= document.getElementById("fileTextContent");
const removeFileBtn  = document.getElementById("removeFileBtn");

// Context bar (topic + language)
const topicInput     = document.getElementById("topicInput");
const langSelect     = document.getElementById("langSelect");

// Webpage selection bar
const selectionBar   = document.getElementById("selectionBar");

// Feature buttons grid
const opsPanel       = document.getElementById("opsPanel");

// Loading indicator
const loader         = document.getElementById("loader");
const loaderText     = document.getElementById("loaderText");

// Output section
const outputBox      = document.getElementById("outputBox");
const outputHeader   = document.getElementById("outputHeader");
const outputOpLabel  = document.getElementById("outputOpLabel");
const copyBtn        = document.getElementById("copyBtn");
const sendToNotesBtn = document.getElementById("sendToNotesBtn");

// Notes panel
const notesPanel     = document.getElementById("notesPanel");
const notesArea      = document.getElementById("notesArea");
const saveNotesBtn   = document.getElementById("saveNotesBtn");
const clearNotesBtn  = document.getElementById("clearNotesBtn");


/* ═══════════════════════════════════════════════════════
   SECTION 3: STATE VARIABLES
   These variables track the current state of the app.
   They can change as the user interacts with the UI.
═════════════════════════════════════════════════════════ */

let currentMode     = "type";   // which input mode is active: "type"|"mic"|"file"
let selectedText    = "";        // text user highlighted on the webpage
let lastResult      = "";        // the last AI result text (for copy button)
let activeOpBtn     = null;      // the last clicked op button (to reset its style)
let isRecording     = false;     // is the mic currently listening?
let recognition     = null;      // the SpeechRecognition object (created in mic setup)


/* ═══════════════════════════════════════════════════════
   SECTION 4: INITIALISATION
   Code that runs ONCE when the panel first opens.
   We load saved notes and start polling for selected text.
═════════════════════════════════════════════════════════ */

/*
  chrome.storage.local.get: reads saved data from Chrome's storage.
  It's like localStorage but works in extensions.
  We saved notes with key "study_notes", so we read with that key.
  The callback function runs AFTER the data is loaded (async).
*/
chrome.storage.local.get(["study_notes"], (data) => {
  // if there's a saved note, put it in the textarea
  if (data.study_notes) {
    notesArea.value = data.study_notes;
  }
});

/*
  setInterval: runs a function repeatedly every N milliseconds.
  Here we poll for webpage selected text every 800ms (0.8 seconds).
  Why poll? Because we can't get instant updates from the webpage.
  We have to keep asking: "hey, has the user selected anything?"
*/
setInterval(pollSelectedText, 800);


/* ═══════════════════════════════════════════════════════
   SECTION 5: TAB SWITCHING
   Handles clicking the 7 category tabs.
═════════════════════════════════════════════════════════ */

/*
  addEventListener("click", handler): listens for click events.
  We attach it to the tabBar CONTAINER (not each tab individually).
  Why? Because event bubbling: a click on a child tab "bubbles up"
  to the parent tabBar. This is called "event delegation" —
  one listener handles all child clicks. Efficient!
*/
tabBar.addEventListener("click", (e) => {
  /*
    e = the event object. e.target = the element that was clicked.
    closest(".tab") walks up the DOM tree from e.target until it
    finds an element with class "tab". This handles clicking the
    emoji inside the button too.
  */
  const tab = e.target.closest(".tab");
  if (!tab) return; // clicked on something that's not a tab — do nothing

  // data-cat="core" → tab.dataset.cat === "core"
  const cat = tab.dataset.cat;

  // remove "active" class from ALL tabs
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  // add "active" to the clicked tab (highlights it)
  tab.classList.add("active");

  // hide all op-groups
  document.querySelectorAll(".op-group").forEach(g => g.classList.remove("active"));
  // show the op-group matching this category
  const group = opsPanel.querySelector(`.op-group[data-cat="${cat}"]`);
  if (group) group.classList.add("active");
});


/* ═══════════════════════════════════════════════════════
   SECTION 6: INPUT MODE SWITCHING (Type / Mic / File)
═════════════════════════════════════════════════════════ */

/*
  We listen for change events on the radio inputs.
  querySelectorAll gets ALL matching elements as an array-like list.
  forEach loops over them.
*/
document.querySelectorAll('input[name="inputMode"]').forEach(radio => {
  radio.addEventListener("change", () => {
    // update our state variable
    currentMode = radio.value; // "type", "mic", or "file"

    // remove "active" styling from all mode labels
    document.querySelectorAll(".mode-btn").forEach(btn => btn.classList.remove("active"));
    // add "active" to the parent label of the selected radio
    radio.parentElement.classList.add("active");

    // hide all input panels
    panelType.classList.add("hidden");
    panelMic.classList.add("hidden");
    panelFile.classList.add("hidden");

    // show the correct panel
    if (currentMode === "type") panelType.classList.remove("hidden");
    if (currentMode === "mic")  panelMic.classList.remove("hidden");
    if (currentMode === "file") panelFile.classList.remove("hidden");
  });
});


/* ═══════════════════════════════════════════════════════
   SECTION 7: TYPE PANEL — live character counter
═════════════════════════════════════════════════════════ */

/*
  "input" event fires every time the user types or deletes a character.
  We update the character count display in real time.
*/
userTextArea.addEventListener("input", () => {
  const len = userTextArea.value.length; // .length = number of characters
  charCount.textContent = `${len} character${len !== 1 ? "s" : ""}`;
  // "character" vs "characters": ternary operator — condition ? ifTrue : ifFalse
});

// Clear button: empties the textarea and resets the counter
clearTextBtn.addEventListener("click", () => {
  userTextArea.value = "";       // empty string = clear the textarea
  charCount.textContent = "0 characters";
  userTextArea.focus();          // put cursor back in the textarea
});


/* ═══════════════════════════════════════════════════════
   SECTION 8: MICROPHONE — Speech Recognition
   Uses the Web Speech API built into Chrome.
   No external library needed!
   
   How Speech Recognition works:
   1. User clicks mic button
   2. Browser asks permission to use microphone
   3. Chrome listens to audio and converts speech → text
   4. The "result" event fires with the transcribed text
   5. We put that text in the micTranscript div
   6. User can then edit it and click any feature button
═════════════════════════════════════════════════════════ */

/*
  SpeechRecognition is available as window.SpeechRecognition
  or window.webkitSpeechRecognition in Chrome.
  The "||" means: try the first, if undefined try the second.
*/
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  // Browser doesn't support speech recognition
  // Show the warning message we put in the HTML
  micWarning.style.display = "block";
  micBtn.disabled = true; // can't use mic button
} else {
  // Browser supports it — set up the recognizer
  recognition = new SpeechRecognition();

  /*
    continuous: true = keep listening until user stops
    (default false = stops after first sentence)
  */
  recognition.continuous = true;

  /*
    interimResults: true = show partial results while speaking
    (live preview of what's being said)
    false = only show final result when you pause
  */
  recognition.interimResults = true;

  /*
    lang: language for recognition.
    "en-US" = American English. Change if needed.
  */
  recognition.lang = "en-US";

  /*
    onresult: fires every time there's a transcription update.
    event.results is an array of recognition results.
    Each result has a transcript (the text) and isFinal flag.
  */
  recognition.onresult = (event) => {
    let finalText   = ""; // confirmed/final speech
    let interimText = ""; // still being spoken (may change)

    /*
      Loop through all results.
      resultIndex: where the new results start (skip old ones).
    */
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalText += transcript; // confirmed — add to final
      } else {
        interimText += transcript; // still speaking — show as preview
      }
    }

    /*
      Update the editable div with the transcribed text.
      We show final text + interim text in different styles.
      innerHTML lets us use HTML tags inside the div.
    */
    micTranscript.innerHTML =
      escapeHtml(finalText) +
      (interimText
        ? `<span style="color:var(--muted)">${escapeHtml(interimText)}</span>`
        : "");
  };

  // onend: fires when recognition stops (user paused, or we called .stop())
  recognition.onend = () => {
    isRecording = false;
    micBtn.classList.remove("recording"); // remove red pulsing style
    micStatus.textContent = "Tap to speak";
    micBtn.querySelector(".mic-icon").textContent = "🎙️";
  };

  // onerror: fires if something goes wrong (mic denied, network error, etc.)
  recognition.onerror = (event) => {
    isRecording = false;
    micBtn.classList.remove("recording");
    micStatus.textContent = "Error — try again";
    console.error("Speech recognition error:", event.error);
  };

  // Mic button click: toggle recording on/off
  micBtn.addEventListener("click", () => {
    if (isRecording) {
      // currently recording — stop it
      recognition.stop();
      // onend handler above will clean up the UI
    } else {
      // not recording — start it
      micTranscript.innerHTML = ""; // clear previous transcript
      recognition.start();
      isRecording = true;
      micBtn.classList.add("recording");   // red pulsing style
      micStatus.textContent = "Listening...";
      micBtn.querySelector(".mic-icon").textContent = "⏹️"; // stop icon
    }
  });
}

// Clear transcribed mic text
clearMicBtn.addEventListener("click", () => {
  micTranscript.innerHTML = ""; // clear the editable div
  if (isRecording) {
    recognition.stop(); // also stop mic if still running
  }
});


/* ═══════════════════════════════════════════════════════
   SECTION 9: FILE UPLOAD
   User can upload TXT, PDF, DOCX, MD, CSV files.
   
   For PDF/DOCX we use the FileReader API to read the file.
   
   NOTE on PDF/DOCX:
   - TXT, MD, CSV: we read as plain text directly ✓
   - PDF: browser can read binary but not parse PDF structure.
     We attempt to extract readable characters from raw bytes.
     For full PDF parsing, you'd need a library like pdf.js.
   - DOCX: similar — we extract raw text, may include some XML noise.
     For clean DOCX, you'd need mammoth.js.
   
   For a beginner project, TXT files work perfectly.
   PDF/DOCX extraction is approximate but functional.
═════════════════════════════════════════════════════════ */

// Clicking the styled drop zone triggers the hidden file input
fileDropZone.addEventListener("click", () => {
  fileInput.click(); // programmatically clicks the real file input
});

/*
  "change" event on file input fires when user selects a file.
  event.target.files is a FileList of selected files.
  We only handle the first file: files[0]
*/
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) handleFile(file);
});

/*
  handleFile: reads the selected file and shows its content.
  This is an async function because FileReader is async.
*/
async function handleFile(file) {
  // Show the file name
  fileName.textContent = `📄 ${file.name}`;

  // Determine file type by extension
  const ext = file.name.split(".").pop().toLowerCase();
  // split(".") splits "report.pdf" into ["report","pdf"]
  // .pop() takes the last element = "pdf"
  // .toLowerCase() makes it case-insensitive

  let text = "";

  try {
    if (ext === "txt" || ext === "md" || ext === "csv") {
      /*
        readAsText: reads the file as a plain text string.
        This is the simplest case — works perfectly for .txt, .md, .csv
      */
      text = await readFileAsText(file);

    } else if (ext === "pdf") {
      /*
        PDF files are binary (not plain text).
        readAsText still works but gives garbled output.
        We use readAsText and then extract only printable ASCII characters.
        This is a simple approach — for production, use pdf.js library.
      */
      const raw = await readFileAsText(file);
      // Keep only printable characters (ASCII 32-126) + newlines
      text = raw.replace(/[^\x20-\x7E\n\r]/g, " ")
                .replace(/\s+/g, " ")     // collapse multiple spaces
                .trim();

      if (text.length < 50) {
        // If we couldn't extract much, tell the user
        text = "PDF text extraction is limited. For best results, copy and paste the PDF text into the Type panel instead.";
      }

    } else if (ext === "doc" || ext === "docx") {
      /*
        DOCX files are ZIP archives containing XML files.
        We try to extract the XML text from the binary.
        Crude but works for simple documents.
        For proper DOCX parsing, use the mammoth.js library.
      */
      const raw = await readFileAsText(file);
      // Look for text between XML tags (the actual content)
      const matches = raw.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
      if (matches.length > 0) {
        text = matches
          .map(m => m.replace(/<[^>]+>/g, "")) // remove the XML tags, keep content
          .join(" ")
          .trim();
      } else {
        text = "DOCX text extraction is limited. For best results, copy and paste the document text into the Type panel instead.";
      }

    } else {
      text = "Unsupported file type. Please use TXT, MD, or CSV files for best results.";
    }

  } catch (err) {
    text = "Could not read file: " + err.message;
  }

  // Put the extracted text in the preview textarea
  fileTextContent.value = text;

  // Show the preview section (hidden by default)
  fileDropZone.style.display = "none"; // hide the upload button
  filePreview.style.display  = "block"; // show the preview
}

/*
  readFileAsText: a helper function that wraps FileReader in a Promise.
  
  Why a Promise? FileReader is callback-based (old style).
  Wrapping it in a Promise lets us use "await" (modern style).
  
  How it works:
  - We create a Promise (a box that will have a value in the future)
  - Inside the Promise, we use FileReader to read the file
  - When reading is done, we call resolve(result) to fill the box
  - If it fails, we call reject(error) to mark it as failed
  - The caller uses "await" to wait for the box to be filled
*/
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result); // success
    reader.onerror = ()  => reject(new Error("File read failed"));
    reader.readAsText(file); // start reading
  });
}

// Remove file button: reset the file panel back to upload state
removeFileBtn.addEventListener("click", () => {
  fileInput.value       = "";     // clear the file input
  fileTextContent.value = "";     // clear extracted text
  fileName.textContent  = "";
  filePreview.style.display  = "none";   // hide preview
  fileDropZone.style.display = "";       // show upload zone again
});


/* ═══════════════════════════════════════════════════════
   SECTION 10: WEBPAGE SELECTION POLLING
   Every 0.8 seconds, we check if the user selected
   text on the current webpage.
   
   Why "polling" instead of an event?
   Chrome extensions can't directly listen to events on the webpage.
   We have to inject a script into the page and run it there.
   Polling (checking regularly) is the simplest approach.
═════════════════════════════════════════════════════════ */

async function pollSelectedText() {
  try {
    /*
      chrome.tabs.query: finds browser tabs matching the criteria.
      active: true = only the currently visible tab
      currentWindow: true = only in this browser window
      Returns an array; we destructure to get the first: [tab]
    */
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // No tab found, or tab has no ID — skip
    if (!tab || !tab.id) return;

    /*
      chrome.scripting.executeScript: runs a function INSIDE the webpage.
      target: which tab to run in
      func: the function to run (this runs in the webpage's context, not here)
      
      The function () => window.getSelection().toString().trim()
      reads whatever text the user has highlighted on the page.
      window.getSelection() = the browser's text selection object
      .toString() = converts it to a plain string
      .trim() = removes leading/trailing whitespace
    */
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString().trim()
    }).catch(() => null); // .catch(()=>null) = if it fails, return null (don't crash)

    // If script couldn't run (e.g. chrome:// pages block this) — skip
    if (!results || !results[0]) return;

    const text = results[0].result || "";

    // Only update UI if the selection actually changed (avoid flicker)
    if (text !== selectedText) {
      selectedText = text;
      updateSelectionBar();
    }
  } catch (_) {
    // Silent catch — some pages block scripting, that's OK
  }
}

// Updates the selection preview bar with the current selected text
function updateSelectionBar() {
  if (selectedText && selectedText.length > 0) {
    // Show a preview (max 120 characters + "…" if longer)
    const preview = selectedText.length > 120
      ? selectedText.slice(0, 120) + "…"  // slice(0,120) = first 120 chars
      : selectedText;
    selectionBar.textContent = `✅ Webpage selection: "${preview}"`;
    selectionBar.classList.add("has-text"); // green border via CSS
  } else {
    selectionBar.textContent = "🖱️ Or highlight text on any webpage — it auto-appears here";
    selectionBar.classList.remove("has-text");
  }
}


/* ═══════════════════════════════════════════════════════
   SECTION 11: GET CONTENT
   This function figures out WHAT TEXT to send to the AI.
   It checks which input mode is active and returns the text.
   Priority order: typed/mic/file input first, then webpage selection.
═════════════════════════════════════════════════════════ */

function getContentToSend() {
  if (currentMode === "type") {
    // Read from the typing textarea
    const text = userTextArea.value.trim();
    if (text) return text;

  } else if (currentMode === "mic") {
    /*
      micTranscript is a contenteditable div, not a textarea.
      We use .innerText (not .value) to get the text content.
      innerText = the visible text (ignores HTML tags).
    */
    const text = micTranscript.innerText.trim();
    if (text) return text;

  } else if (currentMode === "file") {
    // Read from the file content preview textarea
    const text = fileTextContent.value.trim();
    if (text) return text;
  }

  /*
    Fallback: if the user hasn't typed/spoken/uploaded,
    use the text they highlighted on the webpage.
    This maintains backward compatibility with the copy-paste workflow.
  */
  if (selectedText) return selectedText;

  // Nothing available — return empty string
  return "";
}


/* ═══════════════════════════════════════════════════════
   SECTION 12: OPERATION BUTTONS — the main feature handler
   When user clicks any of the 100 feature buttons,
   this code runs the AI request.
═════════════════════════════════════════════════════════ */

/*
  We use event delegation again: listen on the container (opsPanel),
  not on each individual button. One listener handles all 100 buttons.
*/
opsPanel.addEventListener("click", (e) => {
  const btn = e.target.closest(".op-btn"); // find the clicked button
  if (!btn) return; // clicked elsewhere in the grid — ignore
  const op = btn.dataset.op; // read data-op="summarize" etc.
  if (op) runOperation(op, btn);
});

/*
  runOperation: the main function that:
  1. Gets the user's content
  2. Sends it to the Spring Boot backend
  3. Displays the result

  async function = can use "await" inside it.
  await = pause here until the Promise resolves (non-blocking).
*/
async function runOperation(op, btn) {
  // Step 1: Get the content to analyze
  const content = getContentToSend();

  // If there's no content, show an error and stop
  if (!content) {
    showError("No content yet! Type in the text box, speak with mic, upload a file, or highlight text on a webpage.");
    return; // "return" exits the function early
  }

  // Step 2: Update UI to show loading state
  // Reset previous button's style
  if (activeOpBtn) {
    activeOpBtn.classList.remove("loading", "active-result");
  }
  activeOpBtn = btn; // remember which button is active
  btn.classList.add("loading"); // add loading style (blue border)

  setLoading(true, `Running: ${OP_LABELS[op] || op}...`); // show spinner
  clearOutput(); // clear old result

  // Step 3: Build the request body to send to Spring Boot
  /*
    JSON.stringify converts a JavaScript object to a JSON string.
    The object matches StudyRequest.java fields exactly.
    Spring Boot's @RequestBody annotation will parse this JSON
    into a StudyRequest Java object automatically.
  */
  const requestBody = {
    content:           content,                        // the text to analyze
    operation:         op,                             // which feature to run
    researchGoal:      topicInput.value.trim() || content.slice(0, 60), // topic
    ProgrammingLanguage: langSelect.value,             // selected language
    subject:           topicInput.value.trim(),        // same as goal
    studyTopic:        topicInput.value.trim()         // same as goal
  };

  // Step 4: Make the HTTP POST request to Spring Boot
  try {
    /*
      fetch() is the modern way to make HTTP requests from JavaScript.
      It returns a Promise that resolves to the Response object.
      We "await" it so execution pauses here until we get a response.
      
      method: "POST" = we're SENDING data (not just requesting a page)
      headers: metadata about our request
        Content-Type: "application/json" = we're sending JSON data
      body: the actual data, converted to a JSON string
    */
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
        // NOTE: We removed "Authorization" header because your Spring Boot
        // controller uses @CrossOrigin("*") and no security config.
        // If you add Spring Security later, add:
        // "Authorization": "Bearer YOUR_TOKEN_HERE"
      },
      body: JSON.stringify(requestBody)
    });

    /*
      response.ok is true if the HTTP status code is 200-299 (success).
      If it's 400, 500, etc., ok is false = something went wrong.
    */
    if (!response.ok) {
      // Try to read the error message from the server's response body
      const errText = await response.text().catch(() => "Unknown server error");
      throw new Error(`Server error ${response.status}: ${errText}`);
      // throw creates an Error and jumps to the catch block below
    }

    /*
      response.text() reads the response body as a plain string.
      Your Spring Boot controller returns ResponseEntity<String>,
      so we read it as text (not JSON).
      await = wait for the body to fully arrive.
    */
    const resultText = await response.text();

    // Step 5: Show the result
    lastResult = resultText; // save for the Copy button
    showResult(resultText, op);

    // Update button style: green = success
    btn.classList.remove("loading");
    btn.classList.add("active-result");

  } catch (err) {
    /*
      catch block: runs if anything inside try threw an error.
      err.message = the error description.
    */
    if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
      // fetch throws "Failed to fetch" when the server is unreachable
      showError("Cannot connect to backend. Make sure your Spring Boot server is running on http://localhost:8080");
    } else {
      showError(err.message || "An unknown error occurred.");
    }
    btn.classList.remove("loading");

  } finally {
    /*
      finally block: ALWAYS runs, whether try succeeded or catch ran.
      We use it to hide the loading spinner — always hide it when done.
    */
    setLoading(false);
  }
}


/* ═══════════════════════════════════════════════════════
   SECTION 13: UI HELPER FUNCTIONS
   Small functions that update specific parts of the UI.
   Keeping them separate makes the code cleaner and reusable.
═════════════════════════════════════════════════════════ */

/*
  setLoading: shows or hides the loading spinner.
  on = true → show spinner
  on = false → hide spinner
  text = the message to show next to the spinner
*/
function setLoading(on, text = "Generating answer...") {
  loaderText.textContent = text;
  loader.classList.toggle("visible", on);
  // classList.toggle(class, condition): adds class if condition is true, removes if false
}

/*
  clearOutput: resets the output box to show a "generating" state.
  Called right before we make the API request.
*/
function clearOutput() {
  outputBox.innerHTML = `
    <div class="output-empty">
      <span class="empty-icon">⏳</span>
      <p>Generating response...</p>
    </div>`;
  outputHeader.style.display = "none"; // hide the Copy button row
}

/*
  showResult: displays the AI's response in the output box.
  text = the response string from Spring Boot
  op = the operation code (for the label)
*/
function showResult(text, op) {
  /*
    escapeHtml prevents XSS (Cross-Site Scripting) attacks.
    If the AI response contained <script>alert('hacked')</script>,
    escapeHtml converts < to &lt; so the browser shows it as text
    instead of running it as code.
    
    Then we convert \n (newline characters) to <br> (HTML line breaks)
    so the formatted response looks correct in the browser.
  */
  const safe = escapeHtml(text).replace(/\n/g, "<br>");

  outputBox.innerHTML = `<div>${safe}</div>`;

  // Show the label and action buttons (Copy, → Notes)
  outputOpLabel.textContent = OP_LABELS[op] || op;
  outputHeader.style.display = "flex";
}

/*
  showError: displays an error message in the output box.
*/
function showError(msg) {
  outputBox.innerHTML = `<div class="output-error">⚠️ ${escapeHtml(msg)}</div>`;
  outputHeader.style.display = "none";
}

/*
  escapeHtml: converts special HTML characters to safe entities.
  & → &amp;   (must be first!)
  < → &lt;
  > → &gt;
  " → &quot;
  This prevents the browser from interpreting content as HTML/JS.
*/
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


/* ═══════════════════════════════════════════════════════
   SECTION 14: OUTPUT ACTIONS (Copy, Send to Notes)
═════════════════════════════════════════════════════════ */

/*
  Copy button: copies the AI result to the clipboard.
  navigator.clipboard.writeText() is the modern clipboard API.
  It returns a Promise — we use .then() to handle success.
*/
copyBtn.addEventListener("click", () => {
  if (!lastResult) return; // nothing to copy

  navigator.clipboard.writeText(lastResult).then(() => {
    // Temporarily change button text to confirm the copy
    const original = copyBtn.textContent;
    copyBtn.textContent = "✅ Copied!";
    // After 1.5 seconds, restore original text
    setTimeout(() => { copyBtn.textContent = original; }, 1500);
    // setTimeout(function, milliseconds): runs function after delay
  });
});

/*
  "Send to Notes" button: appends the AI result to the notes textarea.
  This is useful for collecting multiple AI outputs into one place.
*/
sendToNotesBtn.addEventListener("click", () => {
  if (!lastResult) return;

  // Open the notes panel if it's hidden
  notesPanel.style.display = "block";

  // Append the result with a separator
  // If notes area already has content, add two newlines before appending
  const existing = notesArea.value;
  const separator = existing ? "\n\n─────────────────\n" : "";
  notesArea.value = existing + separator + lastResult;

  // Scroll the notes textarea to the bottom to show the new content
  notesArea.scrollTop = notesArea.scrollHeight;

  // Confirm action
  const original = sendToNotesBtn.textContent;
  sendToNotesBtn.textContent = "✅ Sent!";
  setTimeout(() => { sendToNotesBtn.textContent = original; }, 1500);
});


/* ═══════════════════════════════════════════════════════
   SECTION 15: CLEAR BUTTON (header)
   Clears the output box and resets all button styles.
═════════════════════════════════════════════════════════ */

clearBtn.addEventListener("click", () => {
  lastResult = ""; // clear stored result

  // Reset output box to default empty state
  outputBox.innerHTML = `
    <div class="output-empty">
      <span class="empty-icon">🎓</span>
      <p>Type, speak, or upload content above — then click any feature button to get AI output.</p>
    </div>`;
  outputHeader.style.display = "none";

  // Reset the last-active op button's style
  if (activeOpBtn) {
    activeOpBtn.classList.remove("loading", "active-result");
    activeOpBtn = null; // null = nothing stored
  }
});


/* ═══════════════════════════════════════════════════════
   SECTION 16: NOTES PANEL — toggle, save, clear
═════════════════════════════════════════════════════════ */

// Toggle notes panel open/closed when 📝 button is clicked
notesToggleBtn.addEventListener("click", () => {
  /*
    If display is "none" or "" (initial), open it by setting to "block".
    If it's already "block", close it by setting to "none".
  */
  const isHidden = notesPanel.style.display !== "block";
  notesPanel.style.display = isHidden ? "block" : "none";
});

// Save notes to Chrome's local storage (persists after closing extension)
saveNotesBtn.addEventListener("click", () => {
  const notes = notesArea.value;

  /*
    chrome.storage.local.set: saves key-value pairs to Chrome's storage.
    This storage persists even after the extension is closed and reopened.
    Unlike localStorage (which is per-tab), chrome.storage is per-extension.
    The callback runs after the save is complete.
  */
  chrome.storage.local.set({ study_notes: notes }, () => {
    const original = saveNotesBtn.textContent;
    saveNotesBtn.textContent = "Saved ✓";
    setTimeout(() => { saveNotesBtn.textContent = original; }, 1500);
  });
});

// Clear all notes (with a confirmation dialog so user doesn't lose data)
clearNotesBtn.addEventListener("click", () => {
  /*
    confirm() shows a browser dialog with OK/Cancel.
    Returns true if user clicks OK, false if Cancel.
    We only clear if user confirms.
  */
  if (confirm("Clear all notes? This cannot be undone.")) {
    notesArea.value = "";
    // Also clear from Chrome storage
    chrome.storage.local.set({ study_notes: "" });
  }
});
