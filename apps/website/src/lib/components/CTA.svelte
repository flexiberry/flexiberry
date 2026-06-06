<script>
  export let isVisible = false;
</script>

<section id="get-started" class="cta-section">
  <!-- Glowing blob -->
  <div class="cta-blob" aria-hidden="true"></div>
  <div class="cta-grid" aria-hidden="true"></div>

  <div class="cta-inner" class:visible={isVisible}>
    <span class="cta-badge">
      <span class="badge-dot"></span>
      Open Beta
    </span>

    <h2 class="cta-heading">
      Ready to unlock<br />
      <span class="cta-accent">frictionless workflows?</span>
    </h2>
    <p class="cta-sub">
      Flexiberry is 100% open-source and community-driven. Take control of your API endpoints today.
    </p>

    <!-- Install command -->
    <div class="install-box">
      <span class="install-prompt">$</span>
      <code class="install-cmd">npm install -g flexiberry</code>
      <button
        class="install-copy"
        title="Copy"
        onclick={() =>
          navigator.clipboard?.writeText("npm install -g flexiberry")}
        aria-label="Copy install command"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" /><path
            d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
          />
        </svg>
      </button>
    </div>

    <div class="cta-actions">
      <a href="https://github.com/flexiberry/flexiberry" class="btn-primary" target="_blank" rel="noopener noreferrer">
        Star us on GitHub
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
      <a href="https://docs.flexiberry.dev/" class="btn-secondary" target="_blank">View Documentation</a>
      <a href="https://github.com/flexiberry/flexiberry/discussions" class="btn-secondary" target="_blank" rel="noopener noreferrer">Join the Community</a>
    </div>

    <p class="cta-footnote">Free forever · Open source · MIT License</p>
  </div>
</section>

<style>
  .cta-section {
    position: relative;
    background: #030712;
    padding: 8rem 2rem;
    overflow: hidden;
    text-align: center;
  }
  .cta-blob {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60vw;
    height: 60vw;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(52, 211, 153, 0.08) 0%,
      transparent 70%
    );
    pointer-events: none;
    animation: pulse-blob 6s ease-in-out infinite;
  }
  @keyframes pulse-blob {
    0%,
    100% {
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      transform: translate(-50%, -50%) scale(1.1);
    }
  }
  .cta-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(52, 211, 153, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(52, 211, 153, 0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  .cta-inner {
    position: relative;
    z-index: 1;
    max-width: 640px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity 0.8s ease,
      transform 0.8s ease;
  }
  .cta-inner.visible {
    opacity: 1;
    transform: none;
  }

  .cta-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.7rem;
    font-family: "JetBrains Mono", monospace;
    color: #34d399;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: rgba(52, 211, 153, 0.08);
    border: 1px solid rgba(52, 211, 153, 0.2);
    padding: 0.25rem 0.85rem;
    border-radius: 9999px;
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

  .cta-heading {
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 800;
    color: #fff;
    line-height: 1.18;
    letter-spacing: -0.02em;
    margin: 0;
  }
  .cta-accent {
    background: linear-gradient(135deg, #34d399, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .cta-sub {
    font-size: 1rem;
    color: #64748b;
    line-height: 1.75;
    max-width: 480px;
    margin: 0;
  }

  .install-box {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: #0a0f1a;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.6rem;
    padding: 0.75rem 1.1rem;
    font-family: "JetBrains Mono", monospace;
    font-size: 0.9rem;
    width: 100%;
    max-width: 400px;
  }
  .install-prompt {
    color: #34d399;
    font-weight: 700;
  }
  .install-cmd {
    color: #e2e8f0;
    flex: 1;
    text-align: left;
  }
  .install-copy {
    background: none;
    border: none;
    cursor: pointer;
    color: #4b5563;
    transition: color 0.2s;
    padding: 0;
    display: flex;
  }
  .install-copy:hover {
    color: #34d399;
  }

  .cta-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #34d399, #059669);
    color: #0a0f1a;
    font-weight: 700;
    padding: 0.8rem 2rem;
    border-radius: 0.5rem;
    font-size: 0.95rem;
    text-decoration: none;
    transition: all 0.25s;
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
    padding: 0.8rem 2rem;
    border-radius: 0.5rem;
    font-size: 0.95rem;
    text-decoration: none;
    transition: all 0.25s;
  }
  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(52, 211, 153, 0.4);
    transform: translateY(-2px);
  }
  .cta-footnote {
    font-size: 0.72rem;
    color: #374151;
    margin: 0;
    font-family: "JetBrains Mono", monospace;
  }
</style>
