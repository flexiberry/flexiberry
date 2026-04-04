/**
 * colors.ts
 *
 * A lightweight, zero-dependency terminal color utility.
 * Uses standard ANSI escape codes to replicate chalk's most-used API surface.
 * Supports chaining via a tagged-template / direct call interface.
 */

// ─── ANSI escape code primitives ───────────────────────────────────────────

const ESC = "\x1b[";
const RESET = `${ESC}0m`;

function ansi(open: number, close: number) {
  return (text: string): string => `${ESC}${open}m${text}${ESC}${close}m`;
}

function ansiNested(open: number, close: number) {
  return (text: string): string => `${ESC}${open}m${text}${ESC}${close}m`;
}

// ─── Foreground colors ──────────────────────────────────────────────────────

export const colors = {
  // Text styles
  bold: ansi(1, 22),
  dim: ansi(2, 22),
  italic: ansi(3, 23),
  underline: ansi(4, 24),
  strikethrough: ansi(9, 29),
  reset: (text: string): string => `${RESET}${text}${RESET}`,

  // Foreground colors
  black: ansi(30, 39),
  red: ansi(31, 39),
  green: ansi(32, 39),
  yellow: ansi(33, 39),
  blue: ansi(34, 39),
  magenta: ansi(35, 39),
  cyan: ansi(36, 39),
  white: ansi(37, 39),
  gray: ansi(90, 39),
  grey: ansi(90, 39),

  // Bright/intense foreground colors
  redBright: ansi(91, 39),
  greenBright: ansi(92, 39),
  yellowBright: ansi(93, 39),
  blueBright: ansi(94, 39),
  magentaBright: ansi(95, 39),
  cyanBright: ansi(96, 39),
  whiteBright: ansi(97, 39),

  // Background colors
  bgBlack: ansi(40, 49),
  bgRed: ansi(41, 49),
  bgGreen: ansi(42, 49),
  bgYellow: ansi(43, 49),
  bgBlue: ansi(44, 49),
  bgMagenta: ansi(45, 49),
  bgCyan: ansi(46, 49),
  bgWhite: ansi(47, 49),

  // Bright background colors
  bgBlackBright: ansi(100, 49),
  bgRedBright: ansi(101, 49),
  bgGreenBright: ansi(102, 49),
  bgYellowBright: ansi(103, 49),
  bgBlueBright: ansi(104, 49),
  bgMagentaBright: ansi(105, 49),
  bgCyanBright: ansi(106, 49),
  bgWhiteBright: ansi(107, 49),
} as const;

// ─── Compound helpers (mimics chalk chaining: e.g. chalk.bold.cyan) ────────

export const c = {
  boldCyan: (text: string) => colors.bold(colors.cyan(text)),
  boldGreen: (text: string) => colors.bold(colors.green(text)),
  boldRed: (text: string) => colors.bold(colors.red(text)),
  boldYellow: (text: string) => colors.bold(colors.yellow(text)),
  boldBlue: (text: string) => colors.bold(colors.blue(text)),
  boldMagenta: (text: string) => colors.bold(colors.magenta(text)),
  boldWhite: (text: string) => colors.bold(colors.white(text)),
  boldBlueBright: (text: string) => colors.bold(colors.blueBright(text)),
  boldCyanBright: (text: string) => colors.bold(colors.cyanBright(text)),
  boldGreenBright: (text: string) => colors.bold(colors.greenBright(text)),
} as const;
