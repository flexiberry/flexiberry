#!/usr/bin/env node

import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { consola } from "consola";
import { db } from "../index.js";

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
      consola.start(chalk.blue(`Selecting file: ${file}... \n`));
      const filePath = path.join(process.cwd(), file);
      if (!fs.existsSync(filePath)) {
        console.log(chalk.red(`😬 Error: File not found at ${filePath}`));
        return;
      }

      consola.box(" 🥳 File found!", chalk.blue(`Location: ${filePath}`));
      consola.info(chalk.green("✅ File selected!"));
      return;
    }

    consola.start(chalk.blue("Selecting a file... \n"));
    const files = fs.readdirSync(process.cwd());
    const projectType = await consola.prompt(
      "Files in the current directory. Pick a file",
      {
        type: "select",
        options: files.filter((x) => x.endsWith(".berry")),
        cancel: "undefined",
      }
    );

    if (!projectType) {
      consola.error("❌ No file selected");
      return;
    }
    const filePath = path.join(process.cwd(), projectType);
    db.set("selectedFile", {
      path: filePath,
      name: projectType,
      date: new Date().toISOString(),
    });
    consola.box("✔️", chalk.blue(`Location: ${filePath}`));
    consola.info(chalk.green("✅ File selected!"));
  }

  static async updateBerryCode(content: string) {
    const fileSelected = db.get("selectedFile");
    if (!fileSelected) {
      consola.error("❌ No file selected");
      return;
    }
    consola.ready(chalk.green(" File found!"));
    consola.info("Selected File Name: ", chalk.blue(` ${fileSelected.name}`));
    fs.appendFileSync(fileSelected.path, "\n\n".concat(content));
    consola.success(" File updated successfully!");

    return fileSelected;
  }
}
