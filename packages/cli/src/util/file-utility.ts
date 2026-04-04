#!/usr/bin/env node

/**
 * file-utility.ts
 *
 * File management helpers for the FlexiBerry CLI.
 * Uses native lib/colors and lib/prompts instead of chalk + @clack/prompts.
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { spawn } from "child_process";
import { db } from "../index.js";
import { colors } from "../lib/colors.js";
import { intro, outro, log, select, isCancel } from "../lib/prompts.js";

// Shape of the persisted selected-file record
interface SelectedFileRecord {
  path: string;
  name: string;
  date: string;
}

export class FileUtility {
  /**
   * Creates a new .berry (or .secret) file at the given path.
   */
  static create(
    file: string,
    template?: string,
    force?: boolean,
    secret?: boolean
  ): void {
    intro(colors.blue("Creating new file..."));

    let fileExt = ".berry";
    if (secret) {
      log.warn("Creating secret file...");
      fileExt = ".secret";
      if (file.endsWith(".berry")) {
        file = file.replace(".berry", "");
      }
    }

    const filePath = path.join(
      process.cwd(),
      file.endsWith(".berry") ? file : `${file}${fileExt}`
    );

    try {
      const fileExists = fs.existsSync(filePath);

      if (fileExists) {
        if (!force) {
          log.error("File already exists. Use -f or --force to overwrite.");
          outro("Aborted.");
          return;
        }
        log.warn("Overwriting existing file...");
        fs.unlinkSync(filePath);
      }

      fs.writeFileSync(filePath, template ?? "");
      log.success(colors.green("File created successfully ✨"));
      log.info(colors.blue(`Location: ${filePath}`));

      if (template) {
        log.info(colors.gray(`Template applied: ${template}`));
      }

      outro("Done ✅");
    } catch (error) {
      log.error(
        "Error creating file: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      outro(colors.red("Error ❌"));
    }
  }

  /**
   * Interactively selects a .berry file from the given folder.
   * When a direct .berry path is supplied the selection is automatic.
   */
  static async select(file?: string): Promise<void> {
    let directory = process.cwd();

    // Direct file path provided — just validate and persist
    if (file && file.includes(".berry")) {
      intro(colors.blue(`Selecting file: ${file}...`));
      const filePath = path.join(directory, file);
      if (!fs.existsSync(filePath)) {
        log.error(colors.red(`File not found at ${filePath}`));
        return;
      }
      FileUtility.persistSelection(filePath, file);
      outro(colors.green("File selected ✔"));
      return;
    }

    log.step(colors.blue("Scanning for .berry files..."));

    // Determine directory to scan
    if (file) {
      const resolved = path.dirname(
        !file.endsWith("/") ? file.concat("/.") : path.join(file, ".")
      );
      directory = resolved;
    }

    const files = fs.readdirSync(directory);
    const berryFiles = files
      .filter((x) => x.endsWith(".berry"))
      .map((x) => ({ value: x, label: `📄  ${x}` }));

    if (berryFiles.length === 0) {
      log.error(colors.red("No .berry files found in current directory."));
      log.info(colors.dim("Files present:\n  " + files.join("\n  ")));
      return;
    }

    const chosen = await select({
      message: "Files in the directory — pick a .berry file:",
      options: berryFiles,
    });

    if (isCancel(chosen) || !chosen) {
      log.error("No file selected.");
      return;
    }

    const filePath = path.resolve(directory, chosen.toString());
    FileUtility.persistSelection(filePath, chosen.toString());

    const display =
      filePath.length > 50
        ? `.../${chosen.toString()}`
        : filePath;

    log.success(
      colors.green("Selected: ") +
        colors.bold(colors.blue(display))
    );
    log.success(colors.green("File selected successfully ✔"));
  }

  /**
   * Persists the selection record to the local FileDB store.
   */
  private static persistSelection(filePath: string, name: string): void {
    db.set<SelectedFileRecord>("selectedFile", {
      path: filePath,
      name,
      date: new Date().toISOString(),
    });
  }

  /**
   * Retrieves the path of the currently selected .berry file.
   * Logs an error and returns undefined if none is selected or the file is gone.
   */
  static getPreselectedFile(): string | undefined {
    const record = db.get<SelectedFileRecord>("selectedFile");
    if (!record || !fs.existsSync(record.path)) {
      log.error("No file selected or the selected file no longer exists.");
      return undefined;
    }
    return record.path;
  }

  /**
   * Retrieves the name of the currently selected .berry file.
   */
  static getPreselectedFileName(): string | undefined {
    const record = db.get<SelectedFileRecord>("selectedFile");
    if (!record || !fs.existsSync(record.path)) {
      log.error("No file selected or the selected file no longer exists.");
      return undefined;
    }
    return record.name;
  }

  /**
   * Appends generated DSL code to the currently selected .berry file.
   * Returns "Success" or "Error" as a string status sentinel.
   */
  static updateBerryCode(content: string): string {
    const record = db.get<SelectedFileRecord>("selectedFile");

    if (!record || !fs.existsSync(record.path)) {
      log.error("No file selected or the selected file no longer exists.");
      return "Error";
    }

    log.step(colors.green("File found"));
    log.info(colors.blue(`Selected file: ${record.name}`));

    fs.appendFileSync(record.path, "\n\n".concat(content));
    log.success(colors.green("File updated successfully ✔"));
    return "Success";
  }

  /**
   * Opens the given file in the user's preferred terminal editor.
   * Falls back to vim on macOS/Linux and notepad on Windows.
   */
  static openEditor(filePath: string): void {
    const platform = os.platform();
    let editor: string;

    if (process.env["EDITOR"]) {
      editor = process.env["EDITOR"];
    } else if (platform === "win32") {
      editor = "notepad";
    } else {
      editor = "vim";
    }

    const child = spawn(editor, [filePath], { stdio: "inherit" });

    child.on("exit", (code) => {
      if (code === 0) {
        log.success("File edited successfully.");
      } else {
        log.error(`Editor exited with code ${code ?? "unknown"}`);
      }
    });
  }
}
