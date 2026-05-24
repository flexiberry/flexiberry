/**
 * BerryCore — Runtime Facade
 *
 * The single entry-point for running a .berry script programmatically.
 *
 * Responsibilities:
 *   1. Tokenise the source code  (LexerEngine)
 *   2. Build the AST            (AstEngine)
 *   3. Execute the program      (Interpreter)
 *   4. Relay every interpreter event to registered outside listeners
 *
 * Usage (CLI consumer):
 *   const core = new BerryCore(source, { adapter: new CliAdapter() });
 *   core.on(InterpreterEvent.Completed, payload => { ... });
 *   await core.run();
 *
 * Usage (bare / no adapter):
 *   const core = new BerryCore(source);
 *   core.on(InterpreterEvent.Log, ({ message }) => console.log(message));
 *   await core.run();
 */

import { LexerEngine } from "./parser/tokenizer/reader/lexer.engine";
import { AstEngine } from "./parser/ast/ast.engine";
import { ProgramNode, NodeType, InputStatementNode, ApiBlockNode } from "./parser/ast/ast.types";
import { Interpreter, InterpreterOptions } from "./interpreter/interpreter";

import {
  InterpreterEvent,
  EventPayloadMap,
  EventListener,
  ExecutionCommand,
  ExecutionState,
  IOAdapter,
  TaskResult,
  ExecutionStatus,
} from "./interpreter/interpreter.types";

// ─── BerryCore Options ───────────────────────────────────────────────────────

export interface BerryCoreOptions {
  /**
   * IO adapter used for user-input prompts, log output, and keyboard commands.
   * Pass a `CliAdapter` for terminal use, or a custom adapter for a UI/WS layer.
   * When omitted, the interpreter runs silently (events are still emitted).
   */
  readonly adapter?: IOAdapter;

  /**
   * Fine-grained interpreter execution options forwarded as-is to the
   * `Interpreter` constructor (timeout, continueOnError, dryRun, …).
   */
  readonly interpreterOptions?: Partial<InterpreterOptions>;

  /**
   * Optional base path used by the default link resolver to resolve relative local file paths.
   * Typically the directory of the entry .berry file.
   */
  readonly basePath?: string;

  /**
   * Optional resolver for `Link` statements.
   * Receives the path/url and should return the string content of that file.
   * Required if the source code contains `Link` statements.
   */
  readonly linkResolver?: (path: string) => Promise<string>;

  /**
   * Optional decryption provider for `Decrypt` flagged `Var` entries.
   * If omitted, base64 decryption is used by default.
   */
  readonly decryptionProvider?: (encrypted: string) => Promise<string> | string;
}

// ─── BerryCore ───────────────────────────────────────────────────────────────

export class BerryCore {
  private readonly source: string;
  private readonly options: BerryCoreOptions;

  /**
   * The interpreter instance is created fresh on every `run()` call so that
   * BerryCore remains reusable across multiple sequential runs.
   */
  private interpreter: Interpreter | null = null;

  /**
   * Listeners registered via `.on()` before `run()` is called.
   * They are forwarded to the interpreter after it is created.
   */
  private readonly pendingListeners: Array<{
    event: InterpreterEvent;
    listener: EventListener<InterpreterEvent>;
  }> = [];

  // ── Constructor ──────────────────────────────────────────────────────────

  constructor (source: string, options: BerryCoreOptions = {}) {
    this.source = source;
    this.options = options;
  }

  // ── Public Event API ────────────────────────────────────────────────────

  /**
   * Register a listener for an interpreter lifecycle event.
   *
   * Listeners can be registered before or after calling `run()`.
   * Listeners registered before `run()` are forwarded to the newly
   * created Interpreter instance automatically.
   */
  on<E extends InterpreterEvent>(event: E, listener: EventListener<E>): this {
    if (this.interpreter) {
      // Already running — wire directly
      this.interpreter.on(event, listener);
    } else {
      // Queue for when run() creates the interpreter
      this.pendingListeners.push({
        event,
        listener: listener as EventListener<InterpreterEvent>,
      });
    }
    return this;
  }

  // ── Execution Control API ───────────────────────────────────────────────

  /**
   * Send an execution command to the running interpreter.
   * Has no effect if `run()` has not been called yet.
   */
  sendCommand(command: ExecutionCommand): void {
    this.interpreter?.sendCommand(command);
  }

  /**
   * Immediately kill the running execution and clean up resources.
   */
  kill(): void {
    this.interpreter?.kill();
  }

  /**
   * Returns the current execution state, or `Idle` if not yet started.
   */
  getState(): ExecutionState {
    return this.interpreter?.getState() ?? ExecutionState.Idle;
  }

  // ── Main Run ────────────────────────────────────────────────────────────

  private async resolveLinks(ast: ProgramNode, visited = new Set<string>()): Promise<ProgramNode> {
    const resolvedBody: any[] = [];

    for (const stmt of ast.body) {
      if (stmt.type === NodeType.LinkStatement) {
        // Prevent infinite loops in circular links
        if (visited.has(stmt.path)) {
          continue; // Already processed this link
        }
        visited.add(stmt.path);

        let content: string;
        if (this.options.linkResolver) {
          content = await this.options.linkResolver(stmt.path);
        } else {
          content = await this.defaultLinkResolver(stmt.path);
        }

        const subTokens = new LexerEngine(content).tokenize();
        const subAst = new AstEngine(subTokens).build();

        // Recursively resolve links in the sub-AST
        const resolvedSubAst = await this.resolveLinks(subAst, visited);

        // Add the resolved sub-body instead of the link statement
        resolvedBody.push(...resolvedSubAst.body);
      } else {
        resolvedBody.push(stmt);
      }
    }

    return {
      ...ast,
      body: resolvedBody,
    };
  }

  private async defaultLinkResolver(path: string): Promise<string> {
    // 1. Check if it's an HTTP URL
    if (path.startsWith("http://") || path.startsWith("https://")) {
      try {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`Failed to fetch URL ${path}: ${response.statusText}`);
        }
        return await response.text();
      } catch (error) {
        throw new Error(`Failed to fetch URL ${path}: ${error}`);
      }
    }

    // 2. Check if we are in Node.js
    const isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
    if (isNode) {
      try {
        // Use dynamic import to avoid bundler issues in browser
        const fs = await import("fs/promises");
        const pathModule = await import("path");
        const resolvedPath = this.options.basePath
          ? pathModule.resolve(this.options.basePath, path)
          : pathModule.resolve(process.cwd(), path);
        return await fs.readFile(resolvedPath, "utf-8");
      } catch (e) {
        throw new Error(`Failed to read local file ${path}: ${e}`);
      }
    }

    // 3. Fallback for browser (relative URLs)
    if (typeof window !== "undefined" && typeof fetch !== "undefined") {
      try {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`Failed to fetch relative URL ${path}: ${response.statusText}`);
        }
        return await response.text();
      } catch (e) {
        throw new Error(`Failed to fetch relative URL ${path}: ${e}`);
      }
    }

    throw new Error(`Cannot resolve link '${path}': Environment does not support file reading and path is not an absolute URL.`);
  }

  private parseData(content: string, path: string): Record<string, string>[] {
    if (path.endsWith('.json')) {
      return JSON.parse(content);
    }

    // Basic CSV parser
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[j] ?? "";
      }
      rows.push(row);
    }

    return rows;
  }

  /**
   * Parse the source code, resolve all links recursively, and return the fully resolved AST.
   */
  async getResolvedAst(): Promise<ProgramNode> {
    const tokens = new LexerEngine(this.source).tokenize();
    const ast = new AstEngine(tokens).build();
    return await this.resolveLinks(ast);
  }

  /**
   * Execute the source code end-to-end.
   *
   * Pipeline:
   *   source → LexerEngine.tokenize() → Token[]
   *         → AstEngine.build()       → ProgramNode
   *         → Interpreter.execute()   → TaskResult[]
   *
   * Throws:
   *   - LexerError  — if the source contains illegal characters
   *   - ParserError — if the source has a grammar error
   *   - RuntimeError — if execution encounters an unrecoverable state
   *
   * @param inputRow Optional data row to inject into the execution for `Input` mappings
   * @returns The array of `TaskResult`s produced by the interpreter.
   */
  async run(inputRow?: Record<string, string>): Promise<TaskResult[]> {
    // ── Phase 1: Tokenise ──────────────────────────────────────────────
    const tokens = new LexerEngine(this.source).tokenize();

    // ── Phase 2: Build AST ────────────────────────────────────────────
    let ast = new AstEngine(tokens).build();

    // ── Phase 2.5: Resolve Links ──────────────────────────────────────
    ast = await this.resolveLinks(ast);

    // ── Phase 2.6: Handle Input ───────────────────────────────────────
    if (!inputRow) {
      const inputNode = ast.body.find(node => node.type === NodeType.InputStatement) as InputStatementNode | undefined;
      if (inputNode) {
        let content: string;
        if (this.options.linkResolver) {
          content = await this.options.linkResolver(inputNode.path);
        } else {
          content = await this.defaultLinkResolver(inputNode.path);
        }

        const rows = this.parseData(content, inputNode.path);

        // Fire DataLoaded event to pending listeners
        for (const { event, listener } of this.pendingListeners) {
          if (event === InterpreterEvent.DataLoaded) {
            await listener({ rows } as any);
          }
        }

        // Return early, adapter is expected to loop and call run(row)
        return [];
      }
    }

    // ── Phase 3: Create Interpreter ───────────────────────────────────
    this.interpreter = new Interpreter(ast, {
      ...this.options.interpreterOptions,
      inputRow,
      decryptionProvider: this.options.decryptionProvider
    } as any);

    // Wire the IO adapter (if provided)
    if (this.options.adapter) {
      this.interpreter.setIOAdapter(this.options.adapter);
    }

    // Forward any listeners that were registered before run() was called
    for (const { event, listener } of this.pendingListeners) {
      this.interpreter.on(event, listener);
    }

    // ── Phase 4: Execute ──────────────────────────────────────────────
    try {
      return await this.interpreter.execute();
    } finally {
      // Only destroy if the interpreter actually finished
      const state = this.interpreter?.getState();
      const isFinished = state === ExecutionState.Completed || state === ExecutionState.Killed || state === ExecutionState.Stopped;
      if (!this.options.interpreterOptions?.dryRun && isFinished) {
        this.interpreter = null;
      }
    }
  }

  /**
   * Directly execute a specific API definition from the source code.
   * Interpolates all variables inside the URL, headers, and body.
   * If any required variables/placeholders are missing, prompts the user for their values.
   *
   * @param apiName Optional target API name. If omitted, defaults to the first API block.
   * @param variables Optional variables map to override or provide values for placeholders.
   * @returns The HTTP status, response body, and headers.
   */
  async executeApi(
    apiName?: string,
    variables: Record<string, string> = {}
  ): Promise<{ status: number; body: any; headers: Record<string, string> }> {
    // ── Phase 1: Tokenise & parse AST ──────────────────────────────────
    const tokens = new LexerEngine(this.source).tokenize();
    let ast = new AstEngine(tokens).build();

    // ── Phase 2: Resolve Links ────────────────────────────────────────
    ast = await this.resolveLinks(ast);

    // ── Phase 3: Find API blocks ──────────────────────────────────────
    const apiBlocks = ast.body.filter((node): node is ApiBlockNode => node.type === NodeType.ApiBlock);
    if (apiBlocks.length === 0) {
      throw new Error("No API blocks found in the source code.");
    }

    // Find the target API block
    const targetApi = apiName
      ? apiBlocks.find(node => node.name === apiName)
      : apiBlocks[0];

    if (!targetApi) {
      throw new Error(`API block '#${apiName}' not found in the source code.`);
    }

    // Identify already declared variables in the script
    const declaredVars = new Set<string>();
    for (const node of ast.body) {
      if (node.type === NodeType.VarDeclaration) {
        for (const entry of node.entries) {
          declaredVars.add(entry.key);
        }
      }
    }

    // Extract placeholders from the target API block
    const placeholders = this.extractPlaceholders(targetApi);
    const mergedVariables: Record<string, string> = { ...variables };

    // Prompt user for any placeholders that aren't provided and aren't declared in the script
    for (const placeholder of placeholders) {
      if (mergedVariables[placeholder] === undefined && !declaredVars.has(placeholder)) {
        if (this.options.adapter?.prompt) {
          const answer = await this.options.adapter.prompt(`Enter value for variable '${placeholder}'`);
          mergedVariables[placeholder] = answer;
        } else {
          const isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
          if (isNode) {
            const readline = await import("readline");
            const rl = readline.createInterface({
              input: process.stdin,
              output: process.stdout,
            });
            const answer = await new Promise<string>((resolve) => {
              rl.question(`Enter value for variable '${placeholder}': `, (ans) => {
                rl.close();
                resolve(ans.trim());
              });
            });
            mergedVariables[placeholder] = answer;
          } else {
            throw new Error(`Variable '${placeholder}' is required but no value was provided and no IO adapter is available to prompt the user.`);
          }
        }
      }
    }

    // ── Phase 4: Construct Virtual AST Nodes ──────────────────────────
    const varEntries = Object.entries(mergedVariables).map(([key, value]) => ({
      type: NodeType.KeyValuePair as const,
      position: { line: 1, column: 1 },
      key,
      value,
      isKeyQuoted: false,
      isValueQuoted: true,
      isMultiline: false,
    }));

    const virtualVarNode = {
      type: NodeType.VarDeclaration as const,
      position: { line: 1, column: 1 },
      title: "Injected Variables",
      pointer: null,
      entries: varEntries,
    };

    const virtualStepNode = {
      type: NodeType.StepBlock as const,
      position: { line: 1, column: 1 },
      callType: "Call",
      targetType: "Api",
      targetName: targetApi.name,
      params: null,
      capture: null,
      check: null,
    };

    const virtualTaskNode = {
      type: NodeType.TaskBlock as const,
      position: { line: 1, column: 1 },
      title: "Virtual Api Execution Task",
      steps: [virtualStepNode],
    };

    // Filter the original AST body to exclude original task blocks so they are not executed
    const filteredOriginalBody = ast.body.filter(
      node => node.type !== NodeType.TaskBlock
    );

    const modifiedAst = {
      ...ast,
      body: [
        ...filteredOriginalBody,
        virtualVarNode,
        virtualTaskNode,
      ],
    };

    // ── Phase 5: Execute Virtual Task using Interpreter ──────────────
    const interpreter = new Interpreter(modifiedAst, {
      ...this.options.interpreterOptions,
      decryptionProvider: this.options.decryptionProvider,
    });

    if (this.options.adapter) {
      interpreter.setIOAdapter(this.options.adapter);
    }

    // Forward listeners if any
    for (const { event, listener } of this.pendingListeners) {
      interpreter.on(event, listener);
    }

    const taskResults = await interpreter.execute();
    const taskResult = taskResults[taskResults.length - 1];
    const stepResult = taskResult?.steps[0];

    if (!stepResult) {
      throw new Error("Virtual API execution did not produce any step result.");
    }

    if (stepResult.status === ExecutionStatus.Failed && stepResult.error && !stepResult.response) {
      throw new Error(`API execution failed: ${stepResult.error}`);
    }

    // Interpolate request details for formatting/logging
    const interpolateString = (template: string, vars: Record<string, string>) => {
      return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_match, varName: string) => {
        return vars[varName] !== undefined ? vars[varName] : `{{${varName}}}`;
      });
    };

    const reqUrl = interpolateString(targetApi.url?.value ?? "", mergedVariables);
    const reqHeaders: Record<string, string> = {};
    if (targetApi.headers?.entries) {
      for (const entry of targetApi.headers.entries) {
        reqHeaders[entry.key] = interpolateString(entry.value, mergedVariables);
      }
    }
    const reqBody = targetApi.body?.content
      ? interpolateString(targetApi.body.content, mergedVariables)
      : null;

    const apiResponse = {
      status: stepResult.response?.status ?? 0,
      body: stepResult.response?.body ?? null,
      headers: stepResult.response?.headers ?? {},
    };

    if (this.options.adapter?.showApiExecution) {
      this.options.adapter.showApiExecution(
        {
          method: targetApi.method ?? "GET",
          url: reqUrl,
          headers: reqHeaders,
          body: reqBody,
        },
        apiResponse
      );
    }

    return apiResponse;
  }

  private extractPlaceholders(api: ApiBlockNode): string[] {
    const placeholders = new Set<string>();
    const regex = /\{\{(\w+(?:\.\w+)*)\}\}/g;

    if (api.url?.value) {
      let match;
      regex.lastIndex = 0;
      while ((match = regex.exec(api.url.value)) !== null) {
        placeholders.add(match[1]);
      }
    }

    if (api.headers?.entries) {
      for (const entry of api.headers.entries) {
        regex.lastIndex = 0;
        let match;
        while ((match = regex.exec(entry.value)) !== null) {
          placeholders.add(match[1]);
        }
      }
    }

    if (api.body?.content) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(api.body.content)) !== null) {
        placeholders.add(match[1]);
      }
    }

    return Array.from(placeholders);
  }
}
