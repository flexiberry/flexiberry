#!/usr/bin/env node

import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";

export class FileUtility {
  static create(file: string, template?: string, force?: boolean) {
    console.log(chalk.blue("Creating a new file... \n"));
    // Validate file extension and create file path
    const filePath = path.join(
      process.cwd(),
      file.endsWith(".berry") ? file : `${file}.berry`
    );

    try {
      // Check if file exists and handle accordingly
      if (fs.existsSync(filePath)) {
        if (!force) {
          console.log(
            chalk.red(
              "\nError: File already exists. Use -f or --force to overwrite"
            )
          );
          return;
        } else {
          console.log(chalk.yellow("\nOverwriting existing file..."));
          fs.unlinkSync(filePath);
        }
      }

      // Create the file
      fs.writeFileSync(filePath, template || "");

      console.log(chalk.green("\nFile created successfully! ✨"));
      console.log(chalk.blue(`\nLocation: ${filePath}`));

      if (template) {
        console.log(chalk.gray(`Template: ${template}`));
      }
    } catch (error) {
      console.error(
        chalk.red("\nError creating file:"),
        error instanceof Error ? error.message : "Unknown error"
      );
      process.exit(1);
    }

    console.log("\n");
  }
}
