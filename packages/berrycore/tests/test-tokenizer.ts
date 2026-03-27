/**
 * Quick test: Tokenize demo-march.berry → Print all tokens
 *
 * Run from berrycore root:
 *   ts-node tests/test-tokenizer.ts
 */

import * as fs from "fs";
import * as path from "path";
import { LexerEngine } from "../src/parser/tokenizer/reader/lexer.engine";
import { TokenType } from "../src/parser/tokenizer/tokenType";
import { Token } from "../src/parser/tokenizer/token";

const filePath = path.resolve(__dirname, "../../../sample/demo-march.berry");
const source = fs.readFileSync(filePath, "utf-8");

// Tokenize
console.log("═══ Tokenizing demo-march.berry ═══\n");
const lexer = new LexerEngine(source);
const tokens: Token[] = lexer.tokenize();
console.log(`✅ Produced ${tokens.length} tokens\n`);

// Group tokens by line for readable output
const tokensByLine = new Map<number, Token[]>();
for (const tok of tokens) {
  const line = tok.position.line ?? -1;
  if (!tokensByLine.has(line)) {
    tokensByLine.set(line, []);
  }
  tokensByLine.get(line)!.push(tok);
}

// Print tokens grouped by line
console.log("── Tokens by Line ──");
const sortedLines = [...tokensByLine.keys()].sort((a, b) => a - b);
for (const line of sortedLines) {
  const lineTokens = tokensByLine.get(line)!;
  console.log(`\n  Line ${line}:`);
  for (const tok of lineTokens) {
    const typeName = TokenType[tok.type] ?? `Unknown(${tok.type})`;
    console.log(
      `    [${tok.position.start}:${tok.position.end}] ${typeName.padEnd(16)} ${JSON.stringify(tok.value)}`
    );
  }
}

// Print token type distribution
console.log("\n── Token Type Distribution ──");
const typeCounts = new Map<string, number>();
for (const tok of tokens) {
  const typeName = TokenType[tok.type] ?? `Unknown(${tok.type})`;
  typeCounts.set(typeName, (typeCounts.get(typeName) ?? 0) + 1);
}
const sorted = [...typeCounts.entries()].sort((a, b) => b[1] - a[1]);
for (const [name, count] of sorted) {
  console.log(`  ${name.padEnd(20)} ${count}`);
}

// Save full token list as JSON
const outputPath = path.resolve(__dirname, "./.outputs/tokenizer-output.json");
fs.writeFileSync(
  outputPath,
  JSON.stringify(
    tokens.map((t) => ({
      type: TokenType[t.type],
      value: t.value,
      line: t.position.line,
      start: t.position.start,
      end: t.position.end,
    })),
    null,
    2
  )
);
console.log(`\n📄 Full token list saved to ${outputPath}`);
