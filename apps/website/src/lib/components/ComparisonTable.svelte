<script lang="ts">
  import { onMount } from "svelte";

  let { isVisible = false } = $props<{ isVisible?: boolean }>();

  let sectionEl: HTMLElement;
  let sectionRevealed = $state(false);

  const features = [
    {
      name: "Declarative API DSL (.berry)",
      description: "Human-readable syntax for endpoint chaining without JS script bloat",
      flexi: "yes",
      postman: "no",
      bruno: "no",
    },
    {
      name: "Native Sequential Chaining",
      description: "Pass dynamic tokens, headers & response fields from step to step effortlessly",
      flexi: "yes",
      postman: "partial",
      bruno: "partial",
    },
    {
      name: "Zero-Dependency CLI Engine",
      description: "Blazing fast native runner for local terminals & CI/CD pipelines",
      flexi: "yes",
      postman: "partial",
      bruno: "yes",
    },
    {
      name: "Web & Browser Playground",
      description: "Instant in-browser scratchpad and sequence execution without installs",
      flexi: "yes",
      postman: "yes",
      bruno: "no",
    },
    {
      name: "Git & Version Control Native",
      description: "Plain text .berry files stored right alongside your repository code",
      flexi: "yes",
      postman: "no",
      bruno: "yes",
    },
    {
      name: "VS Code Extension Support",
      description: "Real-time syntax checking, autocomplete & inline execution buttons",
      flexi: "yes",
      postman: "no",
      bruno: "yes",
    },
    {
      name: "Zero JS Scripting Boilerplate",
      description: "No pm.response.json() or post-response JS code required to capture vars",
      flexi: "yes",
      postman: "no",
      bruno: "no",
    },
    {
      name: "Environment Config Swapping",
      description: "Easily switch @prod, @staging, or @local environments via CLI flags",
      flexi: "yes",
      postman: "yes",
      bruno: "yes",
    },
  ];

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

<section id="comparison" class="comp-section" bind:this={sectionEl}>
  <div class="comp-grid-bg" aria-hidden="true"></div>
  <div class="comp-inner" class:visible={sectionRevealed || isVisible}>
    <div class="section-label">
      <span class="label-dot"></span>
      COMPETITIVE ANALYSIS
    </div>

    <h2 class="section-heading">
      How does Flexiberry compare to <br />
      <span class="h-accent">traditional API tools?</span>
    </h2>

    <!-- Comparison Table -->
    <div class="table-container">
      <table class="comp-table">
        <thead>
          <tr>
            <th class="feature-col">Feature</th>
            <th class="brand-col flexi-col">Flexiberry</th>
            <th class="brand-col">Postman</th>
            <th class="brand-col">Bruno</th>
          </tr>
        </thead>
        <tbody>
          {#each features as feat}
            <tr>
              <td class="feature-name">
                <span class="feat-title">{feat.name}</span>
                <span class="feat-desc">{feat.description}</span>
              </td>

              <!-- Flexiberry Col -->
              <td class="brand-val flexi-val">
                <span class="indicator-wrap success-glow">
                  <svg
                    class="icon-check"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span class="val-text">Yes</span>
                </span>
              </td>

              <!-- Postman Col -->
              <td class="brand-val">
                {#if feat.postman === "yes"}
                  <span class="indicator-wrap success-glow">
                    <svg
                      class="icon-check"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span class="val-text">Yes</span>
                  </span>
                {:else if feat.postman === "partial"}
                  <span class="indicator-wrap warning-glow">
                    <svg
                      class="icon-warning"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path
                        d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                      />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span class="val-text">Limited</span>
                  </span>
                {:else}
                  <span class="indicator-wrap danger-glow">
                    <svg
                      class="icon-close"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" /><line
                        x1="6"
                        y1="6"
                        x2="18"
                        y2="18"
                      />
                    </svg>
                    <span class="val-text">No</span>
                  </span>
                {/if}
              </td>

              <!-- Bruno Col -->
              <td class="brand-val">
                {#if feat.bruno === "yes"}
                  <span class="indicator-wrap success-glow">
                    <svg
                      class="icon-check"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span class="val-text">Yes</span>
                  </span>
                {:else if feat.bruno === "partial"}
                  <span class="indicator-wrap warning-glow">
                    <svg
                      class="icon-warning"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path
                        d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                      />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span class="val-text">Limited</span>
                  </span>
                {:else}
                  <span class="indicator-wrap danger-glow">
                    <svg
                      class="icon-close"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" /><line
                        x1="6"
                        y1="6"
                        x2="18"
                        y2="18"
                      />
                    </svg>
                    <span class="val-text">No</span>
                  </span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Key Highlight Cards -->
    <div class="comp-cards-grid">
      <div class="comp-card flexi-highlight">
        <div class="comp-card-badge">VS POSTMAN & INSOMNIA</div>
        <h3 class="comp-card-title">Zero Cloud Lock-in & No JS Scripts</h3>
        <p class="comp-card-desc">
          Replace heavy GUI apps and hidden <code class="code-inline">pm.response.json()</code> scripts with human-readable <code class="code-inline">.berry</code> files committed directly to your Git repository.
        </p>
      </div>

      <div class="comp-card">
        <div class="comp-card-badge">VS BRUNO</div>
        <h3 class="comp-card-title">Native Chaining & Web Playground</h3>
        <p class="comp-card-desc">
          Flexiberry features first-class <code class="code-inline">Capture</code> and <code class="code-inline">Task</code> primitives for sequential workflow chaining, along with an instant in-browser Web IDE.
        </p>
      </div>

      <div class="comp-card">
        <div class="comp-card-badge">VS CURL & BASH SCRIPTS</div>
        <h3 class="comp-card-title">Readable Specs & Automated Checks</h3>
        <p class="comp-card-desc">
          Ditch fragile bash scripts with complex <code class="code-inline">jq</code> string manipulation. Write clean API declarations with automated response assertions out of the box.
        </p>
      </div>
    </div>
  </div>
</section>

<style>
  .comp-section {
    position: relative;
    padding: 6rem 0;
    background: #06080e;
    overflow: hidden;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }
  .comp-grid-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    background-image:
      linear-gradient(rgba(52, 211, 153, 0.008) 1px, transparent 1px),
      linear-gradient(90deg, rgba(52, 211, 153, 0.008) 1px, transparent 1px);
    background-size: 50px 50px;
    mask-image: radial-gradient(circle at 50% 50%, black, transparent 85%);
    -webkit-mask-image: radial-gradient(
      circle at 50% 50%,
      black,
      transparent 85%
    );
    pointer-events: none;
  }
  .comp-inner {
    position: relative;
    z-index: 2;
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 1.5rem;
    opacity: 0;
    transform: translateY(30px);
    transition:
      opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .comp-inner.visible {
    opacity: 1;
    transform: none;
  }

  /* Headings */
  .section-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.72rem;
    font-family: "JetBrains Mono", monospace;
    font-weight: 700;
    color: #34d399;
    letter-spacing: 0.12em;
    background: rgba(52, 211, 153, 0.05);
    border: 1px solid rgba(52, 211, 153, 0.15);
    border-radius: 9999px;
    padding: 0.35rem 0.95rem;
    margin-bottom: 1.25rem;
  }
  .label-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #34d399;
    box-shadow: 0 0 8px #34d399;
  }
  .section-heading {
    font-size: clamp(1.8rem, 3.5vw, 2.5rem);
    font-weight: 800;
    line-height: 1.25;
    color: #fff;
    letter-spacing: -0.02em;
    margin: 0 0 2.5rem;
    font-family: "JetBrains Mono", monospace;
  }
  .h-accent {
    background: linear-gradient(135deg, #34d399, #38bdf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Table styling */
  .table-container {
    width: 100%;
    overflow-x: auto;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(13, 17, 23, 0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  }
  .comp-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  th,
  td {
    padding: 1.1rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    vertical-align: middle;
  }
  th {
    background: rgba(255, 255, 255, 0.03);
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #94a3b8;
    font-family: "JetBrains Mono", monospace;
  }
  .feature-col {
    width: 46%;
  }
  .brand-col {
    width: 18%;
    text-align: center;
  }
  .flexi-col {
    color: #34d399;
    background: rgba(52, 211, 153, 0.04);
  }

  .feature-name {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .feat-title {
    font-weight: 700;
    font-size: 0.92rem;
    color: #f1f5f9;
  }
  .feat-desc {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 400;
    line-height: 1.35;
  }

  .brand-val {
    text-align: center;
    font-size: 0.85rem;
  }
  .flexi-val {
    background: rgba(52, 211, 153, 0.02);
  }

  /* Status Indicators */
  .indicator-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.25rem 0.7rem;
    border-radius: 9999px;
    font-weight: 700;
    font-size: 0.7rem;
    font-family: "JetBrains Mono", monospace;
  }

  .success-glow {
    background: rgba(52, 211, 153, 0.08);
    border: 1px solid rgba(52, 211, 153, 0.2);
    color: #34d399;
    box-shadow: 0 0 10px rgba(52, 211, 153, 0.08);
  }
  .warning-glow {
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.2);
    color: #f59e0b;
  }
  .danger-glow {
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.16);
    color: #f87171;
  }

  .icon-check {
    stroke-width: 3.5px;
  }
  .icon-warning {
    color: #f59e0b;
  }
  .icon-close {
    stroke-width: 3.5px;
  }

  /* Highlights Grid */
  .comp-cards-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 1.25rem;
    margin-top: 2.5rem;
  }

  @media (min-width: 768px) {
    .comp-cards-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .comp-card {
    background: rgba(13, 17, 23, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1.35rem;
    transition: transform 0.2s ease, border-color 0.2s ease;
  }

  .comp-card:hover {
    transform: translateY(-3px);
    border-color: rgba(255, 255, 255, 0.18);
  }

  .comp-card.flexi-highlight {
    background: rgba(52, 211, 153, 0.03);
    border: 1px solid rgba(52, 211, 153, 0.25);
  }

  .comp-card-badge {
    font-size: 0.64rem;
    font-family: "JetBrains Mono", monospace;
    font-weight: 700;
    color: #34d399;
    letter-spacing: 0.08em;
    margin-bottom: 0.6rem;
  }

  .comp-card-title {
    font-size: 0.98rem;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 0.5rem;
    line-height: 1.3;
    font-family: "JetBrains Mono", monospace;
  }

  .comp-card-desc {
    font-size: 0.78rem;
    color: #94a3b8;
    line-height: 1.5;
  }

  .code-inline {
    background: rgba(255, 255, 255, 0.06);
    color: #34d399;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    font-family: "JetBrains Mono", monospace;
    font-size: 0.72rem;
  }
</style>
