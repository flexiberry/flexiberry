import * as vscode from "vscode";
import { registerFormatter } from "./formatter";
import { LexerEngine, AstEngine } from "@flexiberry/berrycore";

export function activate(context: vscode.ExtensionContext) {
  // Register the formatter
  registerFormatter(context);

  // Set up Diagnostic Collection for Language Service
  const diagnosticCollection = vscode.languages.createDiagnosticCollection("berry");
  context.subscriptions.push(diagnosticCollection);

  // Update diagnostics for a specific document
  const updateDiagnostics = (document: vscode.TextDocument) => {
    if (document.languageId !== "berry") return;

    const text = document.getText();
    const diagnostics: vscode.Diagnostic[] = [];

    try {
      const tokens = new LexerEngine(text).tokenize();
      new AstEngine(tokens).build();
      
      // If parsing succeeds, clear any previous diagnostics
      diagnosticCollection.set(document.uri, []);
    } catch (e: any) {
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
          } else {
            // Provide a sensible default fallback, clamped to line length
            const safeCol = Math.min(col, docLine.text.length);
            const safeEndCol = Math.min(safeCol + 1, docLine.text.length || 1);
            range = new vscode.Range(line, safeCol, line, safeEndCol);
          }
        } catch (err) {
          // Ignore range creation errors if line/col is completely malformed
        }

        const diagnostic = new vscode.Diagnostic(
          range,
          e.message,
          vscode.DiagnosticSeverity.Error
        );
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
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => {
      updateDiagnostics(document);
    }),
    vscode.workspace.onDidChangeTextDocument((event) => {
      updateDiagnostics(event.document);
    }),
    vscode.workspace.onDidCloseTextDocument((document) => {
      diagnosticCollection.delete(document.uri);
    })
  );
}

export function deactivate() {}
