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
exports.BerryFormatter = void 0;
exports.registerFormatter = registerFormatter;
const vscode = __importStar(require("vscode"));
const berrycore_1 = require("@flexiberry/berrycore");
class BerryFormatter {
    provideDocumentFormattingEdits(document, options, token) {
        const text = document.getText();
        try {
            const tokens = new berrycore_1.LexerEngine(text).tokenize();
            const ast = new berrycore_1.AstEngine(tokens).build();
            const formatter = new berrycore_1.BerryFormatter({
                indentSize: options.tabSize ?? 8,
            });
            const formattedText = formatter.format(ast);
            if (document.lineCount === 0)
                return [];
            const firstLine = document.lineAt(0);
            const lastLine = document.lineAt(document.lineCount - 1);
            const range = new vscode.Range(firstLine.range.start, lastLine.range.end);
            return [vscode.TextEdit.replace(range, formattedText)];
        }
        catch (e) {
            // If there's a syntax error, we silently fail formatting so we don't clear the file
            console.warn("Berry formatting skipped due to error:", e.message);
            return [];
        }
    }
}
exports.BerryFormatter = BerryFormatter;
// Register the formatter in your extension's activate function
function registerFormatter(context) {
    const formatter = new BerryFormatter();
    // Document formatting (Format Document command)
    const docFormatter = vscode.languages.registerDocumentFormattingEditProvider({ language: "berry" }, formatter);
    context.subscriptions.push(docFormatter);
}
//# sourceMappingURL=formatter.js.map