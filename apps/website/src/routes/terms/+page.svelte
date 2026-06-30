<script lang="ts">
  import { Navigation, Footer } from "$lib";
</script>

<svelte:head>
  <title>Terms of Service · Flexiberry</title>
  <meta
    name="description"
    content="Review the official Terms of Service for using the Flexiberry website, software tool, and web-based execution playground."
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
          User Agreement
        </span>
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Terms of <span class="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">Service</span>
        </h1>
        <p class="text-slate-400 max-w-lg mx-auto leading-relaxed text-xs md:text-sm">
          Please read these terms carefully before accessing or using the Flexiberry site or CLI utilities.
        </p>
      </div>
    </section>

    <!-- Main Content Section -->
    <section class="max-w-3xl mx-auto px-6 pb-24 relative z-10 font-sans">
      <div class="prose prose-invert max-w-none text-slate-300 text-sm md:text-base leading-relaxed flex flex-col gap-8">
        
        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">1. Terms of Use</h2>
          <p>
            By accessing the website at <a href="https://flexiberry.dev" class="text-emerald-400 hover:underline">https://flexiberry.dev</a>, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">2. Use License</h2>
          <p>
            Flexiberry software packages (including the CLI compiler and runner core) are licensed under the MIT License. This license permits you to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the conditions detailed in the MIT License.
          </p>
          <p class="mt-4">
            Permission is granted to temporarily download one copy of the materials (information or software) on Flexiberry's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul class="list-disc list-inside mt-2 flex flex-col gap-1.5 pl-4">
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li>attempt to decompile or reverse engineer any software contained on Flexiberry's website;</li>
            <li>remove any copyright or other proprietary notations from the materials; or</li>
            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">3. Disclaimer</h2>
          <p>
            The materials on Flexiberry's website are provided on an 'as is' basis. Flexiberry makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">4. Limitations</h2>
          <p>
            In no event shall Flexiberry or its contributors be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Flexiberry's website, even if Flexiberry or an authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">5. Accuracy of Materials</h2>
          <p>
            The materials appearing on Flexiberry's website could include technical, typographical, or photographic errors. Flexiberry does not warrant that any of the materials on its website are accurate, complete, or current. Flexiberry may make changes to the materials contained on its website at any time without notice. However, Flexiberry does not make any commitment to update the materials.
          </p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">6. Links</h2>
          <p>
            Flexiberry has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Flexiberry of the site. Use of any such linked website is at the user's own risk.
          </p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">7. Modifications</h2>
          <p>
            Flexiberry may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then-current version of these terms of service.
          </p>
        </div>

      </div>
    </section>
  </div>

  <!-- Navigation Footer -->
  <Footer />
</div>
