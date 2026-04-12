import * as vscode from "vscode";
import { LexerEngine, AstEngine, BerryFormatter as CoreBerryFormatter } from "@flexiberry/berrycore";

export class BerryFormatter implements vscode.DocumentFormattingEditProvider {
  provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.TextEdit[]> {
    const text = document.getText();
    
    try {
      const tokens = new LexerEngine(text).tokenize();
      const ast = new AstEngine(tokens).build();
      const formatter = new CoreBerryFormatter({
        indentSize: options.tabSize ?? 8,
      });
      const formattedText = formatter.format(ast);

      if (document.lineCount === 0) return [];
      
      const firstLine = document.lineAt(0);
      const lastLine = document.lineAt(document.lineCount - 1);
      const range = new vscode.Range(firstLine.range.start, lastLine.range.end);

      return [vscode.TextEdit.replace(range, formattedText)];
    } catch (e: any) {
      // If there's a syntax error, we silently fail formatting so we don't clear the file
      console.warn("Berry formatting skipped due to error:", e.message);
      return [];
    }
  }
}

// Register the formatter in your extension's activate function
export function registerFormatter(context: vscode.ExtensionContext) {
  const formatter = new BerryFormatter();

  // Document formatting (Format Document command)
  const docFormatter = vscode.languages.registerDocumentFormattingEditProvider(
    { language: "berry" },
    formatter
  );

  context.subscriptions.push(docFormatter);
}
