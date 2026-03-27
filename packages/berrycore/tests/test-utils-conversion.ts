/**
 * Test: Utility Conversions (Postman & Swagger)
 *
 * Run from berrycore root:
 *   ts-node tests/test-utils-conversion.ts
 */

import * as fs from "fs";
import * as path from "path";
import { SwaggerUtil } from "../src/script/swagger.util";
import { PostmanUtil } from "../src/script/postman.util";

async function runTests() {
  console.log("═══ Testing Swagger Conversion ═══");
  const swaggerUrl = "https://petstore.swagger.io/v2/swagger.json";
  try {
    const berryCode = await SwaggerUtil.convertFromSwaggerApi(swaggerUrl);
    console.log("✅ Swagger conversion successful");
    console.log(`Generated lines: ${berryCode.split("\n").length}`);
    console.log("--- Preview (First 20 lines) ---");
    console.log(berryCode.split("\n").slice(0, 20).join("\n"));
    console.log("-------------------------------\n");

    const outputPath = path.resolve(__dirname, "../.outputs/swagger-import.berry");
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, berryCode);
    console.log(`💾 Saved to: ${outputPath}\n`);
  } catch (err) {
    console.error("❌ Swagger test failed:", err);
  }

  console.log("═══ Testing Postman Conversion ═══");
  // Create a mock Postman collection
  const mockPostmanCollection = {
    info: { name: "Test Collection", schema: "123" },
    item: [
      {
        name: "Get User Info",
        request: {
          method: "GET",
          url: "https://api.example.com/users/:id",
          header: [{ key: "Authorization", value: "Bearer token123" }],
        },
      },
      {
        name: "Create User",
        request: {
          method: "POST",
          url: { raw: "https://api.example.com/users" },
          header: [{ key: "Content-Type", value: "application/json" }],
          body: {
            mode: "raw",
            raw: JSON.stringify({ name: "John Doe", email: "john@example.com" }),
            options: { raw: { language: "json" } },
          },
        },
      },
    ],
  };

  const postmanPath = path.resolve(__dirname, "../../tmp/test-postman.json");
  fs.mkdirSync(path.dirname(postmanPath), { recursive: true });
  fs.writeFileSync(postmanPath, JSON.stringify(mockPostmanCollection, null, 2));

  try {
    const berryCode = PostmanUtil.convertFromPostmanFile(postmanPath);
    console.log("✅ Postman conversion successful");
    console.log("--- Generated Berry Code ---");
    console.log(berryCode);
    console.log("----------------------------\n");

    const outputPath = path.resolve(__dirname, "../.outputs/postman-import.berry");
    fs.writeFileSync(outputPath, berryCode);
    console.log(`💾 Saved to: ${outputPath}`);
  } catch (err) {
    console.error("❌ Postman test failed:", err);
  } finally {
    if (fs.existsSync(postmanPath)) fs.unlinkSync(postmanPath);
  }
}

runTests();
