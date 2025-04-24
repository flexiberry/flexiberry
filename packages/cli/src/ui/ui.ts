import { version } from "os";
import chalk from "chalk";
import { createInterface, Interface as ReadlineInterface } from "readline";

// ANSI escape codes for terminal control
const ANSI = {
  // Cursor control
  cursorTo: (x: number, y: number) => `\x1b[${y};${x}H`,
  cursorUp: (n: number) => `\x1b[${n}A`,
  cursorDown: (n: number) => `\x1b[${n}B`,
  cursorForward: (n: number) => `\x1b[${n}C`,
  cursorBackward: (n: number) => `\x1b[${n}D`,
  saveCursor: "\x1b[s",
  restoreCursor: "\x1b[u",

  // Clearing
  clearScreen: "\x1b[2J",
  clearLine: "\x1b[2K",
  clearToEnd: "\x1b[0J",

  // Styling
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",

  // Colors
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  // Background colors
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",

  // Special
  hide: "\x1b[?25l",
  show: "\x1b[?25h",

  // Box drawing characters
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
};

// --- TypeScript interfaces and types ---

type TestStepStatus = "pending" | "running" | "passed" | "failed";

interface TestStep {
  name: string;
  status: TestStepStatus;
  timeElapsed: number; // ms
}

interface TestCase {
  id: string;
  name: string;
  steps: TestStep[];
  status?: TestStepStatus;
  endTime?: string;
}

type TestItemType = "suite" | "test" | "separator";

interface TestDetails {
  title: string;
  version: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: string;
  apiCount: number;
  flexiberry: string;
  stepCounts?: { passed: number; failed: number; pending: number };
}

function getStepCounts(testCases: TestCase[]): {
  passed: number;
  failed: number;
  pending: number;
} {
  const counts = { passed: 0, failed: 0, pending: 0 };
  for (const testCase of testCases) {
    for (const step of testCase.steps) {
      switch (step.status) {
        case "passed":
          counts.passed++;
          break;
        case "failed":
          counts.failed++;
          break;
        case "pending":
          counts.pending++;
          break;
      }
    }
  }
  return counts;
}

function printTableHeader(): void {
  const colWidths = [30, 30, 12, 12];
  process.stdout.write(
    `${ANSI.bold}${"Test Case".padEnd(colWidths[0])}  ${"Step".padEnd(colWidths[1])}  ${"Status".padEnd(colWidths[2])}  ${"Time (ms)".padEnd(colWidths[3])}${ANSI.reset}\n`
  );
  process.stdout.write(
    `${ANSI.boxHorizontal.repeat(colWidths[0])}  ${ANSI.boxHorizontal.repeat(colWidths[1])}  ${ANSI.boxHorizontal.repeat(colWidths[2])}  ${ANSI.boxHorizontal.repeat(colWidths[3])}\n`
  );
}

function printTableRow(testCase: TestCase, showCaseName = true): void {
  const colWidths = [30, 30, 12, 12];
  let isFirstStep = true;
  for (const step of testCase.steps) {
    const statusColor =
      step.status === "passed"
        ? ANSI.green
        : step.status === "failed"
          ? ANSI.red
          : step.status === "running"
            ? ANSI.yellow
            : ANSI.dim;
    let statusDisplay = step.status.padEnd(colWidths[2]);
    if (step.status === "pending") {
      const spinner = "◐◓◑◒"[Math.floor(Date.now() / 250) % 4];
      statusDisplay = `${spinner} ${step.status}`.padEnd(colWidths[2]);
    }
    process.stdout.write(
      `${isFirstStep && showCaseName ? testCase.name.padEnd(colWidths[0]) : "".padEnd(colWidths[0])}  ${step.name.padEnd(colWidths[1])}  ${statusColor}${statusDisplay}${ANSI.reset}  ${String(step.timeElapsed).padEnd(colWidths[3])}\n`
    );
    isFirstStep = false;
  }
  process.stdout.write("\n");
}

function printBar(stepCounts: {
  passed: number;
  failed: number;
  pending: number;
}): void {
  const total = stepCounts.passed + stepCounts.failed + stepCounts.pending;
  const barLength = 30;
  const passedLen = Math.round((stepCounts.passed / total) * barLength);
  const failedLen = Math.round((stepCounts.failed / total) * barLength);
  const pendingLen = barLength - passedLen - failedLen;
  const bar =
    chalk.green("█".repeat(passedLen)) +
    chalk.red("█".repeat(failedLen)) +
    chalk.yellow("█".repeat(pendingLen));
  const percent = (n: number) => (total ? ((n / total) * 100).toFixed(0) : "0");
  process.stdout.write(
    `\n${chalk.bold("Test Results:")}  ${bar}  ` +
      chalk.green(
        `${stepCounts.passed} Passed (${percent(stepCounts.passed)}%) `
      ) +
      chalk.red(
        `${stepCounts.failed} Failed (${percent(stepCounts.failed)}%) `
      ) +
      chalk.yellow(
        `${stepCounts.pending} Pending (${percent(stepCounts.pending)}%)\n\n`
      )
  );
}

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[([0-?]*[ -/]*[@-~])/g, "");
}

export class UI {
  private terminalWidth: number;
  private terminalHeight: number;
  private rl: ReadlineInterface;
  private testCases: TestCase[] = [];
  private tableLineCount: number = 0;
  private tableAnchored: boolean = false;
  private spinnerFrames: string[] = ["◐", "◓", "◑", "◒"];
  private spinnerIndex: number = 0;

  constructor() {
    this.terminalWidth = process.stdout.columns || 80;
    this.terminalHeight = process.stdout.rows || 24;
    this.rl = createInterface({
      input: process.stdin,
      output: undefined,
    });
  }

  initializeTable(testCases: TestCase[]): void {
    this.testCases = testCases;
    this.render();
  }

  updateTestStep(
    testCaseId: string,
    stepIndex: number,
    status: TestStepStatus,
    timeElapsed: number
  ): void {
    const testCase = this.testCases.find((tc) => tc.id === testCaseId);
    if (!testCase || !testCase.steps[stepIndex]) return;
    testCase.steps[stepIndex].status = status;
    testCase.steps[stepIndex].timeElapsed = timeElapsed;
    this.render();
  }

  updateTestCaseResult(testCaseId: string, status: TestStepStatus): void {
    const testCase = this.testCases.find((tc) => tc.id === testCaseId);
    if (!testCase) return;
    testCase.status = status;
    testCase.endTime = new Date().toISOString();
    this.render();
  }

  render(): void {
    // Move cursor up to the start of the table if we've rendered before
    if (this.tableLineCount > 0) {
      process.stdout.write(`\x1b[${this.tableLineCount}A`);
    }
    let linesPrinted = 0;
    // Table header
    printTableHeader();
    linesPrinted += 2;
    // Table rows
    for (const testCase of this.testCases) {
      linesPrinted += testCase.steps.length + 1; // +1 for the extra newline after each test case
      printTableRow(testCase, true);
    }
    // Results bar
    const stepCounts = getStepCounts(this.testCases);
    printBar(stepCounts);
    linesPrinted += 3; // 1 for bar, 2 for newlines in bar
    this.tableLineCount = linesPrinted;
    this.spinnerIndex = (this.spinnerIndex + 1) % this.spinnerFrames.length;
  }

  exit(): void {
    process.stdout.write(ANSI.show + ANSI.reset);
    process.stdin.setRawMode(false);
    process.stdin.pause();
    this.rl.close();
  }

  printTestDetails(details: TestDetails): void {
    const leftCol = [
      chalk.bold("   🚀  Test Execution Details"),
      chalk.cyan("─────────────────────────────"),
      `📝  ${chalk.bold("Title:")}         ${details.title}`,
      `🔖  ${chalk.bold("Version:")}       ${details.version}`,
      `⏱️  ${chalk.bold("Start Time:")}    ${details.startTime}`,
      `⏳  ${chalk.bold("End Time:")}      ${details.endTime}`,
      `⏲️  ${chalk.bold("Duration:")}      ${details.duration}`,
      `📋  ${chalk.bold("Status:")}        ${chalk.yellow(details.status)}`,
    ];
    const rightCol = [
      chalk.bold("   🌐  Environment Overview"),
      chalk.cyan("─────────────────────────────"),
      `🔢  ${chalk.bold("API Count:")}     ${details.apiCount}`,
      `🍓  ${chalk.bold("Flexiberry:")}    ${details.flexiberry}`,
      "",
      "",
      "",
      "",
    ];
    const leftWidths = leftCol.map((line) => stripAnsi(line).length);
    const rightWidths = rightCol.map((line) => stripAnsi(line).length);
    const colWidth = Math.max(30, ...leftWidths, ...rightWidths) + 2;
    for (let i = 0; i < leftCol.length; i++) {
      const left = leftCol[i] || "";
      const right = rightCol[i] || "";
      // Pad right side of left column and print right column
      console.log(left.padEnd(colWidth) + "  " + right);
    }
  }
}
