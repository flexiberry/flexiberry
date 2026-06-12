import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver/node.js';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { LexerEngine, AstEngine } from '@flexiberry/berrycore';

/**
 * Validates a text document using the Lexer and Parser, compiling syntax errors
 * into standard LSP Diagnostics.
 */
export async function validateTextDocument(textDocument: TextDocument): Promise<Diagnostic[]> {
  const text = textDocument.getText();
  const diagnostics: Diagnostic[] = [];

  try {
    const tokens = new LexerEngine(text).tokenize();
    new AstEngine(tokens).build();
  } catch (e: any) {
    if (e.name === 'LexerError' || e.name === 'ParserError') {
      let line = e.line ?? 0;
      let col = e.column ?? 0;

      // Ensure bounds are safe
      if (line >= textDocument.lineCount) {
        line = textDocument.lineCount > 0 ? textDocument.lineCount - 1 : 0;
      }

      // Check the line length to avoid range boundary issues
      let lineText = '';
      try {
        const lines = text.split(/\r?\n/);
        lineText = lines[line] || '';
      } catch (err) {}

      const safeCol = Math.min(col, lineText.length);
      const safeEndCol = Math.min(safeCol + 1, lineText.length || 1);

      const diagnostic: Diagnostic = {
        severity: DiagnosticSeverity.Error,
        range: {
          start: { line, character: safeCol },
          end: { line, character: safeEndCol }
        },
        message: e.message || 'Syntax Error',
        source: 'Berry Language Server'
      };

      diagnostics.push(diagnostic);
    }
  }

  return diagnostics;
}
