import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat
} from 'vscode-languageserver/node.js';
import { TextDocument } from 'vscode-languageserver-textdocument';

/**
 * Returns autocomplete / IntelliSense suggestions based on context and cursor position.
 */
export function getCompletions(
  document: TextDocument,
  position: { line: number; character: number }
): CompletionItem[] {
  const text = document.getText();
  const lines = text.split(/\r?\n/);
  const lineIndex = position.line;
  const currentLine = lines[lineIndex] || '';

  // Determine current block context by scanning upwards
  let context: 'top' | 'api' | 'task' | 'step' | 'var' | 'params' | 'capture' | 'check' = 'top';

  for (let i = lineIndex - 1; i >= 0; i--) {
    const lineText = (lines[i] || '').trim();
    if (lineText.startsWith('Api')) {
      context = 'api';
      break;
    }
    if (lineText.startsWith('Step')) {
      context = 'step';
      break;
    }
    if (lineText.startsWith('Task')) {
      context = 'task';
      break;
    }
    if (lineText.startsWith('Var')) {
      context = 'var';
      break;
    }
    if (lineText.startsWith('Params')) {
      context = 'params';
      break;
    }
    if (lineText.startsWith('Capture')) {
      context = 'capture';
      break;
    }
    if (lineText.startsWith('Check')) {
      context = 'check';
      break;
    }
  }

  const items: CompletionItem[] = [];

  // Inline line completions
  const currentLineTrimmed = currentLine.substring(0, position.character);
  if (/^\s*Api\s+$/i.test(currentLineTrimmed)) {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    methods.forEach(m => {
      items.push({
        label: m,
        kind: CompletionItemKind.Method,
        detail: `HTTP ${m} method`
      });
    });
    return items;
  }

  if (/^\s*Step\s+$/i.test(currentLineTrimmed)) {
    items.push({
      label: 'Call Api',
      kind: CompletionItemKind.Keyword,
      detail: 'Call an API definition'
    });
    return items;
  }

  // Context-sensitive block completions
  if (context === 'api') {
    items.push(
      {
        label: 'Url',
        kind: CompletionItemKind.Keyword,
        detail: 'API Endpoint URL',
        insertText: 'Url ${1:https://api.example.com/v1/resource}',
        insertTextFormat: InsertTextFormat.Snippet
      },
      {
        label: 'Header',
        kind: CompletionItemKind.Keyword,
        detail: 'API Request Headers block',
        insertText: 'Header\n- ${1:key}: "${2:value}"',
        insertTextFormat: InsertTextFormat.Snippet
      },
      {
        label: 'Body JSON',
        kind: CompletionItemKind.Keyword,
        detail: 'API JSON Request Body',
        insertText: 'Body JSON `\n{\n  "${1:key}": "${2:value}"\n}\n`',
        insertTextFormat: InsertTextFormat.Snippet
      }
    );
  } else if (context === 'task') {
    items.push(
      {
        label: 'Step Call Api',
        kind: CompletionItemKind.Keyword,
        detail: 'Task step execution',
        insertText: 'Step Call Api ${1:apiName}',
        insertTextFormat: InsertTextFormat.Snippet
      }
    );
  } else if (context === 'step') {
    items.push(
      {
        label: 'Params',
        kind: CompletionItemKind.Keyword,
        detail: 'Step request parameters block',
        insertText: 'Params\n- ${1:paramName}: ${2:value}',
        insertTextFormat: InsertTextFormat.Snippet
      },
      {
        label: 'Capture',
        kind: CompletionItemKind.Keyword,
        detail: 'Step response variable capture block',
        insertText: 'Capture\n- ${1:varName}: response.body.${2:path}',
        insertTextFormat: InsertTextFormat.Snippet
      },
      {
        label: 'Check',
        kind: CompletionItemKind.Keyword,
        detail: 'Step assertion validations block',
        insertText: 'Check\n- response.status == ${1:200}',
        insertTextFormat: InsertTextFormat.Snippet
      }
    );
  } else {
    // Top-level block declarations
    items.push(
      {
        label: 'Var',
        kind: CompletionItemKind.Keyword,
        detail: 'Declare variables block',
        insertText: 'Var ${1:ConfigName}\n- ${2:key}: "${3:value}"',
        insertTextFormat: InsertTextFormat.Snippet
      },
      {
        label: 'Api GET Template',
        kind: CompletionItemKind.Snippet,
        detail: 'Create a GET API definition',
        insertText: 'Api GET #${1:apiName} ${2:Description}\nUrl ${3:https://api.example.com/v1/resource}\nHeader\n- "Accept": "application/json"',
        insertTextFormat: InsertTextFormat.Snippet
      },
      {
        label: 'Api POST Template',
        kind: CompletionItemKind.Snippet,
        detail: 'Create a POST API definition',
        insertText: 'Api POST #${1:apiName} ${2:Description}\nUrl ${3:https://api.example.com/v1/resource}\nHeader\n- "Content-Type": "application/json"\nBody JSON `\n{\n  "${4:key}": "${5:value}"\n}\n`',
        insertTextFormat: InsertTextFormat.Snippet
      },
      {
        label: 'Task Template',
        kind: CompletionItemKind.Snippet,
        detail: 'Create a Task with Step and validations',
        insertText: 'Task ${1:Task Title}\n\nStep Call Api ${2:apiName}\nParams\n- ${3:key}: ${4:value}\nCapture\n- ${5:varName}: response.body.${6:path}\nCheck\n- response.status == 200',
        insertTextFormat: InsertTextFormat.Snippet
      },
      {
        label: 'Link',
        kind: CompletionItemKind.Keyword,
        detail: 'Link another Berry source file',
        insertText: 'Link ${1:./file.berry}',
        insertTextFormat: InsertTextFormat.Snippet
      },
      {
        label: 'Input',
        kind: CompletionItemKind.Keyword,
        detail: 'Specify input CSV file path',
        insertText: 'Input ${1:./data.csv}',
        insertTextFormat: InsertTextFormat.Snippet
      }
    );
  }

  return items;
}
