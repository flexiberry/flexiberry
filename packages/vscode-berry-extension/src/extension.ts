import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";
import { BerryCore, InterpreterEvent } from "@flexiberry/berrycore";
import { getWebviewContent } from "./runnerWebview";

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
  let serverModule: string;
  try {
    // Attempt to resolve via package dependencies (compiled and linked by pnpm)
    serverModule = require.resolve("@flexiberry/language-server");
  } catch (e) {
    // Fallback relative path in local development context
    serverModule = context.asAbsolutePath(
      path.join("..", "language-server", "dist", "index.js")
    );
  }

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { execArgv: ["--nolazy", "--inspect=6009"] },
    },
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for Berry DSL files
    documentSelector: [{ scheme: "file", language: "berry" }],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher("**/.clientrc"),
    },
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "berryLanguageServer",
    "Berry Language Server",
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();

  // Register command to execute a .berry script file and show results in a custom Webview
  const runFileDisposable = vscode.commands.registerCommand(
    "berry.runFile",
    async (uri?: vscode.Uri) => {
      // Resolve target file URI
      let targetUri = uri;
      if (!targetUri) {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.languageId === "berry") {
          targetUri = activeEditor.document.uri;
        }
      }

      if (!targetUri) {
        vscode.window.showErrorMessage("No active Berry script file selected to run.");
        return;
      }

      const filePath = targetUri.fsPath;
      const fileName = path.basename(filePath);

      // Create and show Webview Panel
      const panel = vscode.window.createWebviewPanel(
        "berryRunner",
        `Berry Run: ${fileName}`,
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      // Render the template
      const logoUri = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, "icon.png")
      );
      panel.webview.html = getWebviewContent(fileName, logoUri.toString());

      let isDisposed = false;
      let activeCore: BerryCore | null = null;

      panel.onDidDispose(() => {
        isDisposed = true;
        if (activeCore) {
          activeCore.kill();
        }
      });

      const runExecution = async () => {
        // Abort previous execution if it is still running
        if (activeCore) {
          activeCore.kill();
          activeCore = null;
        }

        // Read source code (preferring unsaved contents of the editor if active)
        let source = "";
        try {
          const activeEditor = vscode.window.activeTextEditor;
          if (activeEditor && activeEditor.document.uri.toString() === targetUri.toString()) {
            source = activeEditor.document.getText();
          } else {
            source = fs.readFileSync(filePath, "utf8");
          }
        } catch (err: any) {
          vscode.window.showErrorMessage(`Failed to read file: ${err.message}`);
          if (!isDisposed) {
            panel.webview.postMessage({
              type: "error",
              error: { message: `Failed to read file: ${err.message}` },
            });
          }
          return;
        }

        // Initialize BerryCore
        const core = new BerryCore(source, {
          basePath: path.dirname(filePath),
        });
        activeCore = core;

        // Track current task and step index for events that don't pass them directly
        let activeTaskIndex = 0;
        let activeStepIndex = 0;

        // Stream events to Webview
        let dataRows: Record<string, string>[] | null = null;
        core.on(InterpreterEvent.DataLoaded, (payload) => {
          dataRows = payload.rows;
        });

        core.on(InterpreterEvent.Start, (payload) => {
          if (!isDisposed && activeCore === core) {
            panel.webview.postMessage({
              type: "plan",
              plan: payload.plan,
            });
          }
        });

        core.on(InterpreterEvent.TaskBegin, (payload) => {
          activeTaskIndex = payload.index;
          if (!isDisposed && activeCore === core) {
            panel.webview.postMessage({
              type: "taskBegin",
              index: payload.index,
            });
          }
        });

        core.on(InterpreterEvent.TaskDone, (payload) => {
          if (!isDisposed && activeCore === core) {
            panel.webview.postMessage({
              type: "taskDone",
              index: activeTaskIndex,
              status: payload.status,
            });
          }
        });

        core.on(InterpreterEvent.StepBegin, (payload) => {
          activeTaskIndex = payload.taskIndex;
          activeStepIndex = payload.index;
          if (!isDisposed && activeCore === core) {
            panel.webview.postMessage({
              type: "stepBegin",
              taskIndex: payload.taskIndex,
              index: payload.index,
            });
          }
        });

        core.on(InterpreterEvent.ApiCallBegin, (payload) => {
          if (!isDisposed && activeCore === core) {
            panel.webview.postMessage({
              type: "apiCallBegin",
              taskIndex: activeTaskIndex,
              index: activeStepIndex,
              method: payload.method,
              url: payload.url,
            });
          }
        });

        core.on(InterpreterEvent.ApiCallDone, (payload) => {
          if (!isDisposed && activeCore === core) {
            panel.webview.postMessage({
              type: "apiCallDone",
              status: payload.status,
              duration: payload.duration,
            });
          }
        });

        core.on(InterpreterEvent.StepDone, (payload) => {
          if (!isDisposed && activeCore === core) {
            panel.webview.postMessage({
              type: "stepDone",
              taskIndex: payload.taskIndex,
              index: payload.index,
              status: payload.status,
              payload: {
                error: payload.error,
                checksPassed: payload.checksPassed,
                response: payload.response,
                checks: (payload as any).checks || null,
              },
            });
          }
        });

        core.on(InterpreterEvent.Log, (payload) => {
          if (!isDisposed && activeCore === core) {
            panel.webview.postMessage({
              type: "log",
              level: payload.level,
              message: payload.message,
            });
          }
        });

        core.on(InterpreterEvent.Error, (payload) => {
          if (!isDisposed && activeCore === core) {
            panel.webview.postMessage({
              type: "error",
              error: payload,
            });
          }
        });

        // Execute program
        if (!isDisposed && activeCore === core) {
          panel.webview.postMessage({
            type: "start",
            fileName,
          });
        }

        const startTime = Date.now();
        try {
          await core.run();

          // Handle loop iterations if DataLoaded event was triggered
          const activeRows = dataRows as Record<string, string>[] | null;
          if (activeRows && activeRows.length > 0) {
            if (!isDisposed && activeCore === core) {
              panel.webview.postMessage({
                type: "log",
                level: "info",
                message: `Data input detected. Starting ${activeRows.length} iterations.`,
              });
            }

            for (let i = 0; i < activeRows.length; i++) {
              if (isDisposed || activeCore !== core) break;

              panel.webview.postMessage({
                type: "iteration",
                index: i,
              });

              await core.run(activeRows[i]);
            }
          }

          const duration = Date.now() - startTime;
          if (!isDisposed && activeCore === core) {
            panel.webview.postMessage({
              type: "completed",
              success: true,
              duration,
            });
          }
        } catch (err: any) {
          if (!isDisposed && activeCore === core) {
            panel.webview.postMessage({
              type: "error",
              error: { message: err.message || String(err) },
            });
            panel.webview.postMessage({
              type: "completed",
              success: false,
              duration: Date.now() - startTime,
            });
          }
        } finally {
          if (activeCore === core) {
            activeCore = null;
          }
        }
      };

      // Trigger initial execution
      runExecution();

      // Handle messages from Webview
      panel.webview.onDidReceiveMessage(async (message) => {
        if (message.type === "run") {
          runExecution();
        }
      });
    }
  );

  context.subscriptions.push(runFileDisposable);

  // Register command to execute a single API block and display its request/response
  const runApiAloneDisposable = vscode.commands.registerCommand(
    "berry.runApiAlone",
    async (uri: vscode.Uri, apiName: string) => {
      const filePath = uri.fsPath;
      const fileName = path.basename(filePath);

      // Create and show Webview Panel
      const panel = vscode.window.createWebviewPanel(
        "berryRunner",
        `Berry API: #${apiName}`,
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      // Render the template
      const logoUri = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, "icon.png")
      );
      panel.webview.html = getWebviewContent(fileName, logoUri.toString());

      let isDisposed = false;
      let activeCore: BerryCore | null = null;

      panel.onDidDispose(() => {
        isDisposed = true;
        if (activeCore) {
          activeCore.kill();
        }
      });

      const runStandalone = async () => {
        if (activeCore) {
          activeCore.kill();
          activeCore = null;
        }

        // Re-read source code (preferring active unsaved editor content if matching)
        let source = "";
        try {
          const activeEditor = vscode.window.activeTextEditor;
          if (activeEditor && activeEditor.document.uri.toString() === uri.toString()) {
            source = activeEditor.document.getText();
          } else {
            source = fs.readFileSync(filePath, "utf8");
          }
        } catch (err: any) {
          vscode.window.showErrorMessage(`Failed to read file: ${err.message}`);
          if (!isDisposed) {
            panel.webview.postMessage({
              type: "error",
              error: { message: `Failed to read file: ${err.message}` },
            });
          }
          return;
        }

        if (!isDisposed) {
          panel.webview.postMessage({
            type: "startStandalone",
            fileName,
            apiName,
          });
        }

        let apiRequestDetails: any = null;
        let apiResponseDetails: any = null;

        const core = new BerryCore(source, {
          basePath: path.dirname(filePath),
          adapter: {
            prompt: async (message: string) => {
              const answer = await vscode.window.showInputBox({
                prompt: message,
                ignoreFocusOut: true,
              });
              return answer ?? "";
            },
            showApiExecution: (req, res) => {
              apiRequestDetails = req;
              apiResponseDetails = res;
            },
          },
        });
        activeCore = core;

        core.on(InterpreterEvent.Log, (payload) => {
          if (!isDisposed && activeCore === core) {
            panel.webview.postMessage({
              type: "log",
              level: payload.level,
              message: payload.message,
            });
          }
        });

        core.on(InterpreterEvent.Error, (payload) => {
          if (!isDisposed && activeCore === core) {
            panel.webview.postMessage({
              type: "error",
              error: payload,
            });
          }
        });

        const startTime = Date.now();
        try {
          await core.executeApi(apiName);
          const duration = Date.now() - startTime;

          if (!isDisposed && activeCore === core) {
            panel.webview.postMessage({
              type: "apiStandaloneDone",
              request: apiRequestDetails,
              response: apiResponseDetails,
              duration,
            });
            panel.webview.postMessage({
              type: "completed",
              success: true,
              duration,
            });
          }
        } catch (err: any) {
          if (!isDisposed && activeCore === core) {
            panel.webview.postMessage({
              type: "error",
              error: { message: err.message || String(err) },
            });
            panel.webview.postMessage({
              type: "completed",
              success: false,
              duration: Date.now() - startTime,
            });
          }
        } finally {
          if (activeCore === core) {
            activeCore = null;
          }
        }
      };

      // Trigger initial execution
      runStandalone();

      // Handle messages from Webview
      panel.webview.onDidReceiveMessage(async (message) => {
        if (message.type === "runStandalone" || message.type === "run") {
          runStandalone();
        }
      });
    }
  );

  context.subscriptions.push(runApiAloneDisposable);

  // Register CodeLens provider to display "Run API Standalone" above each Api statement
  const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
    { scheme: "file", language: "berry" },
    new BerryCodeLensProvider()
  );
  context.subscriptions.push(codeLensProviderDisposable);

  // Register TestController to display play buttons beside line numbers (in the gutter)
  if (typeof vscode.tests !== "undefined") {
    const controller = vscode.tests.createTestController("berryApis", "Berry APIs");
    context.subscriptions.push(controller);

    const runProfile = controller.createRunProfile(
      "Run API Standalone",
      vscode.TestRunProfileKind.Run,
      async (request, token) => {
        const run = controller.createTestRun(request);
        const queue: vscode.TestItem[] = [];

        if (request.include) {
          queue.push(...request.include);
        } else {
          controller.items.forEach((item) => queue.push(item));
        }

        while (queue.length > 0 && !token.isCancellationRequested) {
          const test = queue.shift()!;
          
          if (test.parent) {
            // This is a child API node (parent is the file node)
            const apiName = test.id;
            const uri = test.uri;
            if (uri) {
              run.started(test);
              try {
                await vscode.commands.executeCommand("berry.runApiAlone", uri, apiName);
                run.passed(test);
              } catch (err: any) {
                run.failed(test, new vscode.TestMessage(err.message || String(err)));
              }
            }
          } else {
            // This is a parent file node, add all its child APIs to the queue
            test.children.forEach((child) => queue.push(child));
          }
        }
        run.end();
      }
    );
    context.subscriptions.push(runProfile);

    const discoverApis = (document: vscode.TextDocument) => {
      if (document.languageId !== "berry" || document.uri.scheme !== "file") {
        return;
      }

      const fileUri = document.uri;
      const fileId = fileUri.toString();

      let fileItem = controller.items.get(fileId);
      if (!fileItem) {
        fileItem = controller.createTestItem(fileId, path.basename(fileUri.fsPath), fileUri);
        controller.items.add(fileItem);
      }

      const text = document.getText();
      // Use [ \t] instead of \s to prevent matching newline characters across lines
      const regex = /^[ \t]*Api[ \t]+(GET|POST|PUT|DELETE|PATCH)[ \t]+#([a-zA-Z0-9_-]+)/gm;
      let match;

      const currentApis = new Map<string, { range: vscode.Range; apiName: string }>();

      while ((match = regex.exec(text)) !== null) {
        const startPosition = document.positionAt(match.index);
        const endPosition = document.positionAt(match.index + match[0].length);
        const range = new vscode.Range(startPosition, endPosition);
        const apiName = match[2];
        currentApis.set(apiName, { range, apiName });
      }

      // Sync kids
      const toRemove: string[] = [];
      fileItem.children.forEach((item) => {
        if (!currentApis.has(item.id)) {
          toRemove.push(item.id);
        }
      });
      toRemove.forEach((id) => fileItem!.children.delete(id));

      for (const [apiName, info] of currentApis.entries()) {
        let apiItem = fileItem.children.get(apiName);
        if (!apiItem) {
          apiItem = controller.createTestItem(apiName, `Api #${apiName}`, fileUri);
          fileItem.children.add(apiItem);
        }
        apiItem.range = info.range;
      }
    };

    // Discover initial open files
    vscode.workspace.textDocuments.forEach(discoverApis);

    context.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument(discoverApis),
      vscode.workspace.onDidChangeTextDocument((e) => discoverApis(e.document)),
      vscode.workspace.onDidCloseTextDocument((doc) => {
        controller.items.delete(doc.uri.toString());
      })
    );
  }
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

/**
 * CodeLens Provider to find all Api declarations and inject a CodeLens.
 */
class BerryCodeLensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    const codeLenses: vscode.CodeLens[] = [];
    const text = document.getText();
    // Use [ \t] instead of \s to prevent matching newline characters across lines
    const regex = /^[ \t]*Api[ \t]+(GET|POST|PUT|DELETE|PATCH)[ \t]+#([a-zA-Z0-9_-]+)/gm;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const startPosition = document.positionAt(match.index);
      const endPosition = document.positionAt(match.index + match[0].length);
      const range = new vscode.Range(startPosition, endPosition);

      const apiName = match[2];
      const cmd: vscode.Command = {
        title: `▶ Run API Standalone`,
        command: "berry.runApiAlone",
        arguments: [document.uri, apiName],
      };
      codeLenses.push(new vscode.CodeLens(range, cmd));
    }

    return codeLenses;
  }
}

