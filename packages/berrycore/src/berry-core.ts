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
    const ast = new AstEngine(tokens).build();

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
