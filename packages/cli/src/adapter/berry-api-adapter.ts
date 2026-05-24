import * as readline from "readline";
import { IOAdapter, LogLevel } from "@flexiberry/berrycore";
import { colors } from "../lib/colors.js";
import { intro, outro } from "../lib/prompts.js";

export class BerryApiAdapter implements IOAdapter {
  private rl: readline.Interface | null = null;
  private spinnerTimer: NodeJS.Timeout | null = null;
  private spinnerTick = 0;
  private readonly SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

  private getReadline(): readline.Interface {
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
    }
    return this.rl;
  }

  /** Prompt the user for input via stdin in a standard, clean way without keyboard locks */
  prompt(message: string): Promise<string> {
    return new Promise((resolve) => {
      this.getReadline().question(`🔹 ${message}: `, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async confirm(message: string): Promise<boolean> {
    const answer = await this.prompt(`${message} (y/n)`);
    return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
  }

  /** Print errors and warnings cleanly */
  log(level: LogLevel, message: string): void {
    if (level === "error") {
      console.log(`${colors.red("❌")} ${colors.bold(message)}`);
    } else if (level === "warn") {
      console.log(`${colors.yellow("⚠️")} ${message}`);
    }
  }

  /** Render request and response detail cards beautifully */
  showApiExecution(
    request: { method: string; url: string; headers: Record<string, string>; body?: string | null },
    response: { status: number; body: any; headers: Record<string, string> }
  ): void {
    intro(`DIRECT API EXECUTION CALL: ${request.method} ${request.url}`);

    const printLine = (msg: string) => {
      console.log(`${colors.cyan("│")}  ${msg}`);
    };

    printLine("");
    printLine(`${colors.cyan(colors.bold("REQUEST HEADERS"))}`);
    if (Object.keys(request.headers).length === 0) {
      printLine(`  ${colors.dim("(None)")}`);
    } else {
      for (const [key, val] of Object.entries(request.headers)) {
        printLine(`  ${colors.dim(key)}: ${colors.bold(val)}`);
      }
    }

    if (request.body) {
      printLine("");
      printLine(`${colors.cyan(colors.bold("REQUEST BODY"))}`);
      let reqBodyStr = request.body;
      try {
        const parsed = JSON.parse(reqBodyStr);
        reqBodyStr = JSON.stringify(parsed, null, 2);
        reqBodyStr = this.highlightJson(reqBodyStr);
      } catch {
        // Fallback to plain text style
        reqBodyStr = reqBodyStr.split("\n").map(l => colors.dim(l)).join("\n");
      }
      const bodyLines = reqBodyStr.split("\n");
      for (const line of bodyLines) {
        printLine(`  ${line}`);
      }
    }

    printLine("");
    printLine(`${colors.cyan("─".repeat(Math.max(40, (process.stdout.columns ?? 80) - 6)))}`);
    printLine("");

    const isSuccess = response.status < 400;
    const statusColor = isSuccess ? colors.green : colors.red;
    const statusIcon = isSuccess ? "✔" : "✖";
    printLine(`${colors.bold("RESPONSE STATUS:")} ${statusColor(colors.bold(`${statusIcon} ${response.status}`))}`);

    printLine("");
    printLine(`${colors.whiteBright(colors.bold("RESPONSE HEADERS"))}`);
    if (Object.keys(response.headers).length === 0) {
      printLine(`  ${colors.dim("(None)")}`);
    } else {
      for (const [key, val] of Object.entries(response.headers)) {
        printLine(`  ${colors.dim(key)}: ${colors.bold(val)}`);
      }
    }

    printLine("");
    printLine(`${colors.whiteBright(colors.bold("RESPONSE BODY"))}`);
    let bodyStr = "";
    let isJson = false;
    if (typeof response.body === "object" && response.body !== null) {
      bodyStr = JSON.stringify(response.body, null, 2);
      isJson = true;
    } else {
      bodyStr = String(response.body);
      try {
        const parsed = JSON.parse(bodyStr);
        bodyStr = JSON.stringify(parsed, null, 2);
        isJson = true;
      } catch {
        isJson = false;
      }
    }

    if (isJson) {
      bodyStr = this.highlightJson(bodyStr);
    }
    const bodyLines = bodyStr.split("\n");
    for (const line of bodyLines) {
      printLine(`  ${line}`);
    }

    outro("API Execution Completed", true);
  }

  onApiCallBegin(method: string, url: string): void {
    this.onApiCallDone(); // Ensure any existing is stopped

    this.spinnerTick = 0;
    process.stdout.write(`\r  ${this.SPINNER[0]}  ${colors.cyan(method)} ${colors.bold(url)} ...`);

    this.spinnerTimer = setInterval(() => {
      this.spinnerTick = (this.spinnerTick + 1) % this.SPINNER.length;
      process.stdout.write(`\r  ${this.SPINNER[this.spinnerTick]}  ${colors.cyan(method)} ${colors.bold(url)} ...`);
    }, 100);
  }

  onApiCallDone(): void {
    if (this.spinnerTimer) {
      clearInterval(this.spinnerTimer);
      this.spinnerTimer = null;
    }
    // Erase the temporary spinner line
    try {
      const cols = process.stdout.columns ?? 80;
      process.stdout.write(`\r${" ".repeat(cols - 1)}\r`);
    } catch {
      process.stdout.write(`\r\r`);
    }
  }

  private highlightJson(jsonStr: string): string {
    return jsonStr.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|[{}[\],])/g,
      (match) => {
        let cls = colors.white;
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = colors.magenta;
            const key = match.slice(0, -1);
            return `${cls(key)}${colors.white(":")}`;
          } else {
            cls = colors.green;
          }
        } else if (/true|false/.test(match)) {
          cls = colors.green;
        } else if (/null/.test(match)) {
          cls = colors.red;
        } else if (/[0-9]/.test(match)) {
          cls = colors.green;
        } else {
          cls = colors.gray;
        }
        return cls(match);
      }
    );
  }

  dispose(): void {
    this.onApiCallDone();
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }
}
