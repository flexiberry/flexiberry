<script lang="ts">
  import { onMount } from "svelte";
  import demoVideo from "$lib/assets/demo.mp4";

  let videoEl: HTMLVideoElement;
  let containerEl: HTMLDivElement;

  onMount(() => {
    // Intersection observer to play video when in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            videoEl?.play().catch((err) => {
              console.log("Autoplay blocked or failed:", err);
            });
          } else {
            videoEl?.pause();
          }
        }
      },
      { threshold: 0.2 }, // trigger play when 20% of container is visible
    );

    if (containerEl) {
      observer.observe(containerEl);
    }

    return () => {
      observer.disconnect();
    };
  });
</script>

<div bind:this={containerEl} class="demo-section">
  <!-- Section heading -->
  <div class="heading-container">
    <p class="section-badge">Interactive Demo</p>
    <h2 class="section-title">
      See <span class="highlight">Flexiberry in action</span>
    </h2>
  </div>

  <!-- Video mockup window card -->
  <div class="video-card">
    <!-- Title bar -->
    <div class="title-bar">
      <div class="dot red-dot"></div>
      <div class="dot yellow-dot"></div>
      <div class="dot green-dot"></div>
      <span class="file-name">flexiberry-demo.mp4</span>
      <!-- <div class="play-indicator">
        <span class="pulse-dot"></span> Live execution
      </div> -->
    </div>

    <!-- Video Area -->
    <div class="video-container">
      <video
        bind:this={videoEl}
        src={demoVideo}
        preload="auto"
        muted
        playsinline
        loop
        controls
        style="width: 100%; height: 100%; object-fit: contain; display: block;"
      >
        <track kind="captions" />
      </video>
    </div>
  </div>
</div>

<style>
  .demo-section {
    position: relative;
    background: #0d1117;
    padding: 6rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    overflow: hidden;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  }
  .heading-container {
    text-align: center;
    margin-bottom: 2.5rem;
  }
  .section-badge {
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    color: rgba(52, 211, 153, 0.4);
    text-transform: uppercase;
    font-family: "JetBrains Mono", monospace;
    margin: 0 0 0.4rem;
  }
  .section-title {
    font-size: clamp(1.6rem, 3.5vw, 2.2rem);
    font-weight: 700;
    color: #fff;
    font-family: "JetBrains Mono", monospace;
    margin: 0;
  }
  .highlight {
    color: #34d399;
  }

  /* Mockup Window */
  .video-card {
    width: 100%;
    max-width: 800px;
    border-radius: 0.9rem;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: #0d1117;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
  }
  .title-bar {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 1rem;
    background: #161b22;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
  }
  .red-dot {
    background: #ff5f56;
  }
  .yellow-dot {
    background: #ffbd2e;
  }
  .green-dot {
    background: #27c93f;
  }

  .file-name {
    margin-left: 0.6rem;
    font-size: 0.68rem;
    font-family: "JetBrains Mono", monospace;
    color: #6b7280;
  }
  .play-indicator {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.62rem;
    font-family: "JetBrains Mono", monospace;
    color: #34d399;
    background: rgba(52, 211, 153, 0.07);
    border: 1px solid rgba(52, 211, 153, 0.2);
    border-radius: 9999px;
    padding: 0.15rem 0.6rem;
  }
  .pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #34d399;
    box-shadow: 0 0 6px #34d399;
    animation: pulse 1.8s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.4;
      transform: scale(0.9);
    }
  }

  .video-container {
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 16/9;
    width: 100%;
  }
</style>
