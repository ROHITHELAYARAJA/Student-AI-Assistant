"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const assistController_js_1 = require("./controllers/assistController.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json({ limit: '15mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '15mb' }));
app.get('/api/health', assistController_js_1.handleHealth);
app.get('/api/operations', assistController_js_1.handleGetOperations);
app.post('/api/assist', assistController_js_1.handleAssist);
app.listen(PORT, () => {
    process.stdout.write(`Student AI Assistant backend server running on http://localhost:${PORT}\n`);
});
exports.default = app;
