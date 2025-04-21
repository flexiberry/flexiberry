import * as vscode from "vscode";

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  // No activation code needed for syntax highlighting only

  // Register an event listener for when a text document is opened
  const disposable = vscode.workspace.onDidOpenTextDocument((document) => {
    if (document.languageId === "berry") {
      vscode.window.showInformationMessage(
        "Berry file detected! Syntax highlighting should be active."
      );
    }
  });

  // Also check the currently open editor when the extension is activated
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor && activeEditor.document.languageId === "berry") {
    vscode.window.showInformationMessage(
      "Berry file detected! Syntax highlighting should be active."
    );
  }

  context.subscriptions.push(disposable);
}

export function deactivate() {}
