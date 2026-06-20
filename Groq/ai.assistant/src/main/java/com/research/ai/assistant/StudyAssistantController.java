package com.research.ai.assistant;


import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(value = "*")
@AllArgsConstructor
public class StudyAssistantController {

    private final StudyAssistantService studyAssistantService;


//    public ResearchController(ResearchService researchService) {
//        this.researchService = researchService;
//    }

    @PostMapping("/assist")
    public ResponseEntity<String> processContent(@RequestBody StudyRequest request) {
        try{
            String result = studyAssistantService.processContent(request);
            return ResponseEntity.ok(result);

        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());

        }

    }

    // Get all available operations
    @GetMapping("/operations")
    public ResponseEntity<List<String>> getOperations() {
        List<String> operations = Arrays.asList(
                // Core Study (1-20)
                "summarize", "keypoints", "notes", "define", "examples",
                "compare", "formulas", "diagram", "timeline", "pros_cons",
                "why_how", "difficult", "realworld", "related", "flashcards",
                "mnemonics", "study_plan", "check_understanding", "quiz", "essay_write",

                // Exam Prep (21-35)
                "exam_questions", "mistakes", "tricks", "past_questions", "answer_template",
                "score_predictor", "highlights", "quick_summary", "onepager", "revision",
                "important", "weightage", "tips_exam", "time_mgmt", "stress",

                // Coding (36-50)
                "code", "code_explain", "optimize", "debug", "convert",
                "complexity", "test", "leetcode", "algorithm", "datastructure",
                "code_compare", "pattern", "pseudocode", "project_idea", "roadmap",

                // Interview Prep (51-60)
                "interview_q", "coding_pattern", "hr_questions", "system_design", "resume_tips",
                "answer_star", "mock_interview", "company_prep", "salary_tips", "career_path",

                // Math & Science (61-75)
                "math_solve", "math_explain", "derivatives", "integrals", "graph",
                "chemistry", "physics", "bio", "stats", "probability",
                "linear_algebra", "calculus", "geometry", "trig", "number_theory",

                // Research & AI (76-90)
                "summarize_research", "cite", "references", "verify_citation", "related_research",
                "ai_explain", "ml_model", "nn_arch", "deep_learning", "nlp",
                "cv", "data_viz", "ethics_ai", "ai_trends", "career_ai",

                // Bonus Extras (91-100)
                "translate", "voice_note", "ask_ai", "debate", "story",
                "analogy", "mindmap", "acronym", "recommend", "motivate"
        );
        return ResponseEntity.ok(operations);
    }
}
