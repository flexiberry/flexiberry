# Spring Boot Native Integration

Generate type-safe Flexiberry (`.berry`) sequential workflow specifications directly from your existing Spring Boot backend controllers, annotations, and route handlers.

---

## 💡 Overview

Writing and synchronizing API workflow tests with backend controllers is notoriously error-prone. When endpoints, parameters, or DTO models change in your backend, manual test scripts quickly drift and break.

The **Flexiberry Spring Boot Starter** (`flexiberry-spring-boot-starter`) solves this by introspecting your Spring Web controllers directly at compile-time or runtime:
- **Zero Intermediate JSON:** Generates clean, native `.berry` files directly.
- **Annotation & Type Introspection:** Automatically maps `@PathVariable`, `@RequestParam`, `@RequestHeader`, and `@RequestBody`.
- **Automatic DTO Mock Synthesis:** Generates sample JSON payloads from Java Records and POJOs.
- **Sequential Multi-API Workflow Inference:** Detects resource CRUD patterns and automatically chains them into complete `Task` test suites with response captures and assertions (`POST` &rarr; capture ID &rarr; `GET /{id}` &rarr; `PUT /{id}` &rarr; `DELETE /{id}`).
- **Dual Trigger Modes:** Generate via JUnit 5 tests on build, or download live specs on-the-fly via `GET /flexiberry/export.berry`.

---

## 📦 Installation

Add the `flexiberry-spring-boot-starter` dependency to your Spring Boot project (compatible with Spring Boot 3.x and Java 17+):

### Maven (`pom.xml`)

```xml
<dependency>
    <groupId>io.flexiberry</groupId>
    <artifactId>flexiberry-spring-boot-starter</artifactId>
    <version>0.1.0-SNAPSHOT</version>
    <scope>test</scope> <!-- Or compile/runtime if using the live HTTP export endpoint -->
</dependency>
```

### Gradle (`build.gradle`)

```groovy
testImplementation 'io.flexiberry:flexiberry-spring-boot-starter:0.1.0-SNAPSHOT'
```

---

## ⚙️ Configuration

Configure the starter in `application.yml` or `application.properties`:

```yaml
flexiberry:
  # Enable or disable the generator (default: true)
  enabled: true

  # Base URL prefixed to endpoints (default: http://localhost:8080)
  base-url: "http://localhost:8080"

  # Target directory where generated .berry files are written
  output-dir: "src/test/resources/flexiberry"

  # Default generated filename
  file-name: "application.berry"

  # Split into separate files per controller and import via Link (default: false)
  split-by-controller: false

  # Automatically write .berry spec on application startup (default: false)
  generate-on-startup: false

  # Automatically infer sequential multi-API CRUD workflows (default: true)
  infer-workflows: true

  # Expose live export endpoint at /flexiberry/export.berry (default: true)
  export-endpoint-enabled: true

  # Optional package filter (restrict scanning to specific controllers)
  base-packages:
    - "com.example.demo.controller"
```

---

## 📁 Modular Multi-File Generation (`split-by-controller`)

By default (`split-by-controller: false`), all discovered controllers, APIs, and workflows are written into a single consolidated file (e.g. `application.berry`).

When your application grows and has many controllers, you can enable modular file separation:

```yaml
flexiberry:
  split-by-controller: true
  output-dir: "src/test/resources/flexiberry"
  file-name: "application.berry"
```

When `split-by-controller: true` is configured, the generator:
1. Emits an isolated `.berry` file for each controller inside a `controllers/` subfolder (e.g. `user-controller.berry`, `order-controller.berry`).
2. Generates the main entry file (`application.berry`) that imports each controller module using Berry's native `Link` statement:

```
src/test/resources/flexiberry/
├── application.berry           # Root entry file importing controller modules
└── controllers/
    ├── user-controller.berry   # UserController APIs & CRUD workflow
    └── order-controller.berry  # OrderController APIs & CRUD workflow
```

#### Generated Root File (`application.berry`)
```berry
## ------------------------------------------------------------------
## FLEXIBERRY ROOT WORKFLOW SPECIFICATION
## Auto-generated from Spring Boot application controllers
## ------------------------------------------------------------------

Link ./controllers/user-controller.berry
Link ./controllers/order-controller.berry
```

When you execute `flexiberry run application.berry`, Berry's compiler recursively resolves the `Link` statements and combines all modules into an unified execution context.

---

## 🚀 How It Works

### 1. Spring Annotation Mapping

The scanner inspects Spring MVC's `RequestMappingHandlerMapping` and translates annotations into Flexiberry DSL primitives:

| Spring Boot Construct | Flexiberry AST / DSL Equivalent |
| :--- | :--- |
| `@RestController` / `@RequestMapping("/api/v1/users")` | Resource group & base endpoint path |
| `@PostMapping` / `@GetMapping` / `@DeleteMapping` | `Api POST #create`, `Api GET #getById`, `Api DELETE #delete` |
| `@PathVariable("id") UUID id` | Path parameter substitution: <code v-pre>/api/v1/users/{{id}}</code> |
| `@RequestParam(defaultValue = "1") int page` | Query parameter with variable token: <code v-pre>?page={{page}}</code> |
| `@RequestBody CreateUserDto dto` | Synthesized `Body JSON` template with realistic mock values |
| `@RequestHeader("X-Tenant-Id") String tenant` | `Header` entry: `- X-Tenant-Id: '...'` |

### 2. Multi-API Sequential Workflow Inference

Beyond standalone endpoint declarations, the integration detects full resource lifecycles on the same controller and chains them into stateful workflows:

1. **Step 1 (`POST`):** Calls the create endpoint, captures `createdId: response.body.id`, and verifies `createStatus == 201 OR createStatus == 200`.
2. **Step 2 (`GET /{id}`):** Piped into `Params - id: createdId` and asserts `$.status == 200` and `response.body.id == createdId`.
3. **Step 3 (`PUT /{id}`):** Injects `id: createdId` and validates update response.
4. **Step 4 (`DELETE /{id}`):** Injects `id: createdId` and asserts HTTP 204 or 200.

---

## 💻 Usage Patterns

### Pattern A: Test-Time Generation (Recommended for CI)

Write a simple Spring Boot test that generates and refreshes your `.berry` test files whenever your backend tests run:

```java
package com.example.demo;

import io.flexiberry.springboot.FlexiberryGeneratorService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;

@SpringBootTest
class FlexiberryExportTest {

    @Autowired
    private FlexiberryGeneratorService generatorService;

    @Test
    void exportFlexiberryWorkflows() throws IOException {
        // Writes application.berry to src/test/resources/flexiberry/
        generatorService.writeDefaultBerryFile();
    }
}
```

Then run it with Maven or Gradle:
```bash
./mvnw test -Dtest=FlexiberryExportTest
```

### Pattern B: Live Export via HTTP

When running your application locally or in a dev environment, fetch the latest `.berry` specification directly using `curl` or your browser:

```bash
curl http://localhost:8080/flexiberry/export.berry -o generated-spec.berry
```

You can then run the generated workflow immediately with the Flexiberry CLI:
```bash
npx flexiberry run generated-spec.berry
```

---

## 📝 End-to-End Example

### Spring Boot Controller

```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    public record CreateUserDto(String username, String email, String role) {}
    public record UpdateUserDto(String email, boolean active) {}
    public record UserResponse(UUID id, String username, String email, String role) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<UserResponse> create(@RequestBody CreateUserDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new UserResponse(UUID.randomUUID(), dto.username(), dto.email(), dto.role()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(new UserResponse(id, "sample_user", "user@example.com", "USER"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(@PathVariable("id") UUID id, @RequestBody UpdateUserDto dto) {
        return ResponseEntity.ok(new UserResponse(id, "sample_user", dto.email(), "USER"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") UUID id) {
        return ResponseEntity.noContent().build();
    }
}
```

### Emitted `.berry` Specification

The integration directly outputs the following specification:

```berry
## ------------------------------------------------------------------
## FLEXIBERRY WORKFLOW SPECIFICATION
## Auto-generated from Spring Boot application controllers
## ------------------------------------------------------------------

Api POST #create Create (UserController.create)
Url http://localhost:8080/api/v1/users
Header
- Content-Type: 'application/json'
- Accept: 'application/json'
Body JSON `
{
  "username" : "sample_string",
  "email" : "sample_string",
  "role" : "sample_string"
}
`

Api GET #getById Get by id (UserController.getById)
Url http://localhost:8080/api/v1/users/{{id}}
Header
- Accept: 'application/json'

Api PUT #update Update (UserController.update)
Url http://localhost:8080/api/v1/users/{{id}}
Header
- Content-Type: 'application/json'
- Accept: 'application/json'
Body JSON `
{
  "email" : "sample_string",
  "active" : true
}
`

Api DELETE #delete Delete (UserController.delete)
Url http://localhost:8080/api/v1/users/{{id}}
Header
- Accept: 'application/json'

## ------------------------------------------------------------------
## INFERRED SEQUENTIAL MULTI-API TASKS
## ------------------------------------------------------------------

Task User Lifecycle Workflow
    Step Call Api create
        Capture
        - createdId: response.body.id
        - createStatus: response.status
        Check
        - createStatus == 201 OR createStatus == 200
        - createdId != null
    Step Call Api getById
        Params
        - id: createdId
        Check
        - $.status == 200
        - response.body.id == createdId
    Step Call Api update
        Params
        - id: createdId
        Check
        - $.status == 200
    Step Call Api delete
        Params
        - id: createdId
        Check
        - $.status == 204 OR $.status == 200
```

---

## 🔄 Automated CI Pipeline Integration

Combine Spring Boot test generation with the Flexiberry CLI runner in your continuous integration pipeline:

```yaml
# GitHub Actions example
- name: Run Spring Boot Tests & Generate Berry Specs
  run: ./mvnw test

- name: Execute Sequential Flexiberry Regression Tests
  run: npx flexiberry run src/test/resources/flexiberry/application.berry
```
