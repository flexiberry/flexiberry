<script>
  import { onMount } from "svelte";
  import { Navigation, Hero, Features, Documentation, CTA, Footer } from "$lib";

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

  let isVisible = {
    hero: false,
    features: false,
    docs: false,
    cta: false,
  };

  onMount(() => {
    // Trigger animations after component mounts with staggered timing
    setTimeout(() => {
      isVisible.hero = true;
    }, 100);
    setTimeout(() => {
      isVisible.features = true;
    }, 400);
    setTimeout(() => {
      isVisible.docs = true;
    }, 600);
    setTimeout(() => {
      isVisible.cta = true;
    }, 800);
  });
</script>

<div class="min-h-screen bg-gray-900 text-gray-100 font-mono">
  <Navigation />
  <Hero isVisible={isVisible.hero} />
  <Features isVisible={isVisible.features} />
  <Documentation isVisible={isVisible.docs} />
  <CTA isVisible={isVisible.cta} />
  <Footer />
</div>

<style>
  :global(body) {
    font-family: "JetBrains Mono", monospace;
    background-color: #111827;
    color: #f3f4f6;
    overflow-x: hidden;
  }

  /* Add smooth scrolling */
  :global(html) {
    scroll-behavior: smooth;
  }

  /* Improve transition performance */
  :global(*) {
    backface-visibility: hidden;
  }
</style>
