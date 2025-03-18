<script>
  export let isVisible = false;
</script>

<!-- CTA Section -->
<section id="get-started" class="bg-gray-800/90 py-20">
  <div
    class={`container mx-auto px-6 text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
  >
    <div class="max-w-2xl mx-auto">
      <h2 class="text-3xl font-bold mb-6">Ready to get started?</h2>
      <p class="text-gray-400 mb-8">
        Join thousands of developers building amazing applications with
        Flexiberry.
      </p>
      <div
        class="bg-gray-700/80 backdrop-blur-sm p-4 rounded-md text-left mb-8 overflow-x-auto shadow-lg"
      >
        <code class="text-emerald-300">npm install flexiberry</code>
      </div>
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <a
          href="#"
          class="bg-emerald-500 hover:bg-emerald-600 text-gray-900 font-bold py-3 px-8 rounded-md transition-all duration-300 shadow-lg hover:shadow-emerald-500/30"
        >
          Start Building
        </a>
        <a
          href="#"
          class="bg-gray-800/60 backdrop-blur-sm hover:bg-gray-800/80 border border-gray-700 hover:border-emerald-500 py-3 px-8 rounded-md transition-all duration-300"
        >
          View Examples
        </a>
      </div>
    </div>
  </div>
</section>
