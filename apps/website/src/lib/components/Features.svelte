<script lang="ts">
  import { onMount } from "svelte";

  let { isVisible = false } = $props<{ isVisible?: boolean }>();

  const features = [
    {
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
      color: "#34d399",
      tag: "Chaining",
      title: "Seamless Chaining",
      description: "Extract headers, cookies, or body fields from one response and inject them into subsequent API requests natively.",
      code: `<span class="fc-keyword">Capture</span>\n- token: response.token\n\n<span class="fc-keyword">Header</span>\n- Authorization: <span class="fc-string">'Bearer {{token}}'</span>`
    },
    {
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"></path></svg>`,
      color: "#a78bfa",
      tag: "DSL",
      title: "Readable DSL Syntax",
      description: "Write HTTP requests, variable declarations, and expectations in a structured, domain-specific script language.",
      code: `<span class="fc-keyword">Api</span> <span class="fc-method">POST</span> <span class="fc-id">#createUser</span>\n<span class="fc-keyword">Url</span> <span class="fc-string">"{{Config.baseUrl}}/users"</span>\n<span class="fc-keyword">Header</span>\n- Content-Type: <span class="fc-string">'application/json'</span>`
    },
    {
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path></svg>`,
      color: "#38bdf8",
      tag: "Engine",
      title: "Dual-Purpose Engine",
      description: "Draft single scratchpad endpoints during development or run complex test runner flows with assertions.",
      code: `<span class="fc-comment"># Execute tasks or single endpoint APIs</span>\nflexiberry run user.berry --api createUser`
    },
    {
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
      color: "#fb923c",
      tag: "CI/CD",
      title: "CI/CD Automations",
      description: "Lightweight, zero-dependency engine. Run your tests in local shells or trigger them in GitHub Actions workflows.",
      code: `<span class="fc-comment"># GitHub Actions runner configuration</span>\n- <span class="fc-keyword">run</span>: npx flexiberry run flow.berry`
    },
    {
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
      color: "#f472b6",
      tag: "Environments",
      title: "Environment Configs",
      description: "Manage endpoints dynamically by swapping local dev, staging, or production env files without changing files.",
      code: `<span class="fc-keyword">Var</span> <span class="fc-id">@PROD</span> Production Config\n- baseUrl: <span class="fc-string">'https://api.flexiberry.dev'</span>`
    }
  ];

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
      FEATURES
    </div>
    <h2 class="section-heading">
      Key Features for<br /><span class="h-accent">Sequential API Workflows</span>
    </h2>
    <p class="section-sub">
      Flexiberry strips away the bloat and provides a lightning fast environment tailored for multi-API journeys.
    </p>

    <div class="feat-cards">
      {#each features as feat, i}
        <div
          class="feat-card feat-card-{i}"
          class:card-in={sectionRevealed || isVisible}
          style="--c:{feat.color}; --delay:{i * 100}ms; --glow-c: {feat.color}22;"
        >
          <div class="feat-card-top">
            <div class="feat-icon" style="color:{feat.color}">
              {@html feat.icon}
            </div>
            <span
              class="feat-tag"
              style="color:{feat.color}; border-color:color-mix(in srgb,{feat.color} 25%,transparent); background:color-mix(in srgb,{feat.color} 8%,transparent)"
            >
              {feat.tag}
            </span>
          </div>

          <h3 class="feat-title">{feat.title}</h3>
          <p class="feat-desc">{feat.description}</p>

          <!-- Embedded typographics block illustration -->
          <div class="feat-code-box">
            <pre class="feat-pre">{@html feat.code}</pre>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .features-section {
    position: relative;
    background: #0d0d0f;
    padding: 7rem 2rem;
    overflow: hidden;
  }
  .feat-grid-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
  }

  .features-inner {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
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
    margin: 1rem 0 1rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .feat-cards {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1.5rem;
    width: 100%;
    text-align: left;
  }

  .feat-card {
    display: flex;
    flex-direction: column;
    position: relative;
    background: rgba(255, 255, 255, 0.015);
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: 1rem;
    padding: 1.5rem;
    opacity: 0;
    transform: translateY(22px);
    transition:
      opacity 0.6s ease var(--delay),
      transform 0.6s ease var(--delay),
      border-color 0.3s ease,
      box-shadow 0.3s ease;
    grid-column: span 6;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  @media (min-width: 650px) and (max-width: 950px) {
    .feat-card {
      grid-column: span 3;
    }
    .feat-card-4 {
      grid-column: span 6;
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

  .feat-card.card-in {
    opacity: 1;
    transform: translateY(0);
  }
  .feat-card:hover {
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4), 0 0 35px var(--glow-c);
    transform: translateY(-4px);
  }

  .feat-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
  }

  .feat-icon {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 0.5rem;
    background: color-mix(in srgb, var(--c) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--c) 15%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .feat-tag {
    font-size: 0.62rem;
    font-family: "JetBrains Mono", monospace;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    border: 1px solid;
  }
  .feat-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: #fff;
    margin: 0 0 0.5rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    letter-spacing: -0.01em;
  }
  .feat-desc {
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.6;
    margin: 0 0 1.25rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    flex-grow: 1;
  }

  /* Code Block Illustrating Features */
  .feat-code-box {
    background: #030304;
    border: 1px solid rgba(255, 255, 255, 0.02);
    border-radius: 0.5rem;
    padding: 0.75rem 0.85rem;
    overflow: hidden;
  }
  .feat-pre {
    margin: 0;
    font-family: "JetBrains Mono", monospace;
    font-size: 0.68rem;
    line-height: 1.5;
    color: #94a3b8;
    text-align: left;
    white-space: pre-wrap;
  }
  :global(.fc-keyword) { color: #f43f5e; font-weight: 700; }
  :global(.fc-method) { color: #10b981; font-weight: 700; }
  :global(.fc-id) { color: #38bdf8; }
  :global(.fc-string) { color: #fbbf24; }
  :global(.fc-num) { color: #fb923c; }
  :global(.fc-comment) { color: #475569; }

  @media (max-width: 700px) {
    .feat-cards {
      grid-template-columns: 1fr;
    }
    .features-section {
      padding: 5rem 1.25rem;
    }
  }
</style>
