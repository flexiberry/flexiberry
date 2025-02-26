#!/usr/bin/env node

import { Command } from "commander";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  (await readFile(new URL("../package.json", import.meta.url))).toString()
);

import { FileUtility } from "./_cli/FileUtility.js";
import { Cli } from "./_cli/Cli.js";

const program = new Command();
program
  .name("flexiberry")
  .description("FlexiBerry CLI - A powerful tool for testing your apis")
  .version(packageJson.version);

program
  .command("cli")
  .description("Welcome to FlexiBerry CLI")
  .action(() => {
    Cli.main(packageJson.version);
  });

program
  .command("create")
  .argument("<file>", "File name to create")
  .argument("[template]", "Template to use")
  .option("-f, --force", "Overwrite existing file")
  .addHelpText("after", "\nExample call: flexiberry create newfile.berry")
  .description("Create a new .berry file with specified template")
  .action((file, template, options) => {
    FileUtility.create(file, template, options.force);
  });

program.parse();
