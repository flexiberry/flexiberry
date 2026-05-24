/**
 * BerryTableAdapter
 *
 * A rich terminal IO adapter that replaces per-line logging with a live
 * table that re-renders in place as each step/task status changes.
 *
 * Features:
 *   - Live task × step matrix (spinner on RUNNING, icons on done)
 *   - HTTP method + URL info column while a step is in flight
 *   - Interrupt bar: [P]ause [C]ontinue [S]kip [T]stop [K]ill
 *   - Paused / Completed state indicator
 *   - Inline input prompt when the script calls `ask`
 */

import {
  type IOAdapter,
  ExecutionCommand,
} from "@flexiberry/berrycore";
import { colors } from "../lib/colors.js";
import { intro, outro } from "../lib/prompts.js";

// LogLevel is internal to berrycore — mirror it locally.
type LogLevel = "info" | "warn" | "error" | "debug" | "step" | "task" | "api";

// ─── Domain types ─────────────────────────────────────────────────────────────

export type StepStatus = "PENDING" | "RUNNING" | "PASS" | "FAILED" | "SKIPPED" | "STOPPED";
type AdapterState = "RUNNING" | "PAUSED" | "COMPLETED";

interface LiveStep {
  readonly name: string;
  status: StepStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;   // ms
  method?: string;
  url?: string;
  httpStatus?: number;
  error?: string;
}

interface LiveTask {
  readonly title: string;
  status: StepStatus;
  readonly steps: LiveStep[];
  iteration: number;   // 1-based index
  startTime: Date;
  endTime?: Date;
}

// ─── ANSI primitives ──────────────────────────────────────────────────────────

const A = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgCyan: "\x1b[46m",
  up: (n: number) => `\x1b[${n}A`,
  col1: "\x1b[1G",
  eraseDown: "\x1b[J",
  hideCursor: "\x1b[?25l",
  showCursor: "\x1b[?25h",
} as const;

// ─── Status icons / labels ────────────────────────────────────────────────────

const ICON: Record<StepStatus, string> = {
  PENDING: `${A.gray}·${A.reset}`,
  RUNNING: `${A.cyan}●${A.reset}`,
  PASS: `${A.green}✓${A.reset}`,
  FAILED: `${A.red}✗${A.reset}`,
  SKIPPED: `${A.yellow}⊟${A.reset}`,
  STOPPED: `\x1b[35m■${A.reset}`,
};

function statusLabel(s: StepStatus, spinner: string): string {
  switch (s) {
    case "PENDING": return `${A.gray}Pending${A.reset}`;
    case "RUNNING": return `${A.cyan}${A.bold}${spinner} Running${A.reset}`;
    case "PASS": return `${A.green}${A.bold}Pass${A.reset}`;
    case "FAILED": return `${A.red}${A.bold}Failed${A.reset}`;
    case "SKIPPED": return `${A.yellow}Skipped${A.reset}`;
    case "STOPPED": return `\x1b[35mStopped${A.reset}`;
  }
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*[mA-Za-z]/g, "");
}

/**
 * Pads a string to exactly `width` *visible* characters (ignoring ANSI codes).
 * Truncates the visible text if it already exceeds `width`.
 */
function padR(s: string, width: number): string {
  const vis = stripAnsi(s);
  if (vis.length >= width) {
    // Truncate: find the real string index for `width` visible chars
    let count = 0;
    let i = 0;
    while (i < s.length && count < width) {
      if (s[i] === "\x1b") {
        // skip escape sequence
        while (i < s.length && !/[A-Za-z]/.test(s[i])) i++;
        i++;
      } else {
        count++;
        i++;
      }
    }
    return s.slice(0, i) + A.reset;
  }
  return s + " ".repeat(width - vis.length);
}

function truncate(s: string, maxVisible: number): string {
  const vis = stripAnsi(s);
  if (vis.length <= maxVisible) return s;
  return vis.slice(0, maxVisible - 1) + "…";
}

function hr(W: number, char = "─"): string {
  return `${A.gray}${char.repeat(W)}${A.reset}`;
}

// ─── Column layout ────────────────────────────────────────────────────────────
//
// Fixed columns (all measured in visible characters):
//   Iter | "  " | Task | "  " | Step | "  "| Status | "  " | Time | "  " | Info
//
const COL = { iter: 6, task: 22, step: 18, status: 9, time: 8 } as const;
const FIXED_WIDTH = COL.iter + 2 + COL.task + 2 + COL.step + 2 + COL.status + 2 + COL.time + 2; // 71

// ─── BerryTableAdapter ────────────────────────────────────────────────────────

export class BerryTableAdapter implements IOAdapter {

  // ── Static Utilities ─────────────────────────────────────────────────────────

  static printJobDetails(fileName: string, environment: string): void {
    const fnStr = fileName ?? "Unknown File";
    const envStr = environment ?? "Local";
    const startStr = new Date().toLocaleString();

    // Use A.cyan + bold for the title
    console.log(
      `${A.cyan}${A.bold}📝 FLEXIBERRY JOB  ${A.reset}\n` +
      `${A.bold}📄 File:${A.reset} ${A.yellow}${fnStr}${A.reset}` +
      `  ${A.bold}🌐 Env:${A.reset} ${A.magenta}${envStr}${A.reset}` +
      `  ${A.bold}⏱️  Start:${A.reset} ${A.cyan}${startStr}${A.reset}` +
      `\n` + `${A.gray}─${A.reset}`.repeat(Math.max(60, process.stdout.columns ?? 100)) + `\n`
    );
  }

  // ── Live model ──────────────────────────────────────────────────────────────
  private readonly tasks: LiveTask[] = [];
  private adapterState: AdapterState = "RUNNING";
  private planLength = 0;
  private totalIterations = 0;
  private activeIteration = 1;

  // ── Render state ────────────────────────────────────────────────────────────
  private renderedLines = 0;
  private spinnerTick = 0;
  private readonly SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  private tickTimer: NodeJS.Timeout | null = null;

  // ── Command handler (injected by interpreter) ────────────────────────────────
  private commandHandler: ((cmd: ExecutionCommand) => void) | null = null;

  // ── Inline input state ───────────────────────────────────────────────────────
  private inputMode = false;
  private inputBuffer = "";
  private inputMessage = "";
  private inputResolver: ((val: string) => void) | null = null;

  // ─── Public update API (called from run-utility event listeners) ─────────────

  initPlan(plan: ReadonlyArray<{ title: string | null; steps: ReadonlyArray<{ targetName: string }> }>, iterationCount: number, activeIteration?: number): void {
    this.adapterState = "RUNNING";
    if (activeIteration !== undefined) {
      this.activeIteration = activeIteration;
    }
    const count = Math.max(1, iterationCount);

    // If the plan is the same, only grow the tasks array if count increased
    if (this.planLength === plan.length && this.tasks.length > 0) {
      if (count > this.totalIterations) {
        const currentCount = this.totalIterations;
        this.totalIterations = count;
        for (let i = currentCount; i < count; i++) {
          for (const p of plan) {
            this.tasks.push({
              title: truncate(p.title || "(unnamed)", COL.task - 2),
              status: "PENDING",
              iteration: i + 1,
              startTime: new Date(),
              steps: p.steps.map(s => ({
                name: truncate(s.targetName, COL.step - 2),
                status: "PENDING",
                startTime: new Date(),
              })),
            });
          }
        }
      }
      this.render();
      return;
    }

    this.renderedLines = 0;
    // New plan or first initialization
    this.tasks.length = 0;
    this.planLength = plan.length;
    this.totalIterations = count;

    for (let i = 0; i < this.totalIterations; i++) {
      for (const p of plan) {
        this.tasks.push({
          title: truncate(p.title || "(unnamed)", COL.task - 2),
          status: "PENDING",
          iteration: i + 1,
          startTime: new Date(), // overridden when actually running
          steps: p.steps.map(s => ({
            name: truncate(s.targetName, COL.step - 2),
            status: "PENDING",
            startTime: new Date(), // overridden later
          })),
        });
      }
    }

    this.render();
  }

  resetBaseline(): void {
    this.renderedLines = 0;
  }

  onTaskBegin(taskIdx: number): void {
    const t = this.tasks[taskIdx];
    if (t) {
      t.status = "RUNNING";
      t.startTime = new Date();
    }
    this.render();
  }

  onTaskDone(taskIdx: number, status: StepStatus): void {
    const t = this.tasks[taskIdx];
    if (!t) return;
    t.status = status;
    t.endTime = new Date();
    this.render();
  }

  onStepBegin(taskIdx: number, stepIdx: number): void {
    const s = this.tasks[taskIdx]?.steps[stepIdx];
    if (s) {
      s.status = "RUNNING";
      s.startTime = new Date();
    }
    this.render();
  }

  onStepDone(taskIdx: number, stepIdx: number, status: StepStatus, error?: string): void {
    const s = this.tasks[taskIdx]?.steps[stepIdx];
    if (!s) return;
    s.status = status;
    s.endTime = new Date();
    s.duration = s.endTime.getTime() - s.startTime.getTime();
    s.error = error;
    this.render();
  }

  onApiCallBegin(taskIdx: number, stepIdx: number, method: string, url: string): void {
    const s = this.tasks[taskIdx]?.steps[stepIdx];
    if (!s) return;
    s.method = method;
    s.url = url;
    this.render();
  }

  onApiCallDone(taskIdx: number, stepIdx: number, httpStatus: number, duration: number): void {
    const s = this.tasks[taskIdx]?.steps[stepIdx];
    if (!s) return;
    s.httpStatus = httpStatus;
    s.duration = duration;
    this.render();
  }

  setCompleted(): void {
    this.adapterState = "COMPLETED";
    this.stopTicker();
    this.render();
  }

  /** Prints the final summary block summarizing the tasks tracked by this adapter. */
  printFinalSummary(): void {
    let passed = 0;
    let failed = 0;
    let pending = 0;

    let startMs = Infinity;
    let endMs = -Infinity;

    for (const t of this.tasks) {
      if (t.startTime) startMs = Math.min(startMs, t.startTime.getTime());
      if (t.endTime) endMs = Math.max(endMs, t.endTime.getTime());

      for (const s of t.steps) {
        if (s.startTime) startMs = Math.min(startMs, s.startTime.getTime());
        if (s.endTime) endMs = Math.max(endMs, s.endTime.getTime());

        if (s.status === "PASS") passed++;
        else if (s.status === "FAILED") failed++;
        else if (s.status === "PENDING" || s.status === "RUNNING") pending++;
      }
    }

    const total = passed + failed + pending;
    const pct = (n: number) => (total ? `${Math.round((n / total) * 100)}%` : "0%");

    const startTimeLabel = startMs < Infinity ? new Date(startMs).toLocaleString() : "-";
    const endTimeLabel = endMs > -Infinity ? new Date(endMs).toLocaleString() : "-";
    const durationLabel = startMs <= endMs ? `${((endMs - startMs) / 1000).toFixed(2)}s` : "-";

    const title = " FINAL SUMMARY ";
    const W = Math.max(60, process.stdout.columns ?? 100);
    const padLen = W - title.length;
    const header =
      A.gray + "─".repeat(title.length) + A.reset +
      A.bold + A.cyan + title + A.reset +
      A.gray + "─".repeat(Math.max(0, Math.ceil(padLen / 2))) + A.reset;

    const barLength = 30;
    const passedLen = Math.round((passed / total) * barLength) || 0;
    const failedLen = Math.round((failed / total) * barLength) || 0;
    const pendingLen = Math.max(0, barLength - passedLen - failedLen);

    const bar =
      colors.green("█".repeat(passedLen)) +
      colors.red("█".repeat(failedLen)) +
      colors.yellow("█".repeat(pendingLen));

    const lines = [
      "",
      ` ${colors.bold("Results:")}  ${bar}  ` +
      `${colors.green(`${passed} pass (${pct(passed)})`)} ` +
      `${colors.red(`${failed} fail (${pct(failed)})`)} ` +
      `${colors.yellow(`${pending} pending (${pct(pending)})`)}`,
      "",
      header,
      "",
      `${colors.gray("Start:")} ${A.white}${startTimeLabel}${A.reset}   ` +
      `${colors.gray("End:")} ${A.white}${endTimeLabel}${A.reset}   ` +
      `${colors.gray("Duration:")} ${A.white}${durationLabel}${A.reset}   ` +
      `${colors.gray("Iterations:")} ${A.white}${this.totalIterations}${A.reset}`,
      "",
      `${colors.green(`${passed} Passed (${pct(passed)})`)}   ` +
      `${colors.red(`${failed} Failed (${pct(failed)})`)}   ` +
      `${colors.yellow(`${pending} Pending (${pct(pending)})`)}`,
      "",
      ""
    ];

    process.stdout.write(lines.join("\n") + "\n");
  }

  /** Number of steps recorded for a task — used by run-utility to find last step. */
  getStepCount(taskIdx: number): number {
    return this.tasks[taskIdx]?.steps.length ?? 0;
  }

  // ─── IOAdapter implementation ─────────────────────────────────────────────────

  onCommand(handler: (cmd: ExecutionCommand) => void): void {
    this.commandHandler = handler;
    this.startKeyboardInput();
  }

  /** Suppress raw log lines — the table is the display surface. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  log(_level: LogLevel, _message: string): void { /* intentionally silent */ }

  prompt(message: string): Promise<string> {
    this.inputMode = true;
    this.inputBuffer = "";
    this.inputMessage = message;
    this.render();
    return new Promise<string>((resolve) => {
      this.inputResolver = resolve;
    });
  }

  async confirm(message: string): Promise<boolean> {
    const ans = await this.prompt(`${message}  (y/n)`);
    return ans.toLowerCase() === "y" || ans.toLowerCase() === "yes";
  }

  showApiExecution(
    request: { method: string; url: string; headers: Record<string, string>; body?: string | null },
    response: { status: number; body: any; headers: Record<string, string> }
  ): void {
    intro(`DIRECT API EXECUTION CALL: ${request.method} ${request.url}`);

    const printLine = (msg: string) => {
      console.log(`${colors.cyan("│")}  ${msg}`);
    };

    printLine("");
    printLine(`${colors.cyan(colors.bold("👉 REQUEST HEADERS"))}`);
    if (Object.keys(request.headers).length === 0) {
      printLine(`  ${colors.dim("(None)")}`);
    } else {
      for (const [key, val] of Object.entries(request.headers)) {
        printLine(`  ${colors.bold(key)}: ${colors.dim(val)}`);
      }
    }

    if (request.body) {
      printLine("");
      printLine(`${colors.cyan(colors.bold("👉 REQUEST BODY"))}`);
      const bodyLines = request.body.split("\n");
      for (const line of bodyLines) {
        printLine(`  ${colors.dim(line)}`);
      }
    }

    printLine("");
    printLine(`${colors.cyan("─".repeat(Math.max(40, (process.stdout.columns ?? 80) - 6)))}`);
    printLine("");

    const isSuccess = response.status < 400;
    const statusColor = isSuccess ? colors.green : colors.red;
    const statusIcon = isSuccess ? "✔" : "✖";
    printLine(`${colors.bold("👈 RESPONSE STATUS:")} ${statusColor(colors.bold(`${statusIcon} ${response.status}`))}`);

    printLine("");
    printLine(`${colors.magenta(colors.bold("👉 RESPONSE HEADERS"))}`);
    if (Object.keys(response.headers).length === 0) {
      printLine(`  ${colors.dim("(None)")}`);
    } else {
      for (const [key, val] of Object.entries(response.headers)) {
        printLine(`  ${colors.bold(key)}: ${colors.dim(val)}`);
      }
    }

    printLine("");
    printLine(`${colors.magenta(colors.bold("👉 RESPONSE BODY"))}`);
    const bodyStr = typeof response.body === "object"
      ? JSON.stringify(response.body, null, 2)
      : String(response.body);
    const bodyLines = bodyStr.split("\n");
    for (const line of bodyLines) {
      printLine(`  ${line}`);
    }

    outro("API Execution Completed");
  }

  dispose(): void {
    this.stopTicker();
    try {
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
    } catch { /* ignore if not TTY */ }
    process.stdin.removeAllListeners("data");
    process.stdin.pause();
    process.stdin.unref();
    process.stdout.write(A.showCursor);
  }

  // ─── Keyboard input ───────────────────────────────────────────────────────────

  private startKeyboardInput(): void {
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (chunk: string) => {
      if (chunk === "\u0003") { // Ctrl+C
        this.dispose();
        process.stdout.write("\n");
        process.exit(0);
      }
      if (this.inputMode) {
        this.handleInputChar(chunk);
      } else {
        this.handleCommandChar(chunk);
      }
    });

    // Spinner tick — only re-render when a step is actually running
    this.tickTimer = setInterval(() => {
      this.spinnerTick = (this.spinnerTick + 1) % this.SPINNER.length;
      if (this.hasRunningStep()) this.render();
    }, 120);
  }

  private stopTicker(): void {
    if (this.tickTimer) { clearInterval(this.tickTimer); this.tickTimer = null; }
  }

  private hasRunningStep(): boolean {
    return this.tasks.some((t) => t.steps.some((s) => s.status === "RUNNING"));
  }

  private handleCommandChar(key: string): void {
    switch (key.toLowerCase()) {
      case "p": this.adapterState = "PAUSED"; this.commandHandler?.(ExecutionCommand.Pause); this.render(); break;
      case "c": this.adapterState = "RUNNING"; this.commandHandler?.(ExecutionCommand.Continue); this.render(); break;
      case "s": this.commandHandler?.(ExecutionCommand.Skip); this.render(); break;
      case "t": this.commandHandler?.(ExecutionCommand.Stop); this.render(); break;
      case "k": this.commandHandler?.(ExecutionCommand.Kill); this.render(); break;
    }
  }

  private handleInputChar(key: string): void {
    if (key === "\r" || key === "\n") {
      const value = this.inputBuffer;
      this.inputMode = false;
      this.inputBuffer = "";
      this.inputMessage = "";
      const resolver = this.inputResolver;
      this.inputResolver = null;
      this.render();
      resolver?.(value);
    } else if (key === "\x7f" || key === "\x08") {
      this.inputBuffer = this.inputBuffer.slice(0, -1);
      this.render();
    } else if (key.length === 1 && key >= " ") {
      this.inputBuffer += key;
      this.render();
    }
  }

  // ─── Rendering ────────────────────────────────────────────────────────────────

  private render(): void {
    const cols = process.stdout.columns;
    const W = Math.max(60, cols ? cols - 2 : 78);
    const lines = this.buildLines(W);

    if (this.renderedLines > 0) {
      process.stdout.write(A.up(this.renderedLines) + A.col1 + A.eraseDown);
    }
    process.stdout.write(A.hideCursor + lines.join("\n") + "\n");
    this.renderedLines = lines.length;
  }

  private buildLines(W: number): string[] {
    const spinner = this.SPINNER[this.spinnerTick];
    // Info column gets whatever space is left (allow shrinking for small terminals)
    const infoW = Math.max(0, W - FIXED_WIDTH);
    const lines: string[] = [];

    // ── Top separator ──────────────────────────────────────────────────────────
    lines.push(hr(W));

    // ── Column header (plain text — no ANSI in padR inputs here) ──────────────
    lines.push(
      `${A.bold}\x1b[34m` +
      padR("Iter", COL.iter) + "  " +
      padR("Task", COL.task) + "  " +
      padR("Step", COL.step) + "  " +
      padR("Status", COL.status) + "  " +
      padR("Time", COL.time) + "  " +
      padR("Info", infoW) +
      A.reset
    );

    // ── Column separator (matches column widths exactly) ───────────────────────
    lines.push(
      A.gray +
      "─".repeat(COL.iter) + "  " +
      "─".repeat(COL.task) + "  " +
      "─".repeat(COL.step) + "  " +
      "─".repeat(COL.status) + "  " +
      "─".repeat(COL.time) + "  " +
      "─".repeat(infoW) +
      A.reset
    );

    // ── Rows ───────────────────────────────────────────────────────────────────
    if (this.tasks.length === 0) {
      lines.push(`  ${A.dim}Waiting to start…${A.reset}`);
    }

    const activeIteration = this.activeIteration;

    const tasksToRender: LiveTask[] = [];
    if (this.planLength > 0) {
      // Only show the active iteration to keep the table compact and prevent terminal scrolling/duplication
      const start = (activeIteration - 1) * this.planLength;
      for (let i = start; i < start + this.planLength; i++) {
        if (this.tasks[i]) tasksToRender.push(this.tasks[i]);
      }
    } else {
      // Fallback if no plan length
      tasksToRender.push(...this.tasks);
    }

    for (let ti = 0; ti < tasksToRender.length; ti++) {
      const task = tasksToRender[ti];
      const taskIcon = ICON[task.status];
      const taskLabel = `${taskIcon} ${task.title}`;
      let firstStep = true;

      // Group visual separator: add empty line if this is the start of a new iteration set
      // (except for the very first row)
      if (ti > 0 && ti % this.planLength === 0) {
        lines.push("");
      }

      if (task.steps.length === 0) {
        const iterStr = `${task.iteration}/${this.totalIterations}`;
        lines.push(
          padR(iterStr, COL.iter) + "  " +
          padR(taskLabel, COL.task) + "  " +
          padR("", COL.step) + "  " +
          padR(statusLabel(task.status, spinner), COL.status) + "  " +
          padR("", COL.time)
        );
        continue;
      }

      for (let si = 0; si < task.steps.length; si++) {
        const step = task.steps[si];
        const sIcon = ICON[step.status];
        const sLabel = statusLabel(step.status, spinner);
        const timeStr = step.duration !== undefined
          ? `${step.duration}ms`
          : step.status === "RUNNING" ? "…" : "";

        let infoAnsi = "";
        if (step.status === "RUNNING" && step.url) {
          infoAnsi = `${A.dim}${(step.method ?? "?") + " " + step.url.slice(0, infoW)}${A.reset}`;
        } else if (step.httpStatus !== undefined) {
          const httpPart = `HTTP ${step.httpStatus}`;
          const errPart = step.error ? `  ${step.error.replace(/\r?\n/g, " ")}` : "";
          const httpColor = step.httpStatus < 300 ? A.green : step.httpStatus < 400 ? A.yellow : A.red;
          const maxErr = infoW - httpPart.length - 2;
          infoAnsi = `${httpColor}${httpPart}${A.reset}${A.gray}${errPart.slice(0, Math.max(0, maxErr))}${A.reset}`;
        } else if (step.error) {
          const cleanErr = step.error.replace(/\r?\n/g, " ");
          infoAnsi = `${A.red}${cleanErr.slice(0, infoW)}${A.reset}`;
        }

        const taskCol = firstStep ? padR(taskLabel, COL.task) : " ".repeat(COL.task);
        const iterStr = firstStep ? `${task.iteration}/${this.totalIterations}` : "";

        lines.push(
          padR(iterStr, COL.iter) + "  " +
          taskCol + "  " +
          padR(`${sIcon} ${step.name}`, COL.step) + "  " +
          padR(sLabel, COL.status) + "  " +
          padR(timeStr, COL.time) + "  " +
          padR(infoAnsi, infoW)
        );
        firstStep = false;
      }

      // Visual gap between tasks
      if (ti < tasksToRender.length - 1) {
        lines.push("");
      }
    }

    // ── Bottom separator ───────────────────────────────────────────────────────
    lines.push(hr(W));

    // ── State / interrupt bar ──────────────────────────────────────────────────
    const iterInfo = this.totalIterations > 1 ? `  ${A.cyan}${A.bold}[Iteration ${this.activeIteration}/${this.totalIterations}]${A.reset}` : "";
    if (this.adapterState === "PAUSED") {
      lines.push(
        `${A.bgYellow}\x1b[30m  ⏸  PAUSED  ${A.reset}   ` +
        `${A.bold}[C]${A.reset} Resume  ` +
        `${A.bold}[S]${A.reset} Skip  ` +
        `${A.bold}[T]${A.reset} Stop  ` +
        `${A.bold}[K]${A.reset} Kill` +
        iterInfo
      );
    } else if (this.adapterState === "COMPLETED") {
      lines.push(`${A.bgGreen}\x1b[30m  ✓  Execution Completed   ${A.reset}` + iterInfo);
    } else {
      lines.push(
        `${A.dim}Controls:${A.reset}  ` +
        `${A.bold}[P]${A.reset} Pause  ` +
        `${A.bold}[S]${A.reset} Skip  ` +
        `${A.bold}[T]${A.reset} Stop  ` +
        `${A.bold}[K]${A.reset} Kill` +
        iterInfo
      );
    }

    // ── Inline input prompt (shown when script calls `ask`) ────────────────────
    if (this.inputMode) {
      lines.push("");
      lines.push(`${A.bgCyan}\x1b[30m  ❓ Input Required  ${A.reset}`);
      lines.push(`  ${A.bold}› ${this.inputMessage}${A.reset}`);
      lines.push(
        `  ${A.bgBlue}\x1b[37m ${this.inputBuffer}${A.reset}` +
        `${A.bgBlue} ${A.reset}${A.dim}  ← type and press Enter${A.reset}`
      );
    }

    return lines;
  }
}
