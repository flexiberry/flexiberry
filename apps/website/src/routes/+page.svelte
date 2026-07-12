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
    ComparisonTable,
  } from "$lib";

  let isVisible = {
    hero: false,
    comparison: false,
    problem: false,
    features: false,
    audience: false,
    docs: false,
    cta: false,
  };

  onMount(() => {
    setTimeout(() => { isVisible.hero = true; }, 100);
    setTimeout(() => { isVisible.comparison = true; }, 200);
    setTimeout(() => { isVisible.problem = true; }, 300);
    setTimeout(() => { isVisible.features = true; }, 500);
    setTimeout(() => { isVisible.audience = true; }, 700);
    setTimeout(() => { isVisible.docs = true; }, 900);
    setTimeout(() => { isVisible.cta = true; }, 1100);
  });
</script>

<svelte:head>
  <title>Flexiberry · The Developer-First HTTP Client for Sequential API Workflows</title>
  <meta
    name="description"
    content="Flexiberry is an open-source, lightweight HTTP client and API testing framework designed to chain dependent requests sequentially with ease."
  />
  <meta property="og:title" content="Flexiberry · The Developer-First HTTP Client for Sequential API Workflows" />
  <meta property="og:description" content="Stop writing heavy scripts just to pass response values. Chain dependent API requests with the human-readable .berry syntax." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://flexiberry.dev" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Flexiberry · The Developer-First HTTP Client for Sequential Workflows" />
  <meta name="twitter:description" content="Chain dependent API requests sequentially with zero setup. Open-source and blistering fast." />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Flexiberry",
      "operatingSystem": "All",
      "applicationCategory": "DeveloperApplication",
      "offers": {
        "@type": "Offer",
        "price": "0.00",
        "priceCurrency": "USD"
      },
      "description": "Flexiberry is an open-source, lightweight HTTP client and API testing framework designed to chain dependent requests sequentially with ease.",
      "softwareVersion": "1.0.0",
      "license": "https://opensource.org/licenses/MIT",
      "applicationSubCategory": "HTTP Client & API Testing Framework",
      "releaseNotes": "https://flexiberry.dev/changelog",
      "downloadUrl": "https://www.npmjs.com/package/@flexiberry/cli",
      "featureList": [
        "Seamless Request Chaining",
        "Human-Readable .berry Syntax",
        "Environment Variables Support with Base64 Decryption",
        "Zero-Dependency CLI & CI/CD Ready",
        "Stateful execution step-by-step with assertion checks"
      ]
    }
  </script>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-gray-100 font-mono">
  <Navigation />
  <Hero isVisible={isVisible.hero} />

  <ComparisonTable isVisible={isVisible.comparison} />

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
