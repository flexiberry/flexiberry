import * as vscode from "vscode";
import { LexerEngine } from "@flexiberry/berrycore";
export class BerryFormatter
  implements
    vscode.DocumentFormattingEditProvider,
    vscode.DocumentRangeFormattingEditProvider
{
  provideDocumentRangeFormattingEdits(
    document: vscode.TextDocument,
    range: vscode.Range,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.TextEdit[]> {
    console.log("Range formatting requested for range:", range);
    return this.format(document, options);
  }

  provideDocumentRangesFormattingEdits?(
    document: vscode.TextDocument,
    ranges: vscode.Range[],
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.TextEdit[]> {
    console.log("Range formatting requested");
    return this.formatRange(document, ranges[0], options);
  }

  private format(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions
  ): vscode.TextEdit[] {
    const edits: vscode.TextEdit[] = [];
    // Your formatting logic
    return edits;
  }

  private formatRange(
    document: vscode.TextDocument,
    range: vscode.Range,
    options: vscode.FormattingOptions
  ): vscode.TextEdit[] {
    const edits: vscode.TextEdit[] = [];

    document.lineAt(range.start.line);

    for (let i = range.start.line; i <= range.end.line; i++) {
      const line = document.lineAt(i);
      // const formattedLine = this.formatBerryCode(line.text, options);
      // edits.push(vscode.TextEdit.replace(line.range, formattedLine));
    }

    return edits;
  }
  provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.TextEdit[]> {
    const edits: vscode.TextEdit[] = [];
    const text = document.getText();
    let formattedText = this.formatBerryCode(text, options);

    // Replace the entire document with formatted text
    // const firstLine = document.lineAt(0);
    // const lastLine = document.lineAt(document.lineCount - 1);
    // const range = new vscode.Range(firstLine.range.start, lastLine.range.end);

    // edits.push(vscode.TextEdit.replace(range, formattedText));
    return edits;
  }

  private formatBerryCode(
    code: string,
    options: vscode.FormattingOptions
  ): string {
    // new Lexer()

    const tkn = new LexerEngine(code).tokenize();
    console.log(tkn);
    new LexerEngine(code);

    return code;
  }
}

// Register the formatter in your extension's activate function
export function registerFormatter(context: vscode.ExtensionContext) {
  const formatter = new BerryFormatter();

  // Document formatting (Format Document command)
  const docFormatter = vscode.languages.registerDocumentFormattingEditProvider(
    { language: "berry" }, // Try this syntax instead
    formatter
  );

  // Range formatting (Format Selection command)
  const rangeFormatter =
    vscode.languages.registerDocumentRangeFormattingEditProvider(
      { language: "berry" },
      formatter
    );

  context.subscriptions.push(docFormatter, rangeFormatter);
}
