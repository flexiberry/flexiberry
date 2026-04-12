"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const formatter_1 = require("./formatter");
const berrycore_1 = require("@flexiberry/berrycore");
function activate(context) {
    // Register the formatter
    (0, formatter_1.registerFormatter)(context);
    // Set up Diagnostic Collection for Language Service
    const diagnosticCollection = vscode.languages.createDiagnosticCollection("berry");
    context.subscriptions.push(diagnosticCollection);
    // Update diagnostics for a specific document
    const updateDiagnostics = (document) => {
        if (document.languageId !== "berry")
            return;
        const text = document.getText();
        const diagnostics = [];
        try {
            const tokens = new berrycore_1.LexerEngine(text).tokenize();
            new berrycore_1.AstEngine(tokens).build();
            // If parsing succeeds, clear any previous diagnostics
            diagnosticCollection.set(document.uri, []);
        }
        catch (e) {
            if (e.name === "LexerError" || e.name === "ParserError") {
                // e.line and e.column are 0-indexed in our errors
                let line = e.line ?? 0;
                let col = e.column ?? 0;
                // Ensure bounds are safe
                if (line >= document.lineCount) {
                    line = document.lineCount > 0 ? document.lineCount - 1 : 0;
                }
                // Use the current word range or fallback to a 1-character length
                let range = new vscode.Range(line, col, line, col + 1);
                try {
                    const docLine = document.lineAt(line);
                    const wordRange = document.getWordRangeAtPosition(new vscode.Position(line, col));
                    if (wordRange) {
                        range = wordRange;
                    }
                    else {
                        // Provide a sensible default fallback, clamped to line length
                        const safeCol = Math.min(col, docLine.text.length);
                        const safeEndCol = Math.min(safeCol + 1, docLine.text.length || 1);
                        range = new vscode.Range(line, safeCol, line, safeEndCol);
                    }
                }
                catch (err) {
                    // Ignore range creation errors if line/col is completely malformed
                }
                const diagnostic = new vscode.Diagnostic(range, e.message, vscode.DiagnosticSeverity.Error);
                diagnostic.source = "Berry Language Service";
                diagnostics.push(diagnostic);
            }
            diagnosticCollection.set(document.uri, diagnostics);
        }
    };
    // Perform check on all currently open Berry documents
    if (vscode.window.activeTextEditor) {
        updateDiagnostics(vscode.window.activeTextEditor.document);
    }
    vscode.workspace.textDocuments.forEach(doc => updateDiagnostics(doc));
    // Trigger diagnostics on doc open and changes
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument((document) => {
        updateDiagnostics(document);
    }), vscode.workspace.onDidChangeTextDocument((event) => {
        updateDiagnostics(event.document);
    }), vscode.workspace.onDidCloseTextDocument((document) => {
        diagnosticCollection.delete(document.uri);
    }));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map