<script lang="ts">
  import { Navigation, Footer } from "$lib";

  let formState = $state({
    name: "",
    email: "",
    subject: "general",
    message: "",
    submitted: false,
    loading: false,
  });

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;
    formState.loading = true;
    setTimeout(() => {
      formState.loading = false;
      formState.submitted = true;
    }, 600);
  }
</script>

<svelte:head>
  <title>Contact Us · Get in Touch with Flexiberry Support</title>
  <meta
    name="description"
    content="Have questions, feedback, or support queries about Flexiberry? Get in touch with the team, submit inquiries, or join our developer community."
  />
</svelte:head>

<div
  class="min-h-screen bg-gray-950 text-gray-100 font-mono flex flex-col justify-between"
>
  <div>
    <!-- Navigation header -->
    <Navigation />

    <!-- Hero Header -->
    <section class="relative pt-32 pb-12 overflow-hidden text-center">
      <!-- Gradient blobs -->
      <div class="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div
          class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px]"
        ></div>
        <div
          class="absolute top-20 right-10 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px]"
        ></div>
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
          Support & Feedback
        </span>
        <h1
          class="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4"
        >
          Contact <span
            class="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent"
            >Us</span
          >
        </h1>
        <p
          class="text-slate-400 max-w-lg mx-auto leading-relaxed text-xs md:text-sm"
        >
          We would love to hear your feedback, feature requests, or help with
          any API integration issues. Reach out via community channels or direct email.
        </p>
      </div>
    </section>

    <!-- Main Content Section -->
    <section class="max-w-4xl mx-auto px-6 pb-24 relative z-10 font-sans">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-16">
        <!-- Contact Information Info Cards -->
        <div class="flex flex-col gap-6">
          <div
            class="bg-gray-900/40 border border-white/5 p-6 rounded-2xl flex flex-col gap-3"
          >
            <h2
              class="text-base font-bold text-white font-mono flex items-center gap-2"
            >
              <span class="text-emerald-400">💬</span> Community Channels
            </h2>
            <p class="text-slate-400 text-xs leading-relaxed">
              For general support, troubleshooting, and discussions about the
              Berry language syntax, please join our GitHub discussions. Our community and core maintainers actively review queries.
            </p>
            <a
              href="https://github.com/flexiberry/flexiberry/discussions"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2 px-4 rounded-xl text-xs mt-2 transition"
            >
              GitHub Discussions
            </a>
          </div>

          <div
            class="bg-gray-900/40 border border-white/5 p-6 rounded-2xl flex flex-col gap-3"
          >
            <h2
              class="text-base font-bold text-white font-mono flex items-center gap-2"
            >
              <span class="text-emerald-400">✉️</span> Email Support
            </h2>
            <p class="text-slate-400 text-xs leading-relaxed">
              If you have security vulnerabilities to report, legal inquiries, enterprise support requirements, or private sponsorship questions, email us directly.
            </p>
            <a
              href="mailto:ezekielrintu@gmail.com"
              class="text-emerald-400 text-xs font-mono hover:underline mt-1"
            >
              ezekielrintu@gmail.com
            </a>
          </div>

          <div
            class="bg-gray-900/40 border border-white/5 p-6 rounded-2xl flex flex-col gap-3"
          >
            <h2
              class="text-base font-bold text-white font-mono flex items-center gap-2"
            >
              <span class="text-emerald-400">⚡</span> Response Expectations
            </h2>
            <p class="text-slate-400 text-xs leading-relaxed">
              Community inquiries on GitHub Discussions are typically addressed within 24 to 48 hours. Direct email requests regarding security or enterprise licensing take priority.
            </p>
          </div>
        </div>

        <!-- Interactive Contact Form -->
        <div
          class="bg-gray-900/40 border border-white/5 p-6 md:p-8 rounded-2xl flex flex-col gap-4"
        >
          <h2 class="text-base font-bold text-white font-mono">
            Send a Direct Message
          </h2>
          {#if formState.submitted}
            <div class="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl text-center">
              <span class="text-2xl block mb-2">🎉</span>
              <h3 class="text-emerald-400 font-bold text-sm mb-1 font-mono">Message Received!</h3>
              <p class="text-slate-300 text-xs leading-relaxed">
                Thank you for reaching out. We have logged your message and will respond to <strong class="text-white">{formState.email}</strong> shortly.
              </p>
              <button
                onclick={() => (formState.submitted = false)}
                class="mt-4 text-xs text-slate-400 hover:text-emerald-400 underline font-mono"
              >
                Send another message
              </button>
            </div>
          {:else}
            <form onsubmit={handleSubmit} class="flex flex-col gap-4">
              <div>
                <label
                  for="name"
                  class="block text-[10px] text-slate-400 font-mono uppercase mb-1"
                  >Your Name</label
                >
                <input
                  type="text"
                  id="name"
                  required
                  bind:value={formState.name}
                  placeholder="e.g. Alex Dev"
                  class="w-full bg-gray-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label
                  for="email"
                  class="block text-[10px] text-slate-400 font-mono uppercase mb-1"
                  >Email Address</label
                >
                <input
                  type="email"
                  id="email"
                  required
                  bind:value={formState.email}
                  placeholder="alex@example.com"
                  class="w-full bg-gray-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label
                  for="subject"
                  class="block text-[10px] text-slate-400 font-mono uppercase mb-1"
                  >Inquiry Type</label
                >
                <select
                  id="subject"
                  bind:value={formState.subject}
                  class="w-full bg-gray-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                >
                  <option value="general">General Support</option>
                  <option value="bug">Bug Report / Integration Issue</option>
                  <option value="feature">Feature Request</option>
                  <option value="enterprise">Enterprise & Sponsorship</option>
                </select>
              </div>
              <div>
                <label
                  for="message"
                  class="block text-[10px] text-slate-400 font-mono uppercase mb-1"
                  >Message</label
                >
                <textarea
                  id="message"
                  rows="4"
                  required
                  bind:value={formState.message}
                  placeholder="Describe your question or workflow setup..."
                  class="w-full bg-gray-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={formState.loading}
                class="w-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-gray-950 font-bold py-3 px-4 rounded-xl text-xs mt-1 transition hover:shadow-[0_4px_20px_rgba(52,211,153,0.3)] disabled:opacity-50"
              >
                {formState.loading ? "Sending..." : "Submit Inquiry"}
              </button>
            </form>
          {/if}
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="border-t border-white/5 pt-12 flex flex-col gap-6">
        <h2 class="text-2xl font-extrabold text-white font-mono tracking-tight text-center mb-4">
          Frequently Asked Questions
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-gray-900/30 border border-white/5 p-6 rounded-2xl">
            <h3 class="text-sm font-bold text-emerald-400 mb-2 font-mono">
              Is Flexiberry free for commercial projects?
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed font-sans">
              Yes, Flexiberry and the Berry core interpreter are published under the open-source MIT license. You can freely use them in personal, commercial, and enterprise software pipelines.
            </p>
          </div>
          <div class="bg-gray-900/30 border border-white/5 p-6 rounded-2xl">
            <h3 class="text-sm font-bold text-emerald-400 mb-2 font-mono">
              How do I report a CLI bug or syntax parser issue?
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed font-sans">
              You can open an issue directly on our official GitHub repository. Please include your .berry script snippet, expected result, and actual compiler output.
            </p>
          </div>
          <div class="bg-gray-900/30 border border-white/5 p-6 rounded-2xl">
            <h3 class="text-sm font-bold text-emerald-400 mb-2 font-mono">
              Can I run Flexiberry tests inside CI/CD pipelines?
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed font-sans">
              Absolutely! Flexiberry features a zero-dependency CLI runner (`npx @flexiberry/cli run`) that integrates into GitHub Actions, GitLab CI/CD, and Docker containers with standard exit code handling.
            </p>
          </div>
          <div class="bg-gray-900/30 border border-white/5 p-6 rounded-2xl">
            <h3 class="text-sm font-bold text-emerald-400 mb-2 font-mono">
              Where can I request new Berry DSL syntax keywords?
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed font-sans">
              We encourage community ideas! Start a thread under the GitHub Discussions section with your proposed grammar keywords and sample usage scenarios.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- Navigation Footer -->
  <Footer />
</div>
