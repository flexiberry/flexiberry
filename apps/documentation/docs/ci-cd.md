# CI / CD Integration

Automating API tests ensures that endpoints execute predictably across new pull requests and deployments. Because Flexiberry executes locally using standard Node.js libraries, testing is seamlessly compatible with modern CI / CD platforms.

Flexiberry uses conventional process exit codes:
- **`0`**: Success (All conditions, assertions, and tasks passed)
- **`1`**: Failure (A syntax error, connection failure, or failed assertion check occurred)

## Setting up your Runner

Before executing Flexiberry workflows, make sure that `flexiberry` is installed as a development dependency or run directly using `npx`. 

### Running Tests in CI
The quickest way to integrate `.berry` test files natively into pipelines is by executing `flexiberry run` inside your run scripts.

```bash
# Execute specific script and throw on failure
npx flexiberry run my-api-tests.berry
```

---

## 💻 GitHub Actions Example

Below is a sample YAML for integrating `.berry` scripts into a GitHub Actions workflow.

```yaml
name: API Regression Tests

on:
  push:
    branches: [ "main", "staging" ]
  pull_request:
    branches: [ "main" ]

jobs:
  test-apis:
    name: Run Flexiberry Testing
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 'lts/*'

      - name: Install dependencies
        run: npm ci

      - name: Execute .berry Tests
        run: npx flexiberry run testmyapi.berry
```

---

## 🦊 GitLab CI/CD Example

For GitLab, you can define your `.gitlab-ci.yml` like this:

```yaml
stages:
  - test

api_testing:
  image: node:lts
  stage: test
  script:
    - npm ci
    - npx flexiberry run testmyapi.berry
```

---

## Secret Management

If you have tokens, API keys, or sensitive backend endpoints, use GitHub Secrets or GitLab CI/CD Variables. 

Since Flexiberry supports `.berry` variables, you can pipe secrets directly into environment execution variables using `-v` (Vars flag) or populate standard `process.env` structures assuming your setup retrieves them!
