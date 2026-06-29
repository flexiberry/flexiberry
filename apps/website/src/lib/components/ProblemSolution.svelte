<script lang="ts">
  import { onMount } from "svelte";
  
  let { isVisible = false } = $props<{ isVisible?: boolean }>();

  let sectionEl: HTMLElement;
  let sectionRevealed = $state(false);

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
      THE PROBLEM & SOLUTION
    </div>

    <h2 class="section-heading">
      API Testing shouldn't require <br />
      <span class="h-accent">writing an entire automation app</span>
    </h2>

    <div class="ps-content">
      <!-- Problem Column (Pain) -->
      <div class="ps-card problem-card">
        <div class="card-status-badge problem-badge">The Pain: Scripting Overload</div>
        <p class="ps-card-intro">
          Most API clients require writing custom Javascript wrappers and environment getters/setters just to pass an ID or token to the next request.
        </p>
        
        <!-- Pain Mockup -->
        <div class="mockup-container">
          <div class="mockup-header">
            <span class="mockup-title">postman-scripts.js</span>
          </div>
          <div class="mockup-code">
            <span class="m-comment">// JavaScript Boilerplate</span>
            <br />
            <span class="m-keyword">const</span> response = pm.response.json();
            <br />
            pm.environment.set(<span class="m-string">"token"</span>, response.token);
            <br />
            pm.test(<span class="m-string">"Status is 200"</span>, <span class="m-keyword">function</span>() &#123;
            <br />
            &nbsp;&nbsp;pm.response.to.have.status(200);
            <br />
            &#125;);
          </div>
        </div>

        <p class="ps-card-text">
          This results in bloated test scripts, broken environment variable syncs, and tests that are impossible to review in Git.
        </p>
      </div>

      <!-- Solution Column (Flexiberry Way) -->
      <div class="ps-card solution-card">
        <div class="card-status-badge solution-badge">Our Solution: Declarative Chaining</div>
        <p class="ps-card-intro">
          Flexiberry uses the human-readable <code class="inline-code">.berry</code> syntax to describe requests, captures, and assertions out-of-the-box.
        </p>

        <!-- Solution Mockup -->
        <div class="mockup-container solution-container">
          <div class="mockup-header">
            <span class="mockup-title">auth-flow.berry</span>
          </div>
          <div class="mockup-code solution-code">
            <span class="m-comment"># Native Chaining in Task Steps</span>
            <br />
            <span class="m-keyword">Step</span> Call Api login
            <br />
            &nbsp;&nbsp;<span class="m-keyword">Capture</span>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;- token: response.token
            <br />
            &nbsp;&nbsp;<span class="m-keyword">Check</span>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;- $.status == 200
          </div>
        </div>

        <p class="ps-card-text">
          Zero dependencies, zero boilerplates. Variables are dynamically bound and passed down the execution chain automatically.
        </p>
      </div>
    </div>
  </div>
</section>

<style>
  .ps-section {
    position: relative;
    background: #060608;
    padding: 7rem 2rem 5rem;
    overflow: hidden;
  }
  .ps-grid-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px);
    background-size: 50px 50px;
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
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.12em;
  }
  .label-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #475569;
  }
  .section-heading {
    font-size: clamp(1.9rem, 4vw, 2.8rem);
    font-weight: 800;
    color: #fff;
    line-height: 1.18;
    letter-spacing: -0.02em;
    margin: 1rem 0 3.5rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
    background: rgba(255, 255, 255, 0.015);
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: 1rem;
    padding: 2.5rem 2rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  .problem-card:hover {
    border-color: rgba(239, 68, 68, 0.15);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(239, 68, 68, 0.03);
  }
  .solution-card:hover {
    border-color: rgba(52, 211, 153, 0.15);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(52, 211, 153, 0.03);
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
    padding: 0.25rem 0.85rem;
    border-radius: 9999px;
    border: 1px solid;
  }
  .problem-badge {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.06);
    border-color: rgba(239, 68, 68, 0.18);
  }
  .solution-badge {
    color: #10b981;
    background: rgba(16, 185, 129, 0.06);
    border-color: rgba(16, 185, 129, 0.18);
  }
  .ps-card-intro {
    font-size: 0.95rem;
    color: #94a3b8;
    line-height: 1.6;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  /* Mockup Container for Code */
  .mockup-container {
    background: #030304;
    border: 1px solid rgba(255, 255, 255, 0.03);
    border-radius: 0.6rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .mockup-header {
    background: rgba(255, 255, 255, 0.01);
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    padding: 0.4rem 1rem;
  }
  .mockup-title {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.65rem;
    color: #475569;
  }
  .mockup-code {
    padding: 1rem;
    font-family: "JetBrains Mono", monospace;
    font-size: 0.72rem;
    line-height: 1.6;
    color: #94a3b8;
  }
  .m-comment { color: #475569; }
  .m-keyword { color: #f43f5e; font-weight: 700; }
  .m-string { color: #fbbf24; }

  /* Solution Specific Code Mockup */
  .solution-container {
    border-color: rgba(16, 185, 129, 0.1);
  }
  .solution-code {
    color: #e2e8f0;
  }
  .solution-code .m-comment { color: #4b5563; }
  .solution-code .m-keyword { color: #10b981; }

  .ps-card-text {
    font-size: 0.9rem;
    color: #64748b;
    line-height: 1.6;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .ps-card-text strong {
    color: #fff;
  }
  .inline-code {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.9em;
    color: #10b981;
    background: rgba(16, 185, 129, 0.08);
    border-radius: 4px;
    padding: 0.05em 0.3em;
    border: 1px solid rgba(16, 185, 129, 0.12);
  }

  @media (max-width: 868px) {
    .ps-content {
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }
    .ps-section {
      padding: 5rem 1.25rem 3rem;
    }
  }
</style>
