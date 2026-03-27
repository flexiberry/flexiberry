/**
 * CLI Adapter
 *
 * Default IOAdapter implementation using Node readline + stdout.
 * Handles input, output, and execution control for CLI execution.
 */

import * as readline from "readline";
import { IOAdapter, LogLevel, ExecutionCommand } from "../interpreter/interpreter.types";

// ─── Log Level Icons ────────────────────────────────────────────────────────

const LEVEL_ICONS: Record<LogLevel, string> = {
  info: "ℹ️ ",
  warn: "⚠️ ",
  error: "❌",
  debug: "🔍",
  step: "▶ ",
  task: "📋",
  api: "🌐",
};

// ─── CLI Adapter ────────────────────────────────────────────────────────────

export class CliAdapter implements IOAdapter {
  private rl: readline.Interface | null = null;
  private commandHandler: ((command: ExecutionCommand) => void) | null = null;
  private readonly enableLogging: boolean;
  private readonly logLevels: Set<LogLevel>;
  private readonly enableCommands: boolean;

  constructor (options: {
    /** Enable log output to stdout (default: true) */
    enableLogging?: boolean;
    /** Which log levels to show (default: all except debug) */
    logLevels?: LogLevel[];
    /** Enable keyboard commands during execution (default: false) */
    enableCommands?: boolean;
  } = {}) {
    this.enableLogging = options.enableLogging ?? true;
    this.logLevels = new Set(
      options.logLevels ?? ["info", "warn", "error", "step", "task", "api"]
    );
    this.enableCommands = options.enableCommands ?? false;
  }

  private getReadline(): readline.Interface {
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      // Listen for keyboard commands during execution
      if (this.enableCommands) {
        this.rl.on("line", (input: string) => {
          this.handleKeyboardInput(input.trim().toLowerCase());
        });
      }
    }
    return this.rl;
  }

  /** Prompt the user for input via stdin */
  prompt(message: string): Promise<string> {
    return new Promise((resolve) => {
      this.getReadline().question(`🔹 ${message}: `, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /** Ask a yes/no question */
  async confirm(message: string): Promise<boolean> {
    const answer = await this.prompt(`${message} (y/n)`);
    return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
  }

  /** Push a log line to stdout */
  log(level: LogLevel, message: string): void {
    if (!this.enableLogging) return;
    if (!this.logLevels.has(level)) return;

    const icon = LEVEL_ICONS[level];
    console.log(`${icon} ${message}`);
  }

  /**
   * Register a command handler.
   * Called by the interpreter to wire up command sending.
   */
  onCommand(handler: (command: ExecutionCommand) => void): void {
    this.commandHandler = handler;

    // Initialize readline so keyboard listening starts
    if (this.enableCommands) {
      this.getReadline();
      console.log("─── Commands: [p]ause  [c]ontinue  [s]kip  [t]stop  [k]ill ───");
    }
  }

  /** Clean up readline interface */
  dispose(): void {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
    this.commandHandler = null;
  }

  // ── Keyboard Input Handling ─────────────────────────────────────────────

  private handleKeyboardInput(input: string): void {
    if (!this.commandHandler) return;

    switch (input) {
      case "p":
      case "pause":
        this.commandHandler(ExecutionCommand.Pause);
        break;
      case "c":
      case "continue":
      case "resume":
        this.commandHandler(ExecutionCommand.Continue);
        break;
      case "s":
      case "skip":
        this.commandHandler(ExecutionCommand.Skip);
        break;
      case "t":
      case "stop":
        this.commandHandler(ExecutionCommand.Stop);
        break;
      case "k":
      case "kill":
        this.commandHandler(ExecutionCommand.Kill);
        break;
      default:
        // Ignore unknown input
        break;
    }
  }
}
