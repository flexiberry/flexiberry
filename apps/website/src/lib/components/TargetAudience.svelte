<script lang="ts">
  import { onMount } from "svelte";
  export let isVisible = false;

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

  const audiences = [
    {
      title: "Backend Developers",
      description: "who want a fast, local HTTP client that can handle modern, state-dependent API flows without the bloat of UI-heavy apps.",
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`,
      color: "#34d399"
    },
    {
      title: "QA & Automation Engineers",
      description: "looking for a zero-boilerplate, git-friendly framework where test logic is transparent, reviewable, and easily merged.",
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
      color: "#a78bfa"
    },
    {
      title: "Product Teams",
      description: "looking to document and validate end-to-end integration flows (e.g., Signup ➡️ Authenticate ➡️ Create Profile ➡️ Fetch Dashboard).",
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
      color: "#38bdf8"
    }
  ];
</script>

<section id="audience" class="audience-section" bind:this={sectionEl}>
  <div class="aud-grid-bg" aria-hidden="true"></div>
  <div class="audience-inner" class:visible={sectionRevealed || isVisible}>
    <div class="section-label">
      <span class="label-dot"></span>
      Target Audience
    </div>

    <h2 class="section-heading">
      Who is <span class="h-accent">Flexiberry For?</span>
    </h2>

    <div class="aud-cards">
      {#each audiences as aud, i}
        <div 
          class="aud-card" 
          style="--c:{aud.color}; --delay:{i * 100}ms"
          class:card-in={sectionRevealed || isVisible}
        >
          <div class="aud-icon" style="color:{aud.color}">
            {@html aud.icon}
          </div>
          <h3 class="aud-title">{aud.title}</h3>
          <p class="aud-desc">{aud.description}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .audience-section {
    position: relative;
    background: #04080f;
    padding: 6rem 2rem;
    overflow: hidden;
  }
  .aud-grid-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }
  .audience-inner {
    position: relative;
    z-index: 1;
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }
  .audience-inner.visible {
    opacity: 1;
    transform: none;
  }
  .section-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    font-family: "JetBrains Mono", monospace;
    color: #38bdf8;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: rgba(56, 189, 248, 0.08);
    border: 1px solid rgba(56, 189, 248, 0.2);
    padding: 0.25rem 0.85rem;
    border-radius: 9999px;
    margin-bottom: 1.5rem;
  }
  .label-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #38bdf8;
    box-shadow: 0 0 6px #38bdf8;
  }
  .section-heading {
    font-size: clamp(1.9rem, 4vw, 2.8rem);
    font-weight: 800;
    color: #fff;
    line-height: 1.18;
    letter-spacing: -0.02em;
    margin: 0 0 3.5rem;
  }
  .h-accent {
    background: linear-gradient(135deg, #38bdf8, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .aud-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    width: 100%;
    text-align: left;
  }
  .aud-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 0.9rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity 0.6s ease var(--delay),
      transform 0.6s ease var(--delay),
      border-color 0.3s ease,
      box-shadow 0.3s ease;
  }
  .aud-card.card-in {
    opacity: 1;
    transform: translateY(0);
  }
  .aud-card:hover {
    border-color: color-mix(in srgb, var(--c) 30%, transparent);
    box-shadow: 0 0 30px color-mix(in srgb, var(--c) 8%, transparent);
    transform: translateY(-2px);
  }
  .aud-card.card-in:hover {
    transform: translateY(-2px);
  }
  .aud-icon {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 0.5rem;
    background: color-mix(in srgb, var(--c) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--c) 15%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .aud-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #e2e8f0;
    margin: 0;
  }
  .aud-desc {
    font-size: 0.88rem;
    color: #64748b;
    line-height: 1.65;
    margin: 0;
  }

  @media (max-width: 868px) {
    .aud-cards {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    .audience-section {
      padding: 5rem 1.25rem;
    }
  }
</style>
