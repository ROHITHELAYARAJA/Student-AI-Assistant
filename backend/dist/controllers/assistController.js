"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAssist = handleAssist;
exports.handleGetOperations = handleGetOperations;
exports.handleHealth = handleHealth;
const operationsList_js_1 = require("../services/operationsList.js");
const aiService_js_1 = require("../services/aiService.js");
async function handleAssist(req, res) {
    try {
        const studyReq = {
            content: req.body.content || '',
            operation: req.body.operation || 'summarize',
            researchGoal: req.body.researchGoal,
            programmingLanguage: req.body.programmingLanguage || req.body.ProgrammingLanguage,
            subject: req.body.subject,
            studyTopic: req.body.studyTopic
        };
        const response = await (0, aiService_js_1.processStudyRequest)(studyReq);
        res.json(response);
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to process request',
            message: error?.message || 'Unknown processing error'
        });
    }
}
function handleGetOperations(_req, res) {
    res.json({
        total: operationsList_js_1.ALL_OPERATIONS.length,
        operations: operationsList_js_1.ALL_OPERATIONS
    });
}
function handleHealth(_req, res) {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
}
