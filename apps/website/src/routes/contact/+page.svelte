<script lang="ts">
  import { Navigation, Footer } from "$lib";
</script>

<svelte:head>
  <title>Contact Us · Get in Touch with Flexiberry Support</title>
  <meta
    name="description"
    content="Have questions, feedback, or support queries about Flexiberry? Get in touch with the team or join our developer community."
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
          any integration issues.
        </p>
      </div>
    </section>

    <!-- Main Content Section -->
    <section class="max-w-4xl mx-auto px-6 pb-24 relative z-10 font-sans">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <!-- Contact Information Info Cards -->
        <div class="flex flex-col gap-6">
          <div
            class="bg-gray-900/40 border border-white/5 p-6 rounded-2xl flex flex-col gap-3"
          >
            <h3
              class="text-base font-bold text-white font-mono flex items-center gap-2"
            >
              <span class="text-emerald-400">💬</span> Community Channels
            </h3>
            <p class="text-slate-400 text-xs leading-relaxed">
              For general support, troubleshooting, and discussions about the
              Berry language syntax, please join our GitHub discussions.
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
            <h3
              class="text-base font-bold text-white font-mono flex items-center gap-2"
            >
              <span class="text-emerald-400">✉️</span> Email Support
            </h3>
            <p class="text-slate-400 text-xs leading-relaxed">
              If you have security vulnerabilities to report, legal inquiries,
              or private sponsorship questions, email us directly.
            </p>
            <a
              href="mailto:ezekielrintu@gmail.com"
              class="text-emerald-400 text-xs font-mono hover:underline mt-1"
            >
              ezekielrintu@gmail.com
            </a>
          </div>
        </div>

        <!-- Feedback Form Mockup (Directly styled and fully interactive-looking) -->
        <!-- <div
          class="bg-gray-900/40 border border-white/5 p-6 rounded-2xl flex flex-col gap-4"
        >
          <h3 class="text-base font-bold text-white font-mono">
            Send a Message
          </h3>
          <div class="flex flex-col gap-3">
            <div>
              <label
                for="name"
                class="block text-[10px] text-slate-500 font-mono uppercase mb-1"
                >Name</label
              >
              <input
                type="text"
                id="name"
                placeholder="Your Name"
                class="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/40 transition"
              />
            </div>
            <div>
              <label
                for="email"
                class="block text-[10px] text-slate-500 font-mono uppercase mb-1"
                >Email</label
              >
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                class="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/40 transition"
              />
            </div>
            <div>
              <label
                for="message"
                class="block text-[10px] text-slate-500 font-mono uppercase mb-1"
                >Message</label
              >
              <textarea
                id="message"
                rows="4"
                placeholder="Tell us how we can help..."
                class="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/40 transition"
              ></textarea>
            </div>
            <button
              class="w-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-gray-950 font-bold py-2.5 px-4 rounded-xl text-xs mt-2 transition hover:shadow-[0_4px_15px_rgba(52,211,153,0.2)]"
              onclick={() => alert("Thank you! Your inquiry has been logged.")}
            >
              Submit Message
            </button>
          </div>
        </div> -->
      </div>
    </section>
  </div>

  <!-- Navigation Footer -->
  <Footer />
</div>
