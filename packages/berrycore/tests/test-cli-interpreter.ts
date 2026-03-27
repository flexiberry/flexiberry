/**
 * Test: Interactive interpreter with CLI adapter
 * Supports keyboard commands during execution:
 *   [p] pause  [c] continue  [s] skip  [t] stop  [k] kill
 *
 * Run from berrycore root:
 *   ts-node tests/test-cli-interpreter.ts
 */

import * as fs from "fs";
import * as path from "path";
import { LexerEngine } from "../src/parser/tokenizer/reader/lexer.engine";
import { AstEngine } from "../src/parser/ast/ast.engine";
import { Interpreter } from "../src/interpreter/interpreter";
import { InterpreterEvent } from "../src/interpreter/interpreter.types";
import { CliAdapter } from "../src/adapter/cli-adapter";

const filePath = path.resolve(__dirname, "../../../sample/demo-march.berry");
const source = fs.readFileSync(filePath, "utf-8");

// Step 1: Tokenize
const lexer = new LexerEngine(source);
const tokens = lexer.tokenize();

// Step 2: Parse
const parser = new AstEngine(tokens);
const ast = parser.build();

// Step 3: Interpret with CLI adapter (real API calls)
console.log("═══ Berry Interpreter — Interactive Mode ═══\n");

const adapter = new CliAdapter({
  enableLogging: true,
  enableCommands: true,
  logLevels: ["info", "warn", "error", "step", "task", "api"],
});

const interpreter = new Interpreter(ast, { dryRun: false });
interpreter.setIOAdapter(adapter);

// Register event listeners for extra output
interpreter
  .on(InterpreterEvent.Completed, (payload) => {
    console.log("\n═══ Execution Complete ═══");
    for (const task of payload.taskResults) {
      const icon = task.status === "PASS" ? "✅" : task.status === "KILLED" ? "💀" : "❌";
      console.log(`  ${icon} "${task.title}" → ${task.status}`);
      for (const step of task.steps) {
        const sIcon =
          step.status === "PASS" ? "✅" :
            step.status === "SKIPPED" ? "⏭ " :
              step.status === "KILLED" ? "💀" : "❌";
        console.log(`     └─ ${sIcon} ${step.targetName} → ${step.status}`);
      }
    }
  })
  .on(InterpreterEvent.StateChanged, (payload) => {
    console.log(`\n🔄 State changed: ${payload.state} — ${payload.reason}\n`);
  });

// Run
interpreter.execute().then(() => {
  adapter.dispose();
  process.exit(0);
}).catch((err) => {
  console.error("❌ Fatal:", err);
  adapter.dispose();
  process.exit(1);
});
