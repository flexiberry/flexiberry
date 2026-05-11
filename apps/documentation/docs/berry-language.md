# .berry Language Documentation

The `.berry` language is a custom Domain Specific Language (DSL) tailored specifically for defining, testing, and asserting API workflows. Its syntax is designed to be highly readable, modular, and declarative, resembling plain English while internally running on a strict compiler architecture.

---

## 1. Global Variables (`Var`)

You can define sets of environment-specific or global variables using the `Var` keyword. This is useful for storing credentials, tokens, or configuration endpoints that are accessed repeatedly throughout the tests.

**Syntax:**
```berry
Var @<EnvironmentName> [optional description]
- <key>: '<value>'
```

**Example:**
```berry
Var @UAT global variable
- name: 'rintu'
- age: '10'
```

---

## 2. API Definitions (`Api`)

The `Api` block is used to declare an HTTP endpoint. It encapsulates the request method, URL, headers, and body payload. Once defined, these APIs are reusable across multiple tasks and steps.

**Syntax:**
```berry
Api <METHOD> #<ApiId> [optional description]
Url <endpoint_url>
Header
- <Header-Name>: '<Value>'
Body <Type> `<content>`
```

**Variables in URLs:** Use `{{variableName}}` to indicate variables in URLs that will be interpolated at runtime.

**Example without Body:**
```berry
Api GET #getPetById
Url https://petstore.swagger.io/v2/pet/{{petId}}
Header
- Accept: 'application/json'
```

**Example with Body (`JSON`):**
```berry
Api POST #addPet
Url https://petstore.swagger.io/v2/pet
Header
- Content-Type: 'application/json'
- Accept: 'application/json'
Body JSON `
{
  "id": 1,
  "name": "doggie",
  "status": "available"
}
`
```

---

## 3. Tasks & Steps (`Task`, `Step`)

A `Task` is a collection of `Step`s that represent a complete test scenario or usage workflow. Each `Step` executes an `Api`, captures data from the response, and checks predefined assertions.

**Syntax:**
```berry
Task <description>
Step Call Api <ApiId> [optional description]
Params
- <key>: <value_or_reference>
Capture
- <variable_name>: <json_path_from_response>
Check
- <assertion_expression>
```

### Params
The `Params` block passes dynamic parameters (for URL path parameters, query parameters, etc.) to the API call. You can reference variables captured in previous steps.

### Capture
The `Capture` block extracts values from the JSON response and stores them sequentially. You can reference `response.<field>` to extract data.

### Check
The `Check` block validates the response. It supports evaluating HTTP status codes, body payloads, and variables captured in the `Capture` step. Use the special variable `$.status` representing the HTTP status of the response, and `$.body` representing the raw response body.

**Example Scenario:**
```berry
Task add new pet and find

Step Call Api addPet 
Capture
- id: response.id
- status: response.status
Check
- $.status == 200 OR $.status == 201
- $.body != null
- id != null


Step Call Api getPetById
Params
- petId: Step.1.id
Capture
- id: response.id
- status: response.status
Check
- $.status == 200
- $.body != null
- id == Step.1.id
```

## 4. Multi-file Parsing (`Link`)

The `Link` keyword allows you to import APIs, Variables, and Tasks from external `.berry` files. This helps in modularizing your tests by keeping environment variables, API definitions, and actual tasks in separate files. You can link local files or remote URLs.

**Syntax:**
```berry
Link <path_or_url>
```

**Examples:**
```berry
Link ../envs/production.berry
Link http://domain.com/apis/user_service.berry
```

When a file is linked, its contents are flattened and merged into the main file before execution.

---

## Referencing Values

As seen in the `Params` and `Check` sections, you can dynamically reference the output of previous steps using the syntax `Step.<step_index>.<captured_variable>`. 
For instance, `Step.1.id` will fetch the variable `id` captured during the first Step of the current Task.
