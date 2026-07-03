/**
 * Interpreter Types
 *
 * Runtime value types, execution status, event types,
 * and the IOAdapter interface for CLI/UI input abstraction.
 */

// ─── Runtime Values ─────────────────────────────────────────────────────────

/** Any value that can exist at runtime */
export type RuntimeValue = string | number | boolean | Record<string, unknown> | null;

// ─── Execution Status ───────────────────────────────────────────────────────

export enum ExecutionStatus {
  Pending = "PENDING",
  Running = "RUNNING",
  Pass = "PASS",
  Failed = "FAILED",
  Skipped = "SKIPPED",
  Paused = "PAUSED",
  Stopped = "STOPPED",
  Killed = "KILLED",
}

// ─── Interpreter Events ─────────────────────────────────────────────────────

export enum InterpreterEvent {
  /** Interpreter has started execution */
  Start = "START",
  /** Interpreter has completed all tasks */
  Completed = "COMPLETED",

  /** A task is about to begin */
  TaskBegin = "TASK_BEGIN",
  /** A task has finished */
  TaskDone = "TASK_DONE",

  /** A step is about to begin */
  StepBegin = "STEP_BEGIN",
  /** A step has finished */
  StepDone = "STEP_DONE",

  /** An API call is about to be made */
  ApiCallBegin = "API_CALL_BEGIN",
  /** An API call has completed */
  ApiCallDone = "API_CALL_DONE",

  /** General log message */
  Log = "LOG",
  /** Runtime error occurred */
  Error = "ERROR",

  /** Interpreter requires user input */
  InputRequired = "INPUT_REQUIRED",

  /** Execution state changed (paused, resumed, killed) */
  StateChanged = "STATE_CHANGED",

  /** Data from an Input statement has been loaded */
  DataLoaded = "DATA_LOADED",
}

// ─── Event Payloads ─────────────────────────────────────────────────────────

export interface StartPayload {
  readonly totalTasks: number;
  readonly totalApis: number;
  readonly totalVars: number;
  readonly startTime: Date;
  readonly plan: ReadonlyArray<{
    readonly title: string | null;
    readonly steps: ReadonlyArray<{ readonly targetName: string }>;
  }>;
}

export interface CompletedPayload {
  readonly endTime: Date;
  readonly taskResults: readonly TaskResult[];
}

export interface TaskResult {
  readonly title: string | null;
  readonly status: ExecutionStatus;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly steps: readonly StepResult[];
}

export interface StepResult {
  readonly targetName: string;
  readonly status: ExecutionStatus;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly error: string | null;
  readonly response: ApiResponse | null;
  readonly checksPassed: boolean | null;
  readonly captures: Record<string, unknown> | null;
  readonly checks?: ReadonlyArray<{ expression: string; pass: boolean; evaluated: string }> | null;
}

export interface ApiResponse {
  readonly status: number;
  readonly headers: Record<string, string>;
  readonly body: unknown;
}

export interface LogPayload {
  readonly level: "info" | "warn" | "debug";
  readonly message: string;
}

export interface ErrorPayload {
  readonly message: string;
  readonly line?: number;
  readonly column?: number;
}

// ─── Event Listener Type ────────────────────────────────────────────────────

export type EventPayloadMap = {
  [InterpreterEvent.Start]: StartPayload;
  [InterpreterEvent.Completed]: CompletedPayload;
  [InterpreterEvent.TaskBegin]: { readonly title: string | null; readonly index: number };
  [InterpreterEvent.TaskDone]: TaskResult;
  [InterpreterEvent.StepBegin]: { readonly targetName: string; readonly index: number; readonly taskIndex: number };
  [InterpreterEvent.StepDone]: StepResult & { readonly taskIndex: number; readonly index: number };
  [InterpreterEvent.ApiCallBegin]: { readonly method: string; readonly url: string; readonly apiName: string };
  [InterpreterEvent.ApiCallDone]: { readonly apiName: string; readonly status: number; readonly duration: number };
  [InterpreterEvent.Log]: LogPayload;
  [InterpreterEvent.Error]: ErrorPayload;
  [InterpreterEvent.InputRequired]: { readonly prompt: string };
  [InterpreterEvent.StateChanged]: { readonly state: ExecutionState; readonly reason: string };
  [InterpreterEvent.DataLoaded]: { readonly rows: Record<string, string>[] };
};

export type EventListener<E extends InterpreterEvent> = (payload: EventPayloadMap[E]) => void | Promise<void>;

// ─── IO Adapter ─────────────────────────────────────────────────────────────

export type LogLevel = "info" | "warn" | "error" | "debug" | "step" | "task" | "api";

// ─── Execution Commands ─────────────────────────────────────────────────────

/** Commands that can be sent to the interpreter at any time */
export enum ExecutionCommand {
  /** Continue to the next step (default behavior) */
  Continue = "CONTINUE",
  /** Skip the current/next step and move on */
  Skip = "SKIP",
  /** Stop the current task (skip remaining steps) and move to next task */
  Stop = "STOP",
  /** Pause execution — wait for Continue or Kill */
  Pause = "PAUSE",
  /** Kill execution — clean up all resources and abort immediately */
  Kill = "KILL",
}

/** The current execution state of the interpreter */
export enum ExecutionState {
  Idle = "IDLE",
  Running = "RUNNING",
  Paused = "PAUSED",
  Stopped = "STOPPED",
  Killed = "KILLED",
  Completed = "COMPLETED",
}

/**
 * Abstraction for user input, output, AND execution control.
 * Implement this for CLI (readline/stdout) or UI (callback/websocket).
 */
export interface IOAdapter {
  /** Prompt the user for input and return the response */
  prompt(message: string): Promise<string>;

  /** Optional: confirm yes/no from user */
  confirm?(message: string): Promise<boolean>;

  /**
   * Push a log line to the output.
   * Called by the interpreter for real-time status updates.
   */
  log?(level: LogLevel, message: string): void;

  /**
   * Register a callback that the adapter calls when the user issues a command.
   * The interpreter calls this once at startup to give the adapter
   * a way to send commands back.
   */
  onCommand?(handler: (command: ExecutionCommand) => void): void;

  /**
   * Print a beautifully formatted summary of the API request and response
   * specifically for API-only execution.
   */
  showApiExecution?(
    request: { method: string; url: string; headers: Record<string, string>; body?: string | null },
    response: { status: number; body: any; headers: Record<string, string> }
  ): void;

  /**
   * Called when the interpreter is being killed.
   * Adapter should clean up its resources (close readline, sockets, etc.).
   */
  dispose?(): void;
}
