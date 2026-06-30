<script lang="ts">
  import { Navigation, Footer } from "$lib";
</script>

<svelte:head>
  <title>About Flexiberry · The Developer-First API Client</title>
  <meta
    name="description"
    content="Learn about Flexiberry, the open-source HTTP client and sequential workflow runner built by developers, for developers."
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
          Our Story
        </span>
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          About <span class="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">Flexiberry</span>
        </h1>
        <p class="text-slate-400 max-w-lg mx-auto leading-relaxed text-xs md:text-sm">
          Empowering software engineers to chain dependent API requests and run automated assertions with zero boilerplate.
        </p>
      </div>
    </section>

    <!-- Main Content Section -->
    <section class="max-w-3xl mx-auto px-6 pb-24 relative z-10 font-sans">
      <div class="prose prose-invert max-w-none text-slate-300 text-sm md:text-base leading-relaxed flex flex-col gap-8">
        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">The Mission</h2>
          <p>
            Flexiberry was born out of frustration with writing heavy scripting frameworks, Postman pre-request scripts, or complex cURL wrappers just to test a simple sequential API workflow. We believe that testing a chain of APIs—where one request depends on the output of another—should be human-readable, fast, and configuration-driven.
          </p>
          <p class="mt-4">
            Our mission is to provide developers with a lightweight, syntax-intuitive language (`.berry`) and a blazing-fast CLI runner that fits perfectly into local development environments and CI/CD pipelines.
          </p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">What is the Berry Language?</h2>
          <p>
            The Berry language is a domain-specific scripting grammar designed specifically for HTTP API declarations and request chains. It lets you write readable syntax like:
          </p>
          <pre class="bg-gray-900 border border-white/5 p-4 rounded-xl font-mono text-xs text-emerald-400 mt-4 overflow-x-auto">
Api POST #loginUrl
Url https://api.example.com/login
Capture
- token: response.token

Task Authenticate
  Step Call Api loginUrl
  Check
  - $.status == 200</pre>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">Open Source & Community Driven</h2>
          <p>
            Flexiberry is fully open-source and licensed under the MIT License. We actively encourage contributions from developers around the world. Whether you're reporting a bug, improving the CLI compiler, or suggesting syntax expansions, your involvement helps shape the future of API testing.
          </p>
          <p class="mt-4">
            Join our discussions, check out the code repositories, and help us build the most accessible API client in the developer ecosystem.
          </p>
        </div>
      </div>
    </section>
  </div>

  <!-- Navigation Footer -->
  <Footer />
</div>
