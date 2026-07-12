<script lang="ts">
  import { Navigation, Footer } from "$lib";
</script>

<svelte:head>
  <title>CLI Quick Start Guide · Flexiberry Guides</title>
  <meta
    name="description"
    content="Follow the official Flexiberry CLI Quick Start guide to install, create, configure, and execute your first sequential API test script."
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
          CLI Quick Start Guide
        </h1>
        <div class="flex items-center justify-center gap-4 text-xs text-slate-500 mb-2">
          <span>Tutorial</span>
          <span>•</span>
          <span>July 12, 2026</span>
          <span>•</span>
          <span>3 min read</span>
        </div>
      </div>
    </section>

    <!-- Main Content Section -->
    <section class="max-w-3xl mx-auto px-6 pb-24 relative z-10 font-sans">
      <div class="prose prose-invert max-w-none text-slate-300 text-sm md:text-base leading-relaxed flex flex-col gap-8">
        
        <p>
          Welcome to the <strong>Flexiberry</strong> Quick Start guide! This tutorial will help you install the command-line interface, initialize your first API test script, and run it locally in just a few minutes.
        </p>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">1. Installation</h2>
          <p>
            Flexiberry is distributed as two packages on npm, alongside an editor extension:
          </p>
          <ul class="list-disc list-inside mt-2 flex flex-col gap-1.5 pl-4">
            <li>🌐 <strong>FlexiBerry CLI</strong>: <a href="https://www.npmjs.com/package/@flexiberry/cli" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:underline">@flexiberry/cli on npm</a> - The interactive command-line interface.</li>
            <li>🧠 <strong>BerryCore Engine</strong>: <a href="https://www.npmjs.com/package/@flexiberry/berrycore" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:underline">@flexiberry/berrycore on npm</a> - The programmatic test execution engine.</li>
            <li>🔌 <strong>VS Code Extension</strong>: <a href="https://open-vsx.org/extension/flexiberry/vscode-berry-extension" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:underline">VS Code Berry Extension on Open VSX</a> - Official editor support providing syntax highlighting, snippets, formatting, and autocomplete.</li>
          </ul>

          <div class="bg-purple-950/20 border border-purple-500/20 rounded-xl p-4 my-4 flex gap-3 text-xs leading-relaxed text-purple-200">
            <span class="text-base">💡</span>
            <div>
              <strong>Important:</strong> Be sure to install the CLI (<code>@flexiberry/cli</code>) and <strong>not</strong> the core engine (<code>@flexiberry/berrycore</code>) for terminal usage. The CLI provides the global command-line tool, whereas the core engine is for programmatic integration inside Node.js applications.
            </div>
          </div>

          <p class="mt-4">To use the tool from your terminal, you should install the CLI package globally:</p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-3 font-mono text-emerald-400"><code># Using npm
npm install -g @flexiberry/cli

# Using pnpm
pnpm install -g @flexiberry/cli</code></pre>

          <p class="mt-4">Verify the installation by running:</p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-3 font-mono text-emerald-400"><code>flexiberry --version</code></pre>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">2. Create Your First Test Script</h2>
          <p>
            You can create a new <code>.berry</code> script by using the <code>create</code> command:
          </p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-3 font-mono text-emerald-400"><code>flexiberry create my-first-api.berry</code></pre>
          <p class="mt-2">This will scaffold a pre-formatted, empty <code>.berry</code> script in your current directory.</p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">3. Selecting a File (Interactive Mode)</h2>
          <p>
            Rather than passing the file explicitly to every command, you can "select" a script locally to serve as your active workspace:
          </p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-3 font-mono text-emerald-400"><code>flexiberry select my-first-api.berry</code></pre>
          <p class="mt-2">
            Any subsequent commands you execute using the CLI will automatically target this active file!
          </p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">4. Add an API Endpoint</h2>
          <p>
            Let's quickly add a new API definition to your active file. We'll use a sample JSON-based GET request:
          </p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-3 font-mono text-emerald-400"><code>flexiberry add api getSampleData -u "https://jsonplaceholder.typicode.com/todos/1" -m "GET"</code></pre>
          <p class="mt-4">You can also import existing APIs from cURL requests easily if you prefer:</p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-3 font-mono text-emerald-400"><code>flexiberry add api fromCurl -c "curl -X GET https://jsonplaceholder.typicode.com/todos/1"</code></pre>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">5. Add a Test Task</h2>
          <p>
            Next, add a task containing a step that calls the newly created API. Open <code>my-first-api.berry</code> and add the task block:
          </p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-3 font-mono text-emerald-300"><code>Task Verify Sample Data
Step Call Api getSampleData
Capture
- id: response.id
Check
- $.status == 200
- $.body != null</code></pre>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">6. Run Your Tests</h2>
          <p>
            Once everything is wired up, you can execute the test engine:
          </p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-3 font-mono text-emerald-400"><code>flexiberry run my-first-api.berry</code></pre>
          <p class="mt-4">
            If your tests are successful, the engine will display a table of passes. Any invalid assertions will be flagged for investigation.
          </p>
        </div>

      </div>
    </section>
  </div>

  <!-- Navigation Footer -->
  <Footer />
</div>
