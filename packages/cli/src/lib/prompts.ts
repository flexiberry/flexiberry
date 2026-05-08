/**
 * prompts.ts
 *
 * A robust, zero-dependency interactive prompt library for Node.js CLIs.
 * Replaces `@clack/prompts` using only Node.js built-in `readline`.
 *
 * Design principles:
 *  - Only ONE readline interface or raw-mode listener is active at a time.
 *  - After every prompt completes, stdin is left in a neutral state
 *    (not paused, not in raw mode) so the next prompt can always attach.
 *  - `select()` uses raw-mode + keypress events, then fully restores
 *    normal line-mode before resolving.
 *  - `text()` / `confirm()` use a single `readline.question()` call.
 *
 * Exported surface:
 *   intro()     – styled section header
 *   outro()     – styled section footer
 *   log         – message / step / success / warn / error / info helpers
 *   text()      – single-line text input with validation
 *   select()    – keyboard-navigable single-choice menu
 *   confirm()   – yes / no prompt
 *   group()     – sequential group of named prompts
 *   spinner()   – animated progress indicator
 *   isCancel()  – cancel-sentinel type-guard
 */

import * as readline from "readline";
import { colors } from "./colors.js";

// ─── Cancel sentinel ──────────────────────────────────────────────────────────

/** Unique symbol used as a "user cancelled" return value. */
const CANCEL_SYMBOL = Symbol("cancel");

/** Returns true when the value is the cancel sentinel from any prompt. */
export function isCancel(value: unknown): value is typeof CANCEL_SYMBOL {
  return value === CANCEL_SYMBOL;
}

// ─── Cursor helpers ───────────────────────────────────────────────────────────

function hideCursor(): void {
  process.stdout.write("\x1b[?25l");
}

function showCursor(): void {
  process.stdout.write("\x1b[?25h");
}

/** Move up `n` lines and clear each one. */
function clearLines(n: number): void {
  for (let i = 0; i < n; i++) {
    process.stdout.write("\x1b[1A\x1b[2K");
  }
}

/**
 * Ensures stdin is not in raw mode and is resumed.
 * Called before creating any readline interface.
 */
function restoreStdin(): void {
  if (process.stdin.isTTY && process.stdin.isRaw) {
    process.stdin.setRawMode(false);
  }
  process.stdin.resume();
}

// ─── Intro / Outro ────────────────────────────────────────────────────────────

/** Prints a styled section header. */
export function intro(message: string): void {
  const w = process.stdout.columns ?? 80;
  console.log(colors.cyan("┌" + "─".repeat(w - 2) + "┐"));
  console.log(colors.bold(colors.cyanBright("  " + message)));
}

/** Prints a styled section footer. */
export function outro(message: string, textOnly?: boolean): void | Promise<void> {
  if (textOnly) {
    console.log(colors.cyan(" "));
    console.log(`${colors.cyan(". ")}${colors.bold(message)}`);
    console.log(colors.cyan(" "));
    console.log(colors.cyan(" "));

    return
  }
  const w = process.stdout.columns ?? 80;
  console.log(colors.cyan("│"));
  console.log(`${colors.cyan("│ ")}${colors.bold(message)}`);
  console.log(colors.cyan("└" + "─".repeat(w - 2) + "┘") + "\n");
}

// ─── Log helpers ──────────────────────────────────────────────────────────────

export const log = {
  message: (msg: string): void => console.log(`${colors.dim("│")}  ${msg}`),
  step: (msg: string): void => console.log(`${colors.cyan("◆")} ${msg}`),
  success: (msg: string): void => console.log(`${colors.green("✔")} ${msg}`),
  warn: (msg: string): void => console.log(`${colors.yellow("⚠")} ${colors.yellow(msg)}`),
  error: (msg: string): void => console.log(`${colors.red("✖")} ${colors.red(msg)}`),
  info: (msg: string): void => console.log(`${colors.blue("ℹ")} ${msg}`),
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export interface Spinner {
  start(message: string): void;
  stop(message: string): void;
}

/** Returns a spinner that animates on the current line until stopped. */
export function spinner(): Spinner {
  let timer: ReturnType<typeof setInterval> | null = null;
  let frameIdx = 0;

  return {
    start(message: string) {
      hideCursor();
      frameIdx = 0;
      timer = setInterval(() => {
        const frame = colors.cyan(SPINNER_FRAMES[frameIdx % SPINNER_FRAMES.length]);
        process.stdout.write(`\r${frame} ${colors.dim(message)}`);
        frameIdx++;
      }, 80);
    },
    stop(message: string) {
      if (timer) { clearInterval(timer); timer = null; }
      process.stdout.write(`\r${colors.green("✔")} ${message}\n`);
      showCursor();
    },
  };
}

// ─── text() ───────────────────────────────────────────────────────────────────

export interface TextOptions {
  message: string;
  placeholder?: string;
  defaultValue?: string;
  initialValue?: string;
  validate?: (value: string) => string | undefined;
}

/**
 * Prompts for a single line of text.
 * Respects `defaultValue` when the user presses Enter with no input.
 * Re-prompts on validation failure.
 * Returns the entered string, or CANCEL_SYMBOL on Ctrl+C.
 */
export async function text(options: TextOptions): Promise<string | typeof CANCEL_SYMBOL> {
  const { message, defaultValue, initialValue, validate } = options;

  const hint = defaultValue ? colors.dim(` (default: ${defaultValue})`) : "";
  const prefix = `${colors.cyan("?")} ${colors.bold(message)}${hint}\n  ${colors.dim("› ")}`;

  return new Promise((resolve) => {
    // Ensure stdin is available for a new readline interface
    restoreStdin();

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const initial = initialValue ?? "";

    rl.question(prefix, (raw) => {
      rl.close();

      // Use typed value, or fall back to default, or pre-fill, or empty string
      const value = raw.trim() !== "" ? raw.trim() : (defaultValue ?? initial);

      if (validate) {
        const err = validate(value);
        if (err) {
          log.error(err);
          // Re-prompt recursively; stdin is reset by restoreStdin at the top
          text(options).then(resolve);
          return;
        }
      }

      resolve(value);
    });

    rl.on("SIGINT", () => {
      rl.close();
      console.log();
      resolve(CANCEL_SYMBOL);
    });
  });
}

// ─── select() ─────────────────────────────────────────────────────────────────

export interface SelectOption<T = string> {
  value: T;
  label?: string;
}

export interface SelectOptions<T = string> {
  message: string;
  options: SelectOption<T>[];
  maxItems?: number;
}

/**
 * Displays a full keyboard-navigable selection menu.
 * ↑ / ↓ to move, Enter to confirm, Ctrl+C to cancel.
 *
 * After resolving, stdin is fully restored to normal line mode so that
 * subsequent text() / confirm() prompts work without any extra setup.
 */
export function select<T = string>(
  options: SelectOptions<T>
): Promise<T | typeof CANCEL_SYMBOL> {
  const { message, options: items } = options;

  return new Promise((resolve) => {
    let current = 0;

    // ── Render helpers ─────────────────────────────────────────────────────
    const render = (): void => {
      for (let i = 0; i < items.length; i++) {
        const label = (items[i].label ?? String(items[i].value)).padEnd(42);
        if (i === current) {
          process.stdout.write(
            `  ${colors.cyan("›")} ${colors.bold(colors.cyanBright(label))}\n`
          );
        } else {
          process.stdout.write(`    ${colors.dim(label)}\n`);
        }
      }
    };

    const redraw = (): void => {
      clearLines(items.length);
      render();
    };

    // Print header + initial menu
    process.stdout.write(
      `\n${colors.cyan("?")} ${colors.bold(message)}\n` +
      `${colors.dim("  Use ↑ ↓ arrows, Enter to confirm, Ctrl+C to cancel")}\n\n`
    );
    render();
    hideCursor();

    // ── Non-TTY environment: just return the first item ────────────────────
    if (!process.stdin.isTTY) {
      showCursor();
      resolve(items[0]?.value as T);
      return;
    }

    // ── Keypress handler (must be declared before cleanup references it) ───
    const onKey = (_str: string | undefined, key: readline.Key | undefined): void => {
      if (!key) return;

      if (key.ctrl && key.name === "c") {
        cleanup(true);
        resolve(CANCEL_SYMBOL);
        return;
      }

      switch (key.name) {
        case "up":
        case "k":
          current = (current - 1 + items.length) % items.length;
          redraw();
          break;

        case "down":
        case "j":
          current = (current + 1) % items.length;
          redraw();
          break;

        case "return":
        case "enter": {
          const chosen = items[current];
          cleanup(false);
          process.stdout.write(
            `  ${colors.green("✔")} ${colors.bold(String(chosen.label ?? chosen.value))}\n\n`
          );
          resolve(chosen.value);
          break;
        }
      }
    };

    // ── Cleanup: exit raw mode, detach listener, leave stdin RESUMED ───────
    // Must be declared after onKey (JS hoisting doesn't apply to const).
    const cleanup = (newline: boolean): void => {
      process.stdin.off("keypress", onKey);
      if (process.stdin.isTTY && process.stdin.isRaw) {
        process.stdin.setRawMode(false);
      }
      // Intentionally NOT pausing — next text()/confirm() needs stdin ready
      showCursor();
      if (newline) process.stdout.write("\n");
    };

    // ── Enter raw mode and start listening ────────────────────────────────
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("keypress", onKey);
  });
}

// ─── confirm() ────────────────────────────────────────────────────────────────

export interface ConfirmOptions {
  message: string;
  initialValue?: boolean;
}

/**
 * Prompts for a yes/no answer.
 * Accepts: y / yes / n / no (case-insensitive).
 * Returns true/false, or CANCEL_SYMBOL on Ctrl+C.
 */
export async function confirm(options: ConfirmOptions): Promise<boolean | typeof CANCEL_SYMBOL> {
  return new Promise((resolve) => {
    restoreStdin();

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const hint = colors.dim(` (y/n)`);
    const defaultHint =
      options.initialValue !== undefined
        ? colors.dim(` [${options.initialValue ? "Y/n" : "y/N"}]`)
        : "";

    rl.question(
      `${colors.cyan("?")} ${colors.bold(options.message)}${hint}${defaultHint} `,
      (raw) => {
        rl.close();
        const answer = raw.trim().toLowerCase();
        if (answer === "y" || answer === "yes") resolve(true);
        else if (answer === "n" || answer === "no") resolve(false);
        else resolve(options.initialValue ?? false);
      }
    );

    rl.on("SIGINT", () => {
      rl.close();
      console.log();
      resolve(CANCEL_SYMBOL);
    });
  });
}

// ─── group() ──────────────────────────────────────────────────────────────────

export type GroupDefinition = Record<
  string,
  () => Promise<string | boolean | typeof CANCEL_SYMBOL | undefined>
>;

export interface GroupOptions {
  onCancel?: (ctx: { results: Partial<Record<string, unknown>> }) => void;
}

/**
 * Runs a sequential group of named prompts, collecting results into an object.
 * If any prompt is cancelled and `onCancel` is provided, the group stops.
 */
export async function group<T extends GroupDefinition>(
  prompts: T,
  opts?: GroupOptions
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const results: Record<string, unknown> = {};

  for (const [key, promptFn] of Object.entries(prompts)) {
    const value = await promptFn();

    if (isCancel(value)) {
      opts?.onCancel?.({ results });
      results[key] = undefined;
      break;
    }

    results[key] = value;
  }

  return results as { [K in keyof T]: Awaited<ReturnType<T[K]>> };
}
