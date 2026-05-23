<script lang="ts">
  import { onMount } from "svelte";

  export let isVisible = false;

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
      alpha: 0.07 + Math.random() * 0.1,
      rotate: Math.random() * Math.PI * 2,
      rotateSpeed: -0.004 + Math.random() * 0.008,
      hoverTick: 0,
      deflectTick: 0,
    };
  }

  function animateWords() {
    if (!bgCanvas || !ctx) return;
    const W = (bgCanvas.width = bgCanvas.offsetWidth);
    const H = (bgCanvas.height = bgCanvas.offsetHeight);
    ctx.clearRect(0, 0, W, H);
    while (flyingWords.length < 22) flyingWords.push(spawnWord(W, H));
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
        fw.scale += (1.5 - fw.scale) * 0.2;
        fw.hoverTick = 8;
        if (fw.deflectTick === 0) {
          const a = Math.atan2(dy, dx) + Math.PI;
          fw.vx += Math.cos(a) * 0.5;
          fw.vy += Math.sin(a) * 0.5;
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

  // ── Workflow step reveal ───────────────────────────────────────────────────
  let stepVisible = [false, false, false];
  let lineProgress = 0; // 0→1 used to animate the connecting line height

  // Report counter animation
  let reportTotal = 0;
  let reportPassed = 0;
  let reportFailed = 0;
  const REPORT_TOTAL = 12;
  const REPORT_PASSED = 10;
  const REPORT_FAILED = 2;

  function animateCounters() {
    const duration = 1400;
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      reportTotal = Math.round(ease * REPORT_TOTAL);
      reportPassed = Math.round(ease * REPORT_PASSED);
      reportFailed = Math.round(ease * REPORT_FAILED);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  onMount(() => {
    setTimeout(() => {
      isVisible = true;
    }, 100);

    // Canvas
    if (bgCanvas) {
      ctx = bgCanvas.getContext("2d");
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

    // Staggered step reveal
    const delays = [400, 900, 1400];
    delays.forEach((ms, i) => {
      setTimeout(() => {
        stepVisible[i] = true;
        stepVisible = [...stepVisible]; // trigger reactivity
        // Animate the connecting line between steps 0→1, 1→2
        if (i > 0) {
          const lineStart = performance.now();
          const lineDur = 400;
          (function tickLine(now: number) {
            lineProgress = Math.min((now - lineStart) / lineDur, 1) * i;
            if (lineProgress < i) requestAnimationFrame(tickLine);
            else lineProgress = i;
          })(performance.now());
        }
        // Start counters when last step appears
        if (i === 2) setTimeout(animateCounters, 200);
      }, ms);
    });
  });
</script>

<!-- ── Hero ─────────────────────────────────────────────────────────────── -->
<section class="hero-section">
  <!-- Floating keyword canvas -->
  <canvas bind:this={bgCanvas} class="hero-canvas"></canvas>

  <!-- Gradient blobs -->
  <div class="hero-blobs" aria-hidden="true">
    <div class="blob blob-a"></div>
    <div class="blob blob-b"></div>
    <div class="blob blob-c"></div>
  </div>

  <!-- Grid overlay -->
  <div class="hero-grid" aria-hidden="true"></div>

  <!-- Main content grid -->
  <div class="hero-content" class:visible={isVisible}>
    <!-- ── Left: headline + CTA ──────────────────────────────────────── -->
    <div class="hero-left">
      <span class="hero-badge">
        <span class="badge-dot"></span>
        Berry Language · Open Beta
      </span>

      <h1 class="hero-heading">
        API testing, <br />
        as easy as writing<br />
        <span class="hero-accent">plain English</span>
      </h1>

      <p class="hero-sub">
        Write expressive <code class="inline-code">.berry</code> scripts, run them
        via CLI or the online portal, and get instant pass/fail reports — no boilerplate
        required.
      </p>

      <div class="hero-actions">
        <a href="#get-started" class="btn-primary">
          Get Started
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 7.5h11M9 3.5l4 4-4 4"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </a>
        <a href="https://docs.flexiberry.dev/" class="btn-secondary"
          >Read Docs</a
        >
      </div>

      <div class="hero-stats">
        <div class="stat">
          <span class="stat-value">~10×</span><span class="stat-label"
            >less boilerplate</span
          >
        </div>
        <div class="stat-div"></div>
        <div class="stat">
          <span class="stat-value">100%</span><span class="stat-label"
            >readable syntax</span
          >
        </div>
        <div class="stat-div"></div>
        <div class="stat">
          <span class="stat-value">0</span><span class="stat-label"
            >dependencies</span
          >
        </div>
      </div>
    </div>

    <!-- ── Right: workflow chart ──────────────────────────────────────── -->
    <div class="workflow">
      <!-- ─── Step 1: Write .berry file ──────────────────────────────── -->
      <div class="wf-step" class:wf-visible={stepVisible[0]}>
        <div class="wf-badge" style="--c:#a78bfa">
          <span class="wf-num">01</span>
        </div>
        <div class="wf-card" style="--glow:#a78bfa22; --border:#a78bfa33">
          <div class="wf-card-header">
            <span class="wf-icon" style="--ic:#a78bfa">
              <!-- file icon -->
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                /><polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" /><line
                  x1="16"
                  y1="17"
                  x2="8"
                  y2="17"
                /><polyline points="10 9 9 9 8 9" />
              </svg>
            </span>
            <div>
              <p class="wf-title">
                Write a <code class="c-code">.berry</code> script
              </p>
              <p class="wf-desc">
                Define APIs, variables, tasks and checks in one readable file.
              </p>
            </div>
          </div>
          <!-- Mini code preview -->
          <div class="mini-code">
            <div class="mc-line">
              <span class="mc-kw">Api</span><span class="mc-method">
                POST</span
              ><span class="mc-id"> #createUser</span>
            </div>
            <div class="mc-line">
              <span class="mc-kw">Url</span><span class="mc-val"
                >{"  {{baseUrl}}/users"}</span
              >
            </div>
            <div class="mc-line"><span class="mc-kw">Check</span></div>
            <div class="mc-line">
              <span class="mc-chk"> - $.status == 201</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Connector 0→1 -->
      <div class="wf-connector" class:wf-visible={stepVisible[1]}>
        <div class="connector-line"></div>
        <span class="connector-arrow">↓</span>
      </div>

      <!-- ─── Step 2: Run via CLI / portal ───────────────────────────── -->
      <div class="wf-step" class:wf-visible={stepVisible[1]}>
        <div class="wf-badge" style="--c:#34d399">
          <span class="wf-num">02</span>
        </div>
        <div class="wf-card" style="--glow:#34d39922; --border:#34d39933">
          <div class="wf-card-header">
            <span class="wf-icon" style="--ic:#34d399">
              <!-- terminal icon -->
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
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
            </span>
            <div>
              <p class="wf-title">Run via CLI or Portal</p>
              <p class="wf-desc">
                Execute in one command or use the web dashboard — no setup
                needed.
              </p>
            </div>
          </div>
          <!-- CLI + portal tabs -->
          <div class="run-tabs">
            <div class="run-tab active-tab">CLI</div>
            <div class="run-tab">Online Portal</div>
          </div>
          <div class="cli-box">
            <span class="cli-prompt">$</span>
            <span class="cli-cmd">
              flexiberry run <span class="cli-file">demo.berry</span></span
            >
            <span class="cli-blink">▌</span>
          </div>
        </div>
      </div>

      <!-- Connector 1→2 -->
      <div class="wf-connector" class:wf-visible={stepVisible[2]}>
        <div class="connector-line"></div>
        <span class="connector-arrow">↓</span>
      </div>

      <!-- ─── Step 3: Report ──────────────────────────────────────────── -->
      <div class="wf-step" class:wf-visible={stepVisible[2]}>
        <div class="wf-badge" style="--c:#fb923c">
          <span class="wf-num">03</span>
        </div>
        <div class="wf-card" style="--glow:#fb923c22; --border:#fb923c33">
          <div class="wf-card-header">
            <span class="wf-icon" style="--ic:#fb923c">
              <!-- bar chart icon -->
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="20" x2="18" y2="10" /><line
                  x1="12"
                  y1="20"
                  x2="12"
                  y2="4"
                />
                <line x1="6" y1="20" x2="6" y2="14" /><line
                  x1="2"
                  y1="20"
                  x2="22"
                  y2="20"
                />
              </svg>
            </span>
            <div>
              <p class="wf-title">Instant Test Report</p>
              <p class="wf-desc">
                Get a per-task breakdown of passed and failed assertions.
              </p>
            </div>
          </div>
          <!-- Report metrics -->
          <div class="report-metrics">
            <div class="metric metric-total">
              <span class="metric-val">{reportTotal}</span>
              <span class="metric-lbl">Total Tasks</span>
            </div>
            <div class="metric metric-pass">
              <span class="metric-val">{reportPassed}</span>
              <span class="metric-lbl">✓ Passed</span>
            </div>
            <div class="metric metric-fail">
              <span class="metric-val">{reportFailed}</span>
              <span class="metric-lbl">✗ Failed</span>
            </div>
          </div>
          <!-- Progress bar -->
          <div class="report-bar-wrap">
            <div
              class="report-bar-fill"
              class:bar-animated={stepVisible[2]}
              style="--pct:{(REPORT_PASSED / REPORT_TOTAL) * 100}%"
            ></div>
            <span class="report-bar-label"
              >{Math.round((REPORT_PASSED / REPORT_TOTAL) * 100)}% pass rate</span
            >
          </div>
        </div>
      </div>
    </div>
    <!-- end .workflow -->
  </div>
</section>

<style>
  /* ── Section & background ────────────────────────────────────────────── */
  .hero-section {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    overflow: hidden;
    background: #030712;
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
  }
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.16;
  }
  .blob-a {
    width: 55vw;
    height: 55vw;
    background: radial-gradient(circle, #34d399, transparent 70%);
    top: -15%;
    left: -15%;
    animation: drift-a 14s ease-in-out infinite alternate;
  }
  .blob-b {
    width: 40vw;
    height: 40vw;
    background: radial-gradient(circle, #a78bfa, transparent 70%);
    bottom: -10%;
    right: -10%;
    animation: drift-b 18s ease-in-out infinite alternate;
  }
  .blob-c {
    width: 28vw;
    height: 28vw;
    background: radial-gradient(circle, #38bdf8, transparent 70%);
    top: 55%;
    left: 55%;
    animation: drift-c 12s ease-in-out infinite alternate;
  }
  @keyframes drift-a {
    to {
      transform: translate(6%, 8%) scale(1.08);
    }
  }
  @keyframes drift-b {
    to {
      transform: translate(-8%, -6%);
    }
  }
  @keyframes drift-c {
    to {
      transform: translate(-48%, -52%) scale(1.05);
    }
  }
  .hero-grid {
    position: absolute;
    inset: 0;
    z-index: 0;
    background-image:
      linear-gradient(rgba(52, 211, 153, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(52, 211, 153, 0.05) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  /* ── Content grid ────────────────────────────────────────────────────── */
  .hero-content {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 5rem 2rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5rem;
    align-items: center;
    opacity: 0;
    transform: translateY(24px);
    transition:
      opacity 0.9s ease,
      transform 0.9s ease;
  }
  .hero-content.visible {
    opacity: 1;
    transform: none;
  }

  /* ── Left ────────────────────────────────────────────────────────────── */
  .hero-left {
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
  }
  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.72rem;
    font-family: "JetBrains Mono", monospace;
    color: #34d399;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: rgba(52, 211, 153, 0.09);
    border: 1px solid rgba(52, 211, 153, 0.25);
    border-radius: 9999px;
    padding: 0.3rem 0.9rem;
    width: fit-content;
  }
  .badge-dot {
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
  .hero-heading {
    font-size: clamp(2.2rem, 4.5vw, 3.5rem);
    font-weight: 800;
    line-height: 1.18;
    color: #fff;
    letter-spacing: -0.02em;
    margin: 0;
  }
  .hero-accent {
    background: linear-gradient(135deg, #34d399, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-sub {
    font-size: 1rem;
    color: #94a3b8;
    line-height: 1.78;
    max-width: 440px;
    margin: 0;
  }
  .inline-code {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.9em;
    color: #a78bfa;
    background: rgba(167, 139, 250, 0.1);
    border-radius: 4px;
    padding: 0.05em 0.3em;
  }
  .hero-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #34d399, #059669);
    color: #0a0f1a;
    font-weight: 700;
    padding: 0.75rem 1.75rem;
    border-radius: 0.5rem;
    font-size: 0.95rem;
    text-decoration: none;
    transition: all 0.25s ease;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(52, 211, 153, 0.35);
  }
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
    font-weight: 600;
    padding: 0.75rem 1.75rem;
    border-radius: 0.5rem;
    font-size: 0.95rem;
    text-decoration: none;
    transition: all 0.25s ease;
  }
  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(52, 211, 153, 0.4);
    transform: translateY(-2px);
  }
  .hero-stats {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-top: 0.5rem;
  }
  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .stat-value {
    font-size: 1.25rem;
    font-weight: 800;
    color: #fff;
  }
  .stat-label {
    font-size: 0.68rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .stat-div {
    width: 1px;
    height: 2rem;
    background: rgba(255, 255, 255, 0.1);
  }

  /* ── Workflow ─────────────────────────────────────────────────────────── */
  .workflow {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
  }

  /* Step card */
  .wf-step {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    opacity: 0;
    transform: translateX(28px);
    transition:
      opacity 0.5s ease,
      transform 0.5s ease;
  }
  .wf-step.wf-visible {
    opacity: 1;
    transform: none;
  }

  .wf-badge {
    flex-shrink: 0;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--c) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--c) 40%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.25rem;
  }
  .wf-num {
    font-size: 0.6rem;
    font-family: "JetBrains Mono", monospace;
    font-weight: 700;
    color: var(--c);
  }

  .wf-card {
    flex: 1;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border);
    border-radius: 0.85rem;
    padding: 1rem 1.1rem 1rem;
    box-shadow: 0 0 0 0 var(--glow);
    transition: box-shadow 0.4s ease;
  }
  .wf-card:hover {
    box-shadow: 0 0 30px var(--glow);
  }

  .wf-card-header {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    margin-bottom: 0.8rem;
  }
  .wf-icon {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 0.45rem;
    background: color-mix(in srgb, var(--ic) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--ic) 25%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ic);
  }
  .wf-title {
    font-size: 0.82rem;
    font-weight: 700;
    color: #e2e8f0;
    margin: 0 0 0.2rem;
  }
  .wf-desc {
    font-size: 0.72rem;
    color: #64748b;
    margin: 0;
    line-height: 1.5;
  }

  /* Connector */
  .wf-connector {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-left: calc(2.2rem / 2 + 1rem - 0.5px); /* centres on badge */
    gap: 0;
    height: 2.5rem;
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  .wf-connector.wf-visible {
    opacity: 1;
  }
  .connector-line {
    width: 1px;
    flex: 1;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.2)
    );
    animation: grow-line 0.4s ease forwards;
  }
  .connector-arrow {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.3);
    line-height: 1;
  }
  @keyframes grow-line {
    from {
      transform: scaleY(0);
      transform-origin: top;
    }
    to {
      transform: scaleY(1);
    }
  }

  /* ── Mini code preview (step 1) ──────────────────────────────────────── */
  .mini-code {
    background: #0d1117;
    border-radius: 0.5rem;
    padding: 0.6rem 0.8rem;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    line-height: 1.8;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }
  .mc-line {
    display: flex;
  }
  .mc-kw {
    color: #c084fc;
  }
  .mc-method {
    color: #f97316;
  }
  .mc-id {
    color: #34d399;
  }
  .mc-val {
    color: #fcd34d;
    white-space: pre;
  }
  .mc-chk {
    color: #4ade80;
  }

  /* ── CLI preview (step 2) ────────────────────────────────────────────── */
  .run-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.6rem;
  }
  .run-tab {
    font-size: 0.65rem;
    font-family: "JetBrains Mono", monospace;
    padding: 0.2rem 0.65rem;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
  }
  .active-tab {
    color: #34d399;
    border-color: rgba(52, 211, 153, 0.3);
    background: rgba(52, 211, 153, 0.07);
  }
  .cli-box {
    background: #0a0f1a;
    border-radius: 0.45rem;
    padding: 0.55rem 0.8rem;
    font-family: "JetBrains Mono", monospace;
    font-size: 11.5px;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }
  .cli-prompt {
    color: #34d399;
    font-weight: 700;
  }
  .cli-cmd {
    color: #e2e8f0;
  }
  .cli-file {
    color: #a78bfa;
  }
  .cli-blink {
    color: #34d399;
    animation: blink-cursor 0.85s step-start infinite;
  }
  @keyframes blink-cursor {
    0%,
    49% {
      opacity: 1;
    }
    50%,
    100% {
      opacity: 0;
    }
  }

  /* ── Report metrics (step 3) ─────────────────────────────────────────── */
  .report-metrics {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
  .metric {
    flex: 1;
    padding: 0.55rem 0.6rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.03);
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    align-items: center;
  }
  .metric-val {
    font-size: 1.35rem;
    font-weight: 800;
    font-family: "JetBrains Mono", monospace;
  }
  .metric-lbl {
    font-size: 0.6rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .metric-total .metric-val {
    color: #e2e8f0;
  }
  .metric-pass .metric-val {
    color: #4ade80;
  }
  .metric-fail .metric-val {
    color: #f87171;
  }

  .report-bar-wrap {
    height: 6px;
    background: rgba(255, 255, 255, 0.07);
    border-radius: 9999px;
    overflow: hidden;
    position: relative;
  }
  .report-bar-fill {
    height: 100%;
    width: 0;
    background: linear-gradient(90deg, #34d399, #4ade80);
    border-radius: 9999px;
    transition: width 1.4s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .report-bar-fill.bar-animated {
    width: var(--pct);
  }
  .report-bar-label {
    position: absolute;
    right: 0;
    top: -1.3rem;
    font-size: 0.62rem;
    color: #4ade80;
    font-family: "JetBrains Mono", monospace;
  }

  /* ── Responsive ──────────────────────────────────────────────────────── */
  @media (max-width: 860px) {
    .hero-content {
      grid-template-columns: 1fr;
      gap: 3rem;
      padding: 8rem 1.5rem 4rem;
    }
    .hero-left {
      align-items: center;
      text-align: center;
    }
    .hero-sub {
      max-width: 100%;
    }
    .hero-stats {
      justify-content: center;
    }
    .hero-actions {
      justify-content: center;
    }
    .wf-step {
      opacity: 1;
      transform: none;
    }
  }
</style>
