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
</script>

<section id="problem-solution" class="ps-section" bind:this={sectionEl}>
  <div class="ps-grid-bg" aria-hidden="true"></div>
  <div class="ps-inner" class:visible={sectionRevealed || isVisible}>
    <div class="section-label">
      <span class="label-dot"></span>
      The Core Problem
    </div>

    <h2 class="section-heading">
      API Testing shouldn't feel like<br />
      <span class="h-accent">writing an entire automation app</span>
    </h2>

    <div class="ps-content">
      <!-- Problem Column -->
      <div class="ps-card problem-card">
        <div class="card-status-badge problem-badge">The Pain</div>
        <div class="ps-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <p class="ps-card-text">
          Most API clients either force you into heavy, click-and-point GUIs that make automation a nightmare, or make you write endless JavaScript snippets just to pass an ID from one request to the next.
        </p>
      </div>

      <!-- Solution Column -->
      <div class="ps-card solution-card">
        <div class="card-status-badge solution-badge">Our Solution</div>
        <div class="ps-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
        </div>
        <p class="ps-card-text">
          <strong>Flexiberry fixes this.</strong> It introduces a clean, readable syntax (<code class="inline-code">.berry</code>) designed specifically to track dependencies and chain multi-API sequences straight out of the box.
        </p>
      </div>
    </div>
  </div>
</section>

<style>
  .ps-section {
    position: relative;
    background: #030712;
    padding: 7rem 2rem 5rem;
    overflow: hidden;
  }
  .ps-grid-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(167, 139, 250, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(167, 139, 250, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }
  .ps-inner {
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
  .ps-inner.visible {
    opacity: 1;
    transform: none;
  }
  .section-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    font-family: "JetBrains Mono", monospace;
    color: #a78bfa;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: rgba(167, 139, 250, 0.08);
    border: 1px solid rgba(167, 139, 250, 0.2);
    padding: 0.25rem 0.85rem;
    border-radius: 9999px;
    margin-bottom: 1.5rem;
  }
  .label-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #a78bfa;
    box-shadow: 0 0 6px #a78bfa;
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
    background: linear-gradient(135deg, #a78bfa, #38bdf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .ps-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    width: 100%;
    text-align: left;
  }
  .ps-card {
    position: relative;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 1rem;
    padding: 2.5rem 2rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    transition: all 0.3s ease;
  }
  .problem-card:hover {
    border-color: rgba(239, 68, 68, 0.25);
    box-shadow: 0 0 40px rgba(239, 68, 68, 0.05);
  }
  .solution-card:hover {
    border-color: rgba(52, 211, 153, 0.25);
    box-shadow: 0 0 40px rgba(52, 211, 153, 0.05);
  }
  .card-status-badge {
    position: absolute;
    top: -12px;
    left: 2rem;
    font-size: 0.65rem;
    font-family: "JetBrains Mono", monospace;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.2rem 0.75rem;
    border-radius: 9999px;
    border: 1px solid;
  }
  .problem-badge {
    color: #f87171;
    background: rgba(248, 113, 113, 0.1);
    border-color: rgba(248, 113, 113, 0.2);
  }
  .solution-badge {
    color: #34d399;
    background: rgba(52, 211, 153, 0.1);
    border-color: rgba(52, 211, 153, 0.2);
  }
  .ps-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.6rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .problem-card .ps-icon {
    background: rgba(248, 113, 113, 0.08);
    border: 1px solid rgba(248, 113, 113, 0.15);
    color: #f87171;
  }
  .solution-card .ps-icon {
    background: rgba(52, 211, 153, 0.08);
    border: 1px solid rgba(52, 211, 153, 0.15);
    color: #34d399;
  }
  .ps-card-text {
    font-size: 0.95rem;
    color: #94a3b8;
    line-height: 1.75;
    margin: 0;
  }
  .ps-card-text strong {
    color: #fff;
  }
  .inline-code {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.9em;
    color: #a78bfa;
    background: rgba(167, 139, 250, 0.1);
    border-radius: 4px;
    padding: 0.05em 0.3em;
  }

  @media (max-width: 768px) {
    .ps-content {
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }
    .ps-section {
      padding: 5rem 1.25rem 3rem;
    }
  }
</style>
