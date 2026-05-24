import * as fs from "fs";
import * as path from "path";
import {
  BerryCore,
  LexerEngine,
  AstEngine,
  NodeType,
  type ApiBlockNode,
  InterpreterEvent,
} from "@flexiberry/berrycore";
import { FileUtility } from "./file-utility.js";
import { RunUtility } from "./run-utility.js";
import { select, isCancel, log, outro, intro } from "../lib/prompts.js";
import { colors } from "../lib/colors.js";
import { BerryTableAdapter } from "../adapter/berry-table-adapter.js";
import { BerryApiAdapter } from "../adapter/berry-api-adapter.js";

export class RunApiUtility {
  /**
   * Run a specific API block from a .berry file, or let the user choose interactively.
   */
  static async runApi(file: string, apiName?: string | boolean): Promise<void> {
    let filePath = file;

    // ── Resolve File ────────────────────────────────────────────────────────
    if (!filePath) {
      const preSelectedFile = FileUtility.getPreselectedFile();
      if (preSelectedFile && fs.existsSync(preSelectedFile)) {
        filePath = preSelectedFile;
      } else {
        const fileSelected = await RunUtility.selectFromCurrentFolder();
        if (!fileSelected) {
          log.warn("No .berry file selected.");
          return;
        }
        filePath = path.join(process.cwd(), fileSelected);
      }
    } else {
      filePath = path.resolve(process.cwd(), filePath);
      if (!fs.existsSync(filePath)) {
        log.error(`❌ File not found: ${filePath}`);
        return;
      }
    }

    const fileName = path.basename(filePath);

    // ── Parse File and Extract APIs ──────────────────────────────────────────
    let apiBlocks: ApiBlockNode[] = [];
    let source = "";
    try {
      source = fs.readFileSync(filePath, "utf8");
      const tempCore = new BerryCore(source, { basePath: path.dirname(filePath) });
      const resolvedAst = await tempCore.getResolvedAst();
      apiBlocks = resolvedAst.body.filter(
        (node): node is ApiBlockNode => node.type === NodeType.ApiBlock
      );
    } catch (e: any) {
      log.error(`Failed to parse file: ${e.message}`);
      return;
    }

    if (apiBlocks.length === 0) {
      log.error(`❌ No API blocks found in the file: ${fileName}`);
      return;
    }

    // ── Choose API ───────────────────────────────────────────────────────────
    let chosenApi = "";
    if (typeof apiName === "string" && apiName.trim().length > 0) {
      const target = apiBlocks.find(b => b.name === apiName);
      if (!target) {
        log.error(`❌ API block '#${apiName}' not found in the file.`);
        return;
      }
      chosenApi = apiName;
    } else {
      const choices = apiBlocks.map(b => ({
        value: b.name,
        label: `🌐  #${b.name}${b.title ? ` — ${b.title}` : ""}`
      }));

      const selection = await select({
        message: `Select an API from ${colors.cyan(fileName)} to execute:`,
        options: choices,
      });

      if (isCancel(selection) || !selection) {
        log.warn("Cancelled.");
        return;
      }
      chosenApi = selection;
    }

    // ── Execute API using BerryCore and CliAdapter ───────────────────────────
    intro(`Executing API Alone: #${chosenApi}`);

    const adapter = new BerryApiAdapter();
    const core = new BerryCore(source, {
      adapter,
      basePath: path.dirname(filePath)
    });

    core.on(InterpreterEvent.ApiCallBegin, ({ method, url }: any) => {
      adapter.onApiCallBegin(method, url);
    });

    core.on(InterpreterEvent.ApiCallDone, () => {
      adapter.onApiCallDone();
    });

    try {
      await core.executeApi(chosenApi);
    } catch (e: any) {
      log.error(`API execution failed: ${e.message}`);
    } finally {
      adapter.dispose();
      // outro("API Execution Completed", true);
    }
  }
}
