import figlet from "figlet";
import packageFile from "../package.json";

// Adjust the path as necessary
// console.log(figlet.textSync("FlexiBerry"));
// console.log("Version: " + packageFile.version);

import { Lexer } from "./lang/tokenizer/lexer";
// initialize the application

// const program = new Command();
// program
//   .version(packageFile.version)
//   .description("CLI to process JSON input")
//   .option("-i, --input", "Input file string")
//   .action(handleInput);

// program.parse(process.argv);

export { Lexer };
