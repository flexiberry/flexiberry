<script>
  export let isVisible = false;
</script>

<section id="docs" class="docs-section">
  <div class="docs-grid-bg" aria-hidden="true"></div>

  <div class="docs-inner" class:visible={isVisible}>
    <div class="section-label">
      <span class="label-dot"></span>
      Documentation
    </div>
    <h2 class="section-heading">Start building <span class="h-accent">in minutes</span></h2>
    <p class="section-sub">
      Everything you need — from first steps to advanced Berry patterns.
    </p>

    <div class="docs-cards">

      <a href="#" class="doc-card" style="--c:#a78bfa">
        <div class="doc-icon" style="color:#a78bfa">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>
          </svg>
        </div>
        <h3 class="doc-title">Getting Started</h3>
        <p class="doc-desc">Set up your first <code class="ic">.berry</code> project and run your first test in under 5 minutes.</p>
        <span class="doc-link">Read guide →</span>
      </a>

      <a href="#" class="doc-card" style="--c:#34d399">
        <div class="doc-icon" style="color:#34d399">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <h3 class="doc-title">Core Concepts</h3>
        <p class="doc-desc">Understand <code class="ic">Api</code>, <code class="ic">Task</code>, <code class="ic">Step</code>, and <code class="ic">Check</code> — the four pillars of Berry.</p>
        <span class="doc-link">Explore concepts →</span>
      </a>

      <a href="#" class="doc-card" style="--c:#38bdf8">
        <div class="doc-icon" style="color:#38bdf8">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
          </svg>
        </div>
        <h3 class="doc-title">CLI Reference</h3>
        <p class="doc-desc">Every flag, option and exit code for <code class="ic">berrycore run</code> documented with examples.</p>
        <span class="doc-link">View reference →</span>
      </a>

    </div>
  </div>
</section>

<style>
  .docs-section {
    position: relative; background: #04080f;
    padding: 7rem 2rem; overflow: hidden;
  }
  .docs-grid-bg {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(56,189,248,.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56,189,248,.035) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }
  .docs-inner {
    position: relative; z-index: 1;
    max-width: 1100px; margin: 0 auto;
    display: flex; flex-direction: column; align-items: center; text-align: center;
    opacity: 0; transform: translateY(20px);
    transition: opacity .8s ease, transform .8s ease;
  }
  .docs-inner.visible { opacity: 1; transform: none; }

  .section-label {
    display: inline-flex; align-items: center; gap: .5rem;
    font-size: .7rem; font-family: 'JetBrains Mono', monospace;
    color: #38bdf8; letter-spacing: .1em; text-transform: uppercase;
    background: rgba(56,189,248,.08); border: 1px solid rgba(56,189,248,.2);
    padding: .25rem .85rem; border-radius: 9999px; margin-bottom: 1.5rem;
  }
  .label-dot { width:6px;height:6px;border-radius:50%;background:#38bdf8;box-shadow:0 0 6px #38bdf8; }
  .section-heading { font-size: clamp(1.9rem,4vw,2.8rem); font-weight:800; color:#fff; line-height:1.18; letter-spacing:-.02em; margin:0 0 1rem; }
  .h-accent { background:linear-gradient(135deg,#38bdf8,#34d399);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
  .section-sub { font-size:1rem; color:#64748b; max-width:480px; line-height:1.7; margin-bottom:3.5rem; }

  .docs-cards {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem; width: 100%; text-align: left;
  }
  .doc-card {
    display: flex; flex-direction: column; gap: .75rem;
    background: rgba(255,255,255,.025);
    border: 1px solid rgba(255,255,255,.07);
    border-radius: .9rem; padding: 1.75rem;
    text-decoration: none; color: inherit;
    transition: border-color .3s, box-shadow .3s, transform .3s;
  }
  .doc-card:hover {
    border-color: color-mix(in srgb, var(--c) 35%, transparent);
    box-shadow: 0 0 36px color-mix(in srgb, var(--c) 12%, transparent);
    transform: translateY(-4px);
  }
  .doc-icon {
    width: 2.4rem; height: 2.4rem; border-radius: .55rem;
    background: color-mix(in srgb, var(--c) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--c) 22%, transparent);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .doc-title { font-size:1.05rem; font-weight:700; color:#e2e8f0; margin:0; }
  .doc-desc  { font-size:.85rem; color:#64748b; line-height:1.65; flex:1; margin:0; }
  .ic { font-family:'JetBrains Mono',monospace; font-size:.85em; color:#a78bfa; background:rgba(167,139,250,.1); border-radius:3px; padding:.05em .3em; }
  .doc-link { font-size:.82rem; font-family:'JetBrains Mono',monospace; color:var(--c); margin-top:auto; transition:letter-spacing .2s; }
  .doc-card:hover .doc-link { letter-spacing:.03em; }

  @media (max-width: 800px) {
    .docs-cards { grid-template-columns: 1fr; }
    .docs-section { padding: 5rem 1.25rem; }
  }
</style>
