import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  TextDocumentSyncKind,
  InitializeResult,
  DocumentFormattingParams,
  TextEdit,
  Range,
  Position
} from 'vscode-languageserver/node.js';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { LexerEngine, AstEngine, BerryFormatter } from '@flexiberry/berrycore';

// Create a connection for the server, using Node's IPC as a transport.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      documentFormattingProvider: true
    }
  };
});

// The content of a text document has changed.
documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
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

  // Send the computed diagnostics to client.
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// Support formatting
connection.onDocumentFormatting((params: DocumentFormattingParams): TextEdit[] => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return [];
  }

  const text = document.getText();
  try {
    const tokens = new LexerEngine(text).tokenize();
    const ast = new AstEngine(tokens).build();
    const formatter = new BerryFormatter({
      indentSize: params.options.tabSize ?? 4,
    });
    const formattedText = formatter.format(ast);

    // Full document range replacement
    const fullRange = Range.create(
      Position.create(0, 0),
      document.positionAt(text.length)
    );

    return [TextEdit.replace(fullRange, formattedText)];
  } catch (e: any) {
    connection.console.warn(`Berry formatting skipped due to error: ${e.message}`);
    return [];
  }
});

// Listen on the documents and connection
documents.listen(connection);
connection.listen();
