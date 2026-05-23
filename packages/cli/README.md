# @flexiberry/cli

The official zero-dependency CLI shell for the **FlexiBerry** API Testing Framework, bringing keyboard-driven interactive creation, parsing, validation, and execution of `.berry` DSL scripts straight to your terminal.

`@flexiberry/cli` eliminates the need for heavy API clients and constant context switching. It features a rich terminal-based wizard to generate tasks, steps, endpoints, and environment variables interactively, converts cURL and Swagger definitions into Berry DSL, and executes scripts locally with live execution metrics powered by `@flexiberry/berrycore`.

---

<div align="center">
  <img src="https://raw.githubusercontent.com/Flexiberry/flexiberry/main/assets/favicon/android-icon-192x192.png" height="120" width="120" alt="FlexiBerry Logo" />
  <h2>🚀 @flexiberry/cli</h2>
  <p><strong>The official zero-dependency CLI shell for FlexiBerry API Testing Framework</strong></p>

  [![npm version](https://img.shields.io/npm/v/@flexiberry/cli.svg?style=flat-square)](https://www.npmjs.com/package/@flexiberry/cli)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

  <br />
</div>

---

## ✨ What is FlexiBerry CLI?

The FlexiBerry CLI brings the power of the FlexiBerry API Testing Framework directly into your terminal. It offers a fully interactive, keyboard-driven menu system that allows you to effortlessly design, test, and manage `.berry` domain-specific language files. 

No context switching, no heavy browsers—just pure, frictionless API engineering.

<div align="center">
  <!-- TODO: Replace with the actual URL to your CLI demo GIF -->
  <img src="https://raw.githubusercontent.com/Flexiberry/flexiberry/main/assets/cli-demo.gif" alt="FlexiBerry CLI Demo" width="800" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"/>
  <p><em>Interactive `.berry` file generation and execution.</em></p>
</div>

---

## ⚡ Features

- **Interactive Wizards:** Generate `Task`, `Step`, `Api`, and `Env` blocks interactively—no need to memorize syntax.
- **cURL & Swagger Imports:** Instantly parse complex cURL commands or OpenAPI/Postman schemas straight into `.berry` DSL.
- **Local AST Engine:** Powered natively by `@flexiberry/berrycore` to perform real-time parsing, formatting, and validation.
- **Stateful Execution:** The CLI dynamically remembers your working directory and recent files to speed up your workflow.
- **Zero Third-Party Clutter:** Designed to be extremely lightweight and lightning-fast.

---

## 📦 Installation

Install the CLI globally via NPM to make the `flexiberry` command accessible anywhere:

```bash
npm install -g @flexiberry/cli
```

---

## 🚀 Quick Start

The quickest way to get started is by launching the interactive wizard! Just run:

```bash
flexiberry cli
```

This will launch a rich, terminal UI guiding you through creating files, running tests, and managing your API suites.

---

## 🛠️ CLI Commands

If you prefer passing arguments directly, the CLI supports a robust set of standard commands.

### `flexiberry create`
Create a new `.berry` script with an optional template.

```bash
flexiberry create my-test.berry
```
> **Flags:**
> - `-f, --force` : Overwrite if the file already exists
> - `-s, --secret` : Creates a secured `.berry` template

### `flexiberry select`
Sets your active/target script file for the current session.

```bash
flexiberry select ./my-test.berry
```

### `flexiberry add`
Programmatically add elements like APIs, Tasks, Steps, or Environments to your active `.berry` script.

```bash
# Add an API from a raw cURL command
flexiberry add api LoginEndpoint -c "curl -X POST https://api.example.com/login"

# Add a new Task block interactively
flexiberry add task "User Onboarding Flow"
```

### `flexiberry run`
Execute your script locally using the `berrycore` interpreter.

```bash
flexiberry run my-test.berry
```

> **Data Iteration Options:**
> If your script contains an `Input` statement linking to external data (CSV/JSON), the CLI provides flexible execution options:
> - **Interactive Prompt:** By default, you'll be asked whether to run **All iterations** or a **Custom range**.
> - **CLI Flags:**
>   - `--iter <all|custom>` : Set the iteration mode directly.
>   - `--start <index>` : 1-based index to start from (requires `--iter custom`).
>   - `--end <index>` : 1-based index to end at (requires `--iter custom`).
>
> *Example: `flexiberry run script.berry --iter custom --start 1 --end 10`*

---

## 🤝 Contributing & Source

The CLI is part of the broader FlexiBerry monorepo. We warmly welcome contributions!

1. Fork the [main repository](https://github.com/Flexiberry/flexiberry).
2. Read our contribution guidelines.
3. Submit a PR!

---

## 📄 License

This project is licensed under the **MIT License**.
