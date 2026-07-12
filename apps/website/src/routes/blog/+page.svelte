<script lang="ts">
  import { Navigation, Footer } from "$lib";

  const posts = [
    {
      slug: "quick-start",
      title: "CLI Quick Start Guide",
      description: "Learn how to install the Flexiberry CLI, scaffold your first sequential API test script, and run it locally in under 5 minutes.",
      category: "Tutorial",
      readTime: "3 min read",
      date: "July 12, 2026",
    },
    {
      slug: "writing-berry-dsl",
      title: "Mastering the .berry DSL Language",
      description: "A comprehensive step-by-step tutorial on writing declarative .berry scripts. Explore variable declarations, HTTP blocks, dynamic captures, and logical assertions.",
      category: "Language Reference",
      readTime: "8 min read",
      date: "July 11, 2026",
    },
    {
      slug: "ci-cd-integration",
      title: "Automating API Workflows in CI/CD",
      description: "How to integrate your sequential API test suites into modern automated pipelines using GitHub Actions, GitLab CI/CD, and process exit codes.",
      category: "Automation",
      readTime: "4 min read",
      date: "July 10, 2026",
    },
  ];
</script>

<svelte:head>
  <title>Developer Guides & Blog · Flexiberry</title>
  <meta
    name="description"
    content="Read official guides, tutorials, and articles on API testing automation, request chaining, and the .berry scripting language."
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
        <span
          class="inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full mb-4"
        >
          Knowledge Base
        </span>
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Developer <span class="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">Guides & Blog</span>
        </h1>
        <p class="text-slate-400 max-w-lg mx-auto leading-relaxed text-sm md:text-base">
          In-depth tutorials, concepts, and automated workflow strategies to supercharge your API regression testing.
        </p>
      </div>
    </section>

    <!-- Blog Grid Section -->
    <section class="max-w-5xl mx-auto px-6 pb-24 relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each posts as post}
          <a
            href="/blog/{post.slug}"
            class="group bg-gray-900/40 backdrop-blur-md border border-white/5 hover:border-emerald-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(52,211,153,0.08)] hover:-translate-y-1 flex flex-col justify-between h-full"
          >
            <div>
              <div class="flex items-center justify-between gap-2 mb-4 text-[0.68rem] tracking-wider text-slate-500 uppercase">
                <span>{post.category}</span>
                <span>{post.readTime}</span>
              </div>
              <h2 class="text-lg font-bold text-white group-hover:text-emerald-400 transition mb-3">
                {post.title}
              </h2>
              <p class="text-slate-400 text-xs md:text-sm font-sans leading-relaxed mb-6">
                {post.description}
              </p>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold group-hover:underline">
              Read Guide
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </a>
        {/each}
      </div>
    </section>
  </div>

  <!-- Navigation Footer -->
  <Footer />
</div>
