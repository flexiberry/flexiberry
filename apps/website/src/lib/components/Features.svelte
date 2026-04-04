<script lang="ts">
  import { onMount } from "svelte";
  export let isVisible = false;

  const features = [
    {
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
      color: "#a78bfa",
      title: "Custom Scripts",
      description: "Write API tests in plain Berry syntax. Full control, no limitations, no rigid structure to fight against.",
      tag: "DSL",
    },
    {
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      color: "#34d399",
      title: "Automated Testing",
      description: "Execute test cases seamlessly with real-time feedback. Parallel runs, instant pass/fail reports.",
      tag: "Runtime",
    },
    {
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
      color: "#38bdf8",
      title: "Developer-Friendly CLI",
      description: "One command to run. Flexible config to adapt to any project structure or CI/CD pipeline.",
      tag: "CLI",
    },
    {
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      color: "#fb923c",
      title: "Fast & Lightweight",
      description: "Zero runtime bloat. Berrycore starts in milliseconds and scales to hundreds of API tests effortlessly.",
      tag: "Performance",
    },
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
      { threshold: 0.1 }
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
      Everything you need,<br /><span class="h-accent">nothing you don't</span>
    </h2>
    <p class="section-sub">
      Berrycore strips away everything that makes API testing painful and keeps only what matters.
    </p>

    <div class="feat-cards">
      {#each features as feat, i}
        <div
          class="feat-card"
          class:card-in={sectionRevealed || isVisible}
          style="--c:{feat.color}; --delay:{i * 100}ms"
        >
          <div class="feat-icon" style="color:{feat.color}">
            {@html feat.icon}
          </div>
          <span class="feat-tag" style="color:{feat.color}; border-color:color-mix(in srgb,{feat.color} 30%,transparent); background:color-mix(in srgb,{feat.color} 10%,transparent)">{feat.tag}</span>
          <h3 class="feat-title">{feat.title}</h3>
          <p class="feat-desc">{feat.description}</p>
        </div>
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
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(52,211,153,.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(52,211,153,.04) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  /* ── Wrapper ────────────────────────────────────────────────────────── */
  .features-inner {
    position: relative; z-index: 1;
    max-width: 1100px; margin: 0 auto;
    display: flex; flex-direction: column; align-items: center;
    text-align: center;
  }

  /* ── Section header ─────────────────────────────────────────────────── */
  .section-label {
    display: inline-flex; align-items: center; gap: .5rem;
    font-size: .7rem; font-family: 'JetBrains Mono', monospace;
    color: #34d399; letter-spacing: .1em; text-transform: uppercase;
    background: rgba(52,211,153,.08); border: 1px solid rgba(52,211,153,.2);
    padding: .25rem .85rem; border-radius: 9999px;
    margin-bottom: 1.5rem;
  }
  .label-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #34d399; box-shadow: 0 0 6px #34d399;
    animation: pulse-dot 2s ease-in-out infinite;
  }
  @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }

  .section-heading {
    font-size: clamp(1.9rem, 4vw, 2.8rem);
    font-weight: 800; color: #fff;
    line-height: 1.18; letter-spacing: -.02em;
    margin: 0 0 1rem;
  }
  .h-accent {
    background: linear-gradient(135deg, #34d399, #a78bfa);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .section-sub {
    font-size: 1rem; color: #64748b;
    max-width: 520px; line-height: 1.7;
    margin-bottom: 4rem;
  }

  /* ── Cards grid ─────────────────────────────────────────────────────── */
  .feat-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
    width: 100%;
    text-align: left;
  }

  .feat-card {
    position: relative;
    background: rgba(255,255,255,.025);
    border: 1px solid rgba(255,255,255,.07);
    border-radius: .9rem;
    padding: 1.75rem;
    /* Initial hidden state */
    opacity: 0;
    transform: translateY(22px);
    /* Animate opacity + transform + hover properties */
    transition:
      opacity .5s ease var(--delay),
      transform .5s ease var(--delay),
      border-color .3s ease,
      box-shadow .3s ease;
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
  .feat-card.card-in:hover { transform: translateY(-3px); }

  .feat-icon {
    width: 2.5rem; height: 2.5rem; border-radius: .6rem;
    background: color-mix(in srgb, var(--c) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--c) 20%, transparent);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1rem;
  }
  .feat-tag {
    display: inline-block;
    font-size: .6rem; font-family: 'JetBrains Mono', monospace;
    letter-spacing: .08em; text-transform: uppercase;
    padding: .15rem .55rem; border-radius: 4px; border: 1px solid;
    margin-bottom: .75rem;
  }
  .feat-title { font-size: 1.05rem; font-weight: 700; color: #e2e8f0; margin: 0 0 .55rem; }
  .feat-desc  { font-size: .88rem; color: #64748b; line-height: 1.65; margin: 0; }

  @media (max-width: 700px) {
    .feat-cards { grid-template-columns: 1fr; }
    .features-section { padding: 5rem 1.25rem; }
  }
</style>
