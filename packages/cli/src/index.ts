import { Main } from "./_cli/main";
import { Lexer } from "@flexiberry/berrycore";

console.log("FlexiBerry CLI v0.0.1");

export const name = "FlexiBerry";

console.log("Version: " + "0.0.1");

console.log("Hello, World!");

console.error("Error: " + "This is an error message");

Main.main();

const lexer = new Lexer("Hello, World!");
console.log(lexer.tokenize());
