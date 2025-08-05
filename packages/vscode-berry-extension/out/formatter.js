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
    provideDocumentRangeFormattingEdits(document, range, options, token) {
        console.log("Range formatting requested for range:", range);
        return this.format(document, options);
    }
    provideDocumentRangesFormattingEdits(document, ranges, options, token) {
        console.log("Range formatting requested");
        return this.formatRange(document, ranges[0], options);
    }
    format(document, options) {
        const edits = [];
        // Your formatting logic
        return edits;
    }
    formatRange(document, range, options) {
        const edits = [];
        document.lineAt(range.start.line);
        for (let i = range.start.line; i <= range.end.line; i++) {
            const line = document.lineAt(i);
            // const formattedLine = this.formatBerryCode(line.text, options);
            // edits.push(vscode.TextEdit.replace(line.range, formattedLine));
        }
        return edits;
    }
    provideDocumentFormattingEdits(document, options, token) {
        const edits = [];
        const text = document.getText();
        let formattedText = this.formatBerryCode(text, options);
        // Replace the entire document with formatted text
        // const firstLine = document.lineAt(0);
        // const lastLine = document.lineAt(document.lineCount - 1);
        // const range = new vscode.Range(firstLine.range.start, lastLine.range.end);
        // edits.push(vscode.TextEdit.replace(range, formattedText));
        return edits;
    }
    formatBerryCode(code, options) {
        // new Lexer()
        const tkn = new berrycore_1.LexerEngine(code).tokenize();
        console.log(tkn);
        new berrycore_1.LexerEngine(code);
        return code;
    }
}
exports.BerryFormatter = BerryFormatter;
// Register the formatter in your extension's activate function
function registerFormatter(context) {
    const formatter = new BerryFormatter();
    // Document formatting (Format Document command)
    const docFormatter = vscode.languages.registerDocumentFormattingEditProvider({ language: "berry" }, // Try this syntax instead
    formatter);
    // Range formatting (Format Selection command)
    const rangeFormatter = vscode.languages.registerDocumentRangeFormattingEditProvider({ language: "berry" }, formatter);
    context.subscriptions.push(docFormatter, rangeFormatter);
}
//# sourceMappingURL=formatter.js.map