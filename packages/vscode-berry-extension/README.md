# FlexiBerry VS Code Extension

**FlexiBerry is an elegant, developer-first API client and testing framework designed to make writing, executing, and validating API workflows as simple as writing plain English.**

[🌐 Official Website](https://flexiberry.dev) | [📖 Documentation Portal](https://docs.flexiberry.dev)

Official developer extension for the **FlexiBerry .berry DSL**—a kid-friendly yet professional scripting language for API orchestration and test automation.

This extension delivers real-time validation, syntax coloring, context-sensitive suggestions, formatting, and a side-by-side execution trace visualizer directly within VS Code.

---

## Features

### 1. 🎨 Syntax Highlighting & Theme Integration
* Curated semantic coloring for all Berry DSL syntax structures (keywords, variables, templates, headers, block structures).
* Integrates directly with your active VS Code theme (Dark, Light, High Contrast, etc.) for a clean, integrated experience.

### 2. ⚡ Real-Time Syntax Diagnostics
* Highlights syntax errors and lexer/parser issues with red squiggles as you type.
* Hovering over diagnostics displays helpful error details, including the line and character column.

### 3. 🧠 Autocomplete & IntelliSense
* Offers smart, context-sensitive completion items and templates:
  * **Top-Level**: Templates for `Api GET`, `Api POST`, `Task`, `Var`, `Link`, and `Input`.
  * **Inside Api Block**: Auto-completes HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) and block keywords like `Url`, `Header`, and `Body JSON`.
  * **Inside Step Block**: Suggests sub-blocks (`Params`, `Capture`, `Check`).

### 4. 🚀 Interactive Execution Runner (Visualizer)
* Adds a **Play Button** (`▶`) in the top-right corner of the editor title toolbar when editing a `.berry` file.
* Launches a beautiful, responsive, glassmorphic **Berry Run** Webview panel side-by-side with your code:
  * **Interactive Task Checklist**: Displays tasks and steps with live status markers (⏳ Running, ✅ Passed, ❌ Failed, 🔲 Skipped).
  * **Detailed Tabbed Inspector**: Click on any step to inspect **Response Body** (formatted JSON/text), **Headers**, resolved **Captures** (variables), and check **Assertions** (assertions check list).
  * **Hot Reloading & Run Button**: Re-execute the script directly from the Webview with the green **Run** button. It dynamically reads your active editor's latest content without requiring you to manually save first.
  * **Terminal Log Console**: A bottom panel logging standard trace records, system events, and runtime errors.
  * **Sequential Loop Iterations**: Supports data-driven CSV/JSON loops using the `Input` keyword. Displays a dropdown to navigate and inspect specific iterations.

---

## Getting Started

1. Install the extension.
2. Open any file ending in `.berry` (e.g. `api.berry`, `kitchen-sink.berry`).
3. You will immediately get syntax coloring and real-time error validation.
4. Click the **Play Icon** in the top-right toolbar (or right-click in the editor and choose **Run Berry File**) to run the script and inspect results in the custom Webview panel.

---

## Extension Settings

This extension contributes the following settings:

* `berry.format.enable`: Enable/disable formatting for `.berry` scripts.
* `berry.format.enableFormatOnSave`: Automatically format files on save.

---

## Development & Publishing

To package the extension:
```bash
pnpm run package
```
This builds the package and creates a `.vsix` file using `vsce`.

---

## License

MIT © FlexiBerry Team
