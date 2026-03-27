/**
 * Berry Interpreter
 *
 * Walks the ProgramNode AST and executes the Berry program.
 * Uses the Visitor pattern — one visit* method per AST node type.
 *
 * Architecture rules:
 *   - Interpreter only walks AST — no parsing, no tokenizing
 *   - Maintains environment for variable scoping
 *   - Emits typed events for status reporting
 *   - Uses IOAdapter for user input (CLI or UI)
 */

import axios, { AxiosResponse } from "axios";

import {
  ProgramNode,
  NodeType,
  StatementNode,
  VarDeclarationNode,
  ApiBlockNode,
  TaskBlockNode,
  StepBlockNode,
  KeyValuePairNode,
  ConditionNode,
} from "../parser/ast/ast.types";

import {
  InterpreterEvent,
  EventPayloadMap,
  EventListener,
  ExecutionCommand,
  ExecutionState,
  ExecutionStatus,
  IOAdapter,
  LogLevel,
  RuntimeValue,
  TaskResult,
  StepResult,
  ApiResponse,
} from "./interpreter.types";

import { Environment } from "./environment";
import { RuntimeError, ApiNotFoundError } from "./errors";

// ─── Interpreter Options ────────────────────────────────────────────────────

export interface InterpreterOptions {
  /** Timeout in ms for API calls (default: 30000) */
  readonly apiTimeout: number;
  /** Whether to continue on step failure (default: true) */
  readonly continueOnError: boolean;
  /** Dry run — don't make actual API calls (default: false) */
  readonly dryRun: boolean;
}

const DEFAULT_OPTIONS: InterpreterOptions = {
  apiTimeout: 30000,
  continueOnError: true,
  dryRun: false,
};

// ─── API Registry Entry ─────────────────────────────────────────────────────

interface ApiDefinition {
  readonly method: string;
  readonly name: string;
  readonly title: string | null;
  readonly url: string | null;
  readonly headers: ReadonlyArray<KeyValuePairNode>;
  readonly bodyType: string | null;
  readonly bodyContent: string | null;
}

// ─── Interpreter ────────────────────────────────────────────────────────────

export class Interpreter {
  private readonly ast: ProgramNode;
  private readonly options: InterpreterOptions;
  private readonly globalEnv: Environment = new Environment();
  private readonly apiRegistry: Map<string, ApiDefinition> = new Map();
  private readonly listeners: Map<InterpreterEvent, Array<EventListener<InterpreterEvent>>> = new Map();
  private ioAdapter: IOAdapter | null = null;

  // ── Execution Control State ──────────────────────────────────────────────
  private state: ExecutionState = ExecutionState.Idle;
  private pendingCommand: ExecutionCommand = ExecutionCommand.Continue;
  private pauseResolver: (() => void) | null = null;

  /** Check if killed — bypasses TS narrowing since state changes async */
  private isKilled(): boolean { return this.state === ExecutionState.Killed; }

  constructor(ast: ProgramNode, options: Partial<InterpreterOptions> = {}) {
    this.ast = ast;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /** Register an event listener */
  on<E extends InterpreterEvent>(event: E, listener: EventListener<E>): Interpreter {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener as EventListener<InterpreterEvent>);
    return this;
  }

  /** Set the IO adapter for user input, output, and execution control */
  setIOAdapter(adapter: IOAdapter): Interpreter {
    this.ioAdapter = adapter;

    // Wire up command handler so adapter can send commands to interpreter
    if (adapter.onCommand) {
      adapter.onCommand((command: ExecutionCommand) => {
        this.sendCommand(command);
      });
    }

    return this;
  }

  /**
   * Send an execution command to the interpreter.
   * Can be called externally (from adapter, UI, or programmatically).
   */
  sendCommand(command: ExecutionCommand): void {
    this.pendingCommand = command;

    switch (command) {
      case ExecutionCommand.Pause:
        if (this.state === ExecutionState.Running) {
          this.state = ExecutionState.Paused;
          this.pushLog("info", "⏸  Execution paused");
          this.emitStateChanged(ExecutionState.Paused, "User requested pause");
        }
        break;

      case ExecutionCommand.Continue:
        if (this.state === ExecutionState.Paused) {
          this.state = ExecutionState.Running;
          this.pushLog("info", "▶️  Execution resumed");
          this.emitStateChanged(ExecutionState.Running, "User requested continue");
          // Resolve the pause promise to unblock execution
          if (this.pauseResolver) {
            this.pauseResolver();
            this.pauseResolver = null;
          }
        }
        break;

      case ExecutionCommand.Kill:
        this.state = ExecutionState.Killed;
        this.pushLog("error", "💀 Execution killed");
        this.emitStateChanged(ExecutionState.Killed, "User requested kill");
        // Unblock pause if paused
        if (this.pauseResolver) {
          this.pauseResolver();
          this.pauseResolver = null;
        }
        this.cleanup();
        break;

      case ExecutionCommand.Skip:
        this.pushLog("info", "⏭  Skipping current step");
        // If paused, resume so the skip can take effect
        if (this.state === ExecutionState.Paused) {
          this.state = ExecutionState.Running;
          if (this.pauseResolver) {
            this.pauseResolver();
            this.pauseResolver = null;
          }
        }
        break;

      case ExecutionCommand.Stop:
        this.pushLog("info", "⏹  Stopping current task");
        // If paused, resume so the stop can take effect
        if (this.state === ExecutionState.Paused) {
          this.state = ExecutionState.Running;
          if (this.pauseResolver) {
            this.pauseResolver();
            this.pauseResolver = null;
          }
        }
        break;
    }
  }

  /** Get the current execution state */
  getState(): ExecutionState {
    return this.state;
  }

  /** Kill execution and clean up all resources */
  kill(): void {
    this.sendCommand(ExecutionCommand.Kill);
  }

  /** Execute the entire program */
  async execute(): Promise<TaskResult[]> {
    this.state = ExecutionState.Running;
    this.pendingCommand = ExecutionCommand.Continue;

    // Phase 1: Register all declarations (Vars, APIs) — no execution
    const tasks: TaskBlockNode[] = [];

    for (const node of this.ast.body) {
      switch (node.type) {
        case NodeType.VarDeclaration:
          this.visitVarDeclaration(node);
          break;
        case NodeType.ApiBlock:
          this.visitApiBlock(node);
          break;
        case NodeType.TaskBlock:
          tasks.push(node);
          break;
        case NodeType.Comment:
          // skip comments
          break;
        default:
          break;
      }
    }

    // Emit start event
    await this.emit(InterpreterEvent.Start, {
      totalTasks: tasks.length,
      totalApis: this.apiRegistry.size,
      totalVars: this.globalEnv.getOwnEntries().size,
      startTime: new Date(),
    });

    this.pushLog("info", `Starting execution: ${tasks.length} tasks, ${this.apiRegistry.size} APIs, ${this.globalEnv.getOwnEntries().size} vars`);

    // Phase 2: Execute tasks sequentially
    const taskResults: TaskResult[] = [];

    for (let i = 0; i < tasks.length; i++) {
      // Check for kill before each task
      if (this.isKilled()) {
        this.pushLog("warn", `Skipping remaining tasks (killed)`);
        break;
      }

      // Wait if paused
      await this.waitIfPaused();
      if (this.isKilled()) break;

      const result = await this.visitTask(tasks[i], i);
      taskResults.push(result);
    }

    // Emit completed event
    if (!this.isKilled()) {
      this.state = ExecutionState.Completed;
    }

    await this.emit(InterpreterEvent.Completed, {
      endTime: new Date(),
      taskResults,
    });

    this.pushLog("info", `Execution ${this.isKilled() ? "killed" : "completed"}`);

    return taskResults;
  }

  // ── Var Declaration Visitor ─────────────────────────────────────────────

  private visitVarDeclaration(node: VarDeclarationNode): void {
    // Store each key-value entry as a global variable
    for (const entry of node.entries) {
      this.globalEnv.declare(entry.key, entry.value);
    }

    // If the var has a pointer, store the pointer reference
    if (node.pointer) {
      this.globalEnv.declare(
        `@${node.pointer.target}`,
        node.title ?? null
      );
    }

    this.emitSync(InterpreterEvent.Log, {
      level: "debug",
      message: `Var declared: ${node.title ?? "(unnamed)"} with ${node.entries.length} entries`,
    });
  }

  // ── API Block Visitor ───────────────────────────────────────────────────

  private visitApiBlock(node: ApiBlockNode): void {
    const definition: ApiDefinition = {
      method: node.method ?? "GET",
      name: node.name,
      title: node.title ?? null,
      url: node.url?.value ?? null,
      headers: node.headers?.entries ?? [],
      bodyType: node.body?.bodyType ?? null,
      bodyContent: node.body?.content ?? null,
    };

    this.apiRegistry.set(node.name, definition);

    this.emitSync(InterpreterEvent.Log, {
      level: "debug",
      message: `API registered: ${definition.method} #${definition.name}`,
    });
  }

  // ── Task Visitor ────────────────────────────────────────────────────────

  private async visitTask(node: TaskBlockNode, taskIndex: number): Promise<TaskResult> {
    const startTime = new Date();

    await this.emit(InterpreterEvent.TaskBegin, {
      title: node.title,
      index: taskIndex,
    });

    this.pushLog("task", `Task ${taskIndex + 1}: "${node.title ?? "(unnamed)"}"`);

    const stepResults: StepResult[] = [];
    const taskEnv = this.globalEnv.createChild();
    let overallStatus = ExecutionStatus.Pass;

    for (let i = 0; i < node.steps.length; i++) {
      // Check kill
      if (this.isKilled()) {
        overallStatus = ExecutionStatus.Killed;
        break;
      }

      // Wait if paused
      await this.waitIfPaused();
      if (this.isKilled()) {
        overallStatus = ExecutionStatus.Killed;
        break;
      }

      // Check stop (stop current task, skip remaining steps)
      if (this.pendingCommand === ExecutionCommand.Stop) {
        this.pushLog("info", `Stopping task — skipping step ${i + 1} and remaining`);
        overallStatus = ExecutionStatus.Stopped;
        this.pendingCommand = ExecutionCommand.Continue; // reset for next task
        break;
      }

      // Check skip (skip this step, continue to next)
      if (this.pendingCommand === ExecutionCommand.Skip) {
        this.pushLog("info", `Skipping step ${i + 1}: ${node.steps[i].targetName}`);
        stepResults.push({
          targetName: node.steps[i].targetName,
          status: ExecutionStatus.Skipped,
          startTime: new Date(),
          endTime: new Date(),
          error: null,
          response: null,
          checksPassed: null,
        });
        this.pendingCommand = ExecutionCommand.Continue; // reset after skip
        continue;
      }

      const stepResult = await this.visitStep(node.steps[i], i, taskIndex, taskEnv);
      stepResults.push(stepResult);

      if (stepResult.status === ExecutionStatus.Failed) {
        overallStatus = ExecutionStatus.Failed;
        if (!this.options.continueOnError) {
          break;
        }
      }
    }

    const result: TaskResult = {
      title: node.title,
      status: overallStatus,
      startTime,
      endTime: new Date(),
      steps: stepResults,
    };

    await this.emit(InterpreterEvent.TaskDone, result);

    const taskIcon = overallStatus === ExecutionStatus.Pass ? "✅" : "❌";
    this.pushLog("task", `${taskIcon} Task "${node.title ?? "(unnamed)"}" → ${overallStatus}`);

    return result;
  }

  // ── Step Visitor ────────────────────────────────────────────────────────

  private async visitStep(
    node: StepBlockNode,
    stepIndex: number,
    taskIndex: number,
    taskEnv: Environment
  ): Promise<StepResult> {
    const startTime = new Date();

    await this.emit(InterpreterEvent.StepBegin, {
      targetName: node.targetName,
      index: stepIndex,
      taskIndex,
    });

    this.pushLog("step", `Step ${stepIndex + 1}: Call ${node.targetType} ${node.targetName}`);

    const stepEnv = taskEnv.createChild();
    let status = ExecutionStatus.Pass;
    let error: string | null = null;
    let apiResponse: ApiResponse | null = null;
    let checksPassed: boolean | null = null;

    try {
      // Look up the API definition
      const apiDef = this.apiRegistry.get(node.targetName);
      if (!apiDef) {
        throw new ApiNotFoundError(node.targetName, node.position.line, node.position.column);
      }

      // Resolve params into step environment
      if (node.params) {
        this.resolveParams(node.params.entries, stepEnv, taskEnv);
      }

      // Make the API call
      const response = await this.callApi(apiDef, stepEnv, taskEnv);
      apiResponse = {
        status: response.status,
        headers: response.headers as Record<string, string>,
        body: response.data,
      };

      // Store response metadata in step environment
      stepEnv.declare("$.status", response.status);
      stepEnv.declare("$.body", response.data ?? null);

      // Process capture
      if (node.capture) {
        this.processCapture(node.capture.entries, response, stepIndex, taskEnv);
      }

      // Process check
      if (node.check) {
        checksPassed = this.processCheck(node.check.conditions, stepEnv, taskEnv);
        if (!checksPassed) {
          status = ExecutionStatus.Failed;
          error = "Check validation failed";
        }
      }
    } catch (err: unknown) {
      status = ExecutionStatus.Failed;
      if (err instanceof RuntimeError) {
        error = err.message;
      } else if (axios.isAxiosError(err)) {
        error = `API call failed: ${err.message}`;
        // Even on HTTP errors, store response for capture/check
        if (err.response) {
          apiResponse = {
            status: err.response.status,
            headers: err.response.headers as Record<string, string>,
            body: err.response.data,
          };
          stepEnv.declare("$.status", err.response.status);
          stepEnv.declare("$.body", err.response.data ?? null);

          // Still try capture and check on error responses
          if (node.capture) {
            this.processCapture(node.capture.entries, err.response, stepIndex, taskEnv);
          }
          if (node.check) {
            checksPassed = this.processCheck(node.check.conditions, stepEnv, taskEnv);
            if (checksPassed) {
              status = ExecutionStatus.Pass;
              error = null;
            }
          }
        }
      } else {
        error = String(err);
      }

      await this.emit(InterpreterEvent.Error, {
        message: error ?? "Unknown error",
        line: node.position.line,
        column: node.position.column,
      });

      this.pushLog("error", error ?? "Unknown error");
    }

    const result: StepResult = {
      targetName: node.targetName,
      status,
      startTime,
      endTime: new Date(),
      error,
      response: apiResponse,
      checksPassed,
    };

    await this.emit(InterpreterEvent.StepDone, { ...result, taskIndex });

    const stepIcon = status === ExecutionStatus.Pass ? "✅" : "❌";
    this.pushLog("step", `${stepIcon} ${node.targetName} → ${status}`);

    return result;
  }

  // ── API Call ────────────────────────────────────────────────────────────

  private async callApi(
    apiDef: ApiDefinition,
    stepEnv: Environment,
    taskEnv: Environment
  ): Promise<AxiosResponse> {
    const allVars = taskEnv.getAllEntries();
    // Merge step env on top
    for (const [k, v] of stepEnv.getOwnEntries()) {
      allVars.set(k, v);
    }

    // Resolve URL with interpolation
    const url = this.interpolate(apiDef.url ?? "", allVars);

    // Resolve headers
    const headers: Record<string, string> = {};
    for (const entry of apiDef.headers) {
      headers[entry.key] = this.interpolate(entry.value, allVars);
    }

    // Resolve body
    let data: string | undefined;
    if (apiDef.bodyContent) {
      data = this.interpolate(apiDef.bodyContent, allVars);
    }

    await this.emit(InterpreterEvent.ApiCallBegin, {
      method: apiDef.method,
      url,
      apiName: apiDef.name,
    });

    this.pushLog("api", `${apiDef.method} ${url}`);

    if (this.options.dryRun) {
      await this.emit(InterpreterEvent.Log, {
        level: "info",
        message: `[DRY RUN] ${apiDef.method} ${url}`,
      });
      // Return a mock response for dry run
      return {
        status: 200,
        data: { dryRun: true },
        headers: {},
        statusText: "OK",
        config: {} as AxiosResponse["config"],
      } as AxiosResponse;
    }

    const callStart = Date.now();
    const response = await axios({
      method: apiDef.method.toLowerCase(),
      url,
      data,
      headers,
      timeout: this.options.apiTimeout,
      validateStatus: () => true, // don't throw on non-2xx
    });

    const duration = Date.now() - callStart;
    await this.emit(InterpreterEvent.ApiCallDone, {
      apiName: apiDef.name,
      status: response.status,
      duration,
    });

    this.pushLog("api", `${apiDef.name} → ${response.status} (${duration}ms)`);

    return response;
  }

  // ── Params Resolution ───────────────────────────────────────────────────

  private resolveParams(
    entries: ReadonlyArray<KeyValuePairNode>,
    stepEnv: Environment,
    taskEnv: Environment
  ): void {
    for (const entry of entries) {
      // Check if the value references another variable (e.g., "Step.1.id")
      const resolved = taskEnv.tryLookup(entry.value);
      stepEnv.declare(entry.key, resolved !== undefined ? resolved : entry.value);
    }
  }

  // ── Capture Processing ──────────────────────────────────────────────────

  private processCapture(
    entries: ReadonlyArray<KeyValuePairNode>,
    response: AxiosResponse,
    stepIndex: number,
    taskEnv: Environment
  ): void {
    for (const entry of entries) {
      const value = this.resolveResponsePath(response.data, entry.value);
      // Store as Step.<1-based index>.<key>
      taskEnv.declare(`Step.${stepIndex + 1}.${entry.key}`, value as RuntimeValue);
    }
  }

  // ── Check Processing ────────────────────────────────────────────────────

  private processCheck(
    conditions: ReadonlyArray<ConditionNode>,
    stepEnv: Environment,
    taskEnv: Environment
  ): boolean {
    for (const condition of conditions) {
      const result = this.evaluateCondition(condition, stepEnv, taskEnv);
      if (!result) return false;
    }
    return true;
  }

  private evaluateCondition(
    condition: ConditionNode,
    stepEnv: Environment,
    taskEnv: Environment
  ): boolean {
    const lhs = this.resolveValue(condition.lhs, stepEnv, taskEnv);
    const rhs = this.resolveValue(condition.rhs, stepEnv, taskEnv);
    let result = this.compareValues(lhs, condition.operator, rhs);

    // Process OR chains — any one passing makes the condition pass
    if (!result && condition.orConditions.length > 0) {
      for (const orExpr of condition.orConditions) {
        const orLhs = this.resolveValue(orExpr.lhs, stepEnv, taskEnv);
        const orRhs = this.resolveValue(orExpr.rhs, stepEnv, taskEnv);
        if (this.compareValues(orLhs, orExpr.operator, orRhs)) {
          result = true;
          break;
        }
      }
    }

    return result;
  }

  private compareValues(lhs: unknown, operator: string, rhs: unknown): boolean {
    // Coerce to numbers if both are numeric
    const numLhs = Number(lhs);
    const numRhs = Number(rhs);
    const useNumbers = !isNaN(numLhs) && !isNaN(numRhs);

    switch (operator) {
      case "==":
        return useNumbers ? numLhs === numRhs : String(lhs) === String(rhs);
      case "!=":
        return useNumbers ? numLhs !== numRhs : String(lhs) !== String(rhs);
      case ">":
        return useNumbers ? numLhs > numRhs : String(lhs) > String(rhs);
      case "<":
        return useNumbers ? numLhs < numRhs : String(lhs) < String(rhs);
      case ">=":
        return useNumbers ? numLhs >= numRhs : String(lhs) >= String(rhs);
      case "<=":
        return useNumbers ? numLhs <= numRhs : String(lhs) <= String(rhs);
      default:
        return false;
    }
  }

  // ── Value Resolution ────────────────────────────────────────────────────

  private resolveValue(
    raw: string,
    stepEnv: Environment,
    taskEnv: Environment
  ): unknown {
    // Special keyword: null
    if (raw === "null") return null;
    // Special keyword: true/false
    if (raw === "true") return true;
    if (raw === "false") return false;

    // Try step env first (for $.status, $.body)
    const stepVal = stepEnv.tryLookup(raw);
    if (stepVal !== undefined) return stepVal;

    // Try task env (for Step.1.id etc.)
    const taskVal = taskEnv.tryLookup(raw);
    if (taskVal !== undefined) return taskVal;

    // Try global env
    const globalVal = this.globalEnv.tryLookup(raw);
    if (globalVal !== undefined) return globalVal;

    // If numeric, return as number
    const num = Number(raw);
    if (!isNaN(num)) return num;

    // Return as raw string
    return raw;
  }

  /**
   * Resolve a dot-separated path from response data.
   * e.g., "response.id" → data.id
   */
  private resolveResponsePath(data: unknown, path: string): unknown {
    // Strip "response." prefix if present
    const cleanPath = path.startsWith("response.")
      ? path.substring("response.".length)
      : path;

    const parts = cleanPath.split(".");
    let current: unknown = data;

    for (const part of parts) {
      if (current === null || current === undefined) return null;
      if (typeof current === "object") {
        current = (current as Record<string, unknown>)[part];
      } else {
        return null;
      }
    }

    return current ?? null;
  }

  // ── Interpolation ──────────────────────────────────────────────────────

  /**
   * Replace {{varName}} placeholders with values from the variable map.
   */
  private interpolate(template: string, vars: Map<string, unknown>): string {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_match, varName: string) => {
      const value = vars.get(varName);
      if (value !== undefined && value !== null) {
        return String(value);
      }
      // Try dot-path lookup
      const parts = varName.split(".");
      if (parts.length > 1) {
        const rootVal = vars.get(parts[0]);
        if (rootVal !== undefined && rootVal !== null) {
          return String(this.resolveResponsePath(rootVal, parts.slice(1).join(".")));
        }
      }
      return `{{${varName}}}`;  // leave unresolved
    });
  }

  // ── Event Emission ─────────────────────────────────────────────────────

  private async emit<E extends InterpreterEvent>(
    event: E,
    payload: EventPayloadMap[E]
  ): Promise<void> {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;
    for (const listener of eventListeners) {
      await listener(payload);
    }
  }

  private emitSync<E extends InterpreterEvent>(
    event: E,
    payload: EventPayloadMap[E]
  ): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;
    for (const listener of eventListeners) {
      listener(payload);
    }
  }

  // ── Adapter Logging ─────────────────────────────────────────────────────

  /** Push a log line through the IO adapter (if set and supports logging) */
  private pushLog(level: LogLevel, message: string): void {
    if (this.ioAdapter?.log) {
      this.ioAdapter.log(level, message);
    }
  }

  // ── Execution Control ───────────────────────────────────────────────────

  /** Block execution while state is Paused */
  private waitIfPaused(): Promise<void> {
    if (this.state !== ExecutionState.Paused) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this.pauseResolver = resolve;
    });
  }

  /** Emit a state change event */
  private emitStateChanged(newState: ExecutionState, reason: string): void {
    this.emit(InterpreterEvent.StateChanged, { state: newState, reason });
  }

  /**
   * Clean up all resources.
   * Called on kill — clears environment, registry, listeners, adapter.
   */
  private cleanup(): void {
    this.pushLog("info", "🧹 Cleaning up resources...");

    // Clear environment
    for (const [key] of this.globalEnv.getOwnEntries()) {
      this.globalEnv.assign(key, null);
    }

    // Clear API registry
    this.apiRegistry.clear();

    // Clear event listeners
    this.listeners.clear();

    // Dispose adapter
    if (this.ioAdapter?.dispose) {
      this.ioAdapter.dispose();
    }

    this.pushLog("info", "✅ Cleanup complete");
  }

  // ── Public Accessors ───────────────────────────────────────────────────

  /** Get the global environment (for inspection/testing) */
  getEnvironment(): Environment {
    return this.globalEnv;
  }

  /** Get the API registry (for inspection/testing) */
  getApiRegistry(): ReadonlyMap<string, ApiDefinition> {
    return this.apiRegistry;
  }

  /** Prompt the user for input via the IOAdapter */
  async promptUser(message: string): Promise<string> {
    if (!this.ioAdapter) {
      throw new RuntimeError("No IO adapter set — cannot prompt user");
    }
    await this.emit(InterpreterEvent.InputRequired, { prompt: message });
    return this.ioAdapter.prompt(message);
  }
}
