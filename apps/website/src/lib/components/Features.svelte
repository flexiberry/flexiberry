<script>
  export let isVisible = false;

  let features = [
    {
      title: "Fast & Lightweight",
      description:
        "Built for performance with minimal overhead and optimized rendering.",
    },
    {
      title: "Developer Friendly",
      description:
        "Intuitive API designed with developers in mind. Easy to learn, simple to master.",
    },
    {
      title: "Highly Customizable",
      description:
        "Flexible configuration options to adapt to your specific project needs.",
    },
    {
      title: "Well Documented",
      description:
        "Comprehensive documentation with examples and best practices.",
    },
  ];
</script>

<!-- Features Section -->
<section id="features" class="bg-gray-800/90 py-20">
  <div
    class={`container mx-auto px-6 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
  >
    <h2 class="text-3xl font-bold text-center mb-16">Features</h2>
    <div class="grid md:grid-cols-2 gap-8">
      {#each features as feature, i}
        <div
          class="bg-gray-900/80 backdrop-blur-sm p-6 rounded-lg border border-gray-700 hover:border-emerald-500 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900/20"
        >
          <h3 class="text-xl font-bold mb-3">{feature.title}</h3>
          <p class="text-gray-400">{feature.description}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
