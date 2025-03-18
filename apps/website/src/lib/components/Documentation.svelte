<script>
  export let isVisible = false;
</script>

<!-- Documentation Section -->
<section id="docs" class="py-20">
  <div
    class={`container mx-auto px-6 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
  >
    <h2 class="text-3xl font-bold text-center mb-8">Documentation</h2>
    <p class="text-gray-400 text-center max-w-2xl mx-auto mb-12">
      Everything you need to know about Flexiberry, from getting started to
      advanced techniques.
    </p>

    <div class="grid md:grid-cols-3 gap-6">
      <div
        class="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-emerald-900/30 hover:translate-y-[-4px]"
      >
        <h3 class="text-xl font-bold mb-3">Getting Started</h3>
        <p class="text-gray-400 mb-4">
          Learn the basics and set up your first Flexiberry project in minutes.
        </p>
        <a href="#" class="text-emerald-400 hover:underline">Read guide →</a>
      </div>

      <div
        class="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-emerald-900/30 hover:translate-y-[-4px]"
      >
        <h3 class="text-xl font-bold mb-3">Core Concepts</h3>
        <p class="text-gray-400 mb-4">
          Understand the architecture and philosophy behind Flexiberry.
        </p>
        <a href="#" class="text-emerald-400 hover:underline"
          >Explore concepts →</a
        >
      </div>

      <div
        class="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-emerald-900/30 hover:translate-y-[-4px]"
      >
        <h3 class="text-xl font-bold mb-3">API Reference</h3>
        <p class="text-gray-400 mb-4">
          Detailed documentation of all Flexiberry APIs and components.
        </p>
        <a href="#" class="text-emerald-400 hover:underline">View reference →</a
        >
      </div>
    </div>
  </div>
</section>
