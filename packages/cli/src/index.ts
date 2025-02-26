#!/usr/bin/env node

import { Command } from "commander";
import { version } from "../package.json";
import { FileUtility } from "./_cli/FileUtility";
import { Cli } from "./_cli/Cli";

const program = new Command();
program
  .name("flexiberry")
  .description("FlexiBerry CLI - A powerful tool for testing your apis")
  .version(version);

program
  .command("cli")
  .description("Welcome to FlexiBerry CLI")
  .action(() => {
      Cli.main(version);
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
