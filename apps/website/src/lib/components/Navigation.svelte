<script lang="ts">
  import berryIcon from "$lib/assets/icon.png";

  let scrolled = false;
  if (typeof window !== "undefined") {
    window.addEventListener(
      "scroll",
      () => {
        scrolled = window.scrollY > 20;
      },
      { passive: true },
    );
  }
</script>

<nav class="nav" class:nav-scrolled={scrolled}>
  <div class="nav-inner">
    <!-- Logo -->
    <a href="/" class="nav-logo">
      <img src={berryIcon} alt="Flexiberry logo" class="nav-icon" />
      <span class="nav-brand">Flexiberry</span>
    </a>

    <!-- Links -->
    <div class="nav-links">
      <a href="/#features" class="nav-link">Features</a>
      <a href="/#docs" class="nav-link">Docs</a>
      <a href="/#get-started" class="nav-link">Get Started</a>
      <a
        href="https://github.com/flexiberry/flexiberry"
        class="nav-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <!-- GitHub icon -->
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
        GitHub
      </a>
      <a href="https://app.flexiberry.dev" class="nav-cta">Open App</a>
    </div>
  </div>
</nav>

<style>
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 1rem 0;
    transition:
      background 0.3s ease,
      border-color 0.3s ease,
      padding 0.3s ease;
    border-bottom: 1px solid transparent;
  }
  .nav-scrolled {
    background: rgba(3, 7, 18, 0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-color: rgba(255, 255, 255, 0.06);
    padding: 0.65rem 0;
  }
  .nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .nav-logo {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    color: #fff;
  }
  .nav-icon {
    width: 30px;
    height: 30px;
    border-radius: 6px;
  }
  .nav-brand {
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: #fff;
  }
  .nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
  }
  .nav-link {
    font-size: 0.88rem;
    color: #94a3b8;
    text-decoration: none;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }
  .nav-link:hover {
    color: #34d399;
  }
  .nav-cta {
    font-size: 0.82rem;
    font-weight: 700;
    background: linear-gradient(135deg, #34d399, #059669);
    color: #0a0f1a;
    text-decoration: none;
    padding: 0.45rem 1.1rem;
    border-radius: 0.45rem;
    transition: all 0.25s;
  }
  .nav-cta:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(52, 211, 153, 0.3);
  }

  @media (max-width: 700px) {
    .nav-links {
      gap: 1rem;
    }
    .nav-link:not(.nav-cta) {
      display: none;
    }
  }
</style>
