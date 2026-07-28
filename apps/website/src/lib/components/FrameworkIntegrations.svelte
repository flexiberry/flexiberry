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

  const frameworks = [
    {
      id: "springboot",
      name: "Spring Boot",
      language: "Java / Kotlin",
      status: "in-progress",
      statusLabel: "In Progress",
      description: "Auto-generate .berry workflow scripts directly from Spring @RestController annotations, RequestMapping endpoints & WebClient dependencies.",
      brandColor: "#6DB33F",
      bgGlow: "rgba(109, 179, 63, 0.16)",
      borderGlow: "rgba(109, 179, 63, 0.45)",
      shadowGlow: "rgba(109, 179, 63, 0.25)",
      badgeBg: "rgba(109, 179, 63, 0.15)",
      badgeText: "#4ade80",
      icons8Url: "https://img.icons8.com/color/96/spring-logo.png",
      svg: `<svg width="34" height="34" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><circle cx="64" cy="64" r="60" fill="#6DB33F"/><path fill="#FFFFFF" d="M96 68.8c0 1.8-.7 3.4-2 4.6l-24 24c-1.2 1.3-2.8 2-4.6 2s-3.4-.7-4.6-2l-24-24c-1.3-1.2-2-2.8-2-4.6v-24c0-1.8.7-3.4 2-4.6l24-24c1.2-1.3 2.8-2 4.6-2s3.4.7 4.6 2l24 24c1.3 1.2 2 2.8 2 4.6v24z"/><path fill="#6DB33F" d="M64 48c-8.8 0-16 7.2-16 16s7.2 16 16 16 16-7.2 16-16-7.2-16-16-16z"/></svg>`
    },
    {
      id: "express",
      name: "Express.js",
      language: "Node.js / TS",
      status: "coming-soon",
      statusLabel: "Coming Soon",
      description: "Extract Express route handlers, middleware parameters, and router stacks into declarative multi-step execution chains.",
      brandColor: "#F7DF1E",
      bgGlow: "rgba(247, 223, 30, 0.16)",
      borderGlow: "rgba(247, 223, 30, 0.4)",
      shadowGlow: "rgba(247, 223, 30, 0.2)",
      badgeBg: "rgba(247, 223, 30, 0.12)",
      badgeText: "#fcd34d",
      icons8Url: "https://img.icons8.com/color/96/express-js.png",
      svg: `<svg width="34" height="34" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="128" rx="28" fill="#1E293B" stroke="#475569" stroke-width="6"/><text x="64" y="80" font-family="system-ui, -apple-system, sans-serif" font-size="46" font-weight="900" fill="#FFFFFF" text-anchor="middle">ex</text></svg>`
    },
    {
      id: "nestjs",
      name: "NestJS",
      language: "TypeScript",
      status: "coming-soon",
      statusLabel: "Coming Soon",
      description: "Convert NestJS @Controller() decorators, DTO schemas, and Swagger metadata into ready-to-run test cases.",
      brandColor: "#E0234E",
      bgGlow: "rgba(224, 35, 78, 0.16)",
      borderGlow: "rgba(224, 35, 78, 0.4)",
      shadowGlow: "rgba(224, 35, 78, 0.2)",
      badgeBg: "rgba(255, 255, 255, 0.06)",
      badgeText: "#94a3b8",
      icons8Url: "https://img.icons8.com/color/96/nestjs.png",
      svg: `<svg width="34" height="34" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><path fill="#E0234E" d="M112 40c-2.7-5.3-7.5-9.4-13.3-11.4l-30.6-10.4c-2.7-.9-5.7-.9-8.4 0L29.1 28.6C23.3 30.6 18.5 34.7 15.8 40c-2.7 5.3-3.2 11.5-1.4 17.1l9.6 30.1c2.7 8.5 9.7 15.1 18.4 17.1l24.2 7.8c2.2.7 4.6 1.1 6.9 1.1 2.3 0 4.7-.4 6.9-1.1l24.2-7.8c8.7-2 15.7-8.6 18.4-17.1l9.6-30.1c1.9-5.6 1.4-11.8-1.3-17.1z"/><path fill="#FFFFFF" d="M64 36l26 46H38l26-46z"/></svg>`
    },
    {
      id: "django",
      name: "Django",
      language: "Python",
      status: "coming-soon",
      statusLabel: "Coming Soon",
      description: "Extract Django REST Framework serializers and URL patterns into declarative .berry test scripts automatically.",
      brandColor: "#44B78B",
      bgGlow: "rgba(9, 46, 32, 0.45)",
      borderGlow: "rgba(68, 183, 139, 0.45)",
      shadowGlow: "rgba(68, 183, 139, 0.25)",
      badgeBg: "rgba(68, 183, 139, 0.12)",
      badgeText: "#44B78B",
      icons8Url: "https://img.icons8.com/?size=100&id=37o3DqV429ra&format=png&color=000000",
      invertOnDark: true,
      svg: `<svg width="34" height="34" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="128" rx="28" fill="#092E20" stroke="#0C4B33" stroke-width="4"/><text x="64" y="86" font-family="Georgia, serif" font-size="64" font-weight="bold" fill="#44B78B" text-anchor="middle">dj</text></svg>`
    },
    {
      id: "fastapi",
      name: "FastAPI",
      language: "Python",
      status: "coming-soon",
      statusLabel: "Coming Soon",
      description: "Leverage Pydantic models and OpenAPI route definitions to build full multi-step request pipelines.",
      brandColor: "#059669",
      bgGlow: "rgba(5, 150, 105, 0.16)",
      borderGlow: "rgba(5, 150, 105, 0.4)",
      shadowGlow: "rgba(5, 150, 105, 0.2)",
      badgeBg: "rgba(255, 255, 255, 0.06)",
      badgeText: "#94a3b8",
      icons8Url: "https://img.icons8.com/color/96/fastapi.png",
      svg: `<svg width="34" height="34" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><circle cx="64" cy="64" r="60" fill="#059669"/><path fill="#FFFFFF" d="M72 16L36 72h24l-8 40 36-56H64l8-40z"/></svg>`
    },
    {
      id: "gofiber",
      name: "Go (Gin / Fiber)",
      language: "Go",
      status: "coming-soon",
      statusLabel: "Coming Soon",
      description: "Transform Go struct tags and web framework handlers into high-performance, reproducible API specs.",
      brandColor: "#00ADD8",
      bgGlow: "rgba(0, 173, 216, 0.16)",
      borderGlow: "rgba(0, 173, 216, 0.4)",
      shadowGlow: "rgba(0, 173, 216, 0.2)",
      badgeBg: "rgba(255, 255, 255, 0.06)",
      badgeText: "#94a3b8",
      icons8Url: "https://img.icons8.com/color/96/golang.png",
      svg: `<svg width="34" height="34" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><circle cx="64" cy="64" r="60" fill="#00ADD8"/><text x="64" y="80" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="900" fill="#FFFFFF" text-anchor="middle">GO</text></svg>`
    }
  ];

  let failedImages = $state<Record<string, boolean>>({});

  function handleImageError(id: string) {
    failedImages[id] = true;
  }
</script>

<section
  bind:this={sectionEl}
  class="integrations-section"
  class:visible={isVisible || sectionRevealed}
>
  <!-- Background Glow & Micro Grid overlay -->
  <div class="integrations-grid-bg" aria-hidden="true"></div>
  <div class="glow-orb" aria-hidden="true"></div>

  <div class="integrations-container">
    <!-- Header -->
    <div class="integrations-header">
      <span class="header-badge">
        <span class="badge-dot"></span>
        BACKEND ECOSYSTEM · INTEGRATIONS
      </span>
      <h2 class="integrations-title">
        Native Framework <span class="text-gradient">Integrations</span>
      </h2>
      <p class="integrations-sub">
        Generate type-safe Flexiberry workflow specs directly from your existing backend controllers, annotations, and route handlers.
      </p>
    </div>

    <!-- Framework Cards Grid -->
    <div class="frameworks-grid">
      {#each frameworks as fw}
        <div
          class="framework-card"
          class:in-progress={fw.status === "in-progress"}
          style="--brand-glow: {fw.bgGlow}; --brand-border: {fw.borderGlow}; --brand-shadow: {fw.shadowGlow}; --brand-color: {fw.brandColor}"
        >
          {#if fw.status === "in-progress"}
            <div class="active-badge-ribbon">
              <span class="pulse-dot"></span>
              ACTIVE DEV
            </div>
          {/if}

          <!-- Left Column: Icons8 Image with Fallback Inline SVG -->
          <div class="card-logo-col">
            <div class="logo-box">
              {#if !failedImages[fw.id]}
                <img
                  src={fw.icons8Url}
                  alt="{fw.name} Icons8 Logo"
                  class="icons8-img"
                  class:invert-light={fw.invertOnDark}
                  onerror={() => handleImageError(fw.id)}
                />
              {:else}
                {@html fw.svg}
              {/if}
            </div>
          </div>

          <!-- Right Column: Title, Badges & Status -->
          <div class="card-content-col">
            <div class="card-header">
              <div class="title-meta">
                <h3 class="framework-name">{fw.name}</h3>
                <span class="language-pill">{fw.language}</span>
              </div>

              <div class="status-pill" style="background: {fw.badgeBg}; color: {fw.badgeText}">
                {#if fw.status === "in-progress"}
                  <span class="status-dot-active"></span>
                {/if}
                <span>{fw.statusLabel}</span>
              </div>
            </div>

            <div class="card-footer">
              {#if fw.status === "in-progress"}
                <div class="progress-bar-track">
                  <div class="progress-bar-fill"></div>
                </div>
                <span class="status-note active-note">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  Spring Boot adapter in active development
                </span>
              {:else}
                <span class="status-note upcoming-note">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 16 14"/></svg>
                  Planned for upcoming release
                </span>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .integrations-section {
    position: relative;
    padding: 4.5rem 1.5rem;
    background: #03060d;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    overflow: hidden;
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .integrations-section.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .integrations-grid-bg {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 24px 24px;
    opacity: 0.5;
    pointer-events: none;
  }

  .glow-orb {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 700px;
    height: 450px;
    background: radial-gradient(circle, rgba(109, 179, 63, 0.07) 0%, rgba(52, 211, 153, 0.03) 45%, transparent 70%);
    pointer-events: none;
    filter: blur(80px);
  }

  .integrations-container {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }

  /* Header Section */
  .integrations-header {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 3rem auto;
  }

  .header-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.72rem;
    font-family: "JetBrains Mono", monospace;
    font-weight: 700;
    color: #34d399;
    letter-spacing: 0.12em;
    background: rgba(52, 211, 153, 0.06);
    border: 1px solid rgba(52, 211, 153, 0.2);
    border-radius: 9999px;
    padding: 0.35rem 1rem;
    margin-bottom: 1rem;
  }

  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #34d399;
    box-shadow: 0 0 10px #34d399;
  }

  .integrations-title {
    font-size: 2.1rem;
    font-weight: 800;
    color: #f8fafc;
    line-height: 1.25;
    margin-bottom: 0.75rem;
    letter-spacing: -0.02em;
  }

  .text-gradient {
    background: linear-gradient(135deg, #6DB33F 0%, #34d399 50%, #38bdf8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .integrations-sub {
    font-size: 0.92rem;
    color: #94a3b8;
    line-height: 1.6;
  }

  /* Frameworks Grid */
  .frameworks-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 1.25rem;
  }

  @media (min-width: 768px) {
    .frameworks-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Framework Card Design */
  .framework-card {
    position: relative;
    background: linear-gradient(145deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.35) 100%);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 1.25rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1.1rem;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.25s ease;
    overflow: hidden;
  }

  .framework-card:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 14px 28px -10px rgba(0, 0, 0, 0.6), 0 0 20px var(--brand-shadow);
  }

  .framework-card.in-progress {
    background: linear-gradient(145deg, rgba(109, 179, 63, 0.06) 0%, rgba(15, 23, 42, 0.8) 100%);
    border: 1px solid var(--brand-border);
    box-shadow: 0 0 22px rgba(109, 179, 63, 0.12);
  }

  .framework-card.in-progress:hover {
    box-shadow: 0 0 32px rgba(109, 179, 63, 0.28);
    border-color: rgba(109, 179, 63, 0.65);
  }

  .active-badge-ribbon {
    position: absolute;
    top: 0;
    right: 0;
    background: linear-gradient(135deg, rgba(109, 179, 63, 0.3), rgba(74, 222, 128, 0.2));
    border-bottom-left-radius: 8px;
    border-left: 1px solid rgba(109, 179, 63, 0.45);
    border-bottom: 1px solid rgba(109, 179, 63, 0.45);
    padding: 0.2rem 0.65rem;
    font-size: 0.6rem;
    font-weight: 700;
    color: #4ade80;
    letter-spacing: 0.08em;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .pulse-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 8px #4ade80;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.35; transform: scale(1.35); }
  }

  /* Logo Left Column */
  .card-logo-col {
    flex-shrink: 0;
  }

  .logo-box {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: var(--brand-glow);
    border: 1px solid var(--brand-border);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px var(--brand-shadow);
    padding: 6px;
    overflow: hidden;
  }

  .icons8-img {
    width: 36px;
    height: 36px;
    object-fit: contain;
    display: block;
  }

  .icons8-img.invert-light {
    filter: brightness(0) invert(1);
  }

  /* Content Right Column */
  .card-content-col {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.45rem;
    flex-wrap: wrap;
  }

  .title-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .framework-name {
    font-size: 1.05rem;
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: -0.01em;
  }

  .language-pill {
    font-size: 0.64rem;
    font-family: "JetBrains Mono", monospace;
    font-weight: 600;
    color: #94a3b8;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    padding: 0.1rem 0.45rem;
  }

  .status-pill {
    font-size: 0.64rem;
    font-family: "JetBrains Mono", monospace;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    letter-spacing: 0.04em;
  }

  .status-dot-active {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 6px #4ade80;
  }

  /* Card Footer */
  .card-footer {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .progress-bar-track {
    width: 100%;
    height: 3px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 9999px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    width: 72%;
    background: linear-gradient(90deg, #6DB33F, #34d399);
    border-radius: 9999px;
    animation: shimmer-progress 2s infinite ease-in-out;
  }

  @keyframes shimmer-progress {
    0% { opacity: 0.75; }
    50% { opacity: 1; }
    100% { opacity: 0.75; }
  }

  .status-note {
    font-size: 0.68rem;
    font-family: "JetBrains Mono", monospace;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .status-note.active-note {
    color: #4ade80;
    font-weight: 600;
  }

  .status-note.upcoming-note {
    color: #64748b;
  }
</style>
