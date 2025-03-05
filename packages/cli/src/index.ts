#!/usr/bin/env node

import { Command } from "commander";
import { readFile } from "fs/promises";
import { FSDB } from "file-system-db";

const packageJson = JSON.parse(
  (await readFile(new URL("../package.json", import.meta.url))).toString()
);

import { FileUtility } from "./util/FileUtility.js";
import { Cli } from "./util/Cli.js";

import os from "os";
import path from "path";
import { log } from "@clack/prompts";
import { AddCommand } from "./command/AddCommand.js";
import { RunUtility } from "./util/RunUtility.js";

const systemDocumentFolder = path.join(os.homedir(), "Documents");

export const db = new FSDB(
  systemDocumentFolder.concat("@flexiberry/temp.json"),
  true
);
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

program
  .command("select")
  .argument("[file]", "File name to select")
  .description("Select a  *.berry file from the current directory")
  .action(async (file) => {
    await FileUtility.select(file);
  });

program
  .command("add")
  .argument("<type>", "Type of item to add (api, env, task, step)")
  .argument("[name]", "Name of the item")
  .option("-c, --curl <curl>", "Import from cURL command")
  .option("-u, --url <url>", "API URL")
  .option("-m, --method <method>", "HTTP method")
  .option("-h, --headers <headers>", "Request headers (comma-separated)")
  .option("-b, --body <body>", "Request body")
  .description("Add a new configuration item")
  .action((type, name, options) => {
    AddCommand.run(type, name, options);
  });
program
  .command("run")
  .argument("[file]", "Enter the File name ")
  .description("run .berry script")
  .action((file, options) => {
    RunUtility.run(file);
  });

program.parse();
