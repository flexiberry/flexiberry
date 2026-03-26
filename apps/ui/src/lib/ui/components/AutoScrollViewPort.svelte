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

  // Reactive values for viewport dimensions and edge highlights
  let viewportWidth = 0;
  let viewportHeight = 0;
  let scrollLeft = 0;
  let scrollTop = 0;
  let maxScrollLeft = 0;

  // Track which edges are active for highlighting
  let activeEdges = {
    top: false,
    right: false,
    bottom: false,
    left: false,
  };

  // Update active edges based on scroll direction
  $: {
    activeEdges = {
      top: scrollDirection.y < 0,
      right: scrollDirection.x > 0,
      bottom: scrollDirection.y > 0,
      left: scrollDirection.x < 0,
    };
  }
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

    // Reset active edges
    activeEdges = { top: false, right: false, bottom: false, left: false };

    // Horizontal scrolling
    if (mouseX < edgeThreshold && scrollLeft > 0) {
      newScrollX = -1; // Scroll left
      activeEdges.left = true;
    } else if (
      mouseX > viewportWidth - edgeThreshold &&
      scrollLeft < maxScrollLeft
    ) {
      newScrollX = 1; // Scroll right
      activeEdges.right = true;
    }

    // Vertical scrolling
    if (mouseY < edgeThreshold && scrollTop > 0) {
      newScrollY = -1; // Scroll up
      activeEdges.top = true;
    } else if (
      mouseY > viewportHeight - edgeThreshold &&
      scrollTop < maxScrollTop
    ) {
      newScrollY = 1; // Scroll down
      activeEdges.bottom = true;
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
  class="relative w-screen h-screen overflow-auto cursor-crosshair scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
  on:mousemove={handleMouseMove}
  on:mouseleave={handleMouseLeave}
  on:scroll={handleScroll}
>
  <!-- Fixed edge highlight indicators -->
  <div class="fixed inset-0 pointer-events-none z-50 overflow-hidden">
    {#if activeEdges.top}
      <div
        class="absolute left-0 right-0 bg-gradient-to-b from-blue-500/70 to-transparent z-50 transition-opacity duration-200"
        style="height: {edgeThreshold}px; top: 0;"
      ></div>
    {/if}
    {#if activeEdges.right}
      <div
        class="absolute top-0 bottom-0 bg-gradient-to-l from-blue-500/70 to-transparent z-50 transition-opacity duration-200"
        style="width: {edgeThreshold}px; right: 0;"
      ></div>
    {/if}
    {#if activeEdges.bottom}
      <div
        class="absolute left-0 right-0 bg-gradient-to-t from-blue-500/70 to-transparent z-50 transition-opacity duration-200"
        style="height: {edgeThreshold}px; bottom: 0;"
      ></div>
    {/if}
    {#if activeEdges.left}
      <div
        class="absolute top-0 bottom-0 bg-gradient-to-r from-blue-500/70 to-transparent z-50 transition-opacity duration-200"
        style="width: {edgeThreshold}px; left: 0;"
      ></div>
    {/if}
  </div>
  <!-- Large content area with grid pattern background -->
  <div
    class="min-w-[200vw] flex flex-wrap min-h-[200vh] bg-[linear-gradient(45deg,#f3f4f6_25%,transparent_25%),linear-gradient(-45deg,#f3f4f6_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f3f4f6_75%),linear-gradient(-45deg,transparent_75%,#f3f4f6_75%)] bg-[length:20px_20px] bg-[0_0,0_10px,10px_-10px,-10px_0px]"
  >
    <!-- Slot for your content -->
    <slot>
      <!-- Default content for demonstration -->
      <!-- <div class="grid grid-cols-10 gap-4 p-8">
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
      </div> -->
    </slot>
  </div>
</div>

<!-- All styles have been converted to Tailwind CSS classes -->
