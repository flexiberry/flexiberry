/**
 * banner.ts
 *
 * Pre-rendered ASCII art banner for FlexiBerry CLI.
 * Replaces the figlet dependency with a zero-cost static string.
 *
 * Generated in the style of block-letter ASCII art.
 */

import { colors } from "./colors.js";

/** The pre-rendered multi-line ASCII art for "Flexiberry". */
const FLEXIBERRY_ASCII = `
███████╗██╗     ███████╗██╗  ██╗██╗██████╗ ███████╗██████╗ ██████╗ ██╗   ██╗
██╔════╝██║     ██╔════╝╚██╗██╔╝██║██╔══██╗██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝
█████╗  ██║     █████╗   ╚███╔╝ ██║██████╔╝█████╗  ██████╔╝██████╔╝ ╚████╔╝ 
██╔══╝  ██║     ██╔══╝   ██╔██╗ ██║██╔══██╗██╔══╝  ██╔══██╗██╔══██╗  ╚██╔╝  
██║     ███████╗███████╗██╔╝ ██╗██║██████╔╝███████╗██║  ██║██║  ██║   ██║   
╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝  
`;

/**
 * Prints the FlexiBerry branded banner to stdout.
 * @param version - The CLI package version to display below the banner.
 */
export function printBanner(version: string): void {
  const terminalWidth = process.stdout.columns ?? 80;
  const separator = colors.dim("─".repeat(terminalWidth));

  // Render the ASCII art in green
  console.log(colors.green(FLEXIBERRY_ASCII));

  // Subtitle and version row
  console.log(
    `  ${colors.bold("Welcome to")} ${colors.bgGreen(colors.bold(" FlexiBerry CLI "))}  ` +
    `${colors.gray("v" + version)}`
  );
  console.log(`  ${colors.dim("The professional API testing scripting tool.")}`);
  console.log(`\n${separator}\n`);
}
