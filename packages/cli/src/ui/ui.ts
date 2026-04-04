/**
 * ui.ts
 *
 * Live terminal UI for the FlexiBerry test runner.
 * The chalk dependency has been removed and replaced with the native colors lib
 * and the ANSI escape-code constants that were already defined in this file.
 */

import { createInterface, Interface as ReadlineInterface } from "readline";
import { colors, c } from "../lib/colors.js";

// ─── UI data types (internal, not from berrycore) ─────────────────────────────

export interface UIStep {
  id: string;
  title: string;
  action?: string;
  target?: string;
  functionId?: string;
  status: "PENDING" | "RUNNING" | "PASS" | "FAILED" | "SKIPPED";
  startTime?: Date;
  endTime?: Date;
  duration?: string;
  comments?: string;
  taskId?: string;
}

export interface UITask {
  id: string;
  title: string;
  steps?: UIStep[];
  startTime?: Date;
  endTime?: Date;
  duration?: string;
}

export interface UIJobOverview {
  fileName: string;
  activeEnv: string;
  startTime: string;
  endTime: string;
  duration: string;
  apis?: number;
}

// ─── ANSI escape code primitives (already zero-dependency) ───────────────────

const ANSI = {
  cursorTo: (x: number, y: number) => `\x1b[${y};${x}H`,
  cursorUp: (n: number) => `\x1b[${n}A`,
  cursorDown: (n: number) => `\x1b[${n}B`,
  cursorForward: (n: number) => `\x1b[${n}C`,
  cursorBackward: (n: number) => `\x1b[${n}D`,
  saveCursor: "\x1b[s",
  restoreCursor: "\x1b[u",

  clearScreen: "\x1b[2J",
  clearLine: "\x1b[2K",
  clearToEnd: "\x1b[0J",

  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",

  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",

  hide: "\x1b[?25l",
  show: "\x1b[?25h",

  boxHorizontal: "─",
  boxVertical: "│",
  boxTopLeft: "┌",
  boxTopRight: "┐",
  boxBottomLeft: "└",
  boxBottomRight: "┘",
  boxCrossLeft: "├",
  boxCrossRight: "┤",
  boxCrossTop: "┬",
  boxCrossBottom: "┴",
  boxCross: "┼",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStepCounts(tasks: UITask[]): {
  passed: number;
  failed: number;
  pending: number;
} {
  const counts = { passed: 0, failed: 0, pending: 0 };
  for (const task of tasks) {
    for (const step of task.steps ?? []) {
      if (step.status === "PASS") counts.passed++;
      else if (step.status === "FAILED") counts.failed++;
      else if (step.status === "PENDING") counts.pending++;
    }
  }
  return counts;
}

function printTableHeader(): void {
  const colWidths = [30, 30, 12, 12];
  process.stdout.write(
    `${ANSI.bold}${ANSI.blue}${"Task".padEnd(colWidths[0])}  ${"Step".padEnd(colWidths[1])}  ${"Status".padEnd(colWidths[2])}  ${"Time (ms)".padEnd(colWidths[3])}${ANSI.reset}\n`
  );
  process.stdout.write(
    `${ANSI.boxHorizontal.repeat(colWidths[0])}  ${ANSI.boxHorizontal.repeat(colWidths[1])}  ${ANSI.boxHorizontal.repeat(colWidths[2])}  ${ANSI.boxHorizontal.repeat(colWidths[3])}\n`
  );
}

function printTableRow(testCase: UITask, showCaseName = true): void {
  const colWidths = [30, 30, 12, 12];
  let isFirstStep = true;

  for (const step of testCase.steps ?? []) {
    const statusColor =
      step.status === "PASS"
        ? ANSI.green
        : step.status === "FAILED"
          ? ANSI.red
          : step.status === "RUNNING"
            ? ANSI.yellow
            : ANSI.dim;

    let statusDisplay = step.status.padEnd(colWidths[2]);
    if (step.status === "RUNNING") {
      const frame = "◐◓◑◒"[Math.floor(Date.now() / 250) % 4];
      statusDisplay = `${frame} ${step.status}`.padEnd(colWidths[2]);
    }

    process.stdout.write(
      `${isFirstStep && showCaseName ? testCase.title.padEnd(colWidths[0]) : "".padEnd(colWidths[0])}  ` +
      `${step.title.padEnd(colWidths[1])}  ` +
      `${statusColor}${statusDisplay}${ANSI.reset}  ` +
      `${colors.gray(String(step.duration ?? "").padEnd(colWidths[3]))}  ` +
      `${colors.yellow(step.comments ?? "")}\n`
    );
    isFirstStep = false;
  }
  process.stdout.write("\n");
}

function printBar(counts: { passed: number; failed: number; pending: number }): void {
  const { passed, failed, pending } = counts;
  const total = passed + failed + pending;
  const barLength = 30;
  const passedLen = Math.round((passed / total) * barLength) || 0;
  const failedLen = Math.round((failed / total) * barLength) || 0;
  const pendingLen = Math.max(0, barLength - passedLen - failedLen);

  const bar =
    colors.green("█".repeat(passedLen)) +
    colors.red("█".repeat(failedLen)) +
    colors.yellow("█".repeat(pendingLen));

  const pct = (n: number) => (total ? ((n / total) * 100).toFixed(0) : "0");

  process.stdout.write(
    `\n${colors.bold(" Results:")}  ${bar}  ` +
    colors.green(`${passed} pass (${pct(passed)}%) `) +
    colors.red(`${failed} fail (${pct(failed)}%) `) +
    colors.yellow(`${pending} pending (${pct(pending)}%)\n\n`)
  );
}

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[([0-?]*[ -/]*[@-~])/g, "");
}

// ─── UI class ─────────────────────────────────────────────────────────────────

export class UI {
  private readonly terminalWidth: number;
  private readonly terminalHeight: number;
  private readonly rl: ReadlineInterface;
  private testCases: UITask[] = [];
  private tableLineCount: number = 0;
  private spinnerIndex: number = 0;
  private readonly spinnerFrames: string[] = ["◐", "◓", "◑", "◒"];
  private fileName?: string;
  private environment?: string;

  constructor() {
    this.terminalWidth = process.stdout.columns ?? 80;
    this.terminalHeight = process.stdout.rows ?? 24;
    this.rl = createInterface({ input: process.stdin, output: undefined });
  }

  setSummaryContext(fileName: string, environment: string): void {
    this.fileName = fileName;
    this.environment = environment;
  }

  initializeTable(testCases: UITask[]): void {
    this.testCases = testCases;
    this.render();
  }

  updateTask(x: Partial<UITask> & { id: string }): void {
    const idx = this.testCases.findIndex((tc) => tc.id === x.id);
    if (idx === -1) return;
    this.testCases[idx] = { ...this.testCases[idx], ...x };
  }

  updateTestStep(status: UIStep): void {
    const testCase = this.testCases.find((tc) => tc.id === status.taskId);
    const stepIndex = testCase?.steps?.findIndex((s) => s.id === status.id);
    if (stepIndex === undefined || stepIndex === -1) return;
    if (!testCase?.steps?.[stepIndex]) return;

    testCase.steps[stepIndex] = { ...testCase.steps[stepIndex], ...status };

    const step = testCase.steps[stepIndex];
    if (step.endTime && step.startTime) {
      step.duration = `${step.endTime.getTime() - step.startTime.getTime()}ms`;
    }
    this.render();
  }

  updateTaskResult(status: UITask): void {
    const testCase = this.testCases.find((tc) => tc.id === status.id);
    if (!testCase) return;
    testCase.duration = new Date().toISOString();
    this.render();
  }

  render(): void {
    if (this.tableLineCount > 0) {
      process.stdout.write(`\x1b[${this.tableLineCount}A`);
    }
    let linesPrinted = 0;

    printTableHeader();
    linesPrinted += 2;

    for (const testCase of this.testCases) {
      linesPrinted += (testCase.steps?.length ?? 0) + 1;
      printTableRow(testCase, true);
    }

    const stepCounts = getStepCounts(this.testCases);
    printBar(stepCounts);
    linesPrinted += 3;

    this.tableLineCount = linesPrinted;
    this.spinnerIndex = (this.spinnerIndex + 1) % this.spinnerFrames.length;
  }

  exit(): void {
    process.stdout.write(ANSI.show + ANSI.reset);
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
    process.stdin.pause();
    this.rl.close();
    this.printFinalSummary();
  }

  printJobDetails(fileName: string, environment: string): void {
    this.fileName = fileName ?? "Unknown File";
    this.environment = environment ?? "Local";

    const startTime = new Date().toLocaleString();
    const line = colors.gray(ANSI.boxHorizontal.repeat(this.terminalWidth));

    console.log(
      `${c.boldCyan("📝 FLEXIBERRY JOB  ")}\n` +
      `${colors.bold("📄 File:")} ${colors.yellowBright(fileName)}` +
      `  ${colors.bold("🌐 Env:")} ${colors.magentaBright(environment)}` +
      `  ${colors.bold("⏱️  Start:")} ${colors.blueBright(startTime)}` +
      `\n${line}\n`
    );
  }

  printFinalSummary(): void {
    const { passed, failed, pending } = getStepCounts(this.testCases);
    const total = passed + failed + pending;
    const pct = (n: number) => (total ? `${Math.round((n / total) * 100)}%` : "0%");

    let start = Infinity;
    let end = -Infinity;
    for (const tc of this.testCases) {
      if (tc.startTime) start = Math.min(start, new Date(tc.startTime).getTime());
      if (tc.endTime) end = Math.max(end, new Date(tc.endTime).getTime());
    }

    const startTime = start < Infinity ? new Date(start).toLocaleString() : "-";
    const endTime = end > -Infinity ? new Date(end).toLocaleString() : "-";
    const duration = start < end ? `${((end - start) / 1000).toFixed(2)}s` : "-";

    const title = " FINAL SUMMARY ";
    const padLen = this.terminalWidth - title.length;
    const header =
      ANSI.boxHorizontal.repeat(title.length) +
      c.boldBlueBright(title) +
      ANSI.boxHorizontal.repeat(Math.ceil(padLen / 2));

    const lines = [
      "",
      header,
      "",
      `${colors.gray("Start:")} ${colors.white(startTime)}   ${colors.gray("End:")} ${colors.white(endTime)}   ${colors.gray("Duration:")} ${colors.white(duration)}`,
      "",
      `${colors.green(`${passed} Passed (${pct(passed)})`)}   ${colors.red(`${failed} Failed (${pct(failed)})`)}   ${colors.yellow(`${pending} Pending (${pct(pending)})`)}`,
      "",
      "",
    ];

    process.stdout.write(lines.join("\n") + "\n");
  }

  printTestDetails(details: UIJobOverview): void {
    const leftCol = [
      colors.bold("   🚀  Test Execution Details"),
      colors.cyan("─────────────────────────────"),
      `📝  ${colors.bold("Title:")}         ${details.fileName}`,
      `🔖  ${colors.bold("Version:")}       ${details.activeEnv}`,
      `⏱️  ${colors.bold("Start Time:")}    ${details.startTime}`,
      `⏳  ${colors.bold("End Time:")}      ${details.endTime}`,
      `⏲️  ${colors.bold("Duration:")}      ${details.duration}`,
      ``,
    ];
    const rightCol = [
      colors.bold("   🌐  Environment Overview"),
      colors.cyan("─────────────────────────────"),
      `🔢  ${colors.bold("API Count:")}     ${details.apis}`,
      `🍓  ${colors.bold("Flexiberry:")}    ${details.fileName}`,
      "",
      "",
      "",
      "",
    ];

    const leftWidths = leftCol.map((l) => stripAnsi(l).length);
    const rightWidths = rightCol.map((r) => stripAnsi(r).length);
    const colWidth = Math.max(30, ...leftWidths, ...rightWidths) + 2;

    for (let i = 0; i < leftCol.length; i++) {
      console.log((leftCol[i] ?? "").padEnd(colWidth) + "  " + (rightCol[i] ?? ""));
    }
  }
}
