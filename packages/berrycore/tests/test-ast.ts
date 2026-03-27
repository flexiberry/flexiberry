/**
 * Quick test: Tokenize demo-march.berry → Parse into AST → Print tree
 *
 * Run from berrycore root:
 *   npx ts-node tests/test-ast.ts
 */

import * as fs from "fs";
import * as path from "path";
import { LexerEngine } from "../src/parser/tokenizer/reader/lexer.engine";
import { AstEngine } from "../src/parser/ast/ast.engine";
import { ProgramNode, NodeType } from "../src/parser/ast/ast.types";

const filePath = path.resolve(__dirname, "../../../sample/demo-march.berry");
const source = fs.readFileSync(filePath, "utf-8");

// Step 1: Tokenize
console.log("═══ Step 1: Tokenizing ═══");
const lexer = new LexerEngine(source);
const tokens = lexer.tokenize();
console.log(`✅ Produced ${tokens.length} tokens\n`);

// Print first 30 tokens as a sample
console.log("── Token sample (first 30) ──");
for (const tok of tokens.slice(0, 30)) {
  console.log(
    `  [L${tok.position.line}:${tok.position.start}] type=${tok.type} value=${JSON.stringify(tok.value)}`
  );
}
console.log("  ...\n");

// Step 2: Parse
console.log("═══ Step 2: Parsing into AST ═══");
try {
  const parser = new AstEngine(tokens);
  const ast: ProgramNode = parser.build();
  console.log(`✅ AST built with ${ast.body.length} top-level nodes\n`);

  // Print summary of each node
  console.log("── AST Summary ──");
  for (const node of ast.body) {
    switch (node.type) {
      case NodeType.VarDeclaration:
        console.log(
          `  📦 Var "${node.title}" (${node.entries.length} entries, pointer: ${node.pointer?.target ?? "none"})`
        );
        for (const e of node.entries) {
          console.log(`      - ${e.key}: ${e.value}`);
        }
        break;
      case NodeType.ApiBlock:
        console.log(
          `  🌐 Api ${node.method ?? "?"} #${node.name} "${node.title ?? ""}"` +
          `  url=${node.url?.value ?? "none"}` +
          `  headers=${node.headers?.entries.length ?? 0}` +
          `  body=${node.body ? node.body.bodyType : "none"}`
        );
        break;
      case NodeType.TaskBlock:
        console.log(`  📋 Task "${node.title}" (${node.steps.length} steps)`);
        for (const step of node.steps) {
          console.log(
            `      └─ Step Call ${step.targetType} ${step.targetName}` +
            `  params=${step.params?.entries.length ?? 0}` +
            `  capture=${step.capture?.entries.length ?? 0}` +
            `  checks=${step.check?.conditions.length ?? 0}`
          );
        }
        break;
      case NodeType.Comment:
        console.log(`  💬 Comment: ${node.text}`);
        break;
      default:
        console.log(`  ❓ ${node.type}`);
    }
  }

  // Full AST JSON to a file for inspection
  const outputPath = path.resolve(__dirname, "./.outputs/ast-output.json");
  fs.writeFileSync(outputPath, JSON.stringify(ast, null, 2));
  console.log(`\n📄 Full AST JSON saved to ${outputPath}`);
} catch (err) {
  console.error("❌ Parser error:", err);
}
