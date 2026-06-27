# Writing Berry Language: Step-by-Step Tutorial

Welcome to the comprehensive, step-by-step guide on how to write scripts in **Berry DSL** (Domain Specific Language). 

Berry is a clean, indentation-aware scripting language designed to orchestrate sequential API workflows, perform test assertions, and execute automated tasks. It reads like plain English, removes syntax noise like curly braces and semi-colons, and compiles into a strongly-typed Abstract Syntax Tree (AST) before running in an event-driven runtime environment.

Let's learn how to write Berry scripts, moving from the most basic commands to advanced workflows.

---

## Prerequisites
Before writing scripts, make sure you have the CLI installed and a file selected:
```bash
# Create and select your script
flexiberry create my-workflow.berry
flexiberry select my-workflow.berry
```

---

## Step 1: Declaring APIs (Basic)

At its core, a `.berry` script is used to execute HTTP requests. The `Api` keyword defines reusable request specifications.

### Syntax
```berry
Api <METHOD> #<ApiName> [Optional Description]
Url <URL>
Header
- <Header-Key>: '<Header-Value>'
Body <Type> `<Content>`
```

### 1.1 Simple GET Request (No Body)
To declare a standard GET request:
```berry
Api GET #getPetById Fetch pet details from store
Url https://petstore.swagger.io/v2/pet/{{petId}}
Header
- Accept: 'application/json'
```
> [!NOTE]
> `{{petId}}` acts as a placeholder that will be dynamically resolved or interpolated when the API is invoked.

### 1.2 POST Request with JSON Body
For request bodies, Berry supports multiline values enclosed in backticks (`` ` ``):
```berry
Api POST #addPet Add a new pet to the store
Url https://petstore.swagger.io/v2/pet
Header
- Content-Type: 'application/json'
- Accept: 'application/json'
Body JSON `
{
  "id": {{newPetId}},
  "name": "{{newPetName}}",
  "status": "available"
}
`
```

---

## Step 2: Tasks and Steps

Once your APIs are declared, you use **Tasks** to define the sequence of execution. A `Task` contains one or more `Step`s that call the declared APIs.

### Syntax
```berry
Task [Task Description / Title]
  Step Call Api <ApiName> [Optional Step Title]
```

### 2.1 Basic Task Example
Here, we create a task that executes the `#addPet` API declared in Step 1:
```berry
Task Register New Pet
  Step Call Api addPet
```


## Step 3: Variables and Environments

To make workflows dynamic, you can define variables. In Berry, variables are declared in blocks using the `Var` keyword.

### 3.1 Global Variables
Global variables are shared across all tasks and steps in the file:
```berry
Var AppConfig
- newPetId: 9988
- newPetName: "Sherlock"
```

### 3.2 Environment-Specific Variables (`@Pointer`)
You can use the `@` pointer symbol to define variables that only apply to a specific environment:
```berry
Var @UAT Configuration settings for User Acceptance Testing
- baseUrl: "https://uat-api.petstore.io/v2"
- apiKey: "uat-secret-token"

Var @PROD Production endpoint details
- baseUrl: "https://api.petstore.io/v2"
- apiKey: "prod-live-token"
```
When you run your script, the runtime resolves the targeted environment's variables.

---

## Step 4: Dynamic Data Capturing

A workflow often requires taking data from a previous API response and passing it to the next API call. You can extract values using the `Capture` block inside a `Step`.

### 4.1 Capturing Response Data
We use the `response` keyword to extract JSON fields from the API output:
```berry
Task Register and Verify Pet

  Step Call Api addPet
    Capture
    - generatedId: response.id
    - petStatus: response.status
```
Behind the scenes, Berry stores these variables locally in the task execution environment.

### 4.2 Passing Captured Values to the Next Step
To pass a captured value into a subsequent step's API call, use `Step.<index>.<key>` (where `<index>` is the 1-based index of the step within the task):
```berry
Task Register and Verify Pet

  # Step 1: Register Pet
  Step Call Api addPet
    Capture
    - generatedId: response.id

  # Step 2: Fetch the registered Pet using the ID from Step 1
  Step Call Api getPetById
    Params
    - petId: Step.1.generatedId
```

---

## Step 5: Advanced Check Conditions (Assertions)

The `Check` block allows you to run assertions on status codes, response headers, and response payloads.

### 5.1 Simple Checks
Berry supports standard comparison operators: `==`, `!=`, `>`, `<`, `>=`, `<=`.
It also supports special keywords like `null`, `true`, and `false`.

```berry
Step Call Api getPetById
  Check
  - $.status == 200            # $.status refers to the HTTP response status code
  - $.body != null             # $.body refers to the parsed JSON body
```

### 5.2 OR Conditions
You can chain multiple fallback checks on the same line using the `OR` (or `or`) keyword:
```berry
Step Call Api addPet
  Check
  - $.status == 200 OR $.status == 201
```

### 5.3 Asserting Variables
You can also perform assertions against variables captured in previous steps:
```berry
Step Call Api getPetById
  Params
  - petId: Step.1.generatedId
  Capture
  - returnedId: response.id
  Check
  - returnedId == Step.1.generatedId
```

---

## Step 6: Data-Driven Testing (`Input`) (Advanced)

If you need to run the same suite of tasks against multiple rows of data (e.g. from a CSV file), you can use the `Input` keyword.

### 6.1 Defining the Data Source
At the top of your script, declare the path to your CSV or JSON data file:
```berry
Input ./pet-inventory.csv
```

Example `pet-inventory.csv`:
```text
id,name,status
4001,Barky,available
4002,Meow,pending
```

### 6.2 Mapping Row Fields to Variables
Map the fields from each row using `Input.<fieldName>`:
```berry
Var input data mapping with global variable 
- activePetId: Input.id
- activePetName: Input.name

Task Provision Inventory
  Step Call Api addPet
    Params
    - newPetId: activePetId
    - newPetName: activePetName
```
When running the script, the Berry engine will automatically loop through every row in the CSV file, executing the defined tasks sequentially for each row.

---

## Step 7: Encrypted Secrets (`Decrypt`) (Advanced)

Storing plain-text passwords or secret keys in source files is a security risk. Berry offers native variable decryption via the `Decrypt` keyword.

### 7.1 Encrypting Variables
Simply add the `Decrypt` flag at the end of a variable declaration line:
```berry
Var SecureConfig
- adminPassword: 'cGFzc3dvcmQxMjM=' Decrypt
```
When parsed, the compiler flags this variable as encrypted. At runtime, the engine automatically decrypts it.

### 7.2 Decryption Providers
By default, the engine uses **Base64** decryption. However, you can pass a custom `decryptionProvider` programmatically to support KMS, Vault, or AES decryption:
```typescript
import { BerryCore } from "@flexiberry/berrycore";

const runner = new BerryCore(sourceCode, {
  decryptionProvider: (encryptedString) => {
    // Custom decryption logic (e.g., KMS decrypt)
    return customDecrypt(encryptedString);
  }
});
```

---

## Step 8: Multi-File Linking (`Link`) (Advanced)

For large testing suites, keeping all APIs and variables in a single file gets cluttered. You can separate your code into logical modules using the `Link` keyword.

### 8.1 Importing Other Scripts
At the top of your main script, link external `.berry` files:
```berry
Link ../configs/uat-env.berry
Link ../apis/auth-service.berry
Link https://raw.githubusercontent.com/flexiberry/common/main/logging.berry

Task Execute End-To-End Test
  Step Call Api authenticateUser
```

### 8.2 Path Resolution
- **Local files** are resolved relative to the directory containing the active `.berry` file.
- **Remote HTTP/HTTPS URLs** are fetched directly over the network at compile time.
- Linked scripts are parsed recursively, and their variable maps, API registries, and tasks are merged before execution.

---

## Putting It All Together: A Full Script

Here is a complete, production-grade `.berry` script incorporating everything we've learned:

```berry
# 1. Imports and inputs
Link ./common-apis.berry
Input ./test-users.csv

# 2. Environment Configurations
Var @UAT User Acceptance Testing
- apiGateway: 'https://uat-api.myplatform.com'
- authToken: 'YmVhcmVyX3Rva2VuX3VhdF8xMjM=' Decrypt

Var @PROD Production Config
- apiGateway: 'https://api.myplatform.com'
- authToken: 'c2VjcmV0X2xpdmVfcHJvZF90b2tlbg==' Decrypt

# 3. Local Row Variables mapped from CSV
Var ActiveUser
- username: Input.email
- password: Input.password

# 4. APIs specific to this workflow
Api POST #login
Url {{apiGateway}}/auth/login
Header
- Content-Type: 'application/json'
Body JSON `
{
  "email": "{{ActiveUser.username}}",
  "password": "{{ActiveUser.password}}"
}
`

Api GET #getProfile
Url {{apiGateway}}/users/profile
Header
- Authorization: 'Bearer {{sessionToken}}'

# 5. Workflow execution
Task User Authentication Flow

  Step Call Api login Log in user
    Capture
    - sessionToken: response.token
    Check
    - $.status == 200
    - $.body.success == true
    - sessionToken != null

  Step Call Api getProfile Get user profile details
    Params
    - sessionToken: Step.1.sessionToken
    Check
    - $.status == 200
    - $.body.email == ActiveUser.username
```

You are now ready to write clean, advanced, and highly modular API test workflows in Berry language! 🚀
