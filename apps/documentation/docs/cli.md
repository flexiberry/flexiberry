# Flexiberry CLI Documentation

The Flexiberry command-line interface (CLI) is a powerful tool designed to help you create, manage, and execute your API testing workflows directly from the terminal. 

## Installation

Ensure you have Flexiberry installed globally or configured via your package manager. Once installed, the `flexiberry` command will be available in your terminal.

## Commands Overview

Below is the list of available commands and their usage details.

---

### `flexiberry cli`
Launches the interactive FlexiBerry CLI menu. This command provides an easy-to-use terminal user interface (TUI) where you can navigate and execute tasks interactively.

**Usage:**
```bash
flexiberry cli
```

---

### `flexiberry create <file> [template]`
Creates a new `.berry` script file with an optional template. This is the starting point for writing your API tests.

**Usage:**
```bash
flexiberry create <file> [template] [options]
```

**Options:**
- `-f, --force`: Overwrite the existing file if it is already present.
- `-s, --secret`: Create a secret file for storing sensitive data (like environment variables and tokens).

**Examples:**
```bash
# Create a blank script
flexiberry create testmyapi.berry

# Create a script using a default template
flexiberry create mytest.berry api-template

# Force overwrite if the file already exists
flexiberry create mytest.berry -f
```

---

### `flexiberry select [file]`
Select a `*.berry` file from the currently working directory. This file becomes the "active" file that actions like `add` will modify.

**Usage:**
```bash
flexiberry select [file]
```
*Note: If no file is provided, an interactive prompt will allow you to pick one.*

---

### `flexiberry add <type> [name]`
Adds a new configuration item (such as an API request, environment block, task, step, or variable) to the currently selected `.berry` file.

**Usage:**
```bash
flexiberry add <type> [name] [options]
```
**Types:**
- `api`: Declare a new API endpoint definition.
- `env`: Add a new environment block.
- `task`: Create a test task block.
- `step`: Append a testing step.
- `var`: Add a definition for local variables.

**Options:**
- `-c, --curl <curl...>`: Import an API configuration from a cURL command.
- `-s, --swagger <url>`: Import endpoints from a Swagger / OpenAPI URL.
- `-p, --postman <filePath>`: Import configurations from a Postman collection.
- `-u, --url <url>`: Specify the API URL.
- `-m, --method <method>`: HTTP method (e.g., `GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- `-h, --headers <headers>`: Request headers as comma-separated key:value pairs.
- `-b, --body <body>`: Request body content.
- `-e, --env <env>`: Environment name.
- `-v, --var <var>`: Variables as comma-separated key:value pairs.

**Examples:**
```bash
# Add an endpoint using a URL and Method
flexiberry add api getUser -u "https://api.example.com/user" -m "GET"
```

---

### `flexiberry run [file]`
Executes all tasks defined within a `.berry` script file. It runs through the script sequentially, executes API calls, evaluates standard assertions, and outputs results via the live table adapter.

**Usage:**
```bash
flexiberry run [file] [options]
```
*If `[file]` is omitted, it will attempt to run the currently selected file.*

**Data Iteration Options:**
If your script contains an `Input` statement linking to external data (CSV/JSON), the CLI provides flexible execution options:
- **Interactive Prompt:** By default, you'll be asked whether to run **All iterations** or a **Custom range**.
- **CLI Flags:**
  - `--iter <all|custom>` : Set the iteration mode directly.
  - `--start <index>` : 1-based index to start from (requires `--iter custom`).
  - `--end <index>` : 1-based index to end at (requires `--iter custom`).

**Examples:**
```bash
# Run all data iterations
flexiberry run script.berry --iter all

# Run specific iterations (rows 1 to 10)
flexiberry run script.berry --iter custom --start 1 --end 10
```

---

### `flexiberry test [file]`
Debug command that parses the `.berry` script and prints the generated Abstract Syntax Tree (AST). It does **not** execute any API calls or testing tasks.

**Usage:**
```bash
flexiberry test [file]
```
*If `[file]` is omitted, it will attempt to test the currently selected file.*

## State Persistence

Operations like `flexiberry select` save the active configuration context locally to speed up your workflow. Your active context and settings are stored safely inside your system's `Documents/flexiberry/data.json` folder so it persists across multiple terminal sessions.
