# Flexiberry Spring Boot Starter

Generate type-safe Flexiberry workflow specifications (`.berry`) directly from your existing Spring Boot controllers, annotations, and route handlers.

---

## 🍓 Features

- **Direct `.berry` DSL Generation:** Zero intermediate JSON configuration — emits native `.berry` files directly.
- **Introspective Controller Scanning:** Detects `@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping`, `@PutMapping`, `@PatchMapping`, and `@DeleteMapping`.
- **Parameter & Variable Mapping:**
  - Converts `@PathVariable` into native Berry parameter tokens: `/api/v1/users/{id}` &rarr; `/api/v1/users/{{id}}`.
  - Maps `@RequestParam` into query string parameter tokens.
  - Automatically handles `@RequestHeader` constraints.
- **DTO Sample Body Inference:** Introspects Java Records and POJO classes to create pretty-printed sample `Body JSON` payloads with mock values.
- **Sequential Multi-API CRUD Inference:** Automatically detects resource CRUD patterns and synthesizes complete `Task <Resource> Lifecycle Workflow` test suites with `Capture`, `Params`, and `Check` response assertions.
- **Live HTTP Export Endpoint:** Exposes `GET /flexiberry/export.berry` for instant download or CLI import.
- **Build/Startup Trigger:** Optional startup generation writing directly to `src/test/resources/flexiberry/`.

---

## 📦 Installation

### Maven
```xml
<dependency>
    <groupId>io.flexiberry</groupId>
    <artifactId>flexiberry-spring-boot-starter</artifactId>
    <version>0.1.0-SNAPSHOT</version>
    <scope>test</scope> <!-- Or runtime scope if using the export endpoint -->
</dependency>
```

### Gradle
```groovy
testImplementation 'io.flexiberry:flexiberry-spring-boot-starter:0.1.0-SNAPSHOT'
```

---

## 🛠️ Building & Using Locally via Local Maven

If you are developing locally or testing the starter in your local Spring Boot applications:

### 1. Build & Install to Local Maven Cache (`~/.m2/repository`)

Run the following command from the `integrations/spring-boot` directory:

```bash
# Build, run tests, and install to local ~/.m2/repository
mvn clean install

# Or skip tests during build if preferred
mvn clean install -DskipTests
```

This compiles, packages the JAR, and installs `io.flexiberry:flexiberry-spring-boot-starter:0.1.0-SNAPSHOT` into your local machine's Maven repository at:
`~/.m2/repository/io/flexiberry/flexiberry-spring-boot-starter/0.1.0-SNAPSHOT/`

### 2. Consume in Your Local Spring Boot App

#### Maven (`pom.xml`)
Add the dependency directly to your application's `pom.xml`:

```xml
<dependency>
    <groupId>io.flexiberry</groupId>
    <artifactId>flexiberry-spring-boot-starter</artifactId>
    <version>0.1.0-SNAPSHOT</version>
    <scope>test</scope> <!-- Or runtime if using the live /flexiberry/export.berry endpoint -->
</dependency>
```

Maven automatically resolves SNAPSHOT artifacts from your local `~/.m2/repository`. If your project enforces remote repositories, ensure local snapshots are enabled:

```xml
<repositories>
    <repository>
        <id>local-m2</id>
        <url>file://${user.home}/.m2/repository</url>
        <snapshots>
            <enabled>true</enabled>
            <updatePolicy>always</updatePolicy>
        </snapshots>
    </repository>
</repositories>
```

#### Gradle (`build.gradle`)
Ensure `mavenLocal()` is included under `repositories`:

```groovy
repositories {
    mavenLocal()
    mavenCentral()
}

dependencies {
    testImplementation 'io.flexiberry:flexiberry-spring-boot-starter:0.1.0-SNAPSHOT'
}
```

---

## ⚙️ Configuration

Configure generation options in `application.yml` or `application.properties`:

```yaml
flexiberry:
  enabled: true
  base-url: "http://localhost:8080"
  use-base-url-variable: true
  base-url-variable-name: "baseUrl"
  output-dir: "src/test/resources/flexiberry"
  file-name: "application.berry"
  split-by-controller: true
  generate-on-startup: false
  # Generate lifecycle tasks for each controller (default: true)
  infer-workflows: true # or generate-tasks: true
  export-endpoint-enabled: true
  base-packages:
    - "com.example.demo.controller"
```

---

## 🚀 Usage

### 1. In a JUnit 5 / Spring Boot Test

```java
@SpringBootTest
class FlexiberryExportTest {

    @Autowired
    private FlexiberryGeneratorService generatorService;

    @Test
    void exportBerryWorkflows() throws IOException {
        // Writes application.berry to configured output directory
        generatorService.writeDefaultBerryFile();
    }
}
```

### 2. Live Dev Export via HTTP

When the Spring Boot application is running:
```bash
curl http://localhost:8080/flexiberry/export.berry -o my-api.berry
```

---

## 📄 Example Output

Given a Spring Boot controller:
```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    @PostMapping public ResponseEntity<UserResponse> create(@RequestBody CreateUserDto dto) { ... }
    @GetMapping("/{id}") public ResponseEntity<UserResponse> getById(@PathVariable("id") UUID id) { ... }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable("id") UUID id) { ... }
}
```

The starter produces:
```berry
Var AppConfig
    - baseUrl: 'http://localhost:8080'

Api POST #create Create (UserController.create)
Url {{baseUrl}}/api/v1/users
Header
- Content-Type: 'application/json'
- Accept: 'application/json'
Body JSON `
{
  "username" : "sample_string",
  "email" : "sample_string"
}
`

Api GET #getById Get by id (UserController.getById)
Url {{baseUrl}}/api/v1/users/{{id}}
Header
- Accept: 'application/json'

Api DELETE #delete Delete (UserController.delete)
Url {{baseUrl}}/api/v1/users/{{id}}
Header
- Accept: 'application/json'

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
    Step Call Api delete
        Params
        - id: createdId
        Check
        - $.status == 204 OR $.status == 200
```
