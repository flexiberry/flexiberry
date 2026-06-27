# Quick Start

Welcome to the **Flexiberry** Quick Start guide! This page will help you install the CLI, initialize your first API test script, and run it locally in just a few minutes.

## 1. Installation

Flexiberry is distributed as two packages on npm, alongside an editor extension:
* 🌐 **FlexiBerry CLI**: [@flexiberry/cli on npm](https://www.npmjs.com/package/@flexiberry/cli) - The interactive command-line interface.
* 🧠 **BerryCore Engine**: [@flexiberry/berrycore on npm](https://www.npmjs.com/package/@flexiberry/berrycore) - The programmatic test execution engine.
* 🔌 **VS Code Extension**: [VS Code Berry Extension on Open VSX](https://open-vsx.org/extension/flexiberry/vscode-berry-extension) - Official editor support providing syntax highlighting, snippets, formatting, and autocomplete.

To use the tool from your terminal, you should install the CLI package globally. We recommend using `npm` or `pnpm`.

> [!IMPORTANT]
> Be sure to install the CLI (`@flexiberry/cli`) and **not** the core engine (`@flexiberry/berrycore`). The CLI provides the `flexiberry` command line tool, whereas the core engine is for programmatic integration inside Node.js applications.

```bash
# Using npm
npm install -g @flexiberry/cli

# Using pnpm
pnpm install -g @flexiberry/cli
```

Verify the installation by running:
```bash
flexiberry --version
```

## 2. Create Your First Test Script

You can create a new `.berry` script by using the `create` command:

```bash
flexiberry create my-first-api.berry
```
This will scaffold an empty `.berry` script in your current directory. 

## 3. Selecting a File (Interactive Mode)

Rather than passing the file explicitly to every command, you can "select" a script locally to serve as your active workspace:

```bash
flexiberry select my-first-api.berry
```

Any subsequent commands you execute using the CLI will automatically target this active file!

## 4. Add an API Endpoint

Let's quickly add a new API definition to your active file. We'll use a sample JSON-based GET request:

```bash
flexiberry add api getSampleData -u "https://jsonplaceholder.typicode.com/todos/1" -m "GET"
```
You can also import existing APIs quickly if you prefer:
```bash
flexiberry add api fromCurl -c "curl -X GET https://jsonplaceholder.typicode.com/todos/1"
```

## 5. Add a Test Task

Next, add a task containing a step that calls the newly created API. Open `my-first-api.berry` and add the task block:

```berry
Task Verify Sample Data
Step Call Api getSampleData
Capture
- id: response.id
Check
- $.status == 200
- $.body != null
```

## 6. Run Your Tests

Once everything is wired up, you can execute your test engine:

```bash
flexiberry run my-first-api.berry
```

If your tests are successful, the engine will proudly display a table of passes. Any invalid assertions will be flagged for investigation. 

### What's Next?
- Check out the [CLI Commands](/cli) to explore interactive modules.
- Read through the [`.berry` Language Syntax](/berry-language) to create complex test workflows.
- Learn how to run your tests in automated environments via [CI/CD Integration](/ci-cd).
