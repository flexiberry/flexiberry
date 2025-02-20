#!/usr/bin/env node

import { Command } from "commander";
import { version } from "../package.json";
import figlet from "figlet";

import chalkAnimation from "chalk-animation";

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

const text =
  "\n\n" +
  figlet.textSync("FlexiBerry", {
    horizontalLayout: "full",
    whitespaceBreak: true,
    font: "Big Money-sw",
    showHardBlanks: true,
  });
const rainbow = chalkAnimation.rainbow(text);
rainbow.render(); // Animation starts
console.log("Version: " + version);
console.log("Welcome to FlexiBerry CLI! \n\n");

setTimeout(() => {
  rainbow.stop(); // Stop the animation after a delay
  program.parse();
}, 500);
