import * as vscode from "vscode";
import { registerFormatter } from "./formatter";

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  // Register the formatter
  registerFormatter(context);
  // Register an event listener for when a text document is opened
  const disposable = vscode.workspace.onDidOpenTextDocument((document) => {
    if (document.languageId === "berry") {
      vscode.window.showInformationMessage(
        "Berry file detected! Syntax highlighting and formatting are available."
      );
    }
  });

  // Also check the currently open editor when the extension is activated
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor && activeEditor.document.languageId === "berry") {
    vscode.window.showInformationMessage(
      "Berry file detected! Syntax highlighting and formatting are available."
    );
  }

  context.subscriptions.push(disposable);
}

export function deactivate() {}
