<script lang="ts">
  import { onMount } from "svelte";

  let { isVisible = false } = $props<{ isVisible?: boolean }>();

  let sectionEl: HTMLElement;
  let sectionRevealed = $state(false);

  const features = [
    {
      name: "API Testing as Code",
      flexi: "yes",
      postman: "partial",
      bruno: "yes",
    },
    {
      name: "Sequential Workflows",
      flexi: "yes",
      postman: "partial",
      bruno: "partial",
    },
    { name: "CLI Native", flexi: "yes", postman: "partial", bruno: "yes" },
    { name: "Web IDE", flexi: "yes", postman: "yes", bruno: "no" },
    { name: "VS Code Extension", flexi: "yes", postman: "no", bruno: "yes" },
    { name: "Load Testing", flexi: "yes", postman: "no", bruno: "no" },
    { name: "Custom Language", flexi: "yes", postman: "no", bruno: "no" },
    { name: "Git Support", flexi: "yes", postman: "no", bruno: "Yes" },
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
              <td class="feature-name">{feat.name}</td>

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
                {#if feat.postman === "partial"}
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
  </div>
</section>

<style>
  .comp-section {
    position: relative;
    padding: 7rem 0;
    background: #06080e;
    overflow: hidden;
    border-top: 1px solid rgba(255, 255, 255, 0.03);
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
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 2rem;
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
    margin-bottom: 1.5rem;
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
    margin: 0 0 3.5rem;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
    border: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(13, 17, 23, 0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 1rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
  .comp-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  th,
  td {
    padding: 1.2rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }
  th {
    background: rgba(255, 255, 255, 0.02);
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #94a3b8;
    font-family: "JetBrains Mono", monospace;
  }
  .feature-col {
    width: 40%;
  }
  .brand-col {
    width: 20%;
    text-align: center;
  }
  .flexi-col {
    color: #34d399;
    background: rgba(52, 211, 153, 0.02);
  }

  .feature-name {
    font-weight: 600;
    font-size: 0.92rem;
    color: #e2e8f0;
  }
  .brand-val {
    text-align: center;
    font-size: 0.85rem;
  }
  .flexi-val {
    background: rgba(52, 211, 153, 0.01);
  }

  /* Status Indicators */
  .indicator-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-weight: 700;
    font-size: 0.72rem;
    font-family: "JetBrains Mono", monospace;
  }

  .success-glow {
    background: rgba(52, 211, 153, 0.06);
    border: 1px solid rgba(52, 211, 153, 0.15);
    color: #34d399;
    box-shadow: 0 0 10px rgba(52, 211, 153, 0.05);
  }
  .warning-glow {
    background: rgba(245, 158, 11, 0.06);
    border: 1px solid rgba(245, 158, 11, 0.15);
    color: #f59e0b;
  }
  .danger-glow {
    background: rgba(239, 68, 68, 0.06);
    border: 1px solid rgba(239, 68, 68, 0.12);
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
</style>
