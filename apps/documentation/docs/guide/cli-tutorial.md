# FlexiBerry CLI: Step-by-Step Tutorial

This step-by-step tutorial walks you through using all features of the **FlexiBerry CLI**. You will learn how to scaffold files, manage workspace contexts, import APIs, debug syntax, run test iterations, and use the interactive terminal user interface (TUI).

---

## Step 1: Create a Script File (`create`)

The `create` command gets you started by creating empty or template `.berry` scripts.

### 1.1 Create a Basic Script
Run the following command to create a basic test script:
```bash
flexiberry create my-test.berry
```
This generates a blank `.berry` file ready for editing.

### 1.2 Overwrite Existing Files
If the file already exists and you want to recreate it, append the `-f` (force) flag:
```bash
flexiberry create my-test.berry -f
```

### 1.3 Create a Secure Configurations Template
To initialize a file with placeholders specifically for secure configurations (e.g. environment credentials), use the `-s` (secret) flag:
```bash
flexiberry create my-secrets.berry -s
```

---

## Step 2: Set the Active File Workspace (`select`)

To avoid typing the file name in every CLI command, you can set an "active" file. Commands like `add` will then automatically modify this file.

### 2.1 Direct Selection
To select your script file:
```bash
flexiberry select my-test.berry
```

### 2.2 Interactive Selection
If you don't supply a file name, the CLI runs an interactive menu displaying all `.berry` files in the current folder:
```bash
flexiberry select
```
Use the arrow keys to choose your target file and press **Enter**.

---

## Step 3: Construct Your Script (`add`)

Instead of writing scripts manually, you can use the CLI to dynamically build them. Make sure you have a file selected first!

### 3.1 Adding Global Variables
To add a set of global variables:
```bash
flexiberry add var -v "timeout:3000,retries:3"
```
This appends a `Var` block to your selected file:
```berry
Var GlobalVariables
- timeout: 3000
- retries: 3
```

### 3.2 Adding Environment Configs
To add environmental settings:
```bash
flexiberry add env uat -v "apiUrl:https://uat.example.com"
```
This appends the environment block:
```berry
Var @uat uat variables
- apiUrl: https://uat.example.com
```

### 3.3 Adding a Basic API Configuration
To declare an API endpoint using method and URL parameters:
```bash
flexiberry add api getUser -u "https://api.example.com/users/{{userId}}" -m "GET"
```

### 3.4 Importing APIs from cURL
You can copy and paste standard curl commands to import endpoints directly:
```bash
flexiberry add api postToken -c "curl -X POST https://api.example.com/oauth/token -H 'Content-Type: application/json' -d '{\"client_id\":\"123\"}'"
```
The CLI automatically parses the URL, method, headers, and request body, converting them into a clean `Api` definition block in your `.berry` file.

### 3.5 Importing from OpenAPI / Swagger / Postman
If you want to import schemas and endpoints from an external collection or URL:
```bash
# Import from Swagger URL
flexiberry add api mySwagger -s "https://petstore.swagger.io/v2/swagger.json"

# Import from Postman Collection file
flexiberry add api myPostman -p "./postman_collection.json"
```

### 3.6 Adding Tasks and Steps
To build the execution workflow:
```bash
# Add a Task
flexiberry add task "Verify Authentication Flow"

# Add a Step calling the 'getUser' API to the Task
flexiberry add step getUser
```

---

## Step 4: Validate Script Syntax (`test`)

Before executing your script, you can run the `test` command to verify that the syntax compiles correctly.

```bash
flexiberry test my-test.berry
```
This performs a tokenization and parsing run on the file. If successful, it displays the parsed Abstract Syntax Tree (AST) JSON block in the terminal. If there is a syntax issue, it points directly to the error line and column index.

---

## Step 5: Execute Script Workflows (`run`)

The `run` command executes the test tasks and displays outputs in a real-time table adapter.

### 5.1 Run the Active Script
If you already selected the file:
```bash
flexiberry run
```
Or run a file directly by passing its path:
```bash
flexiberry run my-test.berry
```

### 5.2 Execute a Single API Block (`--api`)
If you want to execute a single API definition (e.g. to debug output or see if it behaves as expected) without running the entire task workflow:
```bash
flexiberry run my-test.berry --api getUser
```
If the API requires variables that are not defined in the script, the CLI will interactively prompt you to input the values in the terminal before running the request.

If you don't know the exact API name, run:
```bash
flexiberry run my-test.berry --api
```
This displays an interactive menu listing all APIs inside the file for you to select and run.

### 5.3 Executing Data-Driven Scripts
When a script contains an `Input` statement linking to a CSV or JSON data file:
- **Interactive Prompt:** By default, running the script opens an interactive prompt asking if you want to run **All rows** or a **Custom range**.
- **CLI Flags:** You can bypass the interactive prompts by passing direct flags:
  ```bash
  # Execute all rows
  flexiberry run --iter all

  # Execute a custom range of rows (e.g., rows 1 to 5)
  flexiberry run --iter custom --start 1 --end 5
  ```

---

## Step 6: Launch Interactive TUI Mode (`cli`)

The CLI features a terminal user interface (TUI) that acts as an interactive command center.

```bash
flexiberry cli
```
Launching TUI mode opens an interactive terminal menu where you can:
1. Select active workspace files.
2. Build script configurations.
3. Launch execution runs.
4. Monitor test runs in real time (using pause, continue, skip, and stop execution commands).
