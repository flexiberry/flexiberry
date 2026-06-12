import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  TextDocumentSyncKind,
  InitializeResult,
  DocumentFormattingParams,
  TextEdit,
  CompletionItem,
  TextDocumentPositionParams
} from 'vscode-languageserver/node.js';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { validateTextDocument } from './features/diagnostics.js';
import { formatTextDocument } from './features/formatting.js';
import { getCompletions } from './features/completion.js';

// Create a connection for the server, using Node's IPC as a transport.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      documentFormattingProvider: true,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: [' ', '#', '@', ':']
      }
    }
  };
});

// The content of a text document has changed.
documents.onDidChangeContent(async (change) => {
  const diagnostics = await validateTextDocument(change.document);
  connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
});

// Support Auto-complete / IntelliSense suggestions
connection.onCompletion(
  (textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    const document = documents.get(textDocumentPosition.textDocument.uri);
    if (!document) {
      return [];
    }
    return getCompletions(document, textDocumentPosition.position);
  }
);

connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    return item;
  }
);

// Support formatting
connection.onDocumentFormatting((params: DocumentFormattingParams): TextEdit[] => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return [];
  }
  try {
    return formatTextDocument(document, params);
  } catch (e: any) {
    connection.console.warn(e.message);
    return [];
  }
});

// Listen on the documents and connection
documents.listen(connection);
connection.listen();
