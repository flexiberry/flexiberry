import { LexerEngine, AstEngine, Interpreter, NodeType, type EnvStatementNode } from "../dist/index.js";

async function runTests() {
  console.log("==================================================");
  console.log("       Testing Env Parsing & Scoped Filtering    ");
  console.log("==================================================\n");

  const sampleBerryCode = `
Env DEV, STAGING, PROD

Var App Config
- appName: Flexiberry
- globalKey: GlobalValue

Var @DEV Database Config
- host: dev.db.internal
- port: 5432
- envName: Development

Var @PROD Database Config
- host: prod.db.internal
- port: 5432
- envName: Production
`;

  // Step 1: Test Lexer + AST Parser
  console.log("▶ Step 1: Testing AST Engine parsing for Env statement...");
  const tokens = new LexerEngine(sampleBerryCode).tokenize();
  const ast = new AstEngine(tokens).build();

  const envNode = ast.body.find((n): n is EnvStatementNode => n.type === NodeType.EnvStatement);
  if (!envNode) {
    throw new Error("❌ Failed: EnvStatementNode was not found in parsed AST.");
  }
  console.log(`✅ EnvStatementNode parsed successfully: environments = [${envNode.environments.join(", ")}]`);

  // Step 2: Test Interpreter default behavior (targetEnv = "")
  console.log("\n▶ Step 2: Testing Interpreter default behavior (targetEnv = '')...");
  const defaultInterpreter = new Interpreter(ast, { targetEnv: "", dryRun: true });
  await defaultInterpreter.execute();
  const defaultEnvEntries = Array.from(defaultInterpreter.getEnvironment().getOwnEntries().entries());
  console.log("   Variables in environment:", defaultEnvEntries);

  const defaultKeys = defaultEnvEntries.map(([k]) => k);
  if (!defaultKeys.includes("appName") || !defaultKeys.includes("globalKey")) {
    throw new Error("❌ Failed: Global un-tagged variables missing in default execution.");
  }
  if (defaultKeys.includes("host") || defaultKeys.includes("envName")) {
    throw new Error("❌ Failed: @DEV/@PROD variables should have been IGNORED when targetEnv is default empty string.");
  }
  console.log("✅ PASS: Default execution ignored all @env tagged Var blocks and loaded only global variables.");

  // Step 3: Test Interpreter targetEnv = "DEV"
  console.log("\n▶ Step 3: Testing Interpreter with targetEnv = 'DEV'...");
  const devInterpreter = new Interpreter(ast, { targetEnv: "DEV", dryRun: true });
  await devInterpreter.execute();
  const devEnv = devInterpreter.getEnvironment();
  console.log("   DEV host =", devEnv.tryLookup("host"));
  console.log("   DEV envName =", devEnv.tryLookup("envName"));

  if (devEnv.tryLookup("host") !== "dev.db.internal" || devEnv.tryLookup("envName") !== "Development") {
    throw new Error("❌ Failed: @DEV variables were not loaded correctly when targetEnv = 'DEV'.");
  }
  console.log("✅ PASS: targetEnv = 'DEV' correctly loaded global and @DEV scoped variables.");

  // Step 4: Test Interpreter targetEnv = "PROD"
  console.log("\n▶ Step 4: Testing Interpreter with targetEnv = 'PROD'...");
  const prodInterpreter = new Interpreter(ast, { targetEnv: "PROD", dryRun: true });
  await prodInterpreter.execute();
  const prodEnv = prodInterpreter.getEnvironment();
  console.log("   PROD host =", prodEnv.tryLookup("host"));
  console.log("   PROD envName =", prodEnv.tryLookup("envName"));

  if (prodEnv.tryLookup("host") !== "prod.db.internal" || prodEnv.tryLookup("envName") !== "Production") {
    throw new Error("❌ Failed: @PROD variables were not loaded correctly when targetEnv = 'PROD'.");
  }
  console.log("✅ PASS: targetEnv = 'PROD' correctly loaded global and @PROD scoped variables.");

  console.log("\n🎉 ALL ENV SCOPING TESTS PASSED SUCCESSFULLY!");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
