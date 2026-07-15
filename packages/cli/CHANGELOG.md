# @flexiberry/cli

## 0.1.7

### Patch Changes

- Updated dependencies
  - @flexiberry/berrycore@0.1.7

## 0.1.6

### Patch Changes

- SEO/LLM accessibility features.
- Updated dependencies
  - @flexiberry/berrycore@0.1.6

## 0.1.5

### Patch Changes

- Edited package.json
  Edited package.json
  Ran command: `npm changeset cli`
  Ran command: ` changeset cli`
  Ran command: `npx changeset cli`
  Ran command: `changeset version`
  Ran command: `pnpm changeset init`
  Viewed package.json:120-143

  Here is a summary of the changes we completed recently:

  ***
  - **Gutter Play Buttons**: Integrated a VS Code `TestController` in [extension.ts](file:///Users/rinturajc/lib_projects/Flexiberry/flexiberry/packages/vscode-berry-extension/src/extension.ts) that automatically adds clickable **green play buttons** in the editor gutter directly next to the line numbers for each `Api` statement.
  - **CodeLens Actions**: Registered a custom `CodeLensProvider` that renders `▶ Run API Standalone` text links directly above each `Api` statement.
  - **Interactive Variable Prompts**: Configured the standalone runner to parse the target API block for template variables (e.g. `{{petId}}`). If a variable is missing and not declared in a script's `Var` block, it pauses and prompts the user using a native `vscode.window.showInputBox` before resuming.

  - **Clean Layout**: Configured the visualizer webview to hide the execution plan sidebar and expand the detailed inspector panel to a full `100%` width.
  - **Request Tab**: Added a new **Request Tab** showing:
    - The HTTP method and fully interpolated request URL.
    - A table of outgoing request headers.
    - A formatted, syntax-highlighted code block displaying the request body payload.
  - **Response Views**: Preserves the **Response Body** and **Response Headers** tabs for immediate validation.

  - **Activation Position Crash**: Resolved a VS Code activation crash (`Illegal argument: character must be non-negative`) by changing the regex pattern to match horizontal whitespace (`[ \t]*`) instead of newlines (`\s*`), and resolving ranges using `document.positionAt` directly rather than running fragile `indexOf` string lookups.
  - **Header Variable Rendering**: Fixed a bug where `${logoUrl}` and `${fileName}` were showing up as literal text in the Webview header by correcting template escapes in [runnerWebview.ts](file:///Users/rinturajc/lib_projects/Flexiberry/flexiberry/packages/vscode-berry-extension/src/runnerWebview.ts).

  - **README**: Added a developer-first project tagline and direct links to the official [Website](https://flexiberry.dev) and [Documentation Portal](https://docs.flexiberry.dev) at the top of the extension's [README.md](file:///Users/rinturajc/lib_projects/Flexiberry/flexiberry/packages/vscode-berry-extension/README.md).
  - **Package Validation**: Cleaned up the `categories` array in the extension's [package.json](file:///Users/rinturajc/lib_projects/Flexiberry/flexiberry/packages/vscode-berry-extension/package.json) to strictly match allowed marketplace category enums, and moved custom tags (`api-client`, `api-testing`, etc.) to the `keywords` array. Configured the monorepo directory key in the repository block.

  - **Unified Release Workflow**: Created [.github/workflows/publish-release.yml](file:///Users/rinturajc/lib_projects/Flexiberry/flexiberry/.github/workflows/publish-release.yml) to compile packages on tag push (`v*`), publish NPM packages, verify publication using a sandboxed installation smoke-test, and automatically draft a GitHub Release with the compiled `.vsix` file attached.
  - **Dedicated Extension Publish**: Created [.github/workflows/publish-extension.yml](file:///Users/rinturajc/lib_projects/Flexiberry/flexiberry/.github/workflows/publish-extension.yml) to isolate building and publishing the extension to the VS Code Marketplace.

- Updated dependencies
  - @flexiberry/berrycore@0.1.5

## 0.1.4

### Patch Changes

- Using Optimized tsup.config.ts
- Updated dependencies
  - @flexiberry/berrycore@0.1.4

## 0.1.3

### Patch Changes

- Doc update
- Updated dependencies
  - @flexiberry/berrycore@0.1.3

## 0.1.2

### Patch Changes

- Introduced Api Standalone run feature in berrycore
- Updated dependencies
  - @flexiberry/berrycore@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [0fad92d]
  - @flexiberry/berrycore@0.1.1
