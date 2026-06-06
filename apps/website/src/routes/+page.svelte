<script>
  import { onMount } from "svelte";
  import {
    Navigation,
    Hero,
    ProblemSolution,
    Features,
    TargetAudience,
    Documentation,
    CTA,
    Footer,
    BerryCodeScroll,
  } from "$lib";

  let isVisible = {
    hero: false,
    problem: false,
    features: false,
    audience: false,
    docs: false,
    cta: false,
  };

  onMount(() => {
    setTimeout(() => { isVisible.hero = true; }, 100);
    setTimeout(() => { isVisible.problem = true; }, 300);
    setTimeout(() => { isVisible.features = true; }, 500);
    setTimeout(() => { isVisible.audience = true; }, 700);
    setTimeout(() => { isVisible.docs = true; }, 900);
    setTimeout(() => { isVisible.cta = true; }, 1100);
  });
</script>

<div class="min-h-screen bg-gray-900 text-gray-100 font-mono">
  <Navigation />
  <Hero isVisible={isVisible.hero} />

  <ProblemSolution isVisible={isVisible.problem} />

  <BerryCodeScroll />

  <Features isVisible={isVisible.features} />
  <TargetAudience isVisible={isVisible.audience} />
  <Documentation isVisible={isVisible.docs} />
  <CTA isVisible={isVisible.cta} />
  <Footer />
</div>

<style>
  :global(body) {
    font-family: "JetBrains Mono", monospace;
    background-color: #111827;
    color: #f3f4f6;
    /* NOTE: overflow-x on body breaks position:sticky — use html instead */
  }

  :global(html) {
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
