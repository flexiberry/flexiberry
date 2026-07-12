<script lang="ts">
  import { onMount } from "svelte";

  let { isVisible = false } = $props<{ isVisible?: boolean }>();

  // ── Canvas background ─────────────────────────────────────────────────────
  let bgCanvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let mouse = { x: -1000, y: -1000 };

  const berryKeywords = [
    "Var",
    "Api",
    "Url",
    "Header",
    "Body",
    "Task",
    "Step",
    "Check",
    "Capture",
    "Params",
    "POST",
    "GET",
    "PUT",
    "DELETE",
    "@UAT",
    "@prod",
    "#addPet",
    "$.status",
    "response.id",
  ];
  const tokenColors = [
    "#c084fc",
    "#34d399",
    "#f97316",
    "#93c5fd",
    "#fcd34d",
    "#4ade80",
    "#f472b6",
  ];

  interface FlyWord {
    text: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    baseSize: number;
    scale: number;
    color: string;
    alpha: number;
    rotate: number;
    rotateSpeed: number;
    hoverTick: number;
    deflectTick: number;
  }
  const flyingWords: FlyWord[] = [];

  function spawnWord(w: number, h: number): FlyWord {
    const size = 10 + Math.random() * 10;
    return {
      text: berryKeywords[Math.floor(Math.random() * berryKeywords.length)],
      x: Math.random() * w,
      y: Math.random() * h,
      vx: -0.15 + Math.random() * 0.3,
      vy: -0.1 + Math.random() * 0.2,
      size,
      baseSize: size,
      scale: 1,
      color: tokenColors[Math.floor(Math.random() * tokenColors.length)],
      alpha: 0.12 + Math.random() * 0.1, // Increased word visibility by 30-40%
      rotate: Math.random() * Math.PI * 2,
      rotateSpeed: -0.003 + Math.random() * 0.006,
      hoverTick: 0,
      deflectTick: 0,
    };
  }

  function animateWords() {
    if (!bgCanvas || !ctx) return;
    const W = (bgCanvas.width = bgCanvas.offsetWidth);
    const H = (bgCanvas.height = bgCanvas.offsetHeight);
    ctx.clearRect(0, 0, W, H);
    while (flyingWords.length < 24) flyingWords.push(spawnWord(W, H));
    for (let i = 0; i < flyingWords.length; i++) {
      const fw = flyingWords[i];
      ctx.save();
      ctx.font = `${fw.size}px 'JetBrains Mono', monospace`;
      const tw = ctx.measureText(fw.text).width;
      ctx.restore();
      const dx = mouse.x - fw.x,
        dy = mouse.y - fw.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < Math.max(fw.size, tw) * 0.8) {
        fw.scale += (1.4 - fw.scale) * 0.2;
        fw.hoverTick = 8;
        if (fw.deflectTick === 0) {
          const a = Math.atan2(dy, dx) + Math.PI;
          fw.vx += Math.cos(a) * 0.4;
          fw.vy += Math.sin(a) * 0.4;
          fw.deflectTick = 12;
        }
      } else {
        fw.scale += (1 - fw.scale) * 0.07;
        if (fw.hoverTick > 0) fw.hoverTick--;
        if (fw.deflectTick > 0) fw.deflectTick--;
      }
      ctx.save();
      ctx.globalAlpha = fw.alpha * fw.scale;
      ctx.font = `${fw.baseSize * fw.scale}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = fw.color;
      ctx.translate(fw.x, fw.y);
      ctx.rotate(fw.rotate);
      ctx.fillText(fw.text, 0, 0);
      ctx.restore();
      fw.x += fw.vx;
      fw.y += fw.vy;
      fw.rotate += fw.rotateSpeed;
      fw.vx *= 0.98;
      fw.vy *= 0.98;
      if (fw.x < -120 || fw.x > W + 120 || fw.y < -40 || fw.y > H + 40) {
        flyingWords[i] = spawnWord(W, H);
      }
    }
    requestAnimationFrame(animateWords);
  }

  // ── Interactive Tabs State (Svelte 5 run-time states) ──────────────────────
  let activeTab = $state(0);
  let tabInterval: any;

  function selectTab(index: number) {
    activeTab = index;
    // Clear auto rotation on user click
    if (tabInterval) clearInterval(tabInterval);
  }

  onMount(() => {
    // Canvas background
    if (bgCanvas) {
      ctx = bgCanvas.getContext("2d");
      bgCanvas.width = bgCanvas.offsetWidth;
      bgCanvas.height = bgCanvas.offsetHeight;
      bgCanvas.addEventListener("mousemove", (e) => {
        const r = bgCanvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      });
      bgCanvas.addEventListener("mouseleave", () => {
        mouse.x = -1000;
        mouse.y = -1000;
      });
      animateWords();
    }
    window.addEventListener("resize", () => {
      if (bgCanvas && ctx) {
        bgCanvas.width = bgCanvas.offsetWidth;
        bgCanvas.height = bgCanvas.offsetHeight;
      }
    });

    // Auto-cycle tabs every 7 seconds
    tabInterval = setInterval(() => {
      activeTab = (activeTab + 1) % 3;
    }, 7000);

    return () => {
      if (tabInterval) clearInterval(tabInterval);
    };
  });
</script>

<!-- ── Hero Section ─────────────────────────────────────────────────────── -->
<section class="hero-section">
  <!-- Dynamic floating canvas keywords -->
  <canvas bind:this={bgCanvas} class="hero-canvas"></canvas>

  <!-- Glowing background gradients -->
  <div class="hero-blobs" aria-hidden="true">
    <div class="blob blob-emerald"></div>
    <div class="blob blob-indigo"></div>
    <div class="blob blob-cyan"></div>
  </div>

  <!-- Micro-grid overlay -->
  <div class="hero-grid" aria-hidden="true"></div>

  <!-- Container -->
  <div class="hero-content" class:visible={isVisible}>
    <!-- Left Panel: Brand, Headline & Interactive Selectors -->
    <div class="hero-left-panel">
      <!-- Badge -->
      <span class="hero-badge">
        <span class="badge-dot"></span>
        BERRY LANGUAGE · OPEN BETA
      </span>

      <!-- Bold Gradient Headline -->
      <h1 class="hero-heading">
        API Testing as Code. <br />
        <span class="heading-gradient">Chain workflows, not collections.</span>
      </h1>

      <!-- Description -->
      <p class="hero-sub">
        Flexiberry is the open-source API testing framework that chains
        dependent requests sequentially using a clean, declarative language.
        Zero Javascript boilerplate. Zero environment sync pain. Just readable <code
          class="inline-code">.berry</code
        > scripts that run natively from your editor, CLI, or CI/CD pipelines.
      </p>

      <!-- CTA Action Button Row -->
      <div class="hero-actions">
        <a
          href="https://github.com/flexiberry/flexiberry"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-primary"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
            style="flex-shrink: 0;"
          >
            <path
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
          <span>Star on GitHub</span>
          <span class="btn-circle-arrow">➔</span>
        </a>
        <a
          href="https://docs.flexiberry.dev"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-secondary"
        >
          Read Docs
        </a>
      </div>

      <!-- Vertical Interactive Tab Selectors -->
      <div class="tab-selectors">
        <!-- Tab 0: CLI -->
        <button
          class="tab-btn"
          class:active={activeTab === 0}
          onclick={() => selectTab(0)}
          style="--accent: #34d399;"
        >
          <div class="tab-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="4 17 10 11 4 5" /><line
                x1="12"
                y1="19"
                x2="20"
                y2="19"
              />
            </svg>
          </div>
          <div class="tab-btn-content">
            <span class="tab-btn-title">01 / Command Line Interface</span>
            <span class="tab-btn-desc"
              >Run workflows in any terminal or integrate into CI/CD pipelines.</span
            >
          </div>
        </button>

        <!-- Tab 1: VS Code -->
        <button
          class="tab-btn"
          class:active={activeTab === 1}
          onclick={() => selectTab(1)}
          style="--accent: #a78bfa;"
        >
          <div class="tab-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line
                x1="8"
                y1="21"
                x2="16"
                y2="21"
              /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div class="tab-btn-content">
            <span class="tab-btn-title">02 / VS Code & Open-VSX</span>
            <span class="tab-btn-desc"
              >Write scripts with syntax highlighting, autocomplete & inline
              runs.</span
            >
          </div>
        </button>

        <!-- Tab 2: Web App -->
        <button
          class="tab-btn"
          class:active={activeTab === 2}
          onclick={() => selectTab(2)}
          style="--accent: #fb923c;"
        >
          <div class="tab-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 3h18v18H3z" /><path d="M21 9H3M21 15H3M12 3v18" />
            </svg>
          </div>
          <div class="tab-btn-content">
            <span class="tab-btn-title">03 / Web App Dashboard</span>
            <span class="tab-btn-desc"
              >Build chains visually, manage environments, and track execution
              logs.</span
            >
          </div>
        </button>
      </div>
    </div>

    <!-- Right Panel: High-Fidelity Glassmorphic Device Showcase -->
    <div class="hero-right-panel">
      <div
        class="showcase-window"
        style="--theme-color: {activeTab === 0
          ? '#34d399'
          : activeTab === 1
            ? '#a78bfa'
            : '#fb923c'};"
      >
        <!-- Window titlebar -->
        <div class="window-header">
          <div class="window-dots">
            <span class="window-dot red"></span>
            <span class="window-dot yellow"></span>
            <span class="window-dot green"></span>
          </div>
          <span class="window-title">
            {activeTab === 0
              ? "terminal — flexiberry run"
              : activeTab === 1
                ? "VS Code — auth-flow.berry"
                : "app.flexiberry.dev"}
          </span>
        </div>

        <!-- Window viewport -->
        <div class="window-body">
          {#key activeTab}
            {#if activeTab === 0}
              <!-- CLI Terminal Simulator -->
              <div class="cli-mockup">
                <div class="cli-line typing">
                  <span class="cli-prompt">$</span> flexiberry run auth.berry
                </div>
                <div class="cli-line loading">
                  Loading script and initializing environment...
                </div>
                <div class="cli-line run-step step-1">
                  <span class="status-badge success">RUN</span> Step 1: User
                  Authentication
                  <div class="sub-log">
                    ✔ POST /api/v1/auth/login <span class="log-meta"
                      >200 OK (38ms)</span
                    >
                  </div>
                  <div class="sub-log">
                    ✔ Captured variable <span class="log-var">token</span>
                  </div>
                </div>
                <div class="cli-line run-step step-2">
                  <span class="status-badge success">RUN</span> Step 2: Fetch
                  Account Profile
                  <div class="sub-log">
                    ✔ GET /api/v1/user/profile <span class="log-meta"
                      >200 OK (22ms)</span
                    >
                  </div>
                  <div class="sub-log">
                    ✔ Assertion check <span class="log-meta"
                      >$.status == 200</span
                    > passed
                  </div>
                </div>
                <div class="cli-line finished">
                  <span class="cli-success-text"
                    >✔ Success: All tasks completed successfully in 60ms.</span
                  >
                </div>
              </div>
            {:else if activeTab === 1}
              <!-- VS Code Editor Simulator -->
              <div class="editor-mockup">
                <div class="editor-lines">
                  <div class="code-line">
                    <span class="c-comment"
                      ># API Definitions & Task Testing Suite</span
                    >
                  </div>
                  <div class="code-line">
                    <span class="c-keyword">Var</span> Config
                  </div>
                  <div class="code-line indent-1">
                    - baseUrl: <span class="c-string"
                      >"https://api.flexiberry.dev"</span
                    >
                  </div>
                  <div class="code-line"></div>
                  <div class="code-line">
                    <span class="c-keyword">Api</span>
                    <span class="c-method">POST</span>
                    <span class="c-identifier">#loginUser</span>
                  </div>
                  <div class="code-line indent-1">
                    <span class="c-keyword">Url</span>
                    {"{{Config.baseUrl}}/auth/login"}
                  </div>
                  <div class="code-line indent-1">
                    <span class="c-keyword">Body</span> JSON `&#123; "username":
                    "admin" &#125;`
                  </div>
                  <div class="code-line"></div>
                  <div class="code-line">
                    <span class="c-keyword">Api</span>
                    <span class="c-method">GET</span>
                    <span class="c-identifier">#fetchProfile</span>
                  </div>
                  <div class="code-line indent-1">
                    <span class="c-keyword">Url</span>
                    {"{{Config.baseUrl}}/user/profile"}
                  </div>
                  <div class="code-line indent-1">
                    <span class="c-keyword">Header</span>
                  </div>
                  <div class="code-line indent-1">
                    - Authorization: <span class="c-string"
                      >"Bearer {"{{token}}"}"</span
                    >
                  </div>
                  <div class="code-line"></div>
                  <div class="code-line">
                    <span class="c-keyword">Task</span> Authenticate and Fetch Profile
                  </div>
                  <div class="code-line indent-1">
                    <span class="c-keyword">Step</span> Call Api loginUser
                  </div>
                  <div class="code-line indent-2">
                    <span class="c-keyword">Capture</span>
                  </div>
                  <div class="code-line indent-2">- token: response.token</div>
                  <div class="code-line indent-2">
                    <span class="c-keyword">Check</span>
                  </div>
                  <div class="code-line indent-2">- $.status == 200</div>
                </div>
                <!-- Mini inline run decoration -->
                <div class="editor-inline-action">
                  <span class="action-play">▶</span> Run Workflow (Shift+Enter)
                </div>
              </div>
            {:else if activeTab === 2}
              <!-- Web App Dashboard Simulator -->
              <div class="browser-mockup">
                <!-- Dashboard metrics top row -->
                <div class="dash-metrics">
                  <div class="dash-stat">
                    <span class="stat-num">99.4%</span>
                    <span class="stat-title">Success Rate</span>
                  </div>
                  <div class="dash-stat">
                    <span class="stat-num">24ms</span>
                    <span class="stat-title">Avg Latency</span>
                  </div>
                  <div class="dash-stat">
                    <span class="stat-num">350</span>
                    <span class="stat-title">Runs Today</span>
                  </div>
                </div>

                <!-- Recent request list feed -->
                <div class="dash-feed">
                  <div class="feed-item">
                    <span class="badge-method post">POST</span>
                    <span class="feed-path">/auth/login</span>
                    <span class="feed-time">1s ago</span>
                    <span class="feed-status ok">200 OK</span>
                  </div>
                  <div class="feed-item">
                    <span class="badge-method get">GET</span>
                    <span class="feed-path">/user/profile</span>
                    <span class="feed-time">2s ago</span>
                    <span class="feed-status ok">200 OK</span>
                  </div>
                  <div class="feed-item">
                    <span class="badge-method put">PUT</span>
                    <span class="feed-path">/user/settings</span>
                    <span class="feed-time">5s ago</span>
                    <span class="feed-status ok">204 No Content</span>
                  </div>
                  <div class="feed-item">
                    <span class="badge-method delete">DEL</span>
                    <span class="feed-path">/auth/logout</span>
                    <span class="feed-time">8s ago</span>
                    <span class="feed-status ok">200 OK</span>
                  </div>
                </div>
              </div>
            {/if}
          {/key}
        </div>
      </div>

      <!-- Redirection Button Group on Right Side (below Mockup) -->
      <div class="hero-redirect-group">
        <!-- CLI -->
        <a
          href="https://www.npmjs.com/package/@flexiberry/cli"
          target="_blank"
          rel="noopener noreferrer"
          class="redirect-pill cli-pill"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="4 17 10 11 4 5" /><line
              x1="12"
              y1="19"
              x2="20"
              y2="19"
            />
          </svg>
          <span>CLI Client</span>
        </a>

        <!-- Extension -->
        <a
          href="https://open-vsx.org/extension/flexiberry/vscode-berry-extension"
          target="_blank"
          rel="noopener noreferrer"
          class="redirect-pill ext-pill"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line
              x1="8"
              y1="21"
              x2="16"
              y2="21"
            /><line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span>VS Code Extension</span>
        </a>

        <!-- Dashboard -->
        <a
          href="https://app.flexiberry.dev"
          target="_blank"
          rel="noopener noreferrer"
          class="redirect-pill app-pill"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 3h18v18H3z" /><path d="M21 9H3M21 15H3M12 3v18" />
          </svg>
          <span>Web Dashboard</span>
        </a>
      </div>

      <!-- Social Proof / Trust Badges -->
      <div class="trust-badges">
        <span class="trust-badge">100% Open Source</span>
        <span class="trust-badge">Zero Dependencies</span>
        <span class="trust-badge">CI/CD Ready</span>
        <span class="trust-badge">MIT Licensed</span>
      </div>
    </div>
  </div>
</section>

<style>
  /* ── Core Section Styles ──────────────────────────────────────────────── */
  .hero-section {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    overflow: hidden;
    background: #030305;
    padding-top: 100px;
    padding-bottom: 60px;
  }
  .hero-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
  }
  .hero-blobs {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(140px);
    opacity: 0.15;
  }
  .blob-emerald {
    width: 45vw;
    height: 45vw;
    background: radial-gradient(circle, #059669, transparent 70%);
    top: -10%;
    left: -10%;
    animation: drift 15s ease-in-out infinite alternate;
  }
  .blob-indigo {
    width: 40vw;
    height: 40vw;
    background: radial-gradient(circle, #6366f1, transparent 70%);
    bottom: -10%;
    right: -5%;
    animation: drift 20s ease-in-out infinite alternate-reverse;
  }
  .blob-cyan {
    width: 30vw;
    height: 30vw;
    background: radial-gradient(circle, #06b6d4, transparent 70%);
    top: 50%;
    left: 40%;
    animation: drift 12s ease-in-out infinite alternate;
  }
  @keyframes drift {
    0% {
      transform: translate(0, 0) scale(1);
    }
    100% {
      transform: translate(5%, 8%) scale(1.1);
    }
  }

  .hero-grid {
    position: absolute;
    inset: 0;
    z-index: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.012) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.012) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(circle at 60% 50%, black, transparent 80%);
    -webkit-mask-image: radial-gradient(
      circle at 60% 50%,
      black,
      transparent 80%
    );
  }

  /* ── Content Grid ────────────────────────────────────────────────────── */
  .hero-content {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 2rem;
    display: grid;
    grid-template-columns: 1.25fr 0.75fr; /* Increased left panel width by ~13% */
    gap: 4.5rem;
    align-items: center;
    opacity: 0;
    transform: translateY(30px);
    transition:
      opacity 1s cubic-bezier(0.16, 1, 0.3, 1),
      transform 1s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .hero-content.visible {
    opacity: 1;
    transform: none;
  }

  /* Trust Badges */
  .trust-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 2.5rem;
  }
  .trust-badge {
    font-size: 0.68rem;
    color: #64748b;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    padding: 0.25rem 0.65rem;
    font-family: "JetBrains Mono", monospace;
    letter-spacing: 0.02em;
    transition:
      border-color 0.2s,
      color 0.2s;
  }
  .trust-badge:hover {
    border-color: rgba(52, 211, 153, 0.2);
    color: #e2e8f0;
  }

  /* ── Left Panel ──────────────────────────────────────────────────────── */
  .hero-left-panel {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.72rem;
    font-family: "JetBrains Mono", monospace;
    font-weight: 700;
    color: #4ade80;
    letter-spacing: 0.12em;
    background: rgba(74, 222, 128, 0.06);
    border: 1px solid rgba(74, 222, 128, 0.18);
    border-radius: 9999px;
    padding: 0.35rem 0.95rem;
    margin-bottom: 1.5rem;
  }
  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 8px #4ade80;
    animation: blink-dot 2.5s ease-in-out infinite;
  }
  @keyframes blink-dot {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.35;
    }
  }

  .hero-heading {
    font-size: clamp(2.4rem, 4.8vw, 3.8rem);
    font-weight: 800;
    line-height: 1.1;
    color: #fff;
    letter-spacing: -0.03em;
    margin: 0 0 1.2rem;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
      sans-serif;
  }
  .heading-gradient {
    background: linear-gradient(135deg, #34d399, #38bdf8, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-sub {
    font-size: 1.05rem;
    color: #94a3b8;
    line-height: 1.7;
    max-width: 580px;
    margin: 0 0 2rem;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .inline-code {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.9em;
    color: #34d399;
    background: rgba(52, 211, 153, 0.08);
    border-radius: 4px;
    padding: 0.05em 0.3em;
    border: 1px solid rgba(52, 211, 153, 0.12);
  }

  /* CTAs */
  .hero-actions {
    display: flex;
    gap: 1.25rem;
    margin-bottom: 3rem;
    flex-wrap: wrap;
  }
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    background: #fff;
    color: #030712;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    padding: 0.45rem 0.45rem 0.45rem 1.5rem;
    border-radius: 9999px;
    text-decoration: none;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    background: #f4f4f5;
    box-shadow: 0 12px 24px rgba(255, 255, 255, 0.15);
  }
  .btn-circle-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.2rem;
    height: 2.2rem;
    background: #030712;
    color: #fff;
    border-radius: 50%;
    font-size: 0.8rem;
    transition: transform 0.25s ease;
  }
  .btn-primary:hover .btn-circle-arrow {
    transform: translateX(2px);
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #f1f5f9;
    font-weight: 600;
    padding: 0.7rem 1.6rem;
    border-radius: 9999px;
    font-size: 0.9rem;
    text-decoration: none;
    transition: all 0.2s;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.15);
  }

  /* Vertical Tab Selectors */
  .tab-selectors {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    width: 100%;
    max-width: 480px;
  }
  .tab-btn {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    background: rgba(255, 255, 255, 0.01);
    border: 1px solid rgba(255, 255, 255, 0.03);
    border-radius: 0.85rem;
    padding: 1.1rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    width: 100%;
    position: relative;
    overflow: hidden;
  }
  .tab-btn:hover {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.08);
  }
  .tab-btn.active {
    background: rgba(255, 255, 255, 0.04);
    border-color: var(--accent);
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.25),
      inset 0 0 12px rgba(255, 255, 255, 0.02);
  }

  .tab-icon {
    flex-shrink: 0;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    transition: all 0.3s;
  }
  .tab-btn:hover .tab-icon {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.12);
  }
  .tab-btn.active .tab-icon {
    background: var(--accent);
    color: #030712;
    border-color: transparent;
    box-shadow: 0 0 12px var(--accent);
  }

  .tab-btn-content {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .tab-btn-title {
    font-size: 0.88rem;
    font-weight: 700;
    color: #94a3b8;
    transition: color 0.2s;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .tab-btn.active .tab-btn-title {
    color: #fff;
  }
  .tab-btn-desc {
    font-size: 0.78rem;
    color: #64748b;
    line-height: 1.4;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .tab-btn.active .tab-btn-desc {
    color: #94a3b8;
  }

  /* Redirection Button Group on Right Side */
  .hero-redirect-group {
    display: inline-flex;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: 9999px;
    padding: 0.25rem;
    gap: 0.25rem;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  }
  .redirect-pill {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.45rem 0.95rem;
    border-radius: 9999px;
    font-size: 0.72rem;
    font-weight: 700;
    color: #64748b;
    text-decoration: none;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .redirect-pill svg {
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .redirect-pill:hover svg {
    transform: translate(1px, -1px);
  }

  .cli-pill:hover {
    color: #34d399;
    background: rgba(52, 211, 153, 0.08);
  }
  .ext-pill:hover {
    color: #a78bfa;
    background: rgba(167, 139, 250, 0.08);
  }
  .app-pill:hover {
    color: #fb923c;
    background: rgba(251, 146, 60, 0.08);
  }

  /* ── Right Panel: Devices Frame Showcase ────────────────────────────── */
  .hero-right-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    position: relative;
    width: 100%;
  }

  .showcase-window {
    width: 100%;
    max-width: 520px;
    height: 400px;
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border-radius: 1.25rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    box-shadow: none; /* Removed dropshadow entirely */

    /* Rounded Gradient Border trick */
    border: 1px solid transparent;
    background-image:
      linear-gradient(rgba(10, 10, 15, 0.85), rgba(10, 10, 15, 0.85)),
      linear-gradient(
        135deg,
        var(--theme-color) 0%,
        rgba(255, 255, 255, 0.04) 100%
      );
    background-origin: border-box;
    background-clip: padding-box, border-box;

    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Glass Sheen overlay */
  .showcase-window::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 50%
    );
    pointer-events: none;
    z-index: 10;
  }

  .window-header {
    display: flex;
    align-items: center;
    height: 38px;
    padding: 0 1.25rem;
    background: rgba(22, 22, 30, 0.5);
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    position: relative;
  }
  .window-dots {
    display: flex;
    gap: 0.4rem;
  }
  .window-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  .window-dot.red {
    background: #ff5f56;
  }
  .window-dot.yellow {
    background: #ffbd2e;
  }
  .window-dot.green {
    background: #27c93f;
  }
  .window-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-family: "JetBrains Mono", monospace;
    font-size: 0.72rem;
    color: #64748b;
    white-space: nowrap;
  }

  .window-body {
    flex: 1;
    overflow: hidden;
    padding: 1.5rem;
    position: relative;
  }

  /* 💻 CLI Terminal Mockup */
  .cli-mockup {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    font-family: "JetBrains Mono", monospace;
    font-size: 0.72rem;
    line-height: 1.5;
    color: #cbd5e1;
    text-align: left;
  }
  .cli-line {
    opacity: 0;
    animation: fade-in-line 0.3s ease forwards;
  }
  .cli-prompt {
    color: #34d399;
    font-weight: 700;
  }
  .cli-line.typing {
    animation-delay: 0.1s;
  }
  .cli-line.loading {
    color: #64748b;
    animation-delay: 0.8s;
  }
  .cli-line.run-step.step-1 {
    animation-delay: 1.8s;
  }
  .cli-line.run-step.step-2 {
    animation-delay: 3.2s;
  }
  .cli-line.finished {
    animation-delay: 4.5s;
  }

  .status-badge {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.05rem 0.35rem;
    border-radius: 3px;
    margin-right: 0.4rem;
  }
  .status-badge.success {
    background: rgba(52, 211, 153, 0.12);
    color: #34d399;
    border: 1px solid rgba(52, 211, 153, 0.2);
  }
  .sub-log {
    padding-left: 1.25rem;
    color: #94a3b8;
    margin-top: 0.15rem;
  }
  .log-meta {
    color: #64748b;
  }
  .log-var {
    color: #a78bfa;
    background: rgba(167, 139, 250, 0.1);
    padding: 0 0.25rem;
    border-radius: 3px;
  }
  .cli-success-text {
    color: #34d399;
    font-weight: 700;
  }

  @keyframes fade-in-line {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  /* 🔌 VS Code Editor Mockup */
  .editor-mockup {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    font-family: "JetBrains Mono", monospace;
    font-size: 0.72rem;
    line-height: 1.5;
    text-align: left;
  }
  .editor-lines {
    display: flex;
    flex-direction: column;
  }
  .code-line {
    min-height: 1.1rem;
    white-space: pre;
    opacity: 0;
    animation: slide-in-code 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .code-line:nth-child(1) {
    animation-delay: 0.05s;
  }
  .code-line:nth-child(2) {
    animation-delay: 0.1s;
  }
  .code-line:nth-child(4) {
    animation-delay: 0.2s;
  }
  .code-line:nth-child(5) {
    animation-delay: 0.25s;
  }
  .code-line:nth-child(6) {
    animation-delay: 0.3s;
  }
  .code-line:nth-child(7) {
    animation-delay: 0.35s;
  }
  .code-line:nth-child(8) {
    animation-delay: 0.4s;
  }
  .code-line:nth-child(10) {
    animation-delay: 0.5s;
  }
  .code-line:nth-child(11) {
    animation-delay: 0.55s;
  }
  .code-line:nth-child(12) {
    animation-delay: 0.6s;
  }
  .code-line:nth-child(13) {
    animation-delay: 0.65s;
  }

  @keyframes slide-in-code {
    from {
      opacity: 0;
      transform: translateX(-8px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  .c-comment {
    color: #4b5563;
  }
  .c-keyword {
    color: #c084fc;
    font-weight: 700;
  }
  .c-method {
    color: #34d399;
    font-weight: 700;
  }
  .c-string {
    color: #fcd34d;
  }
  .c-identifier {
    color: #38bdf8;
  }
  .indent-1 {
    padding-left: 1.25rem;
  }
  .indent-2 {
    padding-left: 2.2rem;
  }

  .editor-inline-action {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.65rem;
    color: #a78bfa;
    background: rgba(167, 139, 250, 0.06);
    border: 1px solid rgba(167, 139, 250, 0.15);
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    width: fit-content;
    align-self: flex-start;
    margin-top: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    opacity: 0;
    animation: fade-in-line 0.3s ease 1s forwards;
  }
  .editor-inline-action:hover {
    background: rgba(167, 139, 250, 0.12);
  }
  .action-play {
    font-size: 0.55rem;
  }

  /* 🌐 Web Dashboard Mockup */
  .browser-mockup {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    height: 100%;
    color: #cbd5e1;
  }
  .dash-metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }
  .dash-stat {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 0.6rem;
    padding: 0.6rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
    opacity: 0;
    animation: fade-in-line 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .dash-stat:nth-child(1) {
    animation-delay: 0.1s;
  }
  .dash-stat:nth-child(2) {
    animation-delay: 0.2s;
  }
  .dash-stat:nth-child(3) {
    animation-delay: 0.3s;
  }

  .stat-num {
    font-size: 1.15rem;
    font-weight: 800;
    color: #fff;
    font-family: "JetBrains Mono", monospace;
  }
  .stat-title {
    font-size: 0.6rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .dash-feed {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .feed-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.01);
    border: 1px solid rgba(255, 255, 255, 0.03);
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-family: "JetBrains Mono", monospace;
    font-size: 0.68rem;
    width: 100%;
    opacity: 0;
    animation: slide-in-feed 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .feed-item:nth-child(1) {
    animation-delay: 0.4s;
  }
  .feed-item:nth-child(2) {
    animation-delay: 0.5s;
  }
  .feed-item:nth-child(3) {
    animation-delay: 0.6s;
  }
  .feed-item:nth-child(4) {
    animation-delay: 0.7s;
  }

  @keyframes slide-in-feed {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  .badge-method {
    font-size: 0.58rem;
    font-weight: 800;
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
    width: 42px;
    text-align: center;
  }
  .badge-method.post {
    background: rgba(52, 211, 153, 0.1);
    color: #34d399;
  }
  .badge-method.get {
    background: rgba(56, 189, 248, 0.1);
    color: #38bdf8;
  }
  .badge-method.put {
    background: rgba(167, 139, 250, 0.1);
    color: #a78bfa;
  }
  .badge-method.delete {
    background: rgba(244, 63, 94, 0.1);
    color: #f43f5e;
  }

  .feed-path {
    flex: 1;
    text-align: left;
    margin-left: 0.85rem;
    color: #94a3b8;
  }
  .feed-time {
    color: #475569;
    margin-right: 1rem;
    font-size: 0.62rem;
  }
  .feed-status.ok {
    color: #34d399;
    font-weight: 700;
  }

  /* ── Responsive styling ───────────────────────────────────────────────── */
  @media (max-width: 960px) {
    .hero-content {
      grid-template-columns: 1fr;
      gap: 3.5rem;
      padding: 2rem 1.5rem 4rem;
    }
    .hero-left-panel {
      align-items: center;
      text-align: center;
    }
    .hero-sub {
      max-width: 100%;
    }
    .hero-actions {
      justify-content: center;
    }
    .tab-selectors {
      max-width: 100%;
    }
    .hero-right-panel {
      max-width: 100%;
    }
    .showcase-window {
      max-width: 100%;
      height: 380px;
    }
  }
</style>
