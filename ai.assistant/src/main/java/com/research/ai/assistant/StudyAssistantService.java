package com.research.ai.assistant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import tools.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;

/*
 * ============================================================================
 * WHAT CHANGED FROM YOUR ORIGINAL VERSION — READ THIS FIRST
 * ============================================================================
 *
 * Problem: gpt-oss-120b was returning bloated, table-heavy, emoji-filled
 * output (see your "explain DOM" screenshot) because none of your prompts
 * told it what NOT to do. Left unconstrained, it defaults to markdown
 * tables (which force it to pad every cell to "look complete"), adds
 * emoji headers, writes a preamble ("Below is a ready-to-use..."), and a
 * closing summary table nobody asked for.
 *
 * Fix applied to EVERY case below:
 *   1. A shared FORMAT_RULES block (see below) is appended to every prompt.
 *      It bans markdown tables, bans emoji, bans intro/outro fluff, and
 *      forces plain numbered headings.
 *   2. Every case that previously said "give detailed answer" or similar
 *      open-ended instructions now has an explicit word/sentence cap, so
 *      the model can't pad.
 *   3. Every case's structure is now spelled out as a literal plain-text
 *      skeleton (e.g. "1. [question]\nAnswer: [text]") instead of vague
 *      instructions like "give a table with these columns" — vague
 *      structure requests are exactly what pushes the model toward tables.
 *
 * One honest caveat: I have not run this against the live Groq API to
 * confirm gpt-oss-120b obeys every constraint perfectly — model instruction-
 * following isn't 100% reliable even with explicit rules. If you still see
 * a table or emoji slip through on some case, the fix is to make that
 * case's skeleton even more literal (paste an exact example output back
 * into the prompt), not to add more rules to FORMAT_RULES.
 * ============================================================================
 */

@Service
public class StudyAssistantService {

    @Value("${groq.api.url}")
    private String groqApiUrl;

    @Value("${groq.api.key}")
    private String groqApiKey;

    private WebClient webClient;
    private final ObjectMapper objectMapper;

    public StudyAssistantService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    // Appended to the end of every single prompt. This is what actually
    // fixes the messiness — see comment block above.
    private static final String FORMAT_RULES =
            "\n\nSTRICT OUTPUT FORMAT RULES (follow exactly):\n" +
                    "- Do NOT use markdown tables.\n" +
                    "- Do NOT use emoji or decorative symbols.\n" +
                    "- Do NOT write any introduction, preamble, or closing summary — start directly with the first heading.\n" +
                    "- Use plain numbered or capitalized headings only (e.g. '1. Topic' or 'KEY POINTS').\n" +
                    "- Keep bullet nesting to a maximum of one level.\n" +
                    "- Follow the exact structure given in this prompt — do not add extra sections.";

    public String processContent(StudyRequest request) {
        String prompt = buildPrompt(request);

        Map<String, Object> requestBody = Map.of(
                "model", "openai/gpt-oss-120b",
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                )
        );
        String response = webClient.post()
                .uri(groqApiUrl)
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + groqApiKey)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(status -> status.isError(), clientResponse ->
                        clientResponse.bodyToMono(String.class)
                                .map(errorBody -> {
                                    System.out.println("GROQ ERROR: " + errorBody);
                                    return new RuntimeException("Groq API error: " + errorBody);
                                })
                )
                .bodyToMono(String.class)
                .block();

        return extractTextFromResponse(response);
    }

    private String extractTextFromResponse(String response) {
        try {
            GroqResponse groqResponse = objectMapper.readValue(response, GroqResponse.class);
            if (groqResponse.getChoices() != null && !groqResponse.getChoices().isEmpty()) {
                return groqResponse.getChoices().get(0).getMessage().getContent();
            }
            return "No content found";
        } catch (Exception e) {
            return "Error parsing response: " + e.getMessage();
        }
    }

    private String buildPrompt(StudyRequest request) {
        String content = request.getContent() != null ? request.getContent().trim() : "";
        String goal = request.getResearchGoal() != null ? request.getResearchGoal().trim() : "General";
        String language = request.getProgrammingLanguage() != null ? request.getProgrammingLanguage().trim() : "Java";

        String base;

        switch (request.getOperation()) {

            // ═══════════════════════════════
            // CORE STUDY (1-20)
            // ═══════════════════════════════

            case "summarize":
                base = "You are a student study assistant. Summarize the following content clearly.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure:\n" +
                        "IN SHORT: 2 sentences max.\n" +
                        "KEY POINTS: 5 single-line bullets.\n" +
                        "IMPORTANT TERMS: 3 to 5 terms, one line each.";
                break;

            case "keypoints":
                base = "You are a study assistant. Extract exactly 10 key points from this content for exam preparation.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure: a numbered list 1 to 10, one line per point, no sub-bullets.";
                break;

            case "notes":
                base = "You are a study assistant. Create structured study notes for the topic: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure: numbered sections (e.g. '1. [Section Name]'), each followed by up to 4 " +
                        "single-line bullet points and one 'Remember:' line. Maximum 5 sections.";
                break;

            case "define":
                base = "You are a study assistant. Find and define all important terms in the content below.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, for at least 5 terms:\n" +
                        "TERM: name\n" +
                        "DEFINITION: one sentence\n" +
                        "EXAMPLE: one sentence";
                break;

            case "examples":
                base = "You are a study assistant. Give real world examples for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, for at least 3 examples:\n" +
                        "EXAMPLE: name\n" +
                        "WHAT: one sentence\n" +
                        "WHY IT RELATES: one sentence";
                break;

            case "compare":
                base = "You are a study assistant. Compare the topics mentioned in: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure (plain text, NOT a table):\n" +
                        "[TOPIC A NAME]\n" +
                        "Definition: one sentence\n" +
                        "Key difference: one sentence\n" +
                        "When to use: one sentence\n\n" +
                        "[TOPIC B NAME]\n" +
                        "Definition: one sentence\n" +
                        "Key difference: one sentence\n" +
                        "When to use: one sentence\n\n" +
                        "VERDICT: one line on which is better and when.";
                break;

            case "formulas":
                base = "You are a study assistant. List all formulas related to: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, for each formula:\n" +
                        "FORMULA: the equation\n" +
                        "VARIABLES: one line, comma-separated\n" +
                        "WHEN TO USE: one sentence\n" +
                        "EXAMPLE: one solved line";
                break;

            case "diagram":
                base = "You are a study assistant. Explain the following content using a text-based diagram or flowchart.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Draw a simple ASCII diagram using arrows (->) and boxes ([ ]).\n" +
                        "After the diagram, add 'PARTS EXPLAINED:' with one line per part.";
                break;

            case "timeline":
                base = "You are a study assistant. Create a chronological timeline for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, oldest to newest:\n" +
                        "[Date/Period] - [Event]: one sentence on why it mattered.\n" +
                        "End with 'KEY MILESTONE:' one line.";
                break;

            case "pros_cons":
                base = "You are a study assistant. List pros and cons for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure:\n" +
                        "PROS: 4 single-line bullets, each with a short reason.\n" +
                        "CONS: 4 single-line bullets, each with a short reason.\n" +
                        "VERDICT: one line.";
                break;

            case "why_how":
                base = "You are a study assistant. Explain WHY and HOW for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure:\n" +
                        "WHY: 2 to 3 sentences.\n" +
                        "HOW: numbered steps, one line each, max 6 steps.";
                break;

            case "difficult":
                base = "You are a study assistant. Simplify this difficult concept for a student.\n\n" +
                        "Topic: " + goal + "\n" +
                        "Content: " + content + "\n\n" +
                        "Structure:\n" +
                        "SIMPLE EXPLANATION: as if teaching a 10 year old, max 4 sentences.\n" +
                        "ANALOGY: one everyday comparison, max 2 sentences.\n" +
                        "REMEMBER THIS: one line.";
                break;

            case "realworld":
                base = "You are a study assistant. Give real world applications for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, at least 4 uses:\n" +
                        "INDUSTRY: name\n" +
                        "HOW USED: one sentence\n" +
                        "WHY IT MATTERS: one sentence";
                break;

            case "related":
                base = "You are a study assistant. Suggest related topics to study after: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure: 5 numbered topics, each with one line on why it's related, ordered easiest to hardest.";
                break;

            case "flashcards":
                base = "You are a study assistant. Create 10 flashcards from this content for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, repeated 10 times:\n" +
                        "Q: [question]\n" +
                        "A: [short direct answer]";
                break;

            case "mnemonics":
                base = "You are a study assistant. Create memory tricks and mnemonics to remember: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, at least 2 mnemonics:\n" +
                        "MNEMONIC: the word or phrase\n" +
                        "MEANING: what each letter stands for, one line\n" +
                        "WHY IT HELPS: one sentence";
                break;

            case "study_plan":
                base = "You are a study assistant. Create a 7 day study plan for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, one block per day:\n" +
                        "DAY 1: [topic] - [time in minutes] - [specific task]\n" +
                        "(repeat through DAY 7, include at least one revision day)";
                break;

            case "check_understanding":
                base = "You are a study assistant. Test the student's understanding of: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure:\n" +
                        "MUST-KNOW CONCEPTS: 3 single-line bullets.\n" +
                        "QUESTION 1 / ANSWER 1, QUESTION 2 / ANSWER 2, QUESTION 3 / ANSWER 3 (one line each).\n" +
                        "IF WRONG, REVISE: one line.";
                break;

            case "quiz":
                base = "You are a study assistant. Create a quiz with 5 multiple choice questions from: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, repeated 5 times:\n" +
                        "Q: [question]\n" +
                        "A) [option] B) [option] C) [option] D) [option]\n" +
                        "CORRECT: [letter]\n" +
                        "WHY: one sentence";
                break;

            case "essay_write":
                base = "You are a study assistant. Write a complete essay on: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure: INTRODUCTION (2 sentences), BODY 1, BODY 2, BODY 3 (3 to 4 sentences each), " +
                        "CONCLUSION (2 sentences). Formal academic language, no headings inside the essay itself " +
                        "other than these five labels.";
                break;

            // ═══════════════════════════════
            // EXAM PREP (21-35)
            // ═══════════════════════════════

            case "exam_questions":
                base = "You are an exam preparation assistant. Generate likely exam questions for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure:\n" +
                        "MCQ (3 questions): Q, 4 options, CORRECT: letter.\n" +
                        "SHORT ANSWER (3 questions): Q, Answer in 2 lines.\n" +
                        "LONG ANSWER (2 questions): Q, key points to cover as single-line bullets.";
                break;

            case "mistakes":
                base = "You are a study assistant. List common mistakes students make in: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, at least 5 mistakes:\n" +
                        "MISTAKE: one line\n" +
                        "WHY WRONG: one sentence\n" +
                        "CORRECT APPROACH: one sentence";
                break;

            case "tricks":
                base = "You are a study assistant. Give shortcuts and tricks to solve problems faster in: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, at least 5 tricks:\n" +
                        "TRICK: one line\n" +
                        "WHEN TO USE: one sentence\n" +
                        "EXAMPLE: one line";
                break;

            case "past_questions":
                base = "You are an exam assistant. Generate past exam style questions for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, 5 questions mixing MCQ/short/long:\n" +
                        "Q: [question]\n" +
                        "MODEL ANSWER: [concise answer with key terms in CAPS]";
                break;

            case "answer_template":
                base = "You are an exam assistant. Give a perfect answer writing template for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure:\n" +
                        "TEMPLATE: numbered structure, one line per part.\n" +
                        "SAMPLE ANSWER: using the template, max 100 words.\n" +
                        "SCORING KEYWORDS: comma-separated list.";
                break;

            case "score_predictor":
                base = "You are an exam assistant. Analyze this content and tell which topics to focus on for maximum marks: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure:\n" +
                        "HIGH PRIORITY: topics as single-line bullets with estimated marks.\n" +
                        "MEDIUM PRIORITY: same format.\n" +
                        "LOW PRIORITY: same format.\n" +
                        "STRATEGY: 2 to 3 sentences.";
                break;

            case "highlights":
                base = "You are a study assistant. Extract the most important highlights from this content for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure:\n" +
                        "MUST-KNOW (5 points): one line each, tag with (HIGH).\n" +
                        "BONUS (3 points): one line each, tag with (MEDIUM) or (LOW).";
                break;

            case "quick_summary":
                base = "You are a study assistant. Give a 1 minute revision summary of this content.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure: exactly 3 numbered points, one short sentence each. Nothing else.";
                break;

            case "onepager":
                base = "You are a study assistant. Create a one page cheat sheet for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure:\n" +
                        "DEFINITIONS: up to 5 single-line entries.\n" +
                        "FORMULAS: up to 5 single-line entries.\n" +
                        "KEY POINTS: up to 5 single-line bullets.\n" +
                        "LIKELY QUESTIONS: up to 3 single-line entries.";
                break;

            case "revision":
                base = "You are a study assistant. Create a complete revision guide for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure:\n" +
                        "MAIN CONCEPTS: up to 5 single-line bullets, basic to advanced order.\n" +
                        "KEY FORMULAS: up to 5 single-line entries.\n" +
                        "DEFINITIONS: up to 5 single-line entries.\n" +
                        "SELF-TEST: 3 questions, one line each, no answers given.";
                break;

            case "important":
                base = "You are a study assistant. List the 5 most important topics to study in: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, ranked most to least important:\n" +
                        "TOPIC: name\n" +
                        "WHY: one sentence\n" +
                        "TIP: one sentence";
                break;

            case "weightage":
                base = "You are an exam assistant. Analyze the mark weightage for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, highest to lowest weightage:\n" +
                        "TOPIC: name - APPROX WEIGHTAGE: percent - TIME ADVICE: one line";
                break;

            case "tips_exam":
                base = "You are an exam coach. Give practical exam writing tips for: " + goal + "\n\n" +
                        "Structure: 8 numbered tips, one sentence each, covering reading questions, time " +
                        "management, answer writing, MCQ strategy, and common errors.";
                break;

            case "time_mgmt":
                base = "You are an exam coach. Create a time management plan for: " + goal + " exam.\n\n" +
                        "Assume a 3 hour exam.\n\n" +
                        "Structure:\n" +
                        "TIME ALLOCATION: [Section] - [Minutes] (one line per section).\n" +
                        "TIPS: 3 single-line bullets covering start strategy, difficult questions, and review time.";
                break;

            case "stress":
                base = "You are a student counselor. Give practical stress relief tips for a student preparing for: " + goal + " exam.\n\n" +
                        "Structure: 5 numbered techniques (breathing, breaks, sleep, mindset, day-before " +
                        "routine), one to two sentences each.";
                break;

            // ═══════════════════════════════
            // CODING (36-50)
            // ═══════════════════════════════

            case "code":
                base = "You are a coding assistant. Write a complete working solution in " + language + " only.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Rules: write ONLY " + language + " code with proper imports and inline comments on " +
                        "non-obvious lines.\n" +
                        "After the code add:\n" +
                        "APPROACH: 2 to 3 sentences.\n" +
                        "TIME COMPLEXITY: one line.\n" +
                        "SPACE COMPLEXITY: one line.\n" +
                        "EXAMPLE: one input/output line.";
                break;

            case "code_explain":
                base = "You are a coding teacher. Explain this " + language + " code line by line.\n\n" +
                        "Code: " + content + "\n\n" +
                        "Structure: for each logical block, '[Block name]: one to two sentence explanation.'\n" +
                        "End with OVERALL PURPOSE (1 sentence), TIME COMPLEXITY (1 line), SPACE COMPLEXITY (1 line).";
                break;

            case "optimize":
                base = "You are a coding expert. Optimize this " + language + " code for better performance.\n\n" +
                        "Code: " + content + "\n\n" +
                        "Give the optimized code with inline comments, then:\n" +
                        "BEFORE COMPLEXITY: one line.\n" +
                        "AFTER COMPLEXITY: one line.\n" +
                        "CHANGES MADE: single-line bullets, max 5.";
                break;

            case "debug":
                base = "You are a debugging expert. Find and fix all bugs in this " + language + " code.\n\n" +
                        "Code: " + content + "\n\n" +
                        "Structure:\n" +
                        "BUGS FOUND: for each, one line 'What: ... Why: ... Fix: ...'\n" +
                        "Then the complete corrected code with comments marking each fix.";
                break;

            case "convert":
                base = "You are a coding assistant. Convert the following code to " + language + ".\n\n" +
                        "Original Code: " + content + "\n\n" +
                        "Rules: output ONLY " + language + " code, same logic, idiomatic syntax, with brief " +
                        "inline comments only where the conversion required a non-obvious change.";
                break;

            case "complexity":
                base = "You are a coding expert. Analyze the time and space complexity of this " + language + " code.\n\n" +
                        "Code: " + content + "\n\n" +
                        "Structure:\n" +
                        "TIME COMPLEXITY: Big O, one sentence why.\n" +
                        "SPACE COMPLEXITY: Big O, one sentence why.\n" +
                        "BEST CASE: Big O, one line.\n" +
                        "WORST CASE: Big O, one line.\n" +
                        "IMPROVEMENT: one sentence, if possible.";
                break;

            case "test":
                base = "You are a testing expert. Generate comprehensive test cases for this " + language + " code.\n\n" +
                        "Code: " + content + "\n\n" +
                        "Write actual runnable test code in " + language + " using a standard testing " +
                        "framework, covering at least 8 cases: normal, edge (empty/single/large), and negative. " +
                        "Add a one-line comment above each test stating what it checks.";
                break;

            case "leetcode":
                base = "You are a competitive programmer. Solve this LeetCode problem in " + language + ".\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Structure:\n" +
                        "BRUTE FORCE: code + one-line complexity.\n" +
                        "OPTIMAL: code + one-line complexity.\n" +
                        "APPROACH: 2 to 3 sentences.\n" +
                        "DRY RUN: one worked example, max 5 lines.\n" +
                        "SIMILAR PROBLEMS: comma-separated list.";
                break;

            case "algorithm":
                base = "You are a computer science teacher. Explain this algorithm in detail: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure:\n" +
                        "WHAT IT IS: 2 sentences.\n" +
                        "STEPS: numbered, one line each.\n" +
                        "TIME COMPLEXITY: one line.\n" +
                        "SPACE COMPLEXITY: one line.\n" +
                        "WHEN TO USE: one sentence.\n" +
                        "CODE: simple " + language + " implementation.";
                break;

            case "datastructure":
                base = "You are a computer science teacher. Explain this data structure: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure:\n" +
                        "WHAT IT IS: one sentence.\n" +
                        "HOW IT WORKS: 2 to 3 sentences.\n" +
                        "OPERATIONS: single-line entries, '[Operation] - O(...)'.\n" +
                        "WHEN TO USE: one sentence.\n" +
                        "CODE: basic " + language + " implementation.\n" +
                        "REAL WORLD USE: one sentence.";
                break;

            case "code_compare":
                base = "You are a coding expert. Compare these two code approaches.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure (plain text, NOT a table):\n" +
                        "APPROACH A: time complexity, space complexity, readability — one line each.\n" +
                        "APPROACH B: time complexity, space complexity, readability — one line each.\n" +
                        "RECOMMENDATION: 2 sentences.";
                break;

            case "pattern":
                base = "You are a coding expert. Identify the coding pattern used in this problem or code.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure:\n" +
                        "PATTERN: name.\n" +
                        "WHY IT FITS: one sentence.\n" +
                        "HOW TO RECOGNIZE: one sentence.\n" +
                        "OTHER PROBLEMS: comma-separated list.\n" +
                        "TEMPLATE CODE: in " + language + ".";
                break;

            case "pseudocode":
                base = "You are a coding teacher. Write pseudocode for this problem before coding.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Structure:\n" +
                        "PSEUDOCODE: numbered steps, one line each.\n" +
                        "CODE: " + language + " implementation matching the steps.\n" +
                        "MAPPING: one line per step noting which code lines implement it.";
                break;

            case "project_idea":
                base = "You are a project mentor. Suggest college project ideas related to: " + goal + "\n\n" +
                        "Structure, 5 ideas, one AI-based:\n" +
                        "PROJECT: name\n" +
                        "DESCRIPTION: one sentence\n" +
                        "TECH: comma-separated\n" +
                        "DIFFICULTY: Beginner/Intermediate/Advanced\n" +
                        "LEARNING: one sentence";
                break;

            case "roadmap":
                base = "You are a learning mentor. Create a complete learning roadmap for: " + goal + "\n\n" +
                        "Structure:\n" +
                        "BEGINNER: topics (comma-separated), resources (comma-separated), time estimate, mini project (one line).\n" +
                        "INTERMEDIATE: same format.\n" +
                        "ADVANCED: same format.\n" +
                        "TIMELINE: one line, assuming 1 hour/day.";
                break;

            // ═══════════════════════════════
            // INTERVIEW PREP (51-60)
            // ═══════════════════════════════

            case "interview_q":
                base = "You are an interview coach creating a clean, easy-to-read study sheet for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure:\n" +
                        "TECHNICAL QUESTIONS\n" +
                        "1. [question]\nAnswer: [max 80 words]\n(repeat for 5 questions)\n\n" +
                        "CONCEPTUAL QUESTIONS\n" +
                        "1. [question]\nAnswer: [max 80 words]\n(repeat for 3 questions)\n\n" +
                        "SITUATIONAL (STAR) QUESTIONS\n" +
                        "1. [question]\nSituation: [1 sentence]\nTask: [1 sentence]\nAction: [2 sentences]\n" +
                        "Result: [1 sentence, with a number if possible]\n(repeat for 2 questions)";
                break;

            case "coding_pattern":
                base = "You are an interview coach. Explain the most important coding patterns for interviews.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Cover: Sliding Window, Two Pointer, Fast and Slow Pointer, Merge Intervals, Cyclic " +
                        "Sort, Tree BFS, Tree DFS, Two Heaps, Subsets, Binary Search.\n" +
                        "Structure, per pattern:\n" +
                        "PATTERN: name\n" +
                        "WHEN TO USE: one sentence\n" +
                        "TEMPLATE: short " + language + " code\n" +
                        "EXAMPLE PROBLEM: one line";
                break;

            case "hr_questions":
                base = "You are an HR interview coach. Generate HR interview questions and ideal answers.\n\n" +
                        "Structure, 10 questions covering strengths, weaknesses, teamwork, conflict, goals, " +
                        "and company fit:\n" +
                        "Q: [question]\n" +
                        "WHAT THEY WANT: one sentence\n" +
                        "SAMPLE ANSWER: max 60 words";
                break;

            case "system_design":
                base = "You are a system design expert. Explain the system design for: " + goal + "\n\n" +
                        "Structure:\n" +
                        "REQUIREMENTS: single-line bullets.\n" +
                        "HIGH LEVEL DESIGN: 2 to 3 sentences plus a text-based ASCII diagram.\n" +
                        "COMPONENTS: '[Component] - one line role' entries.\n" +
                        "DATABASE: one to two sentences.\n" +
                        "API: key endpoints, one line each.\n" +
                        "SCALABILITY: single-line bullets.\n" +
                        "TRADE-OFFS: single-line bullets.\n" +
                        "SCALE ESTIMATE: one line.";
                break;

            case "resume_tips":
                base = "You are a resume coach. Give resume writing tips for the role: " + goal + "\n\n" +
                        "Structure:\n" +
                        "SUMMARY SECTION: one sentence tip.\n" +
                        "SKILLS SECTION: one sentence tip.\n" +
                        "EXPERIENCE SECTION: one sentence tip.\n" +
                        "PROJECTS SECTION: one sentence tip.\n" +
                        "KEYWORDS: comma-separated list.\n" +
                        "WEAK VS STRONG: 3 paired one-line examples ('Weak: ... / Strong: ...').\n" +
                        "FIRST 30 SECONDS: 2 sentences.";
                break;

            case "answer_star":
                base = "You are an interview coach. Answer this interview question using the STAR method: " + goal + "\n\n" +
                        "Structure:\n" +
                        "SITUATION: 2 sentences.\n" +
                        "TASK: 2 sentences.\n" +
                        "ACTION: 3 to 4 sentences.\n" +
                        "RESULT: 2 sentences, with a number if possible.\n" +
                        "WHY THIS WORKS: 2 sentences.";
                break;

            case "mock_interview":
                base = "You are an interviewer at a top tech company. Conduct a mock interview for the role: " + goal + "\n\n" +
                        "Structure, 5 questions mixing technical/behavioral/situational:\n" +
                        "Q1: [question]\nSTRONG ANSWER LOOKS LIKE: one sentence.\nAVOID: one sentence.\n" +
                        "(repeat through Q5)\n\n" +
                        "OVERALL FEEDBACK: 2 to 3 sentences.";
                break;

            case "company_prep":
                base = "You are an interview coach. Help prepare for interview at: " + goal + "\n\n" +
                        "Structure:\n" +
                        "COMPANY OVERVIEW: 2 sentences.\n" +
                        "TECH STACK: comma-separated.\n" +
                        "INTERVIEW ROUNDS: single-line list.\n" +
                        "WHAT THEY LOOK FOR: single-line bullets.\n" +
                        "TECHNICAL QUESTIONS: 5, one line each.\n" +
                        "RESEARCH TIPS: single-line bullets.";
                break;

            case "salary_tips":
                base = "You are a career coach. Give salary negotiation tips for the role: " + goal + "\n\n" +
                        "Structure:\n" +
                        "TIPS: 5 numbered, one sentence each.\n" +
                        "SCRIPTS: 3 short one-line scripts labeled (Asking about salary / Countering an offer / Asking for time).\n" +
                        "OTHER BENEFITS TO NEGOTIATE: comma-separated list.\n" +
                        "TYPICAL RANGE (INDIA): one line.";
                break;

            case "career_path":
                base = "You are a career counselor. Explain the career path for: " + goal + "\n\n" +
                        "Structure, entry to senior:\n" +
                        "[LEVEL]: title, years of experience, key skills (comma-separated), avg salary in India — one line.\n" +
                        "GROWTH TIPS: single-line bullets.\n" +
                        "TOP HIRING COMPANIES: comma-separated list.";
                break;

            // ═══════════════════════════════
            // MATH & SCIENCE (61-75)
            // ═══════════════════════════════

            case "math_solve":
                base = "You are a math teacher. Solve this problem step by step.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Structure: numbered steps, one line each, naming the formula used at each step. " +
                        "End with 'FINAL ANSWER: [answer]' and 'CONCEPT USED: one sentence' and " +
                        "'PRACTICE PROBLEM: one line'.";
                break;

            case "math_explain":
                base = "You are a math teacher. Explain this math concept clearly: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure:\n" +
                        "DEFINITION: one sentence.\n" +
                        "WHY IT MATTERS: one sentence.\n" +
                        "KEY FORMULAS: single-line entries.\n" +
                        "EXAMPLE: step by step, numbered lines.\n" +
                        "COMMON MISTAKES: single-line bullets.\n" +
                        "PRACTICE: 2 problems with answers, one line each.";
                break;

            case "derivatives":
                base = "You are a calculus teacher. Find the derivative of this function step by step.\n\n" +
                        "Function: " + content + "\n\n" +
                        "Structure: RULE USED: name. STEPS: numbered lines. FINAL ANSWER: one line. " +
                        "PRACTICE: one similar function, one line.";
                break;

            case "integrals":
                base = "You are a calculus teacher. Evaluate this integral step by step.\n\n" +
                        "Integral: " + content + "\n\n" +
                        "Structure: TECHNIQUE USED: name. STEPS: numbered lines (include +C if indefinite). " +
                        "FINAL ANSWER: one line. PRACTICE: one similar integral, one line.";
                break;

            case "graph":
                base = "You are a math teacher. Explain how to sketch the graph of: " + content + "\n\n" +
                        "Structure, one line each: DOMAIN, RANGE, X-INTERCEPTS, Y-INTERCEPTS, SYMMETRY, " +
                        "INCREASING/DECREASING, MAX/MIN, ASYMPTOTES.\n" +
                        "SHAPE: 2 sentences.\n" +
                        "KEY POINTS TO PLOT: comma-separated coordinates.";
                break;

            case "chemistry":
                base = "You are a chemistry teacher. Explain or solve: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "If a reaction: BALANCED EQUATION, TYPE, PRODUCTS — one line each.\n" +
                        "If a concept: DEFINITION, MECHANISM, EXAMPLE — one to two sentences each.\n" +
                        "EXAM POINTS: single-line bullets.\n" +
                        "EXAM QUESTIONS: 2, one line each.";
                break;

            case "physics":
                base = "You are a physics teacher. Solve this physics problem step by step.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Structure: GIVEN: single-line list. FIND: one line. FORMULA: one line. " +
                        "CALCULATION: numbered steps. FINAL ANSWER: one line with units. " +
                        "CONCEPT: 1 to 2 sentences. PRACTICE: one line.";
                break;

            case "bio":
                base = "You are a biology teacher. Explain this biology topic: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure: EXPLANATION: 2 to 3 sentences or numbered steps if a process. " +
                        "KEY TERMS: single-line entries. EXAM POINTS: single-line bullets. " +
                        "EXAM QUESTIONS: 3, one line each with a one-line answer.";
                break;

            case "stats":
                base = "You are a statistics teacher. Solve this statistics problem step by step.\n\n" +
                        "Data: " + content + "\n\n" +
                        "Structure: one line per statistic calculated (mean, median, mode, variance, std dev " +
                        "as applicable), showing the calculation. INTERPRETATION: 1 to 2 sentences. " +
                        "PRACTICE: one line.";
                break;

            case "probability":
                base = "You are a probability teacher. Solve this probability problem step by step.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Structure: TYPE: one line. FORMULA: one line. STEPS: numbered lines. " +
                        "FINAL ANSWER: fraction, decimal, and percentage on one line. " +
                        "MEANING: one sentence in plain language.";
                break;

            case "linear_algebra":
                base = "You are a linear algebra teacher. Solve this linear algebra problem step by step.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Structure: numbered steps, each naming the rule/property used. " +
                        "FINAL ANSWER: one line. REAL APPLICATION: one sentence.";
                break;

            case "calculus":
                base = "You are a calculus teacher. Solve this calculus problem step by step.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Structure: CONCEPT: one line. STEPS: numbered lines with rule used. " +
                        "FINAL ANSWER: one line. PRACTICE: one line.";
                break;

            case "geometry":
                base = "You are a geometry teacher. Solve this geometry problem step by step.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Structure: DIAGRAM: simple ASCII if helpful. GIVEN: one line. FORMULA: one line. " +
                        "CALCULATION: numbered steps. FINAL ANSWER: one line with units. " +
                        "THEOREM USED: one line. PRACTICE: one line.";
                break;

            case "trig":
                base = "You are a trigonometry teacher. Solve this trigonometry problem step by step.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Structure: IDENTITY/FORMULA USED: one line. STEPS: numbered lines. " +
                        "FINAL ANSWER: exact and decimal form, one line. PRACTICE: one line.";
                break;

            case "number_theory":
                base = "You are a number theory teacher. Solve this number theory problem step by step.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Structure: THEOREM/PROPERTY: one line. PROOF/SOLUTION: numbered steps. " +
                        "PLAIN EXPLANATION: 1 to 2 sentences. RELATED PROBLEMS: comma-separated.";
                break;

            // ═══════════════════════════════
            // RESEARCH & AI (76-90)
            // ═══════════════════════════════

            case "summarize_research":
                base = "You are a research assistant. Summarize this research paper clearly.\n\n" +
                        "Paper: " + content + "\n\n" +
                        "Structure, one to two sentences each: OBJECTIVE, METHODOLOGY, KEY FINDINGS " +
                        "(single-line bullets), CONCLUSION, LIMITATIONS, RELEVANCE.";
                break;

            case "cite":
                base = "You are a research assistant. Generate citations for this source.\n\n" +
                        "Source details: " + content + "\n\n" +
                        "Structure, one line each: APA, MLA, IEEE, CHICAGO, IN-TEXT (APA).";
                break;

            case "references":
                base = "You are a research assistant. Suggest relevant references and sources for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure: SOURCE TYPES: single-line bullets. SEARCH KEYWORDS: comma-separated. " +
                        "DATABASES: comma-separated. CREDIBILITY TIPS: single-line bullets.";
                break;

            case "verify_citation":
                base = "You are a research assistant. Evaluate the credibility of this source.\n\n" +
                        "Source: " + content + "\n\n" +
                        "Structure, one line each: AUTHOR CREDIBILITY, PUBLICATION QUALITY, RECENCY, BIAS. " +
                        "TRUST RATING: HIGH/MEDIUM/LOW with one-sentence reason. " +
                        "CROSS-VERIFY: one sentence. RED FLAGS: single-line bullets if any.";
                break;

            case "related_research":
                base = "You are a research assistant. Suggest related research areas for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, 5 topics:\n" +
                        "TOPIC: name\n" +
                        "CONNECTION: one sentence\n" +
                        "RESEARCH QUESTION: one sentence\n" +
                        "STARTING RESOURCE: one line";
                break;

            case "ai_explain":
                base = "You are an AI educator. Explain this AI concept clearly: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure: DEFINITION: one sentence. HOW IT WORKS: numbered steps. " +
                        "APPLICATIONS: single-line bullets. PROS/CONS: single-line bullets each. " +
                        "ANALOGY: one sentence. CODE EXAMPLE: if applicable. NEXT TOPICS: comma-separated.";
                break;

            case "ml_model":
                base = "You are an ML educator. Explain this machine learning model: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, one line each unless noted: LEARNING TYPE, ALGORITHM (2 to 3 sentences), " +
                        "WHEN TO USE, KEY HYPERPARAMETERS (comma-separated), PROS, CONS. " +
                        "CODE: simple Python example. COMPARISON: 1 to 2 sentences vs a similar model. " +
                        "PRACTICE DATASETS: comma-separated.";
                break;

            case "nn_arch":
                base = "You are a deep learning educator. Explain this neural network architecture.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure: LAYERS: one line per layer type. ACTIVATIONS: one line. " +
                        "LOSS FUNCTION: one line. OPTIMIZER: one line. ASCII DIAGRAM: simple text diagram. " +
                        "WHAT EACH LAYER LEARNS: single-line bullets. CODE: simple implementation.";
                break;

            case "deep_learning":
                base = "You are a deep learning educator. Explain this deep learning concept: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure: CONCEPT: 2 sentences. INTUITION: 2 sentences, plain terms. " +
                        "ARCHITECTURE: one line. TRAINING: numbered steps. APPLICATIONS: single-line bullets. " +
                        "VS TRADITIONAL ML: 1 to 2 sentences. CODE: simple example. KEY PAPERS: comma-separated.";
                break;

            case "nlp":
                base = "You are an NLP educator. Explain this NLP concept: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure: TASK: one sentence. APPROACHES: single-line bullets. POPULAR MODELS: " +
                        "comma-separated. METRICS: comma-separated. APPLICATIONS: single-line bullets. " +
                        "CODE: simple Python example. LIBRARIES: comma-separated. DATASETS: comma-separated.";
                break;

            case "cv":
                base = "You are a computer vision educator. Explain this computer vision concept: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure: TASK: one sentence. ALGORITHMS: single-line bullets. HOW THEY WORK: " +
                        "2 to 3 sentences. APPLICATIONS: single-line bullets. CODE: simple OpenCV or PyTorch " +
                        "example. COMPARISON: 1 to 2 sentences. BENCHMARK DATASETS: comma-separated.";
                break;

            case "data_viz":
                base = "You are a data visualization expert. Suggest the best visualization approach for this data.\n\n" +
                        "Data: " + content + "\n\n" +
                        "Structure: RECOMMENDED CHART: name and one-sentence reason. ALTERNATIVES: " +
                        "single-line bullets with when to use. CODE: Python example using matplotlib or " +
                        "seaborn. BEST PRACTICES: single-line bullets.";
                break;

            case "ethics_ai":
                base = "You are an AI ethics expert. Discuss the ethical considerations for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, one to two sentences each: BIAS AND FAIRNESS, PRIVACY, TRANSPARENCY, " +
                        "ACCOUNTABILITY, SOCIAL IMPACT.\n" +
                        "REAL EXAMPLE: one sentence.\n" +
                        "GUIDELINES: single-line bullets.\n" +
                        "RELEVANT LAWS: comma-separated.";
                break;

            case "ai_trends":
                base = "You are an AI researcher. Explain the latest trends in AI for: " + goal + "\n\n" +
                        "Structure, top 5 trends:\n" +
                        "TREND: name\n" +
                        "WHY IT MATTERS: one sentence\n" +
                        "CURRENT STATE: one sentence\n" +
                        "LEADING LABS: comma-separated\n\n" +
                        "MOST IMPORTANT TO FOLLOW: one sentence advice.";
                break;

            case "career_ai":
                base = "You are an AI career counselor. Give career guidance for: " + goal + " in the AI field.\n\n" +
                        "Structure: ROLES: comma-separated. SKILLS: comma-separated. SALARY RANGE (INDIA): " +
                        "one line. HIRING COMPANIES: comma-separated. GETTING STARTED: 2 sentences. " +
                        "6 MONTH PLAN: numbered monthly milestones. CERTIFICATIONS: comma-separated. " +
                        "PORTFOLIO TIPS: single-line bullets.";
                break;

            // ═══════════════════════════════
            // BONUS EXTRAS (91-100)
            // ═══════════════════════════════

            case "translate":
                base = "You are a study assistant. Explain the following content in very simple English that a " +
                        "school student can understand.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Use short sentences and everyday words only. Max 6 sentences. " +
                        "End with 'ANALOGY: one sentence.'";
                break;

            case "voice_note":
                base = "You are a study assistant. Summarize these rough notes into clean organized study material.\n\n" +
                        "Notes: " + content + "\n\n" +
                        "Structure: numbered headings with single-line bullets under each. " +
                        "Mark the single most important point with 'IMPORTANT:' prefix. " +
                        "Do not repeat information.";
                break;

            case "ask_ai":
                base = "You are a knowledgeable AI assistant. Answer this question thoroughly: " + goal + "\n\n" +
                        "Context: " + content + "\n\n" +
                        "Give a complete, accurate answer, max 200 words, with one concrete example. " +
                        "If the question has multiple parts, answer each as its own numbered point. " +
                        "End with 'RELATED QUESTIONS:' comma-separated list.";
                break;

            case "debate":
                base = "You are a debate coach. Present both sides of this topic: " + goal + "\n\n" +
                        "Structure: FOR: 4 single-line arguments with brief evidence. " +
                        "AGAINST: 4 single-line arguments with brief evidence. " +
                        "CONCLUSION: 2 balanced sentences, no personal bias.";
                break;

            case "story":
                base = "You are a creative teacher. Explain this concept as an engaging short story: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Write a short story (max 200 words) where characters or objects represent the " +
                        "concepts. After the story add 'MAPPING:' one line per concept-to-character link.";
                break;

            case "analogy":
                base = "You are a creative teacher. Explain this concept using a simple analogy: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, 2 analogies:\n" +
                        "ANALOGY: one sentence\n" +
                        "MAPPING: one sentence\n" +
                        "WHERE IT BREAKS DOWN: one sentence";
                break;

            case "mindmap":
                base = "You are a study assistant. Create a text-based mind map for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure using indentation only (no tables, no emoji):\n" +
                        "[CENTRAL TOPIC]\n" +
                        "  - Main topic 1\n" +
                        "    - Subtopic\n" +
                        "  - Main topic 2\n" +
                        "    - Subtopic\n" +
                        "(cover all important aspects, max 2 indent levels)";
                break;

            case "acronym":
                base = "You are a memory expert. Create acronyms to remember the key concepts in: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure, at least 2 acronyms:\n" +
                        "ACRONYM: the word\n" +
                        "MEANING: one line per letter, comma-separated\n" +
                        "WHY IT HELPS: one sentence";
                break;

            case "recommend":
                base = "You are a learning mentor. Recommend the best resources to learn: " + goal + "\n\n" +
                        "Structure, free resources first:\n" +
                        "BOOKS: comma-separated with one-line note.\n" +
                        "YOUTUBE: comma-separated with one-line note.\n" +
                        "WEBSITES: comma-separated with one-line note.\n" +
                        "COURSES: comma-separated with one-line note.\n" +
                        "PRACTICE PLATFORMS: comma-separated.\n" +
                        "SUGGESTED ORDER: one line.";
                break;

            case "motivate":
                base = "You are a student motivator. Give an encouraging message for a student studying: " + goal + "\n\n" +
                        "Structure: QUOTE: one relevant quote. TIPS: 3 single-line practical tips. " +
                        "REMINDER: one sentence on why the effort pays off. " +
                        "Keep tone warm and energetic, max 120 words total.";
                break;

            default:
                base = "You are a study assistant. Help the student understand this content clearly.\n\n" +
                        "Topic: " + goal + "\n" +
                        "Content: " + content + "\n\n" +
                        "Structure: EXPLANATION (max 4 sentences), KEY POINTS (single-line bullets), " +
                        "EXAMPLE (one line), EXAM RELEVANCE (one sentence).";
                break;
        }

        return base + FORMAT_RULES;
    }
}