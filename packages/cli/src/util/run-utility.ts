/**
 * run-utility.ts
 *
 * Handles `flexiberry run` and `flexiberry test` commands.
 *
 * - `test`  → uses LexerEngine + AstEngine directly to print the AST (debug mode)
 * - `run`   → delegates to BerryCore facade with the live BerryTableAdapter
 */

import { intro, outro, log, select, confirm, isCancel } from "../lib/prompts.js";
import { colors } from "../lib/colors.js";
import * as fs from "fs";
import * as path from "path";
import { FileUtility } from "./file-utility.js";
import {
  BerryCore,
  LexerEngine,
  AstEngine,
  InterpreterEvent,
  ExecutionStatus,
} from "@flexiberry/berrycore";
import { BerryTableAdapter } from "../adapter/berry-table-adapter.js";

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
      RunUtility.testingNewLexer(filePath);
      return;
    }

    const fileSelected = await RunUtility.selectFromCurrentFolder();
    if (fileSelected) {
      RunUtility.testingNewLexer(fileSelected);
      return;
    }

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
    RunUtility.testingNewLexer(preSelectedFile);
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

    const fileSelected = await RunUtility.selectFromCurrentFolder();
    if (fileSelected) {
      log.step(`🔄 Preparing to execute: ${colors.blue(fileSelected)}`);
      outro("Execution Starting...");
      await RunUtility.berryExecutor(fileSelected);
      return;
    }

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

  // ─── Private helpers ───────────────────────────────────────────────────────

  /** Debug mode: tokenise + build AST and dump to stdout — no execution. */
  private static testingNewLexer(filePath: string): void {
    const source = fs.readFileSync(filePath, "utf8");
    console.time("Tokenize");
    const tokens = new LexerEngine(source).tokenize();
    const ast = new AstEngine(tokens).build();
    console.log(ast);
    console.timeEnd("Tokenize");
  }

  /**
   * Full execution via BerryCore + BerryTableAdapter (live table UI).
   *
   * Pipeline:
   *   source → BerryCore({ adapter: BerryTableAdapter }) → run()
   *
   * Every interpreter lifecycle event is forwarded to the adapter's update
   * methods so the table re-renders in place after each state change.
   * On Completed the results are handed to the legacy UI for the final
   * summary panel.
   */
  private static async berryExecutor(filePath: string): Promise<void> {
    const source   = fs.readFileSync(filePath, "utf8");
    const fileName = FileUtility.getPreselectedFileName() ?? path.basename(filePath);

    // Static job header (printed once, before the live table)
    BerryTableAdapter.printJobDetails(fileName, "Local");

    // Live table adapter — handles rendering + keyboard interrupt
    const adapter = new BerryTableAdapter();

    // BerryCore: tokenise → parse → execute
    const core = new BerryCore(source, { adapter });

    // Track current task index (used for ApiCall events that lack it)
    let currentTaskIdx = -1;

    // ── Task lifecycle ─────────────────────────────────────────────────────
    core.on(InterpreterEvent.Start, (payload: any) => {
      adapter.initPlan(payload.plan);
    });

    core.on(InterpreterEvent.TaskBegin, ({ index }: any) => {
      currentTaskIdx = index;
      adapter.onTaskBegin(index);
    });

    core.on(InterpreterEvent.TaskDone, (result: any) => {
      const s = RunUtility.mapStatus(result.status);
      adapter.onTaskDone(currentTaskIdx, s);
    });

    // ── Step lifecycle ─────────────────────────────────────────────────────
    core.on(InterpreterEvent.StepBegin, ({ index, taskIndex }: any) => {
      adapter.onStepBegin(taskIndex, index);
    });

    core.on(InterpreterEvent.StepDone, (result: any) => {
      const { taskIndex, index } = result;
      adapter.onStepDone(taskIndex, index, RunUtility.mapStatus(result.status), result.error ?? undefined);
    });

    // ── API call details ───────────────────────────────────────────────────
    // Current design limitation: API events don't carry step indices inherently because
    // they are triggered deeper within. As a fallback, we can use the latest running step index
    // if we needed to track it exactly, or we can just rely on the step count - 1 if we only allow 
    // sequential execution. Actually, since execution is sequential, we can just track `currentStepIdx`.
    let currentStepIdx = -1;
    
    core.on(InterpreterEvent.StepBegin, ({ index }: any) => {
      currentStepIdx = index;
    });

    core.on(InterpreterEvent.ApiCallBegin, ({ method, url }: any) => {
      adapter.onApiCallBegin(currentTaskIdx, currentStepIdx, method, url);
    });

    core.on(InterpreterEvent.ApiCallDone, ({ status, duration }: any) => {
      adapter.onApiCallDone(currentTaskIdx, currentStepIdx, status, duration);
    });

    // ── Completed ─────────────────────────────────────────────────────────
    core.on(InterpreterEvent.Completed, () => {
      adapter.setCompleted();
      adapter.dispose();
      adapter.printFinalSummary();
      process.exit(0);
    });

    await core.run();
  }

  /** Map ExecutionStatus enum → the string union used by BerryTableAdapter. */
  private static mapStatus(
    s: ExecutionStatus
  ): "PASS" | "FAILED" | "SKIPPED" | "STOPPED" | "PENDING" {
    switch (s) {
      case ExecutionStatus.Pass:    return "PASS";
      case ExecutionStatus.Failed:  return "FAILED";
      case ExecutionStatus.Skipped: return "SKIPPED";
      case ExecutionStatus.Stopped: return "STOPPED";
      case ExecutionStatus.Killed:  return "STOPPED";
      default:                      return "PENDING";
    }
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
