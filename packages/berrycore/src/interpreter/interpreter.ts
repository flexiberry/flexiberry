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

export interface FetchResponse {
  readonly status: number;
  readonly data: any;
  readonly headers: Record<string, string>;
}

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
  CommentNode,
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
  /** Injected row of data for Input statements */
  readonly inputRow?: Record<string, string>;
  /** Provider for decrypting encrypted variables */
  readonly decryptionProvider?: (encrypted: string) => Promise<string> | string;
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
          await this.visitVarDeclaration(node);
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

    const plan = tasks.map(t => ({
      title: t.title ?? null,
      steps: t.steps
        .filter((s): s is StepBlockNode => s.type !== NodeType.Comment)
        .map(s => ({ targetName: s.targetName }))
    }));

    // Emit start event
    await this.emit(InterpreterEvent.Start, {
      totalTasks: tasks.length,
      totalApis: this.apiRegistry.size,
      totalVars: this.globalEnv.getOwnEntries().size,
      startTime: new Date(),
      plan,
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

  private async visitVarDeclaration(node: VarDeclarationNode): Promise<void> {
    // Store each key-value entry as a global variable
    for (const entry of node.entries) {
      if (entry.type === NodeType.Comment) continue;
      let value: string = entry.value;

      // Handle Input mapping
      if (value.startsWith("Input.")) {
        const fieldName = value.substring(6);
        if (this.options.inputRow && fieldName in this.options.inputRow) {
          value = this.options.inputRow[fieldName];
        }
      }

      // Handle Decryption
      if (entry.isEncrypted) {
        const provider = this.options.decryptionProvider ?? this.defaultDecryptionProvider.bind(this);
        value = await provider(value);
      }

      this.globalEnv.declare(entry.key, value);
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
      headers: (node.headers?.entries.filter(e => e.type !== NodeType.Comment) as KeyValuePairNode[]) ?? [],
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

    let actualStepIndex = 0;
    for (let i = 0; i < node.steps.length; i++) {
      const step = node.steps[i];
      if (step.type === NodeType.Comment) continue;

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
        this.pushLog("info", `Stopping task — skipping step ${actualStepIndex + 1} and remaining`);
        overallStatus = ExecutionStatus.Stopped;
        this.pendingCommand = ExecutionCommand.Continue; // reset for next task
        break;
      }

      // Check skip (skip this step, continue to next)
      if (this.pendingCommand === ExecutionCommand.Skip) {
        this.pushLog("info", `Skipping step ${actualStepIndex + 1}: ${step.targetName}`);
        stepResults.push({
          targetName: step.targetName,
          status: ExecutionStatus.Skipped,
          startTime: new Date(),
          endTime: new Date(),
          error: null,
          response: null,
          checksPassed: null,
          captures: null,
          checks: null,
        });
        this.pendingCommand = ExecutionCommand.Continue; // reset after skip
        actualStepIndex++;
        continue;
      }

      const stepResult = await this.visitStep(step, actualStepIndex, taskIndex, taskEnv);
      stepResults.push(stepResult);

      if (stepResult.status === ExecutionStatus.Failed) {
        overallStatus = ExecutionStatus.Failed;
        if (!this.options.continueOnError) {
          break;
        }
      }
      actualStepIndex++;
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
    let captures: Record<string, unknown> | null = null;
    let checks: Array<{ expression: string; pass: boolean; evaluated: string }> | null = null;

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
        captures = {};
        for (const entry of node.capture.entries) {
          if (entry.type === NodeType.Comment) continue;
          const val = this.resolveResponsePath(response, entry.value);
          captures[entry.key] = val;
        }
        this.processCapture(node.capture.entries, response, stepIndex, taskEnv);
      }

      // Process check
      if (node.check) {
        const checkResult = this.processCheck(node.check.conditions, stepEnv, taskEnv);
        checksPassed = checkResult.success;
        checks = checkResult.checks;
        if (!checksPassed) {
          status = ExecutionStatus.Failed;
          error = checkResult.error || "Check validation failed";
        }
      }
    } catch (err: unknown) {
      status = ExecutionStatus.Failed;
      if (err instanceof RuntimeError) {
        error = err.message;
      } else {
        error = err instanceof Error ? err.message : String(err);
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
      captures,
      checks,
    };

    await this.emit(InterpreterEvent.StepDone, { ...result, taskIndex, index: stepIndex });

    const stepIcon = status === ExecutionStatus.Pass ? "✅" : "❌";
    this.pushLog("step", `${stepIcon} ${node.targetName} → ${status}`);

    return result;
  }

  // ── API Call ────────────────────────────────────────────────────────────

  private async callApi(
    apiDef: ApiDefinition,
    stepEnv: Environment,
    taskEnv: Environment
  ): Promise<FetchResponse> {
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
      };
    }

    const callStart = Date.now();

    // Create abort controller for the request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.apiTimeout);

    try {
      const response = await fetch(url, {
        method: apiDef.method.toUpperCase(),
        headers,
        body: data,
        signal: controller.signal,
      });

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        responseHeaders[key] = val;
      });

      let responseData: any = null;
      const text = await response.text();
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          responseData = JSON.parse(text);
        } catch {
          responseData = text;
        }
      } else {
        responseData = text;
      }

      const duration = Date.now() - callStart;
      await this.emit(InterpreterEvent.ApiCallDone, {
        apiName: apiDef.name,
        status: response.status,
        duration,
      });

      this.pushLog("api", `${apiDef.name} → ${response.status} (${duration}ms)`);

      return {
        status: response.status,
        data: responseData,
        headers: responseHeaders,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ── Params Resolution ───────────────────────────────────────────────────

  private resolveParams(
    entries: ReadonlyArray<KeyValuePairNode | CommentNode>,
    stepEnv: Environment,
    taskEnv: Environment
  ): void {
    for (const entry of entries) {
      if (entry.type === NodeType.Comment) continue;
      // Check if the value references another variable (e.g., "Step.1.id")
      const resolved = taskEnv.tryLookup(entry.value);
      stepEnv.declare(entry.key, resolved !== undefined ? resolved : entry.value);
    }
  }

  // ── Capture Processing ──────────────────────────────────────────────────

  private processCapture(
    entries: ReadonlyArray<KeyValuePairNode | CommentNode>,
    response: FetchResponse,
    stepIndex: number,
    taskEnv: Environment
  ): void {
    for (const entry of entries) {
      if (entry.type === NodeType.Comment) continue;
      const value = this.resolveResponsePath(response, entry.value);
      // Store as Step.<1-based index>.<key>
      taskEnv.declare(`Step.${stepIndex + 1}.${entry.key}`, value as RuntimeValue);
      // Also store as <key> in task environment for direct reference
      taskEnv.declare(entry.key, value as RuntimeValue);
    }
  }

  // ── Check Processing ────────────────────────────────────────────────────

  private processCheck(
    conditions: ReadonlyArray<ConditionNode | CommentNode>,
    stepEnv: Environment,
    taskEnv: Environment
  ): {
    success: boolean;
    error?: string;
    checks: Array<{ expression: string; pass: boolean; evaluated: string }>;
  } {
    const formatVal = (val: unknown) => val === undefined ? "undefined" : JSON.stringify(val);
    const checksList: Array<{ expression: string; pass: boolean; evaluated: string }> = [];
    let success = true;
    let errorMsg: string | undefined = undefined;

    for (const condition of conditions) {
      if (condition.type === NodeType.Comment) continue;

      const lhsVal = this.resolveValue(condition.lhs, stepEnv, taskEnv);
      const rhsVal = this.resolveValue(condition.rhs, stepEnv, taskEnv);
      let result = this.compareValues(lhsVal, condition.operator, rhsVal);

      const orDetails: string[] = [];
      if (!result && condition.orConditions.length > 0) {
        for (const orExpr of condition.orConditions) {
          const orLhsVal = this.resolveValue(orExpr.lhs, stepEnv, taskEnv);
          const orRhsVal = this.resolveValue(orExpr.rhs, stepEnv, taskEnv);
          const orPass = this.compareValues(orLhsVal, orExpr.operator, orRhsVal);
          orDetails.push(
            `OR ${orExpr.lhs} ${orExpr.operator} ${orExpr.rhs} (evaluated: ${formatVal(orLhsVal)} ${orExpr.operator} ${formatVal(orRhsVal)})`
          );
          if (orPass) {
            result = true;
            break;
          }
        }
      }

      let condStr = `${condition.lhs} ${condition.operator} ${condition.rhs}`;
      let evalStr = `${formatVal(lhsVal)} ${condition.operator} ${formatVal(rhsVal)}`;

      checksList.push({
        expression: condStr,
        pass: result,
        evaluated: evalStr
      });

      if (!result && success) {
        success = false;
        errorMsg = `Check failed: ${condStr} (evaluated: ${evalStr})`;
        if (orDetails.length > 0) {
          errorMsg += " and all OR branches failed:\n- " + orDetails.join("\n- ");
        }
      }
    }

    return { success, error: errorMsg, checks: checksList };
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

    // Try dot-path lookup for nested properties (e.g. $.body.id or Step.1.data.name)
    const parts = raw.split(".");
    if (parts.length > 1) {
      for (let i = parts.length - 1; i >= 1; i--) {
        const prefix = parts.slice(0, i).join(".");
        const val = stepEnv.tryLookup(prefix) ?? taskEnv.tryLookup(prefix) ?? this.globalEnv.tryLookup(prefix);
        if (val !== undefined) {
          const subPath = parts.slice(i).join(".");
          return this.resolvePath(val, subPath);
        }
      }
    }

    // If numeric, return as number
    const num = Number(raw);
    if (!isNaN(num)) return num;

    // Return as raw string
    return raw;
  }

  /**
   * Resolve a dot-separated path from a FetchResponse.
   */
  private resolveResponsePath(response: FetchResponse, path: string): unknown {
    const cleanPath = path.trim();

    // Check HTTP status code access
    if (cleanPath === "response.status" || cleanPath === "$.status") {
      return response.status;
    }

    // Check HTTP headers access
    if (cleanPath.startsWith("response.headers.")) {
      const headerName = cleanPath.substring("response.headers.".length);
      return response.headers[headerName] || response.headers[headerName.toLowerCase()] || null;
    }
    if (cleanPath.startsWith("$.headers.")) {
      const headerName = cleanPath.substring("$.headers.".length);
      return response.headers[headerName] || response.headers[headerName.toLowerCase()] || null;
    }

    // Standard body data access
    let bodyPath = cleanPath;
    if (bodyPath.startsWith("response.body.")) {
      bodyPath = bodyPath.substring("response.body.".length);
    } else if (bodyPath.startsWith("$.body.")) {
      bodyPath = bodyPath.substring("$.body.".length);
    } else if (bodyPath.startsWith("response.")) {
      bodyPath = bodyPath.substring("response.".length);
    } else if (bodyPath.startsWith("$.")) {
      bodyPath = bodyPath.substring("$.".length);
    } else if (bodyPath === "response" || bodyPath === "$") {
      return response.data;
    } else if (bodyPath === "response.body" || bodyPath === "$.body") {
      return response.data;
    }

    return this.resolvePath(response.data, bodyPath);
  }

  /**
   * Resolve a dot-separated path from any object/array value.
   */
  private resolvePath(data: unknown, path: string): unknown {
    if (!path) return data;
    const parts = path.split(".");
    let current: unknown = data;

    for (const part of parts) {
      if (current === null || current === undefined) return null;
      if (Array.isArray(current)) {
        const index = parseInt(part, 10);
        if (!isNaN(index)) {
          current = current[index];
        } else {
          return null;
        }
      } else if (typeof current === "object") {
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
          return String(this.resolvePath(rootVal, parts.slice(1).join(".")));
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

  // ── Decryption Provider ──────────────────────────────────────────────────

  private defaultDecryptionProvider(encrypted: string): string {
    const isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
    if (isNode) {
      return Buffer.from(encrypted, "base64").toString("utf-8");
    }
    return atob(encrypted);
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
