#!/usr/bin/env node

import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { db } from "../index.js";
import { intro, log, note, outro, select, spinner } from "@clack/prompts";

export class FileUtility {
  static create(
    file: string,
    template?: string,
    force?: boolean,
    secret?: any
  ) {
    intro(chalk.blue("Creating new file..."));
    let fileExt = ".berry";
    if (secret) {
      log.warn(chalk.yellow("Creating secret file..."));
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
          log.error(
            chalk.red("File already exists. Use -f or --force to overwrite.")
          );
          return;
        }
        log.warn(chalk.yellow("Overwriting existing file..."));
        fs.unlinkSync(filePath);
      }

      fs.writeFileSync(filePath, template || "");

      log.success(chalk.green("File created successfully ✨"));
      log.info(chalk.blue(`Location: ${filePath}`));

      if (template) {
        log.info(chalk.gray(`Template: ${template}`));
      }
      outro("Done");
    } catch (error) {
      log.error(
        chalk.red("\nError creating file:") +
          (error instanceof Error ? error.message : "Unknown error")
      );
      outro(chalk.red("Error"));
    }
  }

  static async select(file?: string) {
    if (!!file) {
      intro(chalk.blue(`Selecting file: ${file}...`));
      const filePath = path.join(process.cwd(), file);
      if (!fs.existsSync(filePath)) {
        log.error(chalk.red(`File not found at ${filePath}`));
        return;
      }
      note(chalk.blue(`File found at: ${filePath}`));
      log.success(chalk.green("File selected successfully"));
      outro(chalk.green("File selected successfully"));
      return;
    }

    log.step(chalk.blue("Selecting file..."));
    const files = fs.readdirSync(process.cwd());
    const berryFiles = files
      .filter((x) => x.endsWith(".berry"))
      .map((x) => {
        return { value: x, label: x };
      });
    if (berryFiles.length <= 0) {
      log.error(chalk.red("No .berry files found in current directory"));
      return;
    }

    const projectType = await select({
      message: "Files in the current directory. Pick a file",
      maxItems: 10,
      options: berryFiles,
    });

    if (!projectType) {
      log.error(chalk.red("No file selected"));
      return;
    }
    const filePath = path.join(process.cwd(), projectType.toString());
    db.set("selectedFile", {
      path: filePath,
      name: projectType,
      date: new Date().toISOString(),
    });
    log.message(chalk.blue(`Location: ${filePath}`));
    log.success(chalk.green("File selected successfully"));
  }

  static getPreselectedFile() {
    const fileSelected = db.get("selectedFile");
    if (!fileSelected || !fs.existsSync(fileSelected.path)) {
      log.error(chalk.red("No file selected or file does not exist"));
      return;
    }
    return fileSelected.path;
  }

  static updateBerryCode(content: string) {
    const fileSelected = db.get("selectedFile");

    if (!fileSelected || !fs.existsSync(fileSelected.path)) {
      log.error(chalk.red("No file selected or file does not exist"));
      return "Error";
    }

    log.step(chalk.green("File found"));
    log.info(chalk.blue(`Selected file: ${fileSelected.name}`));

    fs.appendFileSync(fileSelected.path, "\n\n".concat(content));
    log.success(chalk.green("File updated successfully"));

    return "Success";
  }
}
