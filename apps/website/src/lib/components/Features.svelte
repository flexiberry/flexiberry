<script lang="ts">
  import { onMount } from "svelte";
  export let isVisible = false;

  const features = [
    {
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
      color: "#34d399",
      title: "Seamless Request Chaining",
      description: "Capture variables (like authentication tokens, user IDs, or entity keys) from one API response and inject them directly into subsequent requests.",
      tag: "Chaining"
    },
    {
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"></path></svg>`,
      color: "#a78bfa",
      title: "Human-Readable .berry Syntax",
      description: "Write your HTTP requests, variable captures, and assertions in a clean, declarative domain-specific language (DSL) that lives right alongside your code.",
      tag: "DSL"
    },
    {
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path></svg>`,
      color: "#38bdf8",
      title: "True Dual-Purpose Engine",
      description: "Use it as a quick HTTP Client to scratchpad daily endpoints during development, or scale it into a robust Automated Test Suite with powerful assertions.",
      tag: "Engine"
    },
    {
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
      color: "#fb923c",
      title: "Zero-Dependency & CI/CD Ready",
      description: "Designed to be lightweight and blistering fast. Run your .berry workflow files natively in your terminal or embed them cleanly into your GitHub Actions / CI pipelines.",
      tag: "CI/CD"
    },
    {
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
      color: "#f472b6",
      title: "Environment Variables Support",
      description: "Easily switch between local, staging, and production environments without rewriting your workflow files.",
      tag: "Environments"
    }
  ];

  // Section-level reveal driven by IntersectionObserver on the section itself
  let sectionEl: HTMLElement;
  let sectionRevealed = false;

  onMount(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sectionRevealed = true;
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (sectionEl) io.observe(sectionEl);
    return () => io.disconnect();
  });
</script>

<section id="features" class="features-section" bind:this={sectionEl}>
  <div class="feat-grid-bg" aria-hidden="true"></div>

  <div class="features-inner" class:visible={sectionRevealed || isVisible}>
    <div class="section-label">
      <span class="label-dot"></span>
      Features
    </div>
    <h2 class="section-heading">
      Key Features for<br /><span class="h-accent">Sequential API Workflows</span>
    </h2>
    <p class="section-sub">
      Flexiberry strips away the bloat and provides a lightning fast environment tailored for multi-API journeys.
    </p>

    <div class="feat-cards">
      {#each features as feat, i}
        <a
          href="/features"
          class="feat-card feat-card-{i}"
          class:card-in={sectionRevealed || isVisible}
          style="--c:{feat.color}; --delay:{i * 100}ms"
        >
          <div class="feat-icon" style="color:{feat.color}">
            {@html feat.icon}
          </div>
          <span
            class="feat-tag"
            style="color:{feat.color}; border-color:color-mix(in srgb,{feat.color} 30%,transparent); background:color-mix(in srgb,{feat.color} 10%,transparent)"
            >{feat.tag}</span
          >
          <h3 class="feat-title">{feat.title}</h3>
          <p class="feat-desc">{feat.description}</p>
        </a>
      {/each}
    </div>
  </div>
</section>

<style>
  .features-section {
    position: relative;
    background: #030712;
    padding: 7rem 2rem;
    overflow: hidden;
  }
  .feat-grid-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(52, 211, 153, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(52, 211, 153, 0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  /* ── Wrapper ────────────────────────────────────────────────────────── */
  .features-inner {
    position: relative;
    z-index: 1;
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  /* ── Section header ─────────────────────────────────────────────────── */
  .section-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    font-family: "JetBrains Mono", monospace;
    color: #34d399;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: rgba(52, 211, 153, 0.08);
    border: 1px solid rgba(52, 211, 153, 0.2);
    padding: 0.25rem 0.85rem;
    border-radius: 9999px;
    margin-bottom: 1.5rem;
  }
  .label-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #34d399;
    box-shadow: 0 0 6px #34d399;
    animation: pulse-dot 2s ease-in-out infinite;
  }
  @keyframes pulse-dot {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }

  .section-heading {
    font-size: clamp(1.9rem, 4vw, 2.8rem);
    font-weight: 800;
    color: #fff;
    line-height: 1.18;
    letter-spacing: -0.02em;
    margin: 0 0 1rem;
  }
  .h-accent {
    background: linear-gradient(135deg, #34d399, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .section-sub {
    font-size: 1rem;
    color: #64748b;
    max-width: 520px;
    line-height: 1.7;
    margin-bottom: 4rem;
  }

  /* ── Cards grid ─────────────────────────────────────────────────────── */
  .feat-cards {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1.25rem;
    width: 100%;
    text-align: left;
  }

  .feat-card {
    display: block;
    text-decoration: none;
    position: relative;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 0.9rem;
    padding: 1.75rem;
    /* Initial hidden state */
    opacity: 0;
    transform: translateY(22px);
    /* Animate opacity + transform + hover properties */
    transition:
      opacity 0.5s ease var(--delay),
      transform 0.5s ease var(--delay),
      border-color 0.3s ease,
      box-shadow 0.3s ease;
    grid-column: span 6; /* Mobile default: full width */
  }

  @media (min-width: 650px) and (max-width: 950px) {
    .feat-card {
      grid-column: span 3; /* Tablet: 2 columns */
    }
    .feat-card-4 {
      grid-column: span 6; /* Center last card */
    }
  }

  @media (min-width: 950px) {
    .feat-card-0, .feat-card-1, .feat-card-2 {
      grid-column: span 2;
    }
    .feat-card-3, .feat-card-4 {
      grid-column: span 3;
    }
  }
  /* Revealed state — added by the class binding */
  .feat-card.card-in {
    opacity: 1;
    transform: translateY(0);
  }
  .feat-card:hover {
    border-color: color-mix(in srgb, var(--c) 35%, transparent);
    box-shadow: 0 0 40px color-mix(in srgb, var(--c) 12%, transparent);
    transform: translateY(-3px);
  }
  /* Keep card visible even while hovering after card-in fires */
  .feat-card.card-in:hover {
    transform: translateY(-3px);
  }

  .feat-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.6rem;
    background: color-mix(in srgb, var(--c) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--c) 20%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }
  .feat-tag {
    display: inline-block;
    font-size: 0.6rem;
    font-family: "JetBrains Mono", monospace;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.15rem 0.55rem;
    border-radius: 4px;
    border: 1px solid;
    margin-bottom: 0.75rem;
  }
  .feat-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #e2e8f0;
    margin: 0 0 0.55rem;
  }
  .feat-desc {
    font-size: 0.88rem;
    color: #64748b;
    line-height: 1.65;
    margin: 0;
  }

  @media (max-width: 700px) {
    .feat-cards {
      grid-template-columns: 1fr;
    }
    .features-section {
      padding: 5rem 1.25rem;
    }
  }
</style>
