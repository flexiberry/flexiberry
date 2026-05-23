<script lang="ts">
  import { Navigation, Footer } from "$lib";

  const featureGroups = [
    {
      title: "The Berry Language",
      badge: "Language Core",
      color: "from-purple-400 to-indigo-500",
      description:
        "A professional, human-readable scripting grammar designed for testing web APIs without programming boilerplate.",
      items: [
        {
          name: "Natural Syntax Scenarios",
          desc: "Expressive declarations (`Var`, `Api`, `Task`, `Step`, `Check`) that read like plain English, making tests accessible to both developers and QA teams.",
        },
        {
          name: "Interactive Data Captures",
          desc: "Extract nested response values (`Capture - id: response.body.id`) on the fly and pass them dynamically as inputs to subsequent request steps.",
        },
        {
          name: "Dynamic Interpolation",
          desc: "Inject variables and step results effortlessly inside request URLs, headers, and body payloads using standard double-curly brackets syntax (`{{baseUrl}}`).",
        },
        {
          name: "Enterprise Decryption",
          desc: "Secure API keys and passwords directly inside scripts. Flexiberry parses the `Decrypt` pipeline operator and decrypts secrets at runtime.",
        },
        {
          name: "Cross-file Module Linking",
          desc: "Avoid code duplication by linking external definitions (`Link ./auth.berry`) which are dynamically loaded and compiled into the execution plan.",
        },
      ],
    },
    {
      title: "The flexiberry CLI",
      badge: "Automation Tooling",
      color: "from-emerald-400 to-teal-500",
      description:
        "A zero-dependency, ultra-lightweight command-line interface built to ship testing scripts directly into CI/CD pipelines.",
      items: [
        {
          name: "Single Command Executions",
          desc: "Execute scripts in one line: `flexiberry run my-test.berry`. Get instant color-coded outcomes and automated exit codes for pipelines.",
        },
        {
          name: "Data-Driven Row Injection",
          desc: "Feed variables directly via CSV or JSON files. Flexiberry will run data-driven loop sequences automatically for each data row.",
        },
        {
          name: "Script Initialization",
          desc: "Bootstrap a clean, ready-to-run testing project template in a single second using `flexiberry init my-project`.",
        },
        {
          name: "Automated Code Formatting",
          desc: "Enforce consistent layout standards across team codebases using the built-in formatter: `flexiberry format <file>`.",
        },
      ],
    },
    {
      title: "Interactive Web Portal",
      badge: "Web Dashboard",
      color: "from-cyan-400 to-blue-500",
      description:
        "A gorgeous, responsive web portal created to write, format, test, and analyze scripts inside your web browser.",
      items: [
        {
          name: "Live Script Editor",
          desc: "Type or load preset templates inside a dark-mode scratchpad workspace with dynamic indentation and error parsing logs.",
        },
        {
          name: "Real-time Logging Console",
          desc: "Watch step-by-step API requests, validation assertion updates, and warnings output as they occur via an emulated terminal.",
        },
        {
          name: "Double Execution Modes",
          desc: "Toggle between **Dry Run Mode** (simulated mocks with realistic output) and **Live Run Mode** (executing Axios calls straight from the browser).",
        },
        {
          name: "Visual Outcomes Summary",
          desc: "Interactive dashboard displaying pass rates, timing durations, request status codes, and step validation details.",
        },
      ],
    },
  ];

  const possibilities = [
    {
      title: "GitHub Actions CI",
      desc: "Trigger automated API regression tests on every push. Build breakable gates based on exit status codes.",
      icon: "⚡",
    },
    {
      title: "Performance Checks",
      desc: "Assert API timings directly inside step conditions (`response.time < 300ms`) to verify SLA agreements.",
      icon: "⏱",
    },
    {
      title: "Multi-service Integration",
      desc: "Link multiple APIs from different hosts inside a single Task block to test complex cross-domain workflows.",
      icon: "🌐",
    },
  ];
</script>

<svelte:head>
  <title>Flexiberry · Feature Capabilities</title>
  <meta
    name="description"
    content="Explore the full features of the Berry language grammar, the automated CLI runner, and the interactive web playground."
  />
</svelte:head>

<div
  class="min-h-screen bg-gray-950 text-gray-100 font-mono flex flex-col justify-between"
>
  <div>
    <!-- Navigation header -->
    <Navigation />

    <!-- Hero Header -->
    <section class="relative pt-32 pb-16 text-center overflow-hidden">
      <!-- Gradient blobs -->
      <div class="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div
          class="absolute -top-32 left-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[100px]"
        ></div>
        <div
          class="absolute top-48 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[100px]"
        ></div>
      </div>

      <!-- Grid overlay -->
      <div
        class="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.012)_1px,transparent_1px)] bg-[size:40px_40px] z-0 pointer-events-none"
        aria-hidden="true"
      ></div>

      <div class="relative z-10 max-w-3xl mx-auto px-6">
        <span
          class="inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full mb-4"
        >
          Capabilities Overview
        </span>
        <h1
          class="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4"
        >
          All-in-One API <span
            class="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent"
            >Testing Suite</span
          >
        </h1>
        <p
          class="text-slate-400 max-w-lg mx-auto leading-relaxed text-xs md:text-sm"
        >
          Discover the complete grammar specifications of the Berry compiler,
          pipeline automation using CLI command tasks, and real-time execution
          in the browser.
        </p>
      </div>
    </section>

    <!-- Capabilities Details Groups -->
    <section class="max-w-5xl mx-auto px-6 pb-12 relative z-10">
      <div class="flex flex-col gap-16">
        {#each featureGroups as group}
          <div
            class="border border-white/5 bg-gray-900/20 backdrop-blur-md rounded-3xl p-6 md:p-10 flex flex-col gap-6 shadow-xl"
          >
            <!-- Group Header -->
            <div
              class="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-5"
            >
              <div>
                <span
                  class="inline-block text-[9px] uppercase font-extrabold tracking-wider bg-gradient-to-r {group.color} text-gray-950 px-2.5 py-0.5 rounded-full mb-2"
                >
                  {group.badge}
                </span>
                <h2 class="text-2xl font-extrabold text-white tracking-tight">
                  {group.title}
                </h2>
              </div>
              <p class="text-xs text-slate-400 max-w-sm font-sans">
                {group.description}
              </p>
            </div>

            <!-- Grid Items -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {#each group.items as item}
                <div
                  class="bg-gray-950/40 border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-300 flex flex-col gap-2"
                >
                  <h3 class="text-xs font-bold text-emerald-400 tracking-tight">
                    {item.name}
                  </h3>
                  <p
                    class="text-[0.7rem] text-slate-500 font-sans leading-relaxed"
                  >
                    {item.desc}
                  </p>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Endless Possibilities Section -->
    <section class="max-w-5xl mx-auto px-6 pb-24 relative z-10">
      <div
        class="border border-white/5 bg-[#0d1117] rounded-3xl p-8 md:p-10 text-center flex flex-col gap-8 shadow-2xl relative overflow-hidden"
      >
        <!-- Subtle mesh glow -->
        <div
          class="absolute inset-0 bg-radial-gradient(circle at center, rgba(52,211,153,0.03) 0%, transparent 60%) pointer-events-none"
          aria-hidden="true"
        ></div>

        <div>
          <h2
            class="text-xl md:text-2xl font-extrabold text-white tracking-tight"
          >
            Endless Integration Possibilities
          </h2>
          <p class="text-xs text-slate-500 font-sans max-w-md mx-auto mt-2">
            Combine Flexiberry core modules with your existing software
            engineering ecosystem to speed up release testing cycles.
          </p>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative z-10"
        >
          {#each possibilities as item}
            <div
              class="bg-gray-900/50 border border-white/5 rounded-2xl p-6 flex flex-col gap-3"
            >
              <span class="text-2xl select-none">{item.icon}</span>
              <h3 class="text-xs font-bold text-white tracking-wide">
                {item.title}
              </h3>
              <p class="text-[0.7rem] text-slate-500 font-sans leading-relaxed">
                {item.desc}
              </p>
            </div>
          {/each}
        </div>

        <div class="flex flex-wrap items-center justify-center gap-4 mt-4">
          <a
            href="/playground"
            class="bg-gradient-to-r from-emerald-400 to-emerald-600 text-gray-950 font-bold py-2.5 px-6 rounded-xl text-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(52,211,153,0.3)]"
          >
            Launch Playground
          </a>
          <a
            href="/example"
            class="bg-white/5 border border-white/10 hover:bg-white/10 font-bold py-2.5 px-6 rounded-xl text-xs transition-all duration-200"
          >
            View Code Examples
          </a>
        </div>
      </div>
    </section>
  </div>

  <!-- Navigation Footer -->
  <Footer />
</div>

<style>
  .max-w-5xl {
    max-width: 1012px;
  }
</style>
