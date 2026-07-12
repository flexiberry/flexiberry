<script lang="ts">
  import { Navigation, Footer } from "$lib";

  // Actual Release Data from Git History
  const releases = [
    {
      version: "v0.1.6 / v1.0.7",
      date: "July 12, 2026",
      badge: "Latest Release",
      badgeColor: "from-emerald-400 to-teal-500",
      title: "Core & SEO Optimization",
      summary:
        "This release consolidates dependencies across the monorepo packages, refines the custom `.berry` lexer/parser core, and integrates advanced SEO features including canonical links, sitemaps, and site navigation schemas on the website.",
      categories: [
        {
          name: "Features & Additions",
          items: [
            "Integrated dynamic canonical URL link tag generation for the website landing page and blog guides.",
            "Added structured Site Navigation JSON-LD schema to website root layout to optimize search engine sitelinks.",
            "Added external documentation and app URLs to sitemap with dynamic location logic.",
            "Updated `.berry` file associations in VS Code extension with custom icons and firstLine configuration.",
          ],
        },
        {
          name: "Improvements & Fixes",
          items: [
            "Refined lexer grammar engine loop safety to prevent infinite parse loops.",
            "Sanitized filename outputs and vsix directories in the publishing workflow.",
          ],
        },
      ],
    },
    {
      version: "v0.1.5 / v1.0.5",
      date: "July 2026",
      badge: "Major Milestone",
      badgeColor: "from-purple-400 to-indigo-500",
      title: "Tauri Web IDE, LSP & CLI Standalone Execution",
      summary:
        "This milestone represents the culmination of a 270-commit journey starting from the original monorepo setup (b3f4a1f). It bridges the custom .berry DSL with the Tauri Desktop IDE, an interactive CLI client, and a dedicated VS Code Extension powered by a custom Language Server (LSP).",
      categories: [
        {
          name: "Web IDE",
          items: [
            "Execution Inspection Suite: Added interactive tabs for outgoing request headers, formatted request body payloads, and response body/headers.",
            "User Profiles & Backup: Added user profile page with local database backup and restore capabilities.",
            "Overhauled Bottom Toolbar: Replaced legacy bar with database connection status and workspace active file context.",
            "Authentication Flow: Implemented login overlays with multi-provider auth state management.",
          ],
        },
        {
          name: "VS Code Extension & LSP",
          items: [
            "LSP Protocol: Added complete LSP-based language server support with diagnostic reporting, completions, and language features.",
            "Gutter Play Buttons: Added green play buttons next to API calls and CodeLens run triggers in VS Code editor.",
            "Variable Prompts: Implemented interactive prompt overlay in VS Code for missing variables during standalone runs.",
          ],
        },
        {
          name: "CLI Shell & Core Compiler",
          items: [
            "Interactive execution: Standalone CLI runs with placeholder interpolation and interactive prompt fallbacks.",
            "Output Formatting: CLI color syntax highlighting for JSON and HTTP status outputs.",
            "Lexer Refinements: Enhanced token patterns and comment reader features in berrycore.",
          ],
        },
      ],
    },
    {
      version: "v0.1.1 / v0.1.2",
      date: "Earlier 2026",
      badge: "Initial Beta",
      badgeColor: "from-cyan-400 to-blue-500",
      title: "The Birth of Berry DSL & Core Runtime",
      summary:
        "First public debut of the Berry compiler core, runtime interpreter, and command-line shell interface.",
      categories: [
        {
          name: "Features",
          items: [
            "Introduced custom LexerEngine and AstEngine matching BNF rules.",
            "Supported basic assertions in the Check block (==, !=, >, <).",
            "Added environment pointers (@UAT, @prod) for flexible config scoping.",
            "Implemented directory & folder save functionality into IndexedDB.",
            "Integrated Monaco editor and Tauri desktop window UI.",
          ],
        },
      ],
    },
  ];
</script>

<svelte:head>
  <title>Flexiberry · Changelog</title>
  <meta
    name="description"
    content="Keep track of the latest updates, features, and fixes in Flexiberry and the Berry language."
  />
</svelte:head>

<div
  class="min-h-screen bg-gray-950 text-gray-100 font-mono flex flex-col justify-between"
>
  <div>
    <!-- Navigation header -->
    <Navigation />

    <!-- Hero Header -->
    <section class="relative pt-32 pb-12 text-center overflow-hidden">
      <!-- Gradient blobs -->
      <div class="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div
          class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]"
        ></div>
      </div>

      <!-- Grid overlay -->
      <div
        class="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.015)_1px,transparent_1px)] bg-[size:40px_40px] z-0 pointer-events-none"
        aria-hidden="true"
      ></div>

      <div class="relative z-10 max-w-2xl mx-auto px-6">
        <span
          class="inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full mb-4"
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"
          ></span>
          Flexiberry Roadmap
        </span>
        <h1
          class="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4"
        >
          What's <span
            class="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent"
            >New</span
          >
        </h1>
        <p
          class="text-slate-400 max-w-md mx-auto leading-relaxed text-xs md:text-sm"
        >
          Keep track of our latest feature releases, compiler performance
          improvements, and syntax enhancements to the Berry language.
        </p>
      </div>
    </section>

    <!-- Timeline Releases Section -->
    <section class="max-w-3xl mx-auto px-6 pb-28 relative z-10">
      <!-- Line matching the timeline standard layout -->
      <div
        class="absolute left-6 md:left-1/2 top-4 bottom-0 w-[1px] bg-white/5 -translate-x-1/2 z-0"
        aria-hidden="true"
      ></div>

      <div class="flex flex-col gap-16 relative">
        {#each releases as release, rIdx}
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative z-10"
          >
            <!-- Left block: Version, Date, Badge (always on one side or alternating) -->
            <div
              class="md:text-right flex flex-col md:items-end gap-2 pr-0 md:pr-12 pl-12 md:pl-0"
            >
              <span
                class="text-[10px] text-slate-500 font-bold uppercase tracking-widest"
                >{release.date}</span
              >
              <h2
                class="text-3xl font-extrabold text-white tracking-tight leading-none"
              >
                {release.version}
              </h2>
              <span
                class="inline-block text-[9px] uppercase font-extrabold tracking-wider bg-gradient-to-r {release.badgeColor} text-gray-950 px-2.5 py-1 rounded-full mt-1.5 shadow-[0_0_15px_rgba(52,211,153,0.15)]"
              >
                {release.badge}
              </span>
            </div>

            <!-- Dot center separator -->
            <div
              class="absolute left-6 md:left-1/2 top-1.5 -translate-x-1/2 flex items-center justify-center"
              aria-hidden="true"
            >
              <div
                class="w-4 h-4 rounded-full bg-gray-950 border-2 border-emerald-500/60 flex items-center justify-center shadow-[0_0_10px_rgba(52,211,153,0.3)]"
              >
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
              </div>
            </div>

            <!-- Right block: Main content card description -->
            <div
              class="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 ml-12 md:ml-0 shadow-xl hover:border-white/10 transition-colors duration-300"
            >
              <div>
                <h3 class="text-lg font-bold text-white mb-2 leading-snug">
                  {release.title}
                </h3>
                <p class="text-xs text-slate-400 leading-relaxed font-sans">
                  {release.summary}
                </p>
              </div>

              <!-- Categories -->
              {#each release.categories as cat}
                <div class="border-t border-white/5 pt-4">
                  <h4
                    class="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3"
                  >
                    {cat.name}
                  </h4>
                  <ul class="flex flex-col gap-2.5">
                    {#each cat.items as item}
                      <li
                        class="flex items-start gap-2 text-[0.72rem] text-slate-300 leading-relaxed font-sans"
                      >
                        <span class="text-emerald-400 font-bold mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    {/each}
                  </ul>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </section>
  </div>

  <!-- Navigation Footer -->
  <Footer />
</div>

<style>
  /* Smooth scroll tracking and timeline line style */
  li {
    word-break: break-word;
  }
</style>
