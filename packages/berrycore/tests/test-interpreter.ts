/**
 * Test: Tokenize → Parse → Interpret (dry run mode)
 *
 * Run from berrycore root:
 *   ts-node tests/test-interpreter.ts
 */

import * as fs from "fs";
import * as path from "path";
import { LexerEngine } from "../src/parser/tokenizer/reader/lexer.engine";
import { AstEngine } from "../src/parser/ast/ast.engine";
import { Interpreter } from "../src/interpreter/interpreter";
import { InterpreterEvent } from "../src/interpreter/interpreter.types";

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

// Step 3: Interpret (dry run — no real API calls)
console.log("═══ Step 3: Interpreting (DRY RUN) ═══\n");

const interpreter = new Interpreter(ast, { dryRun: false });

// Register event listeners
interpreter
  .on(InterpreterEvent.Start, (payload) => {
    console.log(`🚀 Start — ${payload.totalTasks} tasks, ${payload.totalApis} APIs, ${payload.totalVars} vars`);
  })
  .on(InterpreterEvent.Log, (payload) => {
    if (payload.level !== "debug") {
      console.log(`  📝 [${payload.level}] ${payload.message}`);
    }
  })
  .on(InterpreterEvent.TaskBegin, (payload) => {
    console.log(`\n📋 Task ${payload.index + 1}: "${payload.title}"`);
  })
  .on(InterpreterEvent.StepBegin, (payload) => {
    console.log(`  ▶ Step ${payload.index + 1}: Call Api ${payload.targetName}`);
  })
  .on(InterpreterEvent.ApiCallBegin, (payload) => {
    console.log(`    🌐 ${payload.method} ${payload.url}`);
  })
  .on(InterpreterEvent.ApiCallDone, (payload) => {
    console.log(`    ✅ ${payload.apiName} → ${payload.status} (${payload.duration}ms)`);
  })
  .on(InterpreterEvent.StepDone, (payload) => {
    const icon = payload.status === "PASS" ? "✅" : "❌";
    console.log(`  ${icon} Step done: ${payload.targetName} → ${payload.status}`);
    if (payload.error) {
      console.log(`     Error: ${payload.error}`);
    }
  })
  .on(InterpreterEvent.TaskDone, (payload) => {
    const icon = payload.status === "PASS" ? "✅" : "❌";
    console.log(`${icon} Task "${payload.title}" → ${payload.status} (${payload.steps.length} steps)\n`);
  })
  .on(InterpreterEvent.Error, (payload) => {
    console.log(`  ❌ Error: ${payload.message}`);
  })
  .on(InterpreterEvent.Completed, (payload) => {
    console.log("═══ Execution Complete ═══");
    console.log(`Total tasks: ${payload.taskResults.length}`);
    for (const task of payload.taskResults) {
      console.log(`  📋 "${task.title}" → ${task.status}`);
      for (const step of task.steps) {
        console.log(`     └─ ${step.targetName} → ${step.status}`);
      }
    }
  });

// Run!
interpreter.execute().then((results) => {
  // Print environment after execution
  console.log("\n── Global Environment ──");
  for (const [key, val] of interpreter.getEnvironment().getOwnEntries()) {
    console.log(`  ${key} = ${JSON.stringify(val)}`);
  }

  console.log("\n── API Registry ──");
  for (const [name, def] of interpreter.getApiRegistry()) {
    console.log(`  ${def.method} #${name} → ${def.url ?? "(no url)"}`);
  }
}).catch((err) => {
  console.error("❌ Fatal error:", err);
});
