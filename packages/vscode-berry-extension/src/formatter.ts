import * as vscode from "vscode";

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
    // Your range formatting logic

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
    const firstLine = document.lineAt(0);
    const lastLine = document.lineAt(document.lineCount - 1);
    const range = new vscode.Range(firstLine.range.start, lastLine.range.end);

    edits.push(vscode.TextEdit.replace(range, formattedText));
    return edits;
  }

  private formatBerryCode(
    code: string,
    options: vscode.FormattingOptions
  ): string {
    // Split the code into lines
    let lines = code.split("\n");
    let indentLevel = 0;
    let formattedLines: string[] = [];
    const indent = options.insertSpaces ? " ".repeat(options.tabSize) : "\t";

    for (const line of lines) {
      console.log(line);
      const trimmedLine = line.trim();

      // Decrease indent level for closing braces
      if (
        trimmedLine.endsWith("}") ||
        trimmedLine.endsWith(")") ||
        trimmedLine.endsWith("]")
      ) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Add line with current indentation
      if (trimmedLine) {
        formattedLines.push(indent.repeat(indentLevel) + trimmedLine);
      } else {
        formattedLines.push("");
      }

      // Increase indent level for opening braces
      if (
        trimmedLine.endsWith("{") ||
        trimmedLine.endsWith("(") ||
        trimmedLine.endsWith("[")
      ) {
        indentLevel++;
      }
    }

    return formattedLines.join("\n");
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
