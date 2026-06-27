# Flexiberry CLI Reference Manual

The Flexiberry command-line interface (CLI) is a powerful, interactive tool designed to manage and execute your `.berry` API testing workflows directly from the terminal. 

---

## 1. Core CLI Commands

### 1.1 `flexiberry cli`
Launches the interactive terminal user interface (TUI) menu. This provides an easy-to-use menu system to manage and run your test suites.

**Usage:**
```bash
flexiberry cli
```

---

### 1.2 `flexiberry create`
Scaffolds a new `.berry` script file.

**Usage:**
```bash
flexiberry create <file_name> [template_name] [options]
```

**Arguments:**
- `<file_name>`: The name of the file to create (e.g. `auth-flow.berry`).
- `[template_name]`: Optional pre-defined template to initialize the file with.

**Options:**
- `-f, --force`: Overwrite the file if it already exists in the current directory.
- `-s, --secret`: Create a secret/encrypted environment template file.

---

### 1.3 `flexiberry select`
Selects a `.berry` file from the current directory as the active workspace file. This saves you from passing the file name argument to every subsequent CLI action.

**Usage:**
```bash
flexiberry select [file_name]
```
*Note: If no `[file_name]` is provided, an interactive prompt will list the files in the directory for selection.*

---

### 1.4 `flexiberry add`
Appends new declarations and blocks to your currently selected active `.berry` file.

**Usage:**
```bash
flexiberry add <type> [name] [options]
```

#### Valid Types & Options

1. **`api`**: Add an HTTP API configuration.
   - `-u, --url <url>`: Specify the request URL.
   - `-m, --method <method>`: Set HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
   - `-h, --headers <headers>`: Request headers (as comma-separated `key:value` pairs).
   - `-b, --body <body>`: Inline JSON or text body payload.
   - `-c, --curl <curl_command>`: Import an API endpoint directly from a copied shell `cURL` command.
   - `-s, --swagger <swagger_url>`: Import schemas and endpoints from an OpenAPI/Swagger URL.
   - `-p, --postman <postman_file>`: Import configurations from a Postman JSON collection file.

2. **`env`**: Add environment configuration variables.
   - `-e, --env <env_name>`: Set the environment name (e.g., `UAT`).
   - `-v, --var <variables>`: Environment variables (as comma-separated `key:value` pairs).

3. **`task`**: Add a task block.
   - Requires a `[name]` (the task title).

4. **`step`**: Add a step block to a task.
   - Requires the target API `[name]` to invoke.

5. **`var`**: Add global variable entries.
   - `-v, --var <variables>`: Variables (as comma-separated `key:value` pairs).

#### Examples:
```bash
# Add a simple GET API configuration
flexiberry add api getUserProfile -u "https://api.example.com/user/profile" -m "GET"

# Import an API from a cURL command
flexiberry add api loginUser -c "curl -X POST https://api.example.com/login -H 'Content-Type: application/json' -d '{\"user\":\"admin\"}'"

# Add a UAT environment block with vars
flexiberry add env uat -v "apiUrl:https://uat.example.com,timeout:5000"
```

---

### 1.5 `flexiberry run`
Executes tasks defined within a `.berry` script file. If no file is provided, it runs the currently selected active workspace file.

**Usage:**
```bash
flexiberry run [file_name] [options]
```

#### Options for Data-Driven Testing
If the script contains an `Input` statement linking to an external CSV or JSON file:
- **`--iter <all|custom>`**: Directs the iteration execution mode.
- **`--start <index>`**: The 1-based row index to start testing from (requires `--iter custom`).
- **`--end <index>`**: The 1-based row index to end testing at (requires `--iter custom`).

*If no iteration options are specified on a data-driven script, the CLI will display an interactive clack prompt asking for iteration instructions.*

#### Standalone API Execution
To run a single API configuration independently without executing tasks:
- **`--api [api_name]`**: Directly executes the API block matching `[api_name]`. 
*If `--api` is passed without a name, the CLI will parse the script and prompt you to interactively pick an API from the list.*

#### Examples:
```bash
# Run the active script with all data rows
flexiberry run --iter all

# Run only rows 5 to 15 of data input
flexiberry run my-test.berry --iter custom --start 5 --end 15

# Interactively pick and execute an API block
flexiberry run my-test.berry --api
```

---

### 1.6 `flexiberry test`
Parses the target `.berry` file, tokenizes it, and builds the Abstract Syntax Tree (AST). It prints the final parsed AST JSON output to the console. This is a helper utility for debugging syntax errors.

**Usage:**
```bash
flexiberry test [file_name]
```

---

## 2. State & Settings Persistence

To maximize productivity, the FlexiBerry CLI stores settings (such as the currently active workspace file selected via `flexiberry select`) locally on the system.

- **Settings Path:** `Documents/flexiberry/data.json` relative to the user's home directory (e.g. `/Users/username/Documents/flexiberry/data.json`).
- **Structure:** Managed via a lightweight file-database utility (`FileDB`), which ensures settings persist seamlessly across terminal sessions.
