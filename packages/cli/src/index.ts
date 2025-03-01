#!/usr/bin/env node

import { Command } from "commander";
import { readFile } from "fs/promises";
import { FSDB } from "file-system-db";

const packageJson = JSON.parse(
  (await readFile(new URL("../package.json", import.meta.url))).toString()
);

import { FileUtility } from "./util/FileUtility.js";
import { Cli } from "./util/Cli.js";
import { ApiUtility } from "./util/ApiUtility.js";
import { EnvUtility } from "./util/EnvUtility.js";
import { StepUtility } from "./util/StepUtility.js";
import { TaskUtility } from "./util/TaskUtility.js";
import os from "os";
import path from "path";

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
    switch (type.toLowerCase()) {
      case "api":
        if (!name) throw new Error("Name is required for API");
        if (options.curl) {
          ApiUtility.addFromCurl(name, options.curl);
        } else {
          ApiUtility.add(name, {
            url: options.url,
            method: options.method,
            headers: options.headers?.split(","),
            body: options.body,
          });
        }
        break;

      case "env":
        EnvUtility.add(name?.split(",") || []);
        break;

      case "task":
        if (!name) throw new Error("Name is required for task");
        TaskUtility.add(name);
        break;

      case "step":
        if (!name) throw new Error("Name is required for step");
        StepUtility.add(name, options);
        break;

      default:
        console.error(`Unknown type: ${type}`);
    }
  });

program.parse();
