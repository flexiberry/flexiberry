/**
 * Quick test: Tokenize → Parse → Format back to Berry source
 *
 * Run from berrycore root:
 *   ts-node tests/test-formatter.ts
 */

import * as fs from "fs";
import * as path from "path";
import { LexerEngine } from "../src/parser/tokenizer/reader/lexer.engine";
import { AstEngine } from "../src/parser/ast/ast.engine";
import { BerryFormatter } from "../src/parser/formatter/formatter";

const filePath = path.resolve(__dirname, "../../../sample/demo-march.berry");
const source = fs.readFileSync(filePath, "utf-8");

// Step 1: Tokenize
console.log("═══ Step 1: Tokenizing ═══");
const lexer = new LexerEngine(source);
const tokens = lexer.tokenize();
console.log(`✅ ${tokens.length} tokens\n`);

// Step 2: Parse
console.log("═══ Step 2: Parsing ═══");
const parser = new AstEngine(tokens);
const ast = parser.build();
console.log(`✅ ${ast.body.length} AST nodes\n`);

// Step 3: Format
console.log("═══ Step 3: Formatting back to Berry ═══\n");
const formatter = new BerryFormatter({ indentSize: 8 });
const formatted = formatter.format(ast);

console.log("── Formatted Output ──");
console.log(formatted);

// Save formatted output
const outputPath = path.resolve(__dirname, "./outputs/formatted-output.berry");
fs.writeFileSync(outputPath, formatted);
console.log(`\n📄 Formatted Berry code saved to ${outputPath}`);

// Compare line counts
const originalLines = source.split("\n").filter((l: string) => l.trim().length > 0).length;
const formattedLines = formatted.split("\n").filter((l: string) => l.trim().length > 0).length;
console.log(`\n── Comparison ──`);
console.log(`  Original non-blank lines:  ${originalLines}`);
console.log(`  Formatted non-blank lines: ${formattedLines}`);
