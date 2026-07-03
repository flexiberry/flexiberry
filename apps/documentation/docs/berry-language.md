# .berry Language Reference Specification

The `.berry` language is a Domain Specific Language (DSL) designed for defining, testing, and asserting sequential API workflows. The language is indentation-aware, declarative, and compiles into a strongly-typed Abstract Syntax Tree (AST) before being executed by the Berry Core interpreter.

---

## Editor Support

For syntax highlighting, autocomplete, formatting, and snippets when writing `.berry` scripts, install the official [VS Code Berry Extension on Open VSX](https://open-vsx.org/extension/flexiberry/vscode-berry-extension).

---

## 1. Syntax Overview

- **Indentation:** Nested blocks (like keys under a `Var` or steps under a `Task`) are grouped by indentation. Use spaces (typically 2 or 4) consistently.
- **Comments:** Lines starting with `#` are treated as comments and ignored by the compiler.
- **Quotes:** Single quotes (`'`) or double quotes (`"`) can be used for string values. Multiline strings use backticks (`` ` ``).

---

## 2. Multi-File Composition (`Link`)

The `Link` statement allows you to import external `.berry` scripts. At compile time, the engine recursively resolves links, parses their contents, and merges all variables, API definitions, and tasks into a single flat execution context.

### Syntax
```berry
Link <path_or_url>
```

- **Local Path:** Resolved relative to the directory of the file containing the `Link` statement.
- **Remote URL:** Fetched over HTTP/HTTPS (e.g. `https://example.com/shared.berry`).

### Example
```berry
Link ../common/shared-variables.berry
Link https://raw.githubusercontent.com/flexiberry/assets/main/auth.berry
```

---

## 3. Data-Driven Testing (`Input`)

The `Input` statement defines a CSV or JSON file used as a data source for the script.

### Syntax
```berry
Input <file_path>
```
The file path is resolved relative to the active `.berry` file. When an `Input` statement is present, the runner loops through every record/row in the data source, executing the entire script for each row.

### Example
```berry
Input ./users-data.csv
```

---

## 4. Variables (`Var`)

The `Var` block defines key-value variables. Variables can be declared with pointers, decryption keys, and input mappings.

### Syntax
```berry
Var [@Pointer] [Optional Title]
- <key>: <value> [Decrypt]
```

### 4.1 Global Scope Variables
Standard variables available globally in the script.
```berry
Var AppConfig
- environment: 'staging'
- timeout_ms: 10000
```

### 4.2 Environmental Pointers (`@Pointer`)
You can define variables targeted for a specific environment using the `@` pointer symbol. The title acts as a description for the environment.
```berry
Var @UAT User Acceptance Testing Environment Config
- gatewayUrl: 'https://uat-api.example.com'

Var @PROD Production Config
- gatewayUrl: 'https://api.example.com'
```

### 4.3 Data Source Variable Mapping (`Input.<field>`)
When a data-driven `Input` file is declared, you can map row fields to variables using `Input.<fieldName>`.
```berry
Var UserData
- activeEmail: Input.email
- activeUserId: Input.id
```

### 4.4 Encrypted Variables (`Decrypt`)
Variables flagged with `Decrypt` are processed through the decryption provider. The default provider assumes Base64 decryption, but custom providers (like KMS or Vault) can be defined programmatically.
```berry
Var SecureCredentials
- clientSecret: 'c2VjcmV0MTIz' Decrypt # Decrypts to 'secret123'
```

---

## 5. API Declarations (`Api`)

An `Api` block defines an HTTP endpoint configuration. It encapsulates the request method, URL, headers, and body payloads.

### Syntax
```berry
Api <METHOD> #<ApiName> [Optional Description]
Url <endpoint_url>
Header
- <Header-Key>: '<Header-Value>'
Body <Type> `<content>`
```

### 5.1 Properties
- **`<METHOD>`:** `GET` | `POST` | `PUT` | `PATCH` | `DELETE`
- **`#<ApiName>`:** Unique identifier preceded by a `#` symbol.
- **`Url`:** The target URL. Supports placeholder interpolation using `{{variableName}}`.
- **`Header`:** Sub-block containing request headers as key-value pairs. Supports placeholder interpolation.
- **`Body <Type>`:** Declares the body type (typically `JSON`, `XML`, or `FORM`) followed by a backtick-wrapped multiline string. Supports placeholder interpolation.

### Example
```berry
Api POST #createUser Register a new account
Url {{gatewayUrl}}/v1/users
Header
- Content-Type: 'application/json'
- Authorization: 'Bearer {{authToken}}'
Body JSON `
{
  "email": "{{UserData.activeEmail}}",
  "status": "pending"
}
`
```

---

## 6. Tasks & Steps (`Task`, `Step`)

Tasks represent executable testing suites. A `Task` contains sequential `Step`s that call defined APIs, apply dynamic request overrides, capture outputs, and execute assertions.

### 6.1 Task Structure
```berry
Task [Task Description]
  Step Call Api <ApiName> [Optional Step Description]
```

### 6.2 Step Block Modifiers
Inside a `Step`, three modifier sub-blocks can be defined:
1. **`Params`**: Dynamic parameters passed to the API. Values can be hardcoded strings or references to variables.
2. **`Capture`**: Extract values from the API's JSON response and store them in the local Task scope.
3. **`Check`**: Perform conditional validations on the HTTP response.

### Example
```berry
Task User Creation Flow

  Step Call Api login User login
    Params
    - username: 'admin'
    - password: 'password123'
    Capture
    - token: response.token
    Check
    - $.status == 200
    - $.body.success == true

  Step Call Api createUser Register user
    Params
    - authToken: Step.1.token
    Capture
    - userId: response.id
    Check
    - $.status == 201
```

---

## 7. Expressions and Assertions

Assertions inside the `Check` block allow you to validate response status codes, header fields, and JSON payloads.

### 7.1 Special Reference Identifiers
- **`$.status`:** Refers to the HTTP response status code (e.g. `200`).
- **`$.body`:** Refers to the raw response body.
- **`response.<path>`:** Resolves nested properties from the parsed JSON response payload (e.g. `response.data.id`).

### 7.2 Response Path Resolution Syntax (Capture and Check)

When extracting values in a `Capture` block or validating them in a `Check` block, the engine normalizes paths to prevent prefix conflicts:

| Target | Recommended Syntax | Alternative / Legacy | Details |
| :--- | :--- | :--- | :--- |
| **HTTP Status Code** | `$.status` | `response.status` | Resolves to the HTTP response status integer (e.g., `200`). |
| **HTTP Headers** | `$.headers.<name>` | `response.headers.<name>` | Resolves to the specified HTTP header value (case-insensitive). |
| **Response Body** | `$.body` | `response.body` | Resolves to the deserialized response body (object or array). |
| **Nested Body Property** | `$.body.id` | `response.body.id`, `response.id`, `$.id` | Resolves properties from the JSON response body. |
| **Array Indexes** | `$.body.items.0.id` | `response.body.items.0.id` | Resolves index elements inside lists/arrays. |

> [!IMPORTANT]
> **Resolving Naming Conflicts in API Bodies**
> If your API response body itself contains a field named `"status"` or `"headers"` (e.g., `{ "status": "active" }`), you **must** use the explicit **`$.body.status`** (or `response.body.status`) path syntax to access it. Using `$.status` or `response.status` is strictly reserved for the HTTP status code.

### 7.3 Captured Variable Scope & Referencing
When you capture a variable (e.g. `- id: $.body.id`):
1. **Short Reference:** The variable is declared directly in the task scope as `id`, allowing you to reference it as `{{id}}` in subsequent steps or use it in the current step's checks as `id != null`.
2. **Step Reference:** The variable is also declared as `Step.<index>.<key>` (e.g. `Step.1.id`) where `<index>` is the 1-based index of the step that captured it. This ensures you can access values uniquely across multiple steps even if they capture matching variable keys (e.g. `id == Step.1.id`).

### 7.4 Variable Scopes & Hierarchy
When resolving expressions and placeholders (`{{varName}}`), the engine searches in the following order:
1. **Step Environment (`stepEnv`)**: Resolves step parameters and response properties (like `$.status` and `$.body`).
2. **Task Environment (`taskEnv`)**: Resolves step outputs captured from previous steps using the syntax `Step.<Step-Index>.<Captured-Key>` (e.g. `Step.1.token`), as well as short-name variables.
3. **Global Environment (`globalEnv`)**: Resolves variables defined in global `Var` blocks.

### 7.5 Assertions (`Check`) Syntax
The check block executes a list of assertions. All assertions must evaluate to `true` for the step to pass.

#### Supported Operators
- `==` (Equality)
- `!=` (Inequality)
- `>` (Greater than)
- `<` (Less than)
- `>=` (Greater than or equal to)
- `<=` (Less than or equal to)

#### Boolean/Null Keywords
- `true`
- `false`
- `null`

#### Logical OR Chaining
Multiple fallback conditions can be chained on a single line using the `OR` or `or` keyword. The assertion passes if any of the chained conditions evaluate to `true`.
```berry
Check
- $.status == 200 OR $.status == 201
- $.body.role == "admin" or $.body.role == "moderator"
```
