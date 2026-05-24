/**
 * cli.ts
 *
 * Top-level interactive menu controller for `flexiberry cli`.
 * Each menu option drives a real interactive flow rather than static hints.
 */

import { printBanner } from "../lib/banner.js";
import { intro, outro, select, isCancel, log, text } from "../lib/prompts.js";
import { colors } from "../lib/colors.js";
import { FileUtility } from "./file-utility.js";
import { RunUtility } from "./run-utility.js";
import { ApiUtility } from "./api-utility.js";
import { VarUtility } from "./var-utility.js";
import { EnvUtility } from "./env-utility.js";
import { TaskUtility } from "./task-utility.js";
import { StepUtility } from "./step-utility.js";
import { RunApiUtility } from "./run-api-utility.js";

export class Cli {
  /** Entry point for `flexiberry cli` — shows the branded interactive menu. */
  public static async main(version: string): Promise<void> {
    // Show the branded ASCII banner
    printBanner(version);

    intro("FlexiBerry CLI — Interactive Mode");

    const method = await Cli.getMethod();

    if (isCancel(method) || !method) {
      outro("Operation cancelled.");
      return;
    }

    switch (method) {

      // ─── Add ───────────────────────────────────────────────────────────────
      case "Add": {
        const addType = await select({
          message: "What would you like to add?",
          options: [
            { value: "api", label: "🌐  API definition" },
            { value: "var", label: "📦  Variable block" },
            { value: "env", label: "🌍  Environment" },
            { value: "task", label: "📋  Task" },
            { value: "step", label: "🎯  Step" },
            { value: "cancel", label: "✖   Cancel" },
          ],
        });

        if (isCancel(addType) || addType === "cancel") {
          log.warn("Cancelled.");
          break;
        }

        if (addType === "api") {
          await ApiUtility.add("", {});
        } else if (addType === "var") {
          await VarUtility.add("", {});
        } else if (addType === "env") {
          await EnvUtility.add("", {});
        } else if (addType === "task") {
          await TaskUtility.add("", {});
        } else if (addType === "step") {
          await StepUtility.add("", {});
        }
        break;
      }

      // ─── Create ────────────────────────────────────────────────────────────
      case "Create": {
        const filename = await text({
          message: "Enter the name for your new .berry file:",
          placeholder: "my-tests",
          defaultValue: "my-tests",
          validate: (v) =>
            v.trim().length === 0 ? "A filename is required!" : undefined,
        });

        if (isCancel(filename)) {
          log.warn("Cancelled.");
          break;
        }

        log.step(`Creating ${colors.cyan(filename + ".berry")}…`);
        FileUtility.create(filename);
        break;
      }

      // ─── Run ───────────────────────────────────────────────────────────────
      case "Run": {
        await RunUtility.run("");   // "" → will scan CWD for .berry files
        break;
      }
 
      // ─── Run API Alone ─────────────────────────────────────────────────────
      case "RunApi": {
        await RunApiUtility.runApi("");
        break;
      }

      // ─── Select ────────────────────────────────────────────────────────────
      case "Select": {
        const folder = await askForFolderPath();
        if (!folder) {
          outro("Operation cancelled.");
          return;
        }
        await FileUtility.select(folder);
        break;
      }

      // ─── View ──────────────────────────────────────────────────────────────
      case "View": {
        await Cli.view();
        break;
      }
    }

    outro("Thanks for using FlexiBerry CLI! 🍓", true);
    process.exit(0);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  /** Opens the currently pre-selected .berry file in the default editor. */
  static async view(): Promise<void> {
    const preSelectedFile = FileUtility.getPreselectedFile();
    if (!preSelectedFile) {
      log.warn("No file selected. Use the Select option first.");
      return;
    }
    log.message(`📂 Selected file: ${colors.cyan(preSelectedFile)}`);
    log.message("Opening file in editor…");
    FileUtility.openEditor(preSelectedFile);
  }

  /** Presents the top-level action menu and returns the chosen value. */
  static async getMethod(): Promise<string | symbol | undefined> {
    return select({
      message: "Please choose an option",
      options: [
        { value: "Add", label: "➕  Add components to .berry file" },
        { value: "Create", label: "📝  Create new .berry file" },
        { value: "Run", label: "🚀  Run .berry file" },
        { value: "RunApi", label: "🌐  Run API alone" },
        { value: "Select", label: "📁  Select .berry file from folder" },
        { value: "View", label: "👁   View selected .berry file" },
      ],
    });
  }
}

/**
 * Asks for a folder path. Defaults to "." (current directory).
 */
export async function askForFolderPath(): Promise<string | undefined> {
  const folder = await text({
    message: 'Specify the folder to use (use "." for current folder):',
    placeholder: "./../sample",
    defaultValue: ".",
    validate: (value) => {
      if (value.trim().length === 0) return "A folder path is required!";
    },
  });

  if (isCancel(folder)) return undefined;
  return typeof folder === "string" && folder.trim() === "" ? "." : folder;
}
