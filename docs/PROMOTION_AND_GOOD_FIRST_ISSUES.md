# FlexiBerry Promotion Copy & Good First Issues

This guide contains copy-paste ready promotional snippets and starter issues to help launch, market, and foster community contributions for FlexiBerry.

---

## 🎯 Recommended Repository Topics

Set these in your GitHub repository settings under **About** -> **⚙️ Topics** to optimize search discoverability:

```text
api, api-testing, api-testing-framework, http-client, cli, typescript, svelte, testing, testing-framework, berry
```
*(Note: Be sure to remove or replace any misspelled topic like `funtional-testing` with `functional-testing`.)*

---

## 🌟 Ready-to-Publish "Good First Issue" Templates

You can create these issues directly on [GitHub Issues](https://github.com/flexiberry/flexiberry/issues) and assign the `good first issue` and `help wanted` labels.

### Issue 1: Unit tests for `.berry` variable interpolation in BerryCore

- **Title:** `good first issue: add unit test for .berry parser variable interpolation`
- **Labels:** `good first issue`, `help wanted`, `testing`, `berrycore`
- **Body:**
```markdown
### Summary
Add a dedicated unit test suite validating that `{{var}}` variable interpolation in the Berry DSL engine correctly substitutes variables captured from an upstream response into downstream requests and headers.

### Why is this important?
State propagation across multi-step sequences is the core differentiator of FlexiBerry. Clear test fixtures make the DSL engine rock-solid and give newcomers an easy starting point.

### Proposed Steps
1. Clone the repository and run `pnpm install`.
2. Inspect the current parser tests in `packages/berrycore`.
3. Add a test file: `packages/berrycore/__tests__/variable_interpolation.test.ts`.
4. Create a test fixture representing a two-step sequence:
   - **Step 1:** Returns `{ "userId": 42, "token": "berry-secret-token" }`.
   - **Step 2:** Uses `Authorization: Bearer {{token}}` and URL `/users/{{userId}}`.
5. Assert that the compiled and resolved request contains the substituted values.
6. Verify locally by running tests in `packages/berrycore`.

### Getting Help
Feel free to ask questions here or in our [Discord](https://discord.flexiberry.dev).
```

---

### Issue 2: Friendly CLI error messaging when a `.berry` file is missing

- **Title:** `good first issue: enhance CLI error handling for missing .berry file paths`
- **Labels:** `good first issue`, `help wanted`, `cli`, `ux`
- **Body:**
```markdown
### Summary
When a user runs `berry run non-existent.berry`, the CLI should display a clear, helpful error message rather than an unhandled ENOENT stack trace.

### Proposed Behavior
- Check file existence before parsing.
- Print a clean message:
  ```text
  ✖ Error: Could not find suite file 'non-existent.berry'.
  Hint: Make sure the file exists and the path is relative to the current directory.
  ```

### Getting Started
1. Run `pnpm install`.
2. Inspect `packages/cli/src/`.
3. Update the runner entry point to catch missing files gracefully with formatted console output.
```

---

## 📢 Promotional Copy

### 1. Twitter / X Announcement

**Post:**
> 🚀 Tired of heavy API GUIs or writing endless boilerplate just to pass IDs between API requests?
>
> Introducing **FlexiBerry** — a developer-first CLI HTTP client + DSL built specifically for sequential, multi-API workflows.
>
> ⚡ Clean `.berry` syntax
> 🔄 Seamless state chaining & assertions
> 💻 Beautiful Web UI + VS Code Extension
>
> Check it out & star on GitHub:
> 🔗 https://github.com/flexiberry/flexiberry
> 📖 https://docs.flexiberry.dev
>
> #TypeScript #WebDev #API #Testing #OpenSource

---

### 2. Hacker News ("Show HN")

**Title:**
```text
Show HN: FlexiBerry – Developer-first CLI HTTP client and DSL for sequential API flows
```

**Content / First Comment:**
```markdown
Hi HN!

Most API clients (Postman, Insomnia) are either heavy GUI tools that make CI automation difficult, or simple CLI tools (curl, httpie) that don't easily track state across dependent multi-step workflows (e.g., login -> capture token -> create item -> query item by ID -> assert payload).

We built FlexiBerry (https://flexiberry.dev) to solve this:
- Specialized .berry DSL designed to chain and pipe response data into subsequent requests without complex scripting.
- Fast CLI runner (@flexiberry/cli) that integrates into your CI/CD pipelines.
- Modern companion Web App and VS Code extension for live visualization.

The core engine is open source under MIT: https://github.com/flexiberry/flexiberry

We’d love to hear your feedback on the syntax and what features you'd like to see next!
```

---

### 3. Reddit (r/webdev, r/node, r/typescript)

**Title:**
```text
I built FlexiBerry: an open-source CLI HTTP client & DSL for testing multi-step API sequences
```

**Post:**
```markdown
Hey everyone!

Whenever I needed to test an API flow that spans 3 or 4 sequential endpoints (e.g. Authenticate -> Create Tenant -> Generate API Key -> Fetch User with Key), I always found myself either writing throwaway node scripts or wrestling with bloated GUI tools.

I built **FlexiBerry** to make multi-API workflows as simple as writing a markdown-like spec:
- Clean `.berry` files where upstream response variables automatically pipe into downstream queries, headers, and bodies.
- Built-in assertions without needing a full test harness.
- A CLI runner for GitHub Actions & CI, plus a VS Code extension and web visualizer.

Repository: https://github.com/flexiberry/flexiberry
Documentation: https://docs.flexiberry.dev

All feedback, issue reports, and contributions are very welcome!
```
