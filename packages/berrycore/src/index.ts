#!/usr/bin/env node

// initialize the application

import { Command } from "commander";
import { handleInput } from "./core/cli/cli";
// import { handleInput } from "./core/cli/cli";

// import Parser from "./lang/ast/AstParser.js";
// import { Lexer } from "./lang/tokenizer/lexer.js";

console.log("FlexiBerry CLI v0.0.1");

const program = new Command();
program
  .version("0.0.1")
  .description("CLI to process JSON input")
  .option("-i, --input", "Input file string")
  .action(handleInput);

program.parse(process.argv);

// export { Lexer, Parser };
