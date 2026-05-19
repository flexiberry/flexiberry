<div align="center">

<img src="./assets/favicon/android-icon-192x192.png" height="100" width="100" alt="FlexiBerry Logo" />

# FlexiBerry

**A powerful, developer-friendly API testing framework built for every team.**

[![Website](https://img.shields.io/badge/website-flexiberry.dev-6C63FF?style=for-the-badge&logo=google-chrome&logoColor=white)](https://flexiberry.dev)
[![Status](https://img.shields.io/badge/status-in%20development-orange?style=for-the-badge&logo=gitbook&logoColor=white)](https://flexiberry.dev)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](./LICENSE.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge&logo=github)](./CONTRIBUTING.md)
[![Node.js](https://img.shields.io/badge/node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

<br/>

> [!WARNING]
> 🚧 **Active Development — Not Production Ready**
>
> FlexiBerry is currently in its **early development phase**. APIs, syntax, and features are subject to **breaking changes** without prior notice. We do **not** recommend using it in production environments yet.
>
> ⭐ **Star this repo** to stay notified as we approach a stable release!

<br/>

[🌐 Website](https://flexiberry.dev) · [📖 Docs](https://docs.flexiberry.dev) · [📦 Installation](#-installation) · [⚡ Quick Start](#-quick-start) · [✨ Features](#-features) · [🤝 Contributing](#-contributing) · [💬 Support](#-support)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Comprehensive Testing** | Functional, load, security, data comparison, and end-to-end API testing |
| 🖥️ **Minimalistic UI** | Clean, distraction-free interface for efficient test management |
| ⚙️ **Customizable Suites** | Build and organize test suites tailored to your workflows |
| ⏱️ **Real-Time Feedback** | Instant results and live progress directly in your terminal |
| 🔗 **CI/CD Integration** | Drop-in support for GitHub Actions, GitLab CI, and more |
| 📂 **External Data Sources** | Load test data from CSV/JSON files with row-by-row iteration |
| 🔐 **Encrypted Fields** | Built-in support for decrypting sensitive credential fields at runtime |

---

## 📦 Installation

### Prerequisites

- **Node.js** `v18+`
- **npm** or **pnpm**

### FlexiBerry CLI

Install the CLI globally to run and manage test suites from anywhere in your terminal:

```bash
# Step 1 — Build the CLI package
cd packages/cli
npm run build

# Step 2 — Install globally
sudo npm i -g .
```

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/flexiberry/flexiberry.git
cd flexiberry

# 2. Install dependencies
npm install

# 3. Launch the CLI
flexiberry
```

Once inside the CLI:
1. Configure your API endpoints
2. Create test cases from the built-in templates
3. Run your suite and watch results stream in real-time

---

## 🛠️ Development Setup

Want to hack on FlexiBerry itself? Here's how to get started:

```bash
# Install all workspace dependencies
npm install

# Run the CLI in development mode
cd packages/cli && npm run dev
```

Refer to our [self-hosting documentation](https://docs.flexiberry.dev/self-hosting) for a full environment setup guide.

---

## 🤝 Contributing

We warmly welcome contributions of all kinds — bug fixes, new features, documentation improvements, and more.

```
1. Fork the repository
2. Create your branch:  git checkout -b feat/your-feature
3. Commit your changes: git commit -m 'feat: add your feature'
4. Push to the branch:  git push origin feat/your-feature
5. Open a Pull Request
```

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for our code of conduct and PR guidelines.

---

## 🔄 Continuous Integration

FlexiBerry uses **GitHub Actions** for automated builds and quality checks on every commit and pull request.

---

## 📜 Changelog

All notable changes are documented in [CHANGELOG.md](CHANGELOG.md).

---

## 📝 License

Distributed under the **MIT License**. See [LICENSE.md](LICENSE.md) for details.

---

## 💬 Support

| Channel | Link |
|---|---|
| 🌐 Website | [flexiberry.dev](https://flexiberry.dev) |
| 📖 Docs | [docs.flexiberry.dev](https://docs.flexiberry.dev) |
| 💬 Discord | [Join our server](https://discord.flexiberry.dev) |
| 🐛 Bug Reports | [GitHub Issues](https://github.com/flexiberry/flexiberry/issues) |
| 💡 Discussions | [GitHub Discussions](https://github.com/flexiberry/flexiberry/discussions) |

---

<div align="center">

Made with ❤️ by the FlexiBerry community · [flexiberry.dev](https://flexiberry.dev) · © 2025 FlexiBerry, Inc.

</div>
