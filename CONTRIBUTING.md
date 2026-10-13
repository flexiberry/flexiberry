# Contributing to FlexiBerry

First off, thank you for taking the time to contribute to FlexiBerry! 🎉

FlexiBerry is an open-source, developer-first HTTP client and sequential API testing framework. Whether you are fixing a typo in the documentation, reporting a bug, or adding a major feature to the core DSL engine or CLI, all contributions are welcome.

---

## Code of Conduct

This project and everyone participating in it are governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this standard of conduct. Please report any unacceptable behavior to [rinturajc@gmail.com](mailto:rinturajc@gmail.com).

---

## Monorepo Overview

FlexiBerry is organized as a `pnpm` monorepo containing multiple packages and applications:

```text
flexiberry/
├── packages/
│   ├── berrycore/              # Core DSL parser, execution runner, and state engine
│   ├── cli/                    # CLI runner for .berry files & test suites
│   ├── language-server/        # LSP server powering editor intelligence
│   └── vscode-berry-extension/ # Visual Studio Code extension
├── apps/
│   ├── app/                    # FlexiBerry interactive Web UI
│   ├── documentation/          # Documentation portal (docs.flexiberry.dev)
│   └── website/                # Project landing page (flexiberry.dev)
```

---

## Getting Started (Local Development)

### Prerequisites
- **Node.js**: `18.x` or later
- **Package Manager**: [pnpm](https://pnpm.io/) (`corepack enable` or `npm install -g pnpm`)
- **Git**

### 1. Fork & Clone
1. Fork the repository on GitHub: [https://github.com/flexiberry/flexiberry](https://github.com/flexiberry/flexiberry)
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/flexiberry.git
   cd flexiberry
   ```
3. Set upstream remote:
   ```bash
   git remote add upstream https://github.com/flexiberry/flexiberry.git
   ```

### 2. Install Dependencies
Install all workspace dependencies using `pnpm`:
```bash
pnpm install
```

### 3. Running Packages in Development Mode

Depending on what you are working on, you can run individual workspaces:

- **CLI Development**:
  ```bash
  pnpm --filter @flexiberry/cli dev
  ```
- **BerryCore (Engine & Parser)**:
  ```bash
  pnpm --filter @flexiberry/berrycore watch
  ```
- **Interactive Web App**:
  ```bash
  pnpm --filter @flexiberry/app dev
  ```
- **Documentation Site**:
  ```bash
  pnpm run dev:doc
  ```
- **Landing Website**:
  ```bash
  pnpm run dev:website
  ```

### 4. Building and Linting
- Build all packages:
  ```bash
  pnpm build
  ```
- Check code style and linting:
  ```bash
  pnpm lint:check
  ```
- Automatically fix linting issues:
  ```bash
  pnpm lint
  ```

---

## How Can I Contribute?

### Looking for Good First Issues
If you are new to FlexiBerry, look for issues with the [`good first issue`](https://github.com/flexiberry/flexiberry/labels/good%20first%20issue) label. These are self-contained tasks curated specifically to help newcomers get familiar with the codebase.

### Reporting Bugs
Before filing an issue, please check existing open issues to avoid duplicates. When opening a bug report, use our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md) and include:
- A concise description of the bug.
- Minimal reproducible steps (including `.berry` snippets if applicable).
- Expected vs. actual behavior.
- Operating system, Node version, and FlexiBerry package version.

### Suggesting Enhancements
Feature requests and architectural ideas are very welcome:
- Check existing issues and [GitHub Discussions](https://github.com/flexiberry/flexiberry/discussions).
- Open an issue using the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md).
- Clearly describe the problem you want to solve, your suggested approach, and any potential tradeoffs.

### Pull Request (PR) Workflow
1. **Create a branch**:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```
2. **Make your changes**: Keep commits scoped and logically separated.
3. **Follow conventional commits**:
   - `feat: add environment variable inheritance to CLI runner`
   - `fix: correct regex variable interpolation in berry parser`
   - `docs: update quickstart guide with auth examples`
   - `test: add unit tests for assertion engine`
4. **Verify your changes**:
   ```bash
   pnpm lint:check
   pnpm build
   ```
5. **Push and open a PR**:
   ```bash
   git push origin feat/your-feature-name
   ```
   Submit the pull request against the `main` branch (or active release branch) with a descriptive summary using the PR template.

---

## Communication & Community

Need help or want to discuss ideas before coding?
- 💬 **GitHub Discussions**: [flexiberry/flexiberry/discussions](https://github.com/flexiberry/flexiberry/discussions)
- 🎮 **Discord Community**: [discord.flexiberry.dev](https://discord.flexiberry.dev)
- 📧 **Direct Contact / Security Inquiries**: [rinturajc@gmail.com](mailto:rinturajc@gmail.com)

Thank you for helping make FlexiBerry better for developers everywhere! 🚀
