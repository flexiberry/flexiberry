<script lang="ts">
  import { Navigation, Footer } from "$lib";
</script>

<svelte:head>
  <title>Automating API Workflows in CI/CD · Flexiberry Guides</title>
  <meta
    name="description"
    content="Learn how to automate sequential API test suites in modern CI/CD pipelines using Flexiberry CLI, GitHub Actions, GitLab CI/CD, and environment variables."
  />
</svelte:head>

<div class="min-h-screen bg-gray-950 text-gray-100 font-mono flex flex-col justify-between">
  <div>
    <!-- Navigation header -->
    <Navigation />

    <!-- Hero Header -->
    <section class="relative pt-32 pb-12 overflow-hidden text-center">
      <!-- Gradient blobs -->
      <div class="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px]"></div>
        <div class="absolute top-20 right-10 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px]"></div>
      </div>

      <!-- Grid overlay -->
      <div
        class="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.02)_1px,transparent_1px)] bg-[size:40px_40px] z-0 pointer-events-none"
        aria-hidden="true"
      ></div>

      <div class="relative z-10 max-w-3xl mx-auto px-6">
        <a href="/blog" class="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline mb-4">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Guides
        </a>
        <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
          Automating API Workflows in CI/CD
        </h1>
        <div class="flex items-center justify-center gap-4 text-xs text-slate-500 mb-2">
          <span>Automation</span>
          <span>•</span>
          <span>July 10, 2026</span>
          <span>•</span>
          <span>4 min read</span>
        </div>
      </div>
    </section>

    <!-- Main Content Section -->
    <section class="max-w-3xl mx-auto px-6 pb-24 relative z-10 font-sans">
      <div class="prose prose-invert max-w-none text-slate-300 text-sm md:text-base leading-relaxed flex flex-col gap-8">
        
        <p>
          Automating API tests ensures that endpoints execute predictably across new pull requests and deployments. Because Flexiberry executes locally using standard Node.js libraries, testing is seamlessly compatible with modern CI / CD platforms.
        </p>
        <p>
          Flexiberry uses conventional process exit codes to communicate test status to pipeline runners:
        </p>
        <ul class="list-disc list-inside mt-1 pl-4 flex flex-col gap-1">
          <li><strong><code>0</code></strong>: Success (All conditions, assertions, and tasks passed successfully)</li>
          <li><strong><code>1</code></strong>: Failure (A syntax error, connection failure, or failed assertion check occurred)</li>
        </ul>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">Setting up your Runner</h2>
          <p>
            Before executing Flexiberry workflows in CI/CD, make sure that <code>flexiberry</code> is installed as a development dependency or run directly using <code>npx</code>.
          </p>
          <p class="mt-4">The quickest way to integrate <code>.berry</code> test files natively into pipelines is by executing <code>flexiberry run</code> inside your run scripts:</p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-3 font-mono text-emerald-400"><code># Execute specific script and throw on failure
npx flexiberry run my-api-tests.berry</code></pre>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">💻 GitHub Actions Example</h2>
          <p>
            Below is a sample YAML configuration for integrating <code>.berry</code> scripts into a GitHub Actions workflow. This file triggers on push and pull requests, installs dependencies, and runs the test suite.
          </p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-3 font-mono text-emerald-300"><code>name: API Regression Tests

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
        run: npx flexiberry run testmyapi.berry</code></pre>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">🦊 GitLab CI/CD Example</h2>
          <p>
            For GitLab CI/CD, you can define your <code>.gitlab-ci.yml</code> like this:
          </p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-3 font-mono text-emerald-300"><code>stages:
  - test

api_testing:
  image: node:lts
  stage: test
  script:
    - npm ci
    - npx flexiberry run testmyapi.berry</code></pre>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">Secret Management</h2>
          <p>
            If you have tokens, API keys, or sensitive backend endpoints, use GitHub Secrets or GitLab CI/CD Variables.
          </p>
          <p class="mt-4">
            Since Flexiberry supports <code>.berry</code> variables, you can pipe secrets directly into environment execution variables using the <code>-v</code> (Vars flag) or populate standard <code>process.env</code> variables for retrieval at runtime!
          </p>
        </div>

      </div>
    </section>
  </div>

  <!-- Navigation Footer -->
  <Footer />
</div>
