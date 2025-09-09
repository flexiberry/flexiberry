<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  // Props
  export let scrollSpeed = 200; // pixels per frame
  export let edgeThreshold = 50; // pixels from edge to trigger scroll
  export let smoothScroll = true;

  let viewportElement: Element;
  let isScrolling = false;
  let animationFrame: number;
  let scrollDirection = { x: 0, y: 0 };

  // Reactive values for viewport dimensions
  let viewportWidth = 0;
  let viewportHeight = 0;
  let scrollLeft = 0;
  let scrollTop = 0;
  let maxScrollLeft = 0;
  let maxScrollTop = 0;

  function updateScrollLimits() {
    if (viewportElement) {
      maxScrollLeft = viewportElement.scrollWidth - viewportElement.clientWidth;
      maxScrollTop =
        viewportElement.scrollHeight - viewportElement.clientHeight;
    }
  }

  function handleMouseMove(event: { clientX: number; clientY: number }) {
    if (!viewportElement) return;

    const rect = viewportElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculate scroll direction based on cursor position
    let newScrollX = 0;
    let newScrollY = 0;

    // Horizontal scrolling
    if (mouseX < edgeThreshold && scrollLeft > 0) {
      newScrollX = -1; // Scroll left
    } else if (
      mouseX > viewportWidth - edgeThreshold &&
      scrollLeft < maxScrollLeft
    ) {
      newScrollX = 1; // Scroll right
    }

    // Vertical scrolling
    if (mouseY < edgeThreshold && scrollTop > 0) {
      newScrollY = -1; // Scroll up
    } else if (
      mouseY > viewportHeight - edgeThreshold &&
      scrollTop < maxScrollTop
    ) {
      newScrollY = 1; // Scroll down
    }

    scrollDirection = { x: newScrollX, y: newScrollY };

    // Start or stop scrolling animation
    if ((newScrollX !== 0 || newScrollY !== 0) && !isScrolling) {
      startScrolling();
    } else if (newScrollX === 0 && newScrollY === 0 && isScrolling) {
      stopScrolling();
    }
  }

  function startScrolling() {
    isScrolling = true;
    scroll();
  }

  function stopScrolling() {
    isScrolling = false;
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  }

  // Cubic-bezier timing function for smooth scrolling
  function cubicBezier(
    t: number,
    p1: number,
    p2: number,
    p3: number,
    p4: number
  ): number {
    const t1 = 1 - t;
    return (
      Math.pow(t1, 3) * p1 +
      3 * Math.pow(t1, 2) * t * p2 +
      3 * t1 * Math.pow(t, 2) * p3 +
      Math.pow(t, 3) * p4
    );
  }

  // Smooth scroll with cubic-bezier easing
  function smoothScrollTo(
    element: Element,
    targetX: number,
    targetY: number,
    duration: number = 300
  ) {
    const startX = element.scrollLeft;
    const startY = element.scrollTop;
    const distanceX = targetX - startX;
    const distanceY = targetY - startY;
    const startTime = performance.now();

    function step(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Using cubic-bezier(0.4, 0, 0.2, 1) for smooth acceleration/deceleration
      const ease = cubicBezier(progress, 0.4, 0, 0.2, 1);

      element.scrollTo({
        left: startX + distanceX * ease,
        top: startY + distanceY * ease,
        behavior: "auto",
      });

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  function scroll() {
    if (!isScrolling || !viewportElement) return;

    const newScrollLeft = Math.max(
      0,
      Math.min(
        maxScrollLeft,
        viewportElement.scrollLeft + scrollDirection.x * scrollSpeed
      )
    );
    const newScrollTop = Math.max(
      0,
      Math.min(
        maxScrollTop,
        viewportElement.scrollTop + scrollDirection.y * scrollSpeed
      )
    );

    if (smoothScroll) {
      smoothScrollTo(viewportElement, newScrollLeft, newScrollTop, 200);
    } else {
      viewportElement.scrollLeft = newScrollLeft;
      viewportElement.scrollTop = newScrollTop;
    }

    // Update reactive values
    scrollLeft = viewportElement.scrollLeft;
    scrollTop = viewportElement.scrollTop;

    animationFrame = requestAnimationFrame(scroll);
  }

  function handleMouseLeave() {
    stopScrolling();
  }

  function handleScroll() {
    if (viewportElement) {
      scrollLeft = viewportElement.scrollLeft;
      scrollTop = viewportElement.scrollTop;
    }
  }

  function handleResize() {
    if (viewportElement) {
      viewportWidth = viewportElement.clientWidth;
      viewportHeight = viewportElement.clientHeight;
      updateScrollLimits();
    }
  }

  onMount(() => {
    if (viewportElement) {
      viewportWidth = viewportElement.clientWidth;
      viewportHeight = viewportElement.clientHeight;
      console.log(viewportWidth, viewportHeight);

      updateScrollLimits();

      // Add resize observer for better responsiveness
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(viewportElement);

      return () => {
        resizeObserver.disconnect();
      };
    }
  });

  onDestroy(() => {
    stopScrolling();
  });
</script>

<svelte:window on:resize={handleResize} />

<div
  role="region"
  bind:this={viewportElement}
  class="auto-scroll-viewport"
  on:mousemove={handleMouseMove}
  on:mouseleave={handleMouseLeave}
  on:scroll={handleScroll}
>
  <!-- Large content area -->
  <div class="content-area">
    <!-- Slot for your content -->
    <slot>
      <!-- Default content for demonstration -->
      <div class="grid grid-cols-10 gap-4 p-8">
        {#each Array(100) as _, i}
          <div
            class="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 text-center"
          >
            <div class="text-blue-800 font-semibold">Item {i + 1}</div>
            <div class="text-blue-600 text-sm mt-2">
              Grid position: {Math.floor(i / 10) + 1}, {(i % 10) + 1}
            </div>
          </div>
        {/each}
      </div>
    </slot>
  </div>
</div>

<style>
  .auto-scroll-viewport {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: auto;
    cursor: crosshair;
  }

  .content-area {
    min-width: 200vw;
    min-height: 200vh;
    background:
      linear-gradient(45deg, #f3f4f6 25%, transparent 25%),
      linear-gradient(-45deg, #f3f4f6 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #f3f4f6 75%),
      linear-gradient(-45deg, transparent 75%, #f3f4f6 75%);
    background-size: 20px 20px;
    background-position:
      0 0,
      0 10px,
      10px -10px,
      -10px 0px;
  }

  .edge-indicators {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 10;
  }

  /* Custom scrollbar styling */
  .auto-scroll-viewport::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .auto-scroll-viewport::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .auto-scroll-viewport::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  .auto-scroll-viewport::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
</style>
