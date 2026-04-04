/**
 * run-utility.ts
 *
 * Handles `flexiberry run` and `flexiberry test` commands.
 * Uses the actual berrycore Interpreter API: LexerEngine → AstEngine → Interpreter.
 * Uses native lib/prompts and lib/colors instead of @clack/prompts + chalk.
 */

import { intro, outro, log, select, confirm, isCancel } from "../lib/prompts.js";
import { colors } from "../lib/colors.js";
import * as fs from "fs";
import * as path from "path";
import { FileUtility } from "./file-utility.js";
import {
  AstEngine,
  Interpreter,
  LexerEngine,
  CliAdapter,
  InterpreterEvent,
  type CompletedPayload,
} from "@flexiberry/berrycore";
import { UI } from "../ui/ui.js";

export class RunUtility {
  /**
   * `flexiberry test` — tokenises and prints the AST (does not execute).
   */
  static async test(file: string): Promise<void> {
    if (file) {
      const filePath = path.join(process.cwd(), file);
      if (!fs.existsSync(filePath)) {
        log.error(`❌ File not found: ${colors.blue(filePath)}`);
        return;
      }
      log.message(`📄 File detected: ${colors.blue(filePath)}`);
      log.success(colors.green("✔ File successfully selected!"));
      this.testingNewLexer(filePath);
      return;
    }

    const fileSelected = await this.selectFromCurrentFolder();
    if (fileSelected) {
      this.testingNewLexer(fileSelected);
      return;
    }

    // Fallback — use the pre-selected file
    const proceed = await confirm({
      message: `Proceed with pre-selected file? (${colors.blue(FileUtility.getPreselectedFileName() ?? "none")})`,
    });

    if (isCancel(proceed) || !proceed) {
      log.step("⚠️  Operation skipped.");
      return;
    }

    const preSelectedFile = FileUtility.getPreselectedFile();
    if (!preSelectedFile) return;

    log.step(`🔄 Preparing to test: ${colors.blue(preSelectedFile)}`);
    outro("Test engine ready");
    this.testingNewLexer(preSelectedFile);
  }

  /**
   * `flexiberry run` — runs a .berry script through the full execution engine.
   */
  static async run(file: string): Promise<void> {
    intro(`🏎️  Starting FlexiBerry Execution`);

    if (file) {
      const filePath = path.join(process.cwd(), file);
      if (!fs.existsSync(filePath)) {
        log.error(`❌ File not found: ${colors.blue(filePath)}`);
        return;
      }
      log.message(`📄 File detected: ${colors.blue(filePath)}`);
      log.success(colors.green("✔ File successfully selected!"));
      outro("Execution Starting...");
      await RunUtility.berryExecutor(filePath);
      return;
    }

    const fileSelected = await this.selectFromCurrentFolder();
    if (fileSelected) {
      log.step(`🔄 Preparing to execute: ${colors.blue(fileSelected)}`);
      outro("Execution Starting...");
      await RunUtility.berryExecutor(fileSelected);
      return;
    }

    // Fallback — use the pre-selected file
    const proceed = await confirm({
      message: `Proceed with pre-selected file? (${colors.blue(FileUtility.getPreselectedFileName() ?? "none")})`,
    });

    if (isCancel(proceed) || !proceed) {
      log.step("⚠️  Operation skipped.");
      return;
    }

    const preSelectedFile = FileUtility.getPreselectedFile();
    if (!preSelectedFile) return;

    log.step(`🔄 Preparing to execute: ${colors.blue(preSelectedFile)}`);
    outro("Execution Starting...");
    await RunUtility.berryExecutor(preSelectedFile);
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /** Tokenises and builds the AST, prints it (test / debug mode). */
  private static testingNewLexer(filePath: string): void {
    const source = fs.readFileSync(filePath, "utf8");
    console.time("Tokenize");
    const tokens = new LexerEngine(source).tokenize();
    const ast = new AstEngine(tokens).build();
    console.log(ast);
    console.timeEnd("Tokenize");
  }

  /**
   * Wires the complete pipeline: LexerEngine → AstEngine → Interpreter.
   * Hooks the Completed event so the UI can show the final summary.
   */
  private static async berryExecutor(filePath: string): Promise<void> {
    const source = fs.readFileSync(filePath, "utf8");

    // Tokenise + parse into an AST
    const tokens = new LexerEngine(source).tokenize();
    const ast = new AstEngine(tokens).build();

    const ui = new UI();
    ui.printJobDetails(
      FileUtility.getPreselectedFileName() ?? path.basename(filePath),
      "Local"
    );

    const adapter = new CliAdapter({ enableLogging: true });
    const interpreter = new Interpreter(ast);
    interpreter.setIOAdapter(adapter);

    interpreter.on(InterpreterEvent.Completed, (_payload: CompletedPayload) => {
      adapter.dispose();
      ui.exit();
    });

    await interpreter.execute();
  }

  /**
   * Scans the current working directory for .berry files and lets the user
   * pick one interactively. Returns undefined if none found or none chosen.
   */
  static async selectFromCurrentFolder(): Promise<string | undefined> {
    log.step(colors.blue("🔍 Scanning for available .berry files..."));
    const files = fs.readdirSync(process.cwd());
    const berryFiles = files
      .filter((x) => x.endsWith(".berry"))
      .map((x) => ({ value: x, label: `📄  ${x}` }));

    if (berryFiles.length === 0) {
      log.error("❌ No .berry files found in the current directory.");
      return undefined;
    }

    const chosen = await select({
      message: "Select a .berry file to execute:",
      options: berryFiles,
    });

    if (isCancel(chosen) || !chosen) {
      log.error("❌ No file was selected.");
      return undefined;
    }

    log.message(`📂 Selected: ${colors.blue(chosen.toString())}`);
    return chosen.toString();
  }
}
