import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, "./docs");
const OUTPUT_FILE = path.resolve(DOCS_DIR, "./public/llms-full.txt");

const filesToAggregate = [
  "quick-start.md",
  "guide/writing-berry.md",
  "guide/cli-tutorial.md",
  "cli.md",
  "berry-language.md",
  "ci-cd.md"
];

let aggregatedContent = `# FlexiBerry Comprehensive Documentation (Aggregated)
> The Developer-First HTTP Client for Sequential API Workflows.

This file contains the complete, aggregated documentation for FlexiBerry, including installation guides, syntax tutorials, CLI reference manuals, and CI/CD configuration guidelines. It is designed to be easily ingested and parsed by LLMs (Large Language Models).

---
`;

for (const relPath of filesToAggregate) {
  const filePath = path.join(DOCS_DIR, relPath);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    aggregatedContent += `\n\n# SECTION: ${relPath}\n\n${content}\n\n---\n`;
    console.log(`Aggregated: ${relPath}`);
  } else {
    console.warn(`File not found: ${relPath}`);
  }
}

fs.writeFileSync(OUTPUT_FILE, aggregatedContent, "utf-8");
console.log(`llms-full.txt generated successfully at ${OUTPUT_FILE}`);
