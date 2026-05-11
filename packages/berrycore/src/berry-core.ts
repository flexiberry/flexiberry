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
import { ProgramNode, NodeType } from "./parser/ast/ast.types";
import { Interpreter, InterpreterOptions } from "./interpreter/interpreter";

import {
  InterpreterEvent,
  EventPayloadMap,
  EventListener,
  ExecutionCommand,
  ExecutionState,
  IOAdapter,
  TaskResult,
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
   * @returns The array of `TaskResult`s produced by the interpreter.
   */
  async run(): Promise<TaskResult[]> {
    // ── Phase 1: Tokenise ──────────────────────────────────────────────
    const tokens = new LexerEngine(this.source).tokenize();

    // ── Phase 2: Build AST ────────────────────────────────────────────
    let ast = new AstEngine(tokens).build();

    // ── Phase 2.5: Resolve Links ──────────────────────────────────────
    ast = await this.resolveLinks(ast);

    // ── Phase 3: Create Interpreter ───────────────────────────────────
    this.interpreter = new Interpreter(ast, this.options.interpreterOptions);

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
}
