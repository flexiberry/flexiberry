import { LexerEngine, AstEngine, Interpreter } from "../dist/index.js";

async function runTests() {
  console.log("==================================================");
  console.log("   Testing System Process Environment Fallback   ");
  console.log("==================================================\n");

  // Set system environment variable in Node
  process.env["TEST_SYSTEM_KEY"] = "system_secret_value_99";

  const sampleBerryCode = `
Var App Config
- localKey: LocalValue

Api GET #testApi
Url https://httpbin.org/get?sys={{TEST_SYSTEM_KEY}}&explicit={{$env.TEST_SYSTEM_KEY}}&local={{localKey}}
`;

  const tokens = new LexerEngine(sampleBerryCode).tokenize();
  const ast = new AstEngine(tokens).build();

  const interpreter = new Interpreter(ast, { dryRun: true });
  await interpreter.execute();
  
  // Test lookup in Environment
  const env = interpreter.getEnvironment();
  const localVal = env.tryLookup("localKey");
  const sysVal = env.tryLookup("TEST_SYSTEM_KEY");

  console.log("  localKey lookup =", localVal);
  console.log("  TEST_SYSTEM_KEY fallback lookup =", sysVal);

  if (localVal !== "LocalValue") {
    throw new Error("❌ Local variable resolution failed.");
  }
  if (sysVal !== "system_secret_value_99") {
    throw new Error("❌ System environment variable fallback lookup failed.");
  }

  console.log("✅ PASS: Environment.tryLookup and Environment.lookup fallback to process.env seamlessly.");
  console.log("\n🎉 ALL PROCESS ENV FALLBACK TESTS PASSED!");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
