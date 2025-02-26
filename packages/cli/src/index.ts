#!/usr/bin/env node

import { Command } from "commander";
import { version } from "../package.json";
import figlet from "figlet";

import chalkAnimation from "chalk-animation";
import chalk from "chalk";
import { FileUtility } from "./_cli/FileUtility";

const program = new Command();
program
  .name("flexiberry")
  .description("FlexiBerry CLI - A powerful tool for testing your apis")
  .version(version);

program
  .command("cli")
  .description("Welcome to FlexiBerry CLI")
  .action(() => {
    console.log("Welcome to FlexiBerry CLI!");
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

const text =
  "\n\n" +
  figlet.textSync("FlexiBerry", {
    horizontalLayout: "universal smushing",
    whitespaceBreak: true,
    font: "Big Money-sw",
    showHardBlanks: true,
  });
const rainbow = chalkAnimation.rainbow(text);
rainbow.render(); // Animation starts
console.log(chalk.gray("Version: ") + chalk.green(version));
console.log("Welcome to", chalk.bgBlue(" FlexiBerry CLI! "));
console.log("\n");
setTimeout(() => {
  rainbow.stop(); // Stop the animation after a delay
  program.parse();
}, 500);
