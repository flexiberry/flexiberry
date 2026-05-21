<script>
  let currentYear = new Date().getFullYear();

  const links = [
    {
      group: "Product",
      items: [
        { label: "Features", href: "/features" },
        { label: "Documentation", href: "https://docs.flexiberry.dev/" },
        { label: "Changelog", href: "/changelog" },
      ],
    },
    {
      group: "Developers",
      items: [
        {
          label: "CLI Reference",
          href: "https://docs.flexiberry.dev/cli.html",
        },
        { label: "Examples", href: "/example" },
        { label: "GitHub", href: "https://github.com/flexiberry/flexiberry" },
      ],
    },
    {
      group: "Community",
      items: [
        { label: "Twitter / X", href: "https://x.com" },
        { label: "Blog", href: "#" },
      ],
    },
  ];
</script>

<footer class="footer">
  <div class="footer-grid-bg" aria-hidden="true"></div>
  <div class="footer-inner">
    <!-- Brand column -->
    <div class="footer-brand">
      <div class="brand-mark">
        <span class="brand-f">F</span>
      </div>
      <span class="brand-name">Flexiberry</span>
      <p class="brand-tagline">
        Human-readable API testing powered by the Berry language.
      </p>
      <div class="social-row">
        <!-- GitHub -->
        <a
          href="https://github.com"
          class="social-link"
          aria-label="GitHub"
          target="_blank"
          rel="noopener"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"
            ><path
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            /></svg
          >
        </a>
        <!-- Twitter -->
        <a href="#" class="social-link" aria-label="Twitter">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"
            ><path
              d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
            /></svg
          >
        </a>
        <!-- Discord -->
        <a href="#" class="social-link" aria-label="Discord">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
            ><path
              d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057.101 18.079.112 18.1.13 18.116a19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"
            /></svg
          >
        </a>
      </div>
    </div>

    <!-- Link columns -->
    {#each links as col}
      <div class="footer-col">
        <h4 class="col-heading">{col.group}</h4>
        <ul class="col-links">
          {#each col.items as item}
            <li><a href={item.href} class="col-link">{item.label}</a></li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>

  <!-- Bottom bar -->
  <div class="footer-bottom">
    <div class="footer-bottom-inner">
      <span class="copyright">© {currentYear} Flexiberry · MIT License</span>
      <span class="built-with">
        Built with <span class="berry-tag">Berry</span>
      </span>
    </div>
  </div>
</footer>

<style>
  .footer {
    position: relative;
    background: #020609;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }
  .footer-grid-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(52, 211, 153, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(52, 211, 153, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }
  .footer-inner {
    position: relative;
    z-index: 1;
    max-width: 1100px;
    margin: 0 auto;
    padding: 4rem 2rem 3rem;
    display: grid;
    grid-template-columns: 1.8fr 1fr 1fr 1fr;
    gap: 3rem;
  }

  /* Brand */
  .footer-brand {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
  .brand-mark {
    width: 2rem;
    height: 2rem;
    border-radius: 0.45rem;
    background: linear-gradient(135deg, #34d399, #059669);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .brand-f {
    font-weight: 900;
    color: #0a0f1a;
    font-size: 1rem;
  }
  .brand-name {
    font-size: 1.1rem;
    font-weight: 800;
    color: #fff;
  }
  .brand-tagline {
    font-size: 0.82rem;
    color: #4b5563;
    line-height: 1.65;
    margin: 0;
    max-width: 220px;
  }
  .social-row {
    display: flex;
    gap: 0.65rem;
    margin-top: 0.25rem;
  }
  .social-link {
    width: 2rem;
    height: 2rem;
    border-radius: 0.4rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.07);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    text-decoration: none;
    transition: all 0.2s;
  }
  .social-link:hover {
    color: #34d399;
    border-color: rgba(52, 211, 153, 0.3);
    background: rgba(52, 211, 153, 0.07);
  }

  /* Link cols */
  .footer-col {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
  .col-heading {
    font-size: 0.68rem;
    font-family: "JetBrains Mono", monospace;
    font-weight: 700;
    color: #e2e8f0;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0;
  }
  .col-links {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }
  .col-link {
    font-size: 0.84rem;
    color: #4b5563;
    text-decoration: none;
    transition: color 0.2s;
  }
  .col-link:hover {
    color: #34d399;
  }

  /* Bottom bar */
  .footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding: 1.2rem 2rem;
  }
  .footer-bottom-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .copyright {
    font-size: 0.72rem;
    color: #374151;
    font-family: "JetBrains Mono", monospace;
  }
  .built-with {
    font-size: 0.72rem;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .berry-tag {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.65rem;
    color: #34d399;
    background: rgba(52, 211, 153, 0.08);
    border: 1px solid rgba(52, 211, 153, 0.2);
    border-radius: 4px;
    padding: 0.05em 0.4em;
  }

  @media (max-width: 860px) {
    .footer-inner {
      grid-template-columns: 1fr 1fr;
    }
    .footer-brand {
      grid-column: 1/-1;
    }
  }
  @media (max-width: 500px) {
    .footer-inner {
      grid-template-columns: 1fr;
    }
    .footer-bottom-inner {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }
  }
</style>
