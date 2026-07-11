package com.research.ai.assistant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import tools.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;

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

        switch (request.getOperation()) {

            // ═══════════════════════════════
            // CORE STUDY (1-20)
            // ═══════════════════════════════

            case "summarize":
                return "You are a student study assistant. Summarize the following content clearly.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Give output in this format:\n" +
                        "IN SHORT: Write 2 simple sentences.\n" +
                        "KEY POINTS: List 5 bullet points.\n" +
                        "IMPORTANT TERMS: List 3 to 5 key terms.\n" +
                        "Keep it simple for a student to understand.";

            case "keypoints":
                return "You are a study assistant. Extract exactly 10 key points from this content for exam preparation.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Give output as a numbered list 1 to 10.\n" +
                        "Each point must be short, clear, and exam-ready.\n" +
                        "Do not add extra text.";

            case "notes":
                return "You are a study assistant. Create structured study notes for the topic: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Format the notes with clear sections and subsections.\n" +
                        "Each section must have a heading, key points, and what to remember.\n" +
                        "Make it perfect for revision.";

            case "define":
                return "You are a study assistant. Find and define all important terms in the content below.\n\n" +
                        "Content: " + content + "\n\n" +
                        "For each term give:\n" +
                        "TERM: name\n" +
                        "DEFINITION: one simple line\n" +
                        "EXAMPLE: one easy real example\n\n" +
                        "Define at least 5 terms.";

            case "examples":
                return "You are a study assistant. Give real world examples for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Give at least 3 examples.\n" +
                        "For each example explain: what it is, where it is used, and why it relates to the topic.\n" +
                        "Use simple language a student can understand.";

            case "compare":
                return "You are a study assistant. Compare the topics mentioned in: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Create a comparison with these points: Definition, Key difference, When to use, Advantage, Disadvantage.\n" +
                        "Show both sides clearly.\n" +
                        "End with a one-line summary of which is better and when.";

            case "formulas":
                return "You are a study assistant. List all formulas related to: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "For each formula give:\n" +
                        "FORMULA: the equation\n" +
                        "VARIABLES: what each letter means\n" +
                        "WHEN TO USE: the situation\n" +
                        "EXAMPLE: one solved example\n\n" +
                        "List all formulas found in the content.";

            case "diagram":
                return "You are a study assistant. Explain the following content using a text-based diagram or flowchart.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Draw a simple ASCII diagram using arrows and boxes.\n" +
                        "Label each part clearly.\n" +
                        "After the diagram, explain each part in 1 line.\n" +
                        "Make it easy to visualize for a student.";

            case "timeline":
                return "You are a study assistant. Create a chronological timeline for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "List events in order from oldest to newest.\n" +
                        "For each event give: date or period, what happened, why it was important.\n" +
                        "Highlight the most important milestone.";

            case "pros_cons":
                return "You are a study assistant. List pros and cons for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Give at least 4 pros and 4 cons.\n" +
                        "Each point must have a short explanation.\n" +
                        "End with a one-line verdict.";

            case "why_how":
                return "You are a study assistant. Explain WHY and HOW for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "WHY section: explain the reason and purpose in simple words.\n" +
                        "HOW section: give step by step process with clear steps.\n" +
                        "Use simple language suitable for a student.";

            case "difficult":
                return "You are a study assistant. Simplify this difficult concept for a student.\n\n" +
                        "Topic: " + goal + "\n" +
                        "Content: " + content + "\n\n" +
                        "Explain it like you are teaching a 10 year old child.\n" +
                        "Use very simple words, a relatable analogy, and one easy example.\n" +
                        "Then give the key thing to remember in one line.";

            case "realworld":
                return "You are a study assistant. Give real world applications for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Give at least 4 real world uses.\n" +
                        "For each: name the industry, describe how it is used, and why it matters.\n" +
                        "Make it interesting and relatable for a student.";

            case "related":
                return "You are a study assistant. Suggest related topics to study after: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "List 5 related topics.\n" +
                        "For each topic explain why it is related and what the student will learn.\n" +
                        "Give a recommended study order from easiest to hardest.";

            case "flashcards":
                return "You are a study assistant. Create 10 flashcards from this content for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "For each flashcard give:\n" +
                        "QUESTION: a clear exam-style question\n" +
                        "ANSWER: a short direct answer\n\n" +
                        "Make questions cover the most important concepts.";

            case "mnemonics":
                return "You are a study assistant. Create memory tricks and mnemonics to remember: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Create at least 2 mnemonics.\n" +
                        "For each mnemonic: give the word or phrase, explain what each letter or part stands for, and how it helps remember the concept.\n" +
                        "Make them fun and easy to recall.";

            case "study_plan":
                return "You are a study assistant. Create a 7 day study plan for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "For each day give: topic to study, time needed in minutes, and specific task to complete.\n" +
                        "Include revision days and practice days.\n" +
                        "Make it realistic for a student with other subjects too.";

            case "check_understanding":
                return "You are a study assistant. Test the student's understanding of: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "List 3 must-know concepts from this topic.\n" +
                        "Ask 3 questions to check understanding.\n" +
                        "Give the correct answers after each question.\n" +
                        "Tell the student what they must revise if they got it wrong.";

            case "quiz":
                return "You are a study assistant. Create a quiz with 5 multiple choice questions from: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "For each question give:\n" +
                        "QUESTION: clear question\n" +
                        "A B C D options\n" +
                        "CORRECT ANSWER: the letter\n" +
                        "EXPLANATION: why that answer is correct in one line\n\n" +
                        "Make questions exam-level difficulty.";

            case "essay_write":
                return "You are a study assistant. Write a complete essay on: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Structure the essay as:\n" +
                        "INTRODUCTION: 2 sentences introducing the topic\n" +
                        "BODY PARAGRAPH 1: first main point with explanation\n" +
                        "BODY PARAGRAPH 2: second main point with explanation\n" +
                        "BODY PARAGRAPH 3: third main point with explanation\n" +
                        "CONCLUSION: summarize in 2 sentences\n\n" +
                        "Use formal academic language.";

            // ═══════════════════════════════
            // EXAM PREP (21-35)
            // ═══════════════════════════════

            case "exam_questions":
                return "You are an exam preparation assistant. Generate likely exam questions for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Give 3 MCQ questions with 4 options and correct answer.\n" +
                        "Give 3 short answer questions with 2 line answers.\n" +
                        "Give 2 long answer questions with key points to cover.\n" +
                        "Focus on questions that are most likely to appear in exam.";

            case "mistakes":
                return "You are a study assistant. List common mistakes students make in: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Give at least 5 common mistakes.\n" +
                        "For each mistake: describe the wrong way, explain why it is wrong, give the correct approach.\n" +
                        "Focus on mistakes that cost marks in exam.";

            case "tricks":
                return "You are a study assistant. Give shortcuts and tricks to solve problems faster in: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Give at least 5 tricks.\n" +
                        "For each trick: explain what it is, when to use it, and show an example.\n" +
                        "Focus on tricks that save time in exam.";

            case "past_questions":
                return "You are an exam assistant. Generate past exam style questions for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Create 5 questions in the style of university or board exams.\n" +
                        "Include mix of MCQ, short answer, and long answer questions.\n" +
                        "Give model answers for each question.\n" +
                        "Mark the important keywords in each answer.";

            case "answer_template":
                return "You are an exam assistant. Give a perfect answer writing template for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Show the ideal structure for writing exam answers.\n" +
                        "Give a sample answer using the template.\n" +
                        "List the keywords and phrases that score full marks.\n" +
                        "Give tips on what examiners look for.";

            case "score_predictor":
                return "You are an exam assistant. Analyze this content and tell which topics to focus on for maximum marks: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Categorize topics as HIGH priority, MEDIUM priority, LOW priority.\n" +
                        "For each category list the topics and estimated marks.\n" +
                        "Give a strategy to score above 80 percent.";

            case "highlights":
                return "You are a study assistant. Extract the most important highlights from this content for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Give 5 must-know points that will definitely come in exam.\n" +
                        "Give 3 bonus points for extra marks.\n" +
                        "Mark each point with its importance level: HIGH, MEDIUM, or LOW.";

            case "quick_summary":
                return "You are a study assistant. Give a 1 minute revision summary of this content.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Give exactly 3 points only.\n" +
                        "Each point must be one short sentence.\n" +
                        "Focus only on what is most important for exam.\n" +
                        "No extra explanation needed.";

            case "onepager":
                return "You are a study assistant. Create a one page cheat sheet for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Include: key definitions, important formulas, key points, common exam questions.\n" +
                        "Keep everything very short and clear.\n" +
                        "Format it so a student can revise the entire topic in 5 minutes.";

            case "revision":
                return "You are a study assistant. Create a complete revision guide for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Cover: main concepts, key formulas, important definitions, example problems.\n" +
                        "Organize from basic to advanced.\n" +
                        "Add a quick self-test with 3 questions at the end.";

            case "important":
                return "You are a study assistant. List the 5 most important topics to study in: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Rank them from most important to least important for exam.\n" +
                        "For each topic explain why it is important and what type of question it appears in.\n" +
                        "Give a study tip for each topic.";

            case "weightage":
                return "You are an exam assistant. Analyze the mark weightage for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Estimate the percentage of marks each topic carries.\n" +
                        "List topics from highest to lowest weightage.\n" +
                        "Give advice on how much time to spend on each topic.\n" +
                        "Focus on maximizing score with minimum effort.";

            case "tips_exam":
                return "You are an exam coach. Give practical exam writing tips for: " + goal + "\n\n" +
                        "Give at least 8 specific tips.\n" +
                        "Include tips for: reading questions, managing time, writing answers, handling MCQ, avoiding common errors.\n" +
                        "Make each tip actionable and specific to the subject.";

            case "time_mgmt":
                return "You are an exam coach. Create a time management plan for: " + goal + " exam.\n\n" +
                        "Assume the exam is 3 hours long.\n" +
                        "Tell how many minutes to spend on each section.\n" +
                        "Give tips for: starting strong, handling difficult questions, using remaining time for review.\n" +
                        "Include a time allocation table.";

            case "stress":
                return "You are a student counselor. Give practical stress relief tips for a student preparing for: " + goal + " exam.\n\n" +
                        "Give 5 techniques to reduce exam anxiety.\n" +
                        "Include: breathing exercises, study breaks, sleep tips, positive thinking, day-before-exam routine.\n" +
                        "Make it practical and easy to follow for a student.";

            // ═══════════════════════════════
            // CODING (36-50)
            // ═══════════════════════════════

            case "code":
                return "You are a coding assistant. Write a complete working solution in " + language + " only.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Rules:\n" +
                        "1. Write ONLY " + language + " code. Never write any other language.\n" +
                        "2. Write complete working code with proper imports.\n" +
                        "3. Add comments explaining each important line.\n" +
                        "4. After the code give: approach used, time complexity, space complexity, and one example with input and output.";

            case "code_explain":
                return "You are a coding teacher. Explain this " + language + " code line by line.\n\n" +
                        "Code: " + content + "\n\n" +
                        "For each line or block explain: what it does, why it is needed, and what happens if removed.\n" +
                        "At the end give: overall purpose of the code, time complexity, and space complexity.\n" +
                        "Use simple language a beginner can understand.";

            case "optimize":
                return "You are a coding expert. Optimize this " + language + " code for better performance.\n\n" +
                        "Code: " + content + "\n\n" +
                        "Give the optimized code with comments.\n" +
                        "Show: before complexity vs after complexity.\n" +
                        "List all optimizations made and why each improves performance.\n" +
                        "The optimized code must be complete and working.";

            case "debug":
                return "You are a debugging expert. Find and fix all bugs in this " + language + " code.\n\n" +
                        "Code: " + content + "\n\n" +
                        "List each bug found: what is wrong, why it is wrong, how to fix it.\n" +
                        "Give the complete corrected code.\n" +
                        "Add comments where bugs were fixed.\n" +
                        "Also mention any potential issues that could cause problems later.";

            case "convert":
                return "You are a coding assistant. Convert the following code to " + language + ".\n\n" +
                        "Original Code: " + content + "\n\n" +
                        "Rules:\n" +
                        "1. Write ONLY " + language + " code in the output.\n" +
                        "2. Keep the same logic and algorithm.\n" +
                        "3. Use proper " + language + " syntax and conventions.\n" +
                        "4. Add comments explaining any language-specific changes made.";

            case "complexity":
                return "You are a coding expert. Analyze the time and space complexity of this " + language + " code.\n\n" +
                        "Code: " + content + "\n\n" +
                        "Give:\n" +
                        "TIME COMPLEXITY: Big O notation with explanation of why\n" +
                        "SPACE COMPLEXITY: Big O notation with explanation of why\n" +
                        "BEST CASE: complexity and when it occurs\n" +
                        "WORST CASE: complexity and when it occurs\n" +
                        "AVERAGE CASE: complexity\n" +
                        "Suggest how to improve complexity if possible.";

            case "test":
                return "You are a testing expert. Generate comprehensive test cases for this " + language + " code.\n\n" +
                        "Code: " + content + "\n\n" +
                        "Give at least 8 test cases covering:\n" +
                        "- Normal cases with expected input and output\n" +
                        "- Edge cases like empty input, single element, large input\n" +
                        "- Negative cases that should fail or throw error\n" +
                        "Write actual test code in " + language + " using proper testing framework.";

            case "leetcode":
                return "You are a competitive programmer. Solve this LeetCode problem in " + language + ".\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Give:\n" +
                        "1. Brute force approach with code and complexity\n" +
                        "2. Optimal approach with code and complexity\n" +
                        "3. Step by step explanation of the optimal approach\n" +
                        "4. Dry run with example showing how the code works\n" +
                        "5. Similar LeetCode problems to practice\n\n" +
                        "Write ONLY " + language + " code.";

            case "algorithm":
                return "You are a computer science teacher. Explain this algorithm in detail: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Give:\n" +
                        "WHAT IT IS: one paragraph definition\n" +
                        "STEP BY STEP: numbered steps of how it works\n" +
                        "TIME COMPLEXITY: with explanation\n" +
                        "SPACE COMPLEXITY: with explanation\n" +
                        "WHEN TO USE: best use cases\n" +
                        "CODE EXAMPLE: simple implementation in " + language;

            case "datastructure":
                return "You are a computer science teacher. Explain this data structure: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Give:\n" +
                        "WHAT IT IS: simple definition\n" +
                        "HOW IT WORKS: internal structure and memory\n" +
                        "OPERATIONS: list with time complexity for each\n" +
                        "WHEN TO USE: best scenarios\n" +
                        "CODE EXAMPLE: basic implementation in " + language + "\n" +
                        "REAL WORLD USE: where it is used in actual software";

            case "code_compare":
                return "You are a coding expert. Compare these two code approaches.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Compare on: time complexity, space complexity, readability, performance, when to use each.\n" +
                        "Show a table with all comparisons.\n" +
                        "Give a clear recommendation on which approach is better and why.\n" +
                        "Give example where each approach is preferred.";

            case "pattern":
                return "You are a coding expert. Identify the coding pattern used in this problem or code.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Identify: the pattern name, why this pattern fits, how to recognize it in future problems.\n" +
                        "List other problems that use the same pattern.\n" +
                        "Give a template code for this pattern in " + language + ".";

            case "pseudocode":
                return "You are a coding teacher. Write pseudocode for this problem before coding.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Write clear pseudocode step by step.\n" +
                        "After pseudocode, convert it to actual " + language + " code.\n" +
                        "Explain how each pseudocode step maps to the real code.\n" +
                        "This helps understand the logic before writing actual code.";

            case "project_idea":
                return "You are a project mentor. Suggest college project ideas related to: " + goal + "\n\n" +
                        "Give 5 project ideas.\n" +
                        "For each project give: project name, description, technologies to use, difficulty level, and what the student will learn.\n" +
                        "Include at least one AI-based project idea.\n" +
                        "Make projects suitable for final year or internship portfolio.";

            case "roadmap":
                return "You are a learning mentor. Create a complete learning roadmap for: " + goal + "\n\n" +
                        "Divide into phases: Beginner, Intermediate, Advanced.\n" +
                        "For each phase list: topics to learn, resources to use, time needed, and mini projects to build.\n" +
                        "Give a realistic timeline assuming 1 hour per day.\n" +
                        "Focus on skills that are in-demand for jobs.";

            // ═══════════════════════════════
            // INTERVIEW PREP (51-60)
            // ═══════════════════════════════

            case "interview_q":
                return "You are an interview coach. Generate interview questions and answers for: " + goal + "\n\n" +
                        "Give 5 technical questions with detailed answers.\n" +
                        "Give 3 conceptual questions with clear explanations.\n" +
                        "Give 2 situational questions with STAR method answers.\n" +
                        "Mark which questions are asked frequently in top companies.";

            case "coding_pattern":
                return "You are an interview coach. Explain the most important coding patterns for interviews.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Cover these patterns: Sliding Window, Two Pointer, Fast and Slow Pointer, Merge Intervals, Cyclic Sort, Tree BFS, Tree DFS, Two Heaps, Subsets, Binary Search.\n" +
                        "For each pattern: when to use it, template code in " + language + ", and one example problem.";

            case "hr_questions":
                return "You are an HR interview coach. Generate HR interview questions and ideal answers.\n\n" +
                        "Give 10 common HR questions.\n" +
                        "For each question give: the question, what the interviewer really wants to know, and a sample strong answer.\n" +
                        "Include questions about: strengths, weaknesses, teamwork, conflict, goals, and company fit.\n" +
                        "Make answers sound natural and confident.";

            case "system_design":
                return "You are a system design expert. Explain the system design for: " + goal + "\n\n" +
                        "Cover: requirements clarification, high level design, component details, database design, API design, scalability, and trade-offs.\n" +
                        "Draw a simple text-based architecture diagram.\n" +
                        "Explain each component and why it is needed.\n" +
                        "Give estimated capacity and scale numbers.";

            case "resume_tips":
                return "You are a resume coach. Give resume writing tips for the role: " + goal + "\n\n" +
                        "Give tips for: summary section, skills section, experience section, projects section, education section.\n" +
                        "List the most important keywords to include for this role.\n" +
                        "Give 3 example bullet points showing weak vs strong resume writing.\n" +
                        "Tell what recruiters look for in the first 30 seconds.";

            case "answer_star":
                return "You are an interview coach. Answer this interview question using the STAR method: " + goal + "\n\n" +
                        "Give a complete STAR answer:\n" +
                        "SITUATION: describe the context in 2 sentences\n" +
                        "TASK: describe your responsibility in 2 sentences\n" +
                        "ACTION: describe exactly what you did in 3 to 4 sentences\n" +
                        "RESULT: describe the outcome with numbers if possible in 2 sentences\n\n" +
                        "Also explain why this answer is strong and what to avoid.";

            case "mock_interview":
                return "You are an interviewer at a top tech company. Conduct a mock interview for the role: " + goal + "\n\n" +
                        "Ask 5 interview questions one by one.\n" +
                        "After each question give: what a strong answer looks like, common mistakes to avoid, and key points to mention.\n" +
                        "Include mix of technical, behavioral, and situational questions.\n" +
                        "End with overall feedback and areas to improve.";

            case "company_prep":
                return "You are an interview coach. Help prepare for interview at: " + goal + "\n\n" +
                        "Give: company overview, tech stack they use, common interview questions, interview process rounds, what they look for in candidates.\n" +
                        "Give 5 company-specific technical questions.\n" +
                        "Give tips on how to research the company before interview.\n" +
                        "List important topics to study for this company.";

            case "salary_tips":
                return "You are a career coach. Give salary negotiation tips for the role: " + goal + "\n\n" +
                        "Give 5 practical negotiation tips.\n" +
                        "Give sample scripts for: asking about salary, countering an offer, asking for time to decide.\n" +
                        "Tell what benefits to negotiate besides salary.\n" +
                        "Give the typical salary range for this role in India.";

            case "career_path":
                return "You are a career counselor. Explain the career path for: " + goal + "\n\n" +
                        "Show progression from entry level to senior level.\n" +
                        "For each level give: job title, years of experience needed, skills required, and average salary in India.\n" +
                        "Give tips on how to grow faster in this career.\n" +
                        "List top companies hiring for this field.";

            // ═══════════════════════════════
            // MATH & SCIENCE (61-75)
            // ═══════════════════════════════

            case "math_solve":
                return "You are a math teacher. Solve this problem step by step.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Show every single step clearly.\n" +
                        "Write the formula used at each step.\n" +
                        "Box the final answer clearly.\n" +
                        "At the end explain the concept used to solve this problem.\n" +
                        "Give one similar practice problem with answer.";

            case "math_explain":
                return "You are a math teacher. Explain this math concept clearly: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Give: simple definition, why it is important, key formulas, step by step example, and common mistakes students make.\n" +
                        "Use simple language a student can understand.\n" +
                        "Give 2 practice problems with solutions.";

            case "derivatives":
                return "You are a calculus teacher. Find the derivative of this function step by step.\n\n" +
                        "Function: " + content + "\n\n" +
                        "Show: which differentiation rule is applied, every step of working, and the final simplified answer.\n" +
                        "Name the rule used: power rule, chain rule, product rule, quotient rule, etc.\n" +
                        "Give the derivative of similar functions for practice.";

            case "integrals":
                return "You are a calculus teacher. Evaluate this integral step by step.\n\n" +
                        "Integral: " + content + "\n\n" +
                        "Show: which integration technique is used, every step of working, adding constant C if indefinite, and the final answer.\n" +
                        "Name the technique used: substitution, integration by parts, partial fractions, etc.\n" +
                        "Give a similar integral for practice with answer.";

            case "graph":
                return "You are a math teacher. Explain how to sketch the graph of: " + content + "\n\n" +
                        "Give: domain and range, x and y intercepts, symmetry, increasing and decreasing intervals, maximum and minimum points, and asymptotes if any.\n" +
                        "Describe the overall shape of the graph.\n" +
                        "Give key points to plot for an accurate sketch.";

            case "chemistry":
                return "You are a chemistry teacher. Explain or solve: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "If it is a reaction: give balanced equation, type of reaction, and products formed.\n" +
                        "If it is a concept: give definition, mechanism, and real example.\n" +
                        "List important points to remember for exam.\n" +
                        "Give common exam questions on this topic.";

            case "physics":
                return "You are a physics teacher. Solve this physics problem step by step.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Give: list the given values, identify what to find, write the formula, substitute values, show calculation, and state the final answer with units.\n" +
                        "Explain the physics concept behind the problem.\n" +
                        "Give one similar practice problem.";

            case "bio":
                return "You are a biology teacher. Explain this biology topic: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Give: clear explanation of the process, step by step if it is a process, key terms and their meanings, diagram description if applicable.\n" +
                        "List important points for exam.\n" +
                        "Give 3 expected exam questions with answers.";

            case "stats":
                return "You are a statistics teacher. Solve this statistics problem step by step.\n\n" +
                        "Data: " + content + "\n\n" +
                        "Calculate all relevant statistics: mean, median, mode, variance, standard deviation as applicable.\n" +
                        "Show every calculation step.\n" +
                        "Interpret what the results mean.\n" +
                        "Give a practice problem with similar data.";

            case "probability":
                return "You are a probability teacher. Solve this probability problem step by step.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Identify: type of probability problem, formula to use, sample space if needed.\n" +
                        "Show every step of calculation.\n" +
                        "Give the final probability as fraction, decimal, and percentage.\n" +
                        "Explain what the answer means in plain language.";

            case "linear_algebra":
                return "You are a linear algebra teacher. Solve this linear algebra problem step by step.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Show all matrix operations clearly.\n" +
                        "Explain each step with the rule or property used.\n" +
                        "Give the final answer clearly.\n" +
                        "Explain when this type of problem appears in real applications.";

            case "calculus":
                return "You are a calculus teacher. Solve this calculus problem step by step.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Identify which calculus concept is needed.\n" +
                        "Show every step with the rule used.\n" +
                        "Give the final answer clearly.\n" +
                        "Explain the concept used and give a similar practice problem.";

            case "geometry":
                return "You are a geometry teacher. Solve this geometry problem step by step.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Draw a text-based diagram if helpful.\n" +
                        "List the given information, write the formula, show calculation, and give the final answer with units.\n" +
                        "Name the theorem or property used.\n" +
                        "Give a similar practice problem.";

            case "trig":
                return "You are a trigonometry teacher. Solve this trigonometry problem step by step.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Show: which trig identity or formula is used, every step of simplification, and the final answer.\n" +
                        "List all trig identities used.\n" +
                        "Give the value in both exact form and decimal form.\n" +
                        "Give a similar practice problem.";

            case "number_theory":
                return "You are a number theory teacher. Solve this number theory problem step by step.\n\n" +
                        "Problem: " + content + "\n\n" +
                        "Show the theorem or property used.\n" +
                        "Give complete proof or solution with every step.\n" +
                        "Explain the concept in simple terms.\n" +
                        "Give related number theory problems to practice.";

            // ═══════════════════════════════
            // RESEARCH & AI (76-90)
            // ═══════════════════════════════

            case "summarize_research":
                return "You are a research assistant. Summarize this research paper clearly.\n\n" +
                        "Paper: " + content + "\n\n" +
                        "Give:\n" +
                        "OBJECTIVE: what the paper tries to solve\n" +
                        "METHODOLOGY: how they did it\n" +
                        "KEY FINDINGS: main results in bullet points\n" +
                        "CONCLUSION: what was concluded\n" +
                        "LIMITATIONS: what the paper did not cover\n" +
                        "RELEVANCE: who should read this and why";

            case "cite":
                return "You are a research assistant. Generate citations for this source.\n\n" +
                        "Source details: " + content + "\n\n" +
                        "Generate citation in these formats:\n" +
                        "APA format\n" +
                        "MLA format\n" +
                        "IEEE format\n" +
                        "Chicago format\n\n" +
                        "Also show how to cite it as in-text citation in APA format.";

            case "references":
                return "You are a research assistant. Suggest relevant references and sources for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Give 5 types of credible sources to look for.\n" +
                        "Suggest search keywords to find papers on this topic.\n" +
                        "List recommended databases: IEEE, ACM, Google Scholar, etc.\n" +
                        "Give tips on evaluating source credibility.";

            case "verify_citation":
                return "You are a research assistant. Evaluate the credibility of this source.\n\n" +
                        "Source: " + content + "\n\n" +
                        "Check for: author credibility, publication quality, recency, citation count if mentioned, and bias.\n" +
                        "Give a trust rating: HIGH, MEDIUM, or LOW with reasons.\n" +
                        "Suggest how to cross-verify this information.\n" +
                        "List any red flags if present.";

            case "related_research":
                return "You are a research assistant. Suggest related research areas for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Give 5 related research topics worth exploring.\n" +
                        "For each topic explain the connection and what gap it fills.\n" +
                        "Suggest specific research questions to investigate.\n" +
                        "Recommend starting resources for each related topic.";

            case "ai_explain":
                return "You are an AI educator. Explain this AI concept clearly: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Give: simple definition, how it works step by step, real world applications, advantages and limitations.\n" +
                        "Use an analogy to make it easy to understand.\n" +
                        "Give code example if applicable.\n" +
                        "List related AI concepts to learn next.";

            case "ml_model":
                return "You are an ML educator. Explain this machine learning model: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Cover: type of learning, algorithm explanation, when to use it, hyperparameters, advantages and disadvantages.\n" +
                        "Give a simple Python code example.\n" +
                        "Compare with similar models.\n" +
                        "List real datasets to practice with.";

            case "nn_arch":
                return "You are a deep learning educator. Explain this neural network architecture.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Cover: input layer, hidden layers, output layer, activation functions used, loss function, optimizer.\n" +
                        "Draw a simple text-based architecture diagram.\n" +
                        "Explain what each layer learns.\n" +
                        "Give a simple implementation example.";

            case "deep_learning":
                return "You are a deep learning educator. Explain this deep learning concept: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Give: concept explanation, mathematical intuition in simple terms, architecture used, training process, real applications.\n" +
                        "Compare with traditional machine learning approach.\n" +
                        "Give a simple code example.\n" +
                        "List important papers on this topic.";

            case "nlp":
                return "You are an NLP educator. Explain this NLP concept: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Cover: what the task is, common approaches to solve it, popular models used, evaluation metrics, real applications.\n" +
                        "Give a simple code example using Python.\n" +
                        "List popular NLP libraries and tools.\n" +
                        "Give practice datasets for this NLP task.";

            case "cv":
                return "You are a computer vision educator. Explain this computer vision concept: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Cover: what the task involves, popular algorithms and models, how they work, applications in industry.\n" +
                        "Give a simple code example using OpenCV or PyTorch.\n" +
                        "Compare different approaches.\n" +
                        "List benchmark datasets for this task.";

            case "data_viz":
                return "You are a data visualization expert. Suggest the best visualization approach for this data.\n\n" +
                        "Data: " + content + "\n\n" +
                        "Recommend the best chart type and explain why.\n" +
                        "Give alternatives and when to use each.\n" +
                        "Provide code example in Python using matplotlib or seaborn.\n" +
                        "List best practices for clear and effective data visualization.";

            case "ethics_ai":
                return "You are an AI ethics expert. Discuss the ethical considerations for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Cover: bias and fairness, privacy concerns, transparency and explainability, accountability, social impact.\n" +
                        "Give real examples of ethical issues that occurred.\n" +
                        "Suggest guidelines for responsible AI development.\n" +
                        "Discuss relevant laws and regulations.";

            case "ai_trends":
                return "You are an AI researcher. Explain the latest trends in AI for: " + goal + "\n\n" +
                        "Give the top 5 AI trends that are most relevant in 2025 and 2026.\n" +
                        "For each trend: what it is, why it matters, current state, and future direction.\n" +
                        "Mention key companies and research labs leading in each area.\n" +
                        "Give advice on which trends are most important to follow for a student.";

            case "career_ai":
                return "You are an AI career counselor. Give career guidance for: " + goal + " in the AI field.\n\n" +
                        "Cover: roles available, skills required, salary range in India, companies hiring, how to get started.\n" +
                        "Give a 6 month plan to become job-ready in this AI role.\n" +
                        "List top certifications and courses.\n" +
                        "Give tips on building an AI portfolio.";

            // ═══════════════════════════════
            // BONUS EXTRAS (91-100)
            // ═══════════════════════════════

            case "translate":
                return "You are a study assistant. Explain the following content in very simple English that a school student can understand.\n\n" +
                        "Content: " + content + "\n\n" +
                        "Use only common everyday words.\n" +
                        "Break down every difficult term.\n" +
                        "Use short sentences.\n" +
                        "Give a simple analogy from daily life to explain the main idea.";

            case "voice_note":
                return "You are a study assistant. Summarize these rough notes into clean organized study material.\n\n" +
                        "Notes: " + content + "\n\n" +
                        "Organize the notes with clear headings.\n" +
                        "Fix any incomplete points and make them complete.\n" +
                        "Highlight the most important points.\n" +
                        "Remove any irrelevant or repeated information.";

            case "ask_ai":
                return "You are a knowledgeable AI assistant. Answer this question thoroughly: " + goal + "\n\n" +
                        "Context: " + content + "\n\n" +
                        "Give a complete and accurate answer.\n" +
                        "Use examples to clarify.\n" +
                        "If the question has multiple parts answer each part separately.\n" +
                        "At the end suggest related questions the student might want to explore.";

            case "debate":
                return "You are a debate coach. Present both sides of this topic: " + goal + "\n\n" +
                        "Give 4 strong arguments FOR the topic.\n" +
                        "Give 4 strong arguments AGAINST the topic.\n" +
                        "Give evidence or examples for each argument.\n" +
                        "End with a balanced conclusion that considers both sides.\n" +
                        "Do not show personal bias.";

            case "story":
                return "You are a creative teacher. Explain this concept as an engaging story: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Create a short story where characters or objects represent the concepts.\n" +
                        "Make the story interesting and easy to follow.\n" +
                        "After the story, explain how the story maps to the actual concept.\n" +
                        "The story should help the student remember the concept easily.";

            case "analogy":
                return "You are a creative teacher. Explain this concept using a simple analogy: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Create 2 different analogies from everyday life.\n" +
                        "For each analogy explain: what represents what, how the comparison works, and where the analogy breaks down.\n" +
                        "The analogy should make a complex concept feel obvious and simple.";

            case "mindmap":
                return "You are a study assistant. Create a text-based mind map for: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Show the central topic in the middle.\n" +
                        "Branch out to main topics.\n" +
                        "Branch each main topic to subtopics.\n" +
                        "Use indentation and symbols to show hierarchy clearly.\n" +
                        "Cover all important aspects of the topic.";

            case "acronym":
                return "You are a memory expert. Create acronyms to remember the key concepts in: " + goal + "\n\n" +
                        "Content: " + content + "\n\n" +
                        "Create at least 2 meaningful acronyms.\n" +
                        "For each acronym: give the word, explain what each letter stands for, and show how it helps remember the concept.\n" +
                        "Make the acronyms pronounceable and easy to recall under exam pressure.";

            case "recommend":
                return "You are a learning mentor. Recommend the best resources to learn: " + goal + "\n\n" +
                        "Give recommendations for: best books, best YouTube channels, best websites, best courses, best practice platforms.\n" +
                        "For each resource give the name, why it is recommended, and who it is best for beginner intermediate or advanced.\n" +
                        "Focus on free resources first then paid options.\n" +
                        "Give a suggested order to use these resources.";

            case "motivate":
                return "You are a student motivator. Give an encouraging and motivating message for a student studying: " + goal + "\n\n" +
                        "Give a powerful motivational quote relevant to studying and exams.\n" +
                        "Give 3 practical tips to stay focused and motivated while studying.\n" +
                        "Remind the student why their hard work will pay off.\n" +
                        "Keep the tone warm, encouraging, and energetic.\n" +
                        "End with a strong call to action to get back to studying.";

            default:
                return "You are a study assistant. Help the student understand this content clearly.\n\n" +
                        "Topic: " + goal + "\n" +
                        "Content: " + content + "\n\n" +
                        "Give a clear explanation with key points, examples, and what is important to remember for exam.\n" +
                        "Use simple language suitable for a student.";
        }
    }

}