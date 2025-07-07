import { version } from "os";
import chalk from "chalk";
import { createInterface, Interface as ReadlineInterface } from "readline";
import {
  RuntimeJobOverview,
  RuntimeStep,
  RuntimeTask,
} from "@flexiberry/berrycore";

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

function getStepCounts(tasks: RuntimeTask[]): {
  passed: number;
  failed: number;
  pending: number;
} {
  const counts = { passed: 0, failed: 0, pending: 0 };
  for (const task of tasks) {
    for (const step of task.steps || []) {
      switch (step.status) {
        case "PASS":
          counts.passed++;
          break;
        case "FAILED":
          counts.failed++;
          break;
        case "PENDING":
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

function printTableRow(testCase: RuntimeTask, showCaseName = true): void {
  const colWidths = [30, 30, 12, 12];
  let isFirstStep = true;
  for (const step of testCase.steps || []) {
    const statusColor =
      step.status === "PASS"
        ? ANSI.green
        : step.status === "FAILED"
          ? ANSI.red
          : step.status === "RUNNING"
            ? ANSI.yellow
            : ANSI.dim;
    let statusDisplay = step.status.padEnd(colWidths[2]);
    if (step.status === "pending") {
      const spinner = "◐◓◑◒"[Math.floor(Date.now() / 250) % 4];
      statusDisplay = `${spinner} ${step.status}`.padEnd(colWidths[2]);
    }
    process.stdout.write(
      `${isFirstStep && showCaseName ? testCase.title.padEnd(colWidths[0]) : "".padEnd(colWidths[0])}  ${step.title.padEnd(colWidths[1])}  ${statusColor}${statusDisplay}${ANSI.reset}  ${String(step.duration).padEnd(colWidths[3])}\n`
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
  let pendingLen = barLength - passedLen - failedLen;
  if (pendingLen < 0) pendingLen = 0;

  const bar =
    chalk.green("█".repeat(passedLen || 0)) +
    chalk.red("█".repeat(failedLen || 0)) +
    chalk.yellow("█".repeat(pendingLen || 0));
  const percent = (n: number) => (total ? ((n / total) * 100).toFixed(0) : "0");
  process.stdout.write(
    `\n${chalk.bold("Test Results:")}  ${bar}  ` +
      chalk.green(
        `${stepCounts.passed} pass (${percent(stepCounts.passed)}%) `
      ) +
      chalk.red(`${stepCounts.failed} Fail (${percent(stepCounts.failed)}%) `) +
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
  private testCases: RuntimeTask[] = [];
  private tableLineCount: number = 0;
  private tableAnchored: boolean = false;
  private spinnerFrames: string[] = ["◐", "◓", "◑", "◒"];
  private spinnerIndex: number = 0;
  private fileName?: string;
  private environment?: string;

  setSummaryContext(fileName: string, environment: string) {
    this.fileName = fileName;
    this.environment = environment;
  }

  constructor() {
    this.terminalWidth = process.stdout.columns || 80;
    this.terminalHeight = process.stdout.rows || 24;
    this.rl = createInterface({
      input: process.stdin,
      output: undefined,
    });
  }

  initializeTable(testCases: RuntimeTask[]): void {
    this.testCases = testCases;
    this.render();
  }

  updateTestStep(status: RuntimeStep): void {
    const testCase = this.testCases.find((tc) => tc.id === status.taskId);
    const stepIndex = testCase?.steps?.findIndex((s) => s.id === status.id);
    if (stepIndex === undefined) return;
    if (!testCase || !testCase.steps || !testCase.steps[stepIndex]) return;
    testCase.steps[stepIndex].status = status.status;
    if (
      !!testCase.steps[stepIndex].endTime &&
      !!testCase.steps[stepIndex].startTime
    )
      testCase.steps[stepIndex].duration =
        testCase.steps[stepIndex].endTime.getTime() -
        testCase.steps[stepIndex].startTime.getTime() +
        "ms";
    this.render();
  }

  updateTaskResult(status: RuntimeTask): void {
    const testCase = this.testCases.find((tc) => tc.id === status.id);
    if (!testCase) return;
    // testCase. = status;
    testCase.duration = new Date().toISOString();
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
      linesPrinted += (testCase?.steps?.length || 0) + 1; // +1 for the extra newline after each test case
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
    this.printFinalSummary();
  }
  printJobDetails(fileName: string, environment: string): void {
    this.fileName = fileName || "Unknown File";
    this.environment = environment || "Local";
    let startTime = "-";
    if (this.testCases.length > 0) {
      const allStartTimes = this.testCases
        .map((tc) => tc.startTime)
        .filter(Boolean)
        .sort();
      if (allStartTimes.length)
        startTime = allStartTimes[0].toDateString() || "-";
    }
    const line = chalk.cyan(ANSI.boxHorizontal.repeat(this.terminalWidth));
    console.log(
      `${chalk.bold.cyan("📝 FLEXIBERRY TEST JOB  ")} \n` +
        `${chalk.bold("📄 File:")} ${chalk.yellowBright(fileName)}` +
        `  ${chalk.bold("🌐 Env:")} ${chalk.magentaBright(environment)}` +
        `  ${chalk.bold("⏱️  Start:")} ${chalk.whiteBright(startTime)}` +
        `\n${line}\n`
    );
  }

  printFinalSummary(): void {
    const { passed, failed, pending } = getStepCounts(this.testCases);
    const total = passed + failed + pending;
    const percent = (n: number) =>
      total ? `${Math.round((n / total) * 100)}%` : "0%";
    const width = this.terminalWidth;
    const barChar = "│";
    const passedLen = Math.round((passed / total) * width);
    const failedLen = Math.round((failed / total) * width);
    const pendingLen = width - passedLen - failedLen;
    const bar =
      chalk.green(barChar.repeat(passedLen || 0)) +
      chalk.red(barChar.repeat(failedLen || 0)) +
      chalk.yellow(barChar.repeat(pendingLen || 0));

    const fileName = this.fileName || "Unknown File";
    const environment = this.environment || "Local";

    let start = Infinity,
      end = -Infinity;
    for (const tc of this.testCases) {
      if (tc.startTime)
        start = Math.min(start, new Date(tc.startTime).getTime());
      if (tc.endTime) end = Math.max(end, new Date(tc.endTime).getTime());
    }
    const startTime = start < Infinity ? new Date(start).toISOString() : "-";
    const endTime = end > -Infinity ? new Date(end).toISOString() : "-";
    const duration = start < end ? `${Math.round((end - start) / 1000)}s` : "-";

    const statusLine =
      failed === 0 && pending === 0
        ? chalk.green.bold("✨ ALL TESTS PASSED! ✨ 🚀 Great Job! 🚀")
        : failed > 0
          ? chalk.red.bold("❌ SOME TESTS FAILED")
          : chalk.yellow.bold("⏳ TESTS PENDING");

    const centerText = (text: string) => {
      const pad = Math.floor((width - stripAnsi(text).length) / 2);
      return " ".repeat(pad) + text;
    };

    const title = "FINAL SUMMARY";
    const padLen = width - title.length;
    const header =
      ANSI.boxHorizontal.repeat(Math.floor(padLen / 2)) +
      chalk.bold.blueBright(title) +
      ANSI.boxHorizontal.repeat(Math.ceil(padLen / 2));

    const lines = [
      "",
      header,
      "",
      `${chalk.bold("File:")} ${chalk.yellow(fileName)}   ${chalk.bold("Env:")} ${chalk.magenta(environment)}`,
      `${chalk.bold("Start:")} ${chalk.white(startTime)}   ${chalk.bold("End:")} ${chalk.white(endTime)}   ${chalk.bold("Duration:")} ${chalk.white(duration)}`,
      "",
      `${chalk.green(`${passed} Passed (${percent(passed)})`)}   ${chalk.red(`${failed} Failed (${percent(failed)})`)}   ${chalk.yellow(`${pending} Pending (${percent(pending)})`)}`,
      bar,
      "",
      centerText(statusLine),
      "",
    ];
    process.stdout.write(lines.join("\n") + "\n");
  }

  printTestDetails(details: RuntimeJobOverview): void {
    const leftCol = [
      chalk.bold("   🚀  Test Execution Details"),
      chalk.cyan("─────────────────────────────"),
      `📝  ${chalk.bold("Title:")}         ${details.fileName}`,
      `🔖  ${chalk.bold("Version:")}       ${details.activeEnv}`,
      `⏱️  ${chalk.bold("Start Time:")}    ${details.startTime}`,
      `⏳  ${chalk.bold("End Time:")}      ${details.endTime}`,
      `⏲️  ${chalk.bold("Duration:")}      ${details.duration}`,
      ``,
    ];
    const rightCol = [
      chalk.bold("   🌐  Environment Overview"),
      chalk.cyan("─────────────────────────────"),
      `🔢  ${chalk.bold("API Count:")}     ${details.apis}`,
      `🍓  ${chalk.bold("Flexiberry:")}    ${details.fileName}`,
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
