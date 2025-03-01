#!/usr/bin/env node

import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { consola } from "consola";
import { db } from "../index.js";
import { intro, log, note, outro, select, spinner } from "@clack/prompts";

export class FileUtility {
  static create(file: string, template?: string, force?: boolean) {
    consola.info(chalk.blue("Creating a new file... \n"));
    const filePath = path.join(
      process.cwd(),
      file.endsWith(".berry") ? file : `${file}.berry`
    );
    try {
      if (fs.existsSync(filePath)) {
        if (!force) {
          consola.error(
            chalk.red(
              "\nError: File already exists. Use -f or --force to overwrite"
            )
          );
          return;
        } else {
          consola.warn(chalk.yellow("\nOverwriting existing file..."));
          fs.unlinkSync(filePath);
        }
      }
      fs.writeFileSync(filePath, template || "");

      consola.box(
        chalk.green("\nFile created successfully! ✨"),
        chalk.blue(`\nLocation: ${filePath}`)
      );

      if (template) {
        consola.log(chalk.gray(`Template: ${template}`));
      }
    } catch (error) {
      consola.error(
        chalk.red("\nError creating file:"),
        error instanceof Error ? error.message : "Unknown error"
      );
      process.exit(1);
    }
  }

  static async select(file?: string) {
    if (!!file) {
      intro(chalk.blue(`Selecting file: ${file}... \n`));
      const filePath = path.join(process.cwd(), file);
      if (!fs.existsSync(filePath)) {
        console.log(chalk.red(`😬 Error: File not found at ${filePath}`));
        return;
      }
      note(" 🥳 File found!" + chalk.blue(`Location: ${filePath}`));
      log.success(chalk.green("✅ File selected!"));
      outro(chalk.green("✅ File selected!"));
      return;
    }

    log.step(chalk.blue("Selecting a file... \n"));
    const files = fs.readdirSync(process.cwd());
    const berryFiles = files
      .filter((x) => x.endsWith(".berry"))
      .map((x) => {
        return { value: x, label: x };
      });
    if (berryFiles.length <= 0) {
      log.error("❌ .berry files are not found in this folder \n");
      return;
    }

    const projectType = await select({
      message: "Files in the current directory. Pick a file",
      maxItems: 10,
      options: berryFiles,
    });

    if (!projectType) {
      log.error("❌ No file selected");
      return;
    }
    const filePath = path.join(process.cwd(), projectType.toString());
    db.set("selectedFile", {
      path: filePath,
      name: projectType,
      date: new Date().toISOString(),
    });
    log.message(chalk.blue(`Location: ${filePath}`));
    log.success(chalk.green("✅ File selected!"));
  }

  static updateBerryCode(content: string) {
    const fileSelected = db.get("selectedFile");

    if (!fileSelected || !fs.existsSync(fileSelected.path)) {
      log.error("❌ No file selected or file does not exist");
      return "Error";
    }

    log.message(chalk.green(" File found!"));
    log.info("Selected File Name: " + chalk.blue(` ${fileSelected.name}`));

    fs.appendFileSync(fileSelected.path, "\n\n".concat(content));
    log.success(" File updated successfully!");

    return "Success";
  }
}
