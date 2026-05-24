#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync } from "fs";

// Resolve package metadata
const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf-8")
);

import { FileUtility } from "./util/file-utility.js";
import { Cli } from "./util/Cli.js";
import { FileDB } from "./lib/db.js";

import os from "os";
import path from "path";
import { AddCommand } from "./command/add-command.js";
import { RunUtility } from "./util/run-utility.js";
import { RunApiUtility } from "./util/run-api-utility.js";

// ─── Persistent store ─────────────────────────────────────────────────────────
// Stores CLI state (e.g. the currently selected .berry file) in the user's
// Documents folder so it persists across sessions.

const systemDocumentFolder = path.join(os.homedir(), "Documents");

export const db = new FileDB(
  path.join(systemDocumentFolder, "flexiberry", "data.json"),
  true
);

// ─── CLI program ──────────────────────────────────────────────────────────────

const program = new Command();
program
  .name("flexiberry")
  .description("FlexiBerry CLI - A powerful tool for testing your APIs")
  .version(packageJson.version);

// ── flexiberry cli ────────────────────────────────────────────────────────────
program
  .command("cli")
  .description("Launch the interactive FlexiBerry CLI menu")
  .action(() => {
    Cli.main(packageJson.version);
  });

// ── flexiberry create <file> [template] ───────────────────────────────────────
program
  .command("create")
  .argument("<file>", "File name to create")
  .argument("[template]", "Template to use")
  .option("-f, --force", "Overwrite existing file")
  .option("-s, --secret", "Create a secret file for storing sensitive data")
  .addHelpText("after", "\nExample: flexiberry create newfile.berry")
  .description("Create a new .berry file with optional template")
  .action((file: string, template: string | undefined, options: { force?: boolean; secret?: boolean }) => {
    FileUtility.create(file, template, options.force, options.secret);
  });

// ── flexiberry select [file] ──────────────────────────────────────────────────
program
  .command("select")
  .argument("[file]", "File name or directory path to select from")
  .description("Select a *.berry file from the current directory")
  .action(async (file: string | undefined) => {
    await FileUtility.select(file);
  });

// ── flexiberry add <type> [name] ──────────────────────────────────────────────
let multiline = "";

program
  .command("add")
  .argument("<type>", "Type of item to add (api, env, task, step, var)")
  .argument("[name]", "Name of the item")
  .option("-c, --curl <curl...>", "Import from cURL command", (value) => {
    multiline += value;
    return value;
  })
  .option("-s, --swagger <url>", "Import from Swagger / OpenAPI URL")
  .option("-p, --postman <filePath>", "Import from Postman collection")
  .option("-u, --url <url>", "API URL")
  .option("-m, --method <method>", "HTTP method (GET, POST, PUT, PATCH, DELETE)")
  .option("-h, --headers <headers>", "Request headers (comma-separated key:value pairs)")
  .option("-b, --body <body>", "Request body")
  .option("-e, --env <env>", "Environment name")
  .option("-v, --var <var>", "Variables (comma-separated key:value pairs)")
  .description("Add a new configuration item to the selected .berry file")
  .action((type: string, name: string, options: Record<string, unknown>) => {
    if (options["curl"]) options["curl"] = multiline;
    AddCommand.run(type, name, options as Parameters<typeof AddCommand.run>[2]);
    multiline = "";
  });

// ── flexiberry run [file] ─────────────────────────────────────────────────────
program
  .command("run")
  .argument("[file]", "Path to the .berry script file")
  .option("--iter <type>", "Iteration type: 'all' or 'custom'")
  .option("--start <index>", "Start index for custom iterations (1-based)")
  .option("--end <index>", "End index for custom iterations")
  .option("--api [name]", "Select and run a specific API directly")
  .description("Run a .berry script file")
  .action((file: string | undefined, options: any) => {
    if (options.api !== undefined) {
      RunApiUtility.runApi(file ?? "", options.api);
    } else {
      RunUtility.run(file ?? "", options);
    }
  });

// ── flexiberry test [file] ────────────────────────────────────────────────────
program
  .command("test")
  .argument("[file]", "Path to the .berry script file")
  .description("Run the test engine on a .berry script")
  .action((file: string | undefined) => {
    RunUtility.test(file ?? "");
  });

program.parse();
