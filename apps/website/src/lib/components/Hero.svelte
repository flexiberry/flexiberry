<script lang="ts">
  import { onMount } from "svelte";

  export let isVisible = false;
  let headingVisible = false;
  let paragraphVisible = false;
  let sectionHeight = "100vh";

  // Typewriter effect function
  function typewriter(node: HTMLElement, { speed = 50, delay = 0 }) {
    const text = node.textContent || "";
    const duration = text.length * speed;

    return {
      delay,
      duration,
      tick: (t: number) => {
        const i = Math.floor(text.length * t);
        node.textContent = text.slice(0, i);
      },
    };
  }

  onMount(() => {
    setTimeout(() => {
      isVisible = true;
      // Start heading animation after a short delay
      setTimeout(() => (headingVisible = true), 500);
      // Start paragraph animation after heading
      setTimeout(() => (paragraphVisible = true), 2000);
    }, 100);
  });
</script>

<!-- Hero Section with Animated Mesh Gradient -->
<section
  class="relative overflow-hidden transition-all duration-1000 ease-in-out"
  style="min-height: {sectionHeight};"
>
  <!-- Animated Mesh Gradient Background -->
  <div class=" inset-0 -z-20 overflow-hidden">
    <svg
      class=" absolute opacity-50 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0f172a">
            <animate
              attributeName="stop-color"
              values="#0f172a; #134e4a; #0f172a"
              dur="10s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stop-color="#134e4a">
            <animate
              attributeName="stop-color"
              values="#134e4a; #0f766e; #134e4a"
              dur="10s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0d9488">
            <animate
              attributeName="stop-color"
              values="#0d9488; #0f172a; #0d9488"
              dur="8s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stop-color="#0f172a">
            <animate
              attributeName="stop-color"
              values="#0f172a; #0d9488; #0f172a"
              dur="8s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
        <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="50" />
        </filter>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
      <g filter="url(#blur)">
        <ellipse cx="50%" cy="50%" rx="50%" ry="50%" fill="url(#grad2)">
          <animate
            attributeName="cx"
            values="30%;70%;30%"
            dur="10s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values="30%;70%;30%"
            dur="10s"
            repeatCount="indefinite"
          />
        </ellipse>
        <ellipse cx="50%" cy="50%" rx="40%" ry="40%" fill="url(#grad1)">
          <animate
            attributeName="cx"
            values="70%;30%;70%"
            dur="13s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values="70%;30%;70%"
            dur="10s"
            repeatCount="indefinite"
          />
        </ellipse>
      </g>
    </svg>
  </div>

  <!-- Grid Pattern Overlay -->
  <div class=" inset-0 -z-10">
    <svg
      class="w-full opacity-50 absolute h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="grid"
          x="0"
          y="0"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <!-- Horizontal lines -->
          <line
            x1="0"
            y1="0"
            x2="20"
            y2="0"
            stroke="#0d9488"
            stroke-width="1"
            stroke-opacity="0.3"
          >
            <animate
              attributeName="stroke-opacity"
              values="0.3;0.6;0.3"
              dur="14s"
              repeatCount="indefinite"
            />
          </line>
          <!-- Vertical lines -->
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="20"
            stroke="#0d9488"
            stroke-width="1"
            stroke-opacity="0.3"
          >
            <animate
              attributeName="stroke-opacity"
              values="0.3;0.6;0.3"
              dur="4s"
              repeatCount="indefinite"
            />
          </line>
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>

  <div
    class="container mx-auto px-6 py-20 pt-32 flex flex-col items-center relative z-10 transition-all duration-1000 ease-in-out"
  >
    <div
      class={`transition-all duration-1000 ease-in-out space-y-8 w-full ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div
        class="min-h-[160px] transition-all duration-1000 ease-in-out transform"
      >
        <h1
          class="text-5xl md:text-6xl font-bold leading-tight text-center mb-6 text-white transition-all duration-1000 ease-in-out"
        >
          {#if headingVisible}
            <span>Speed Up</span>
            <span class="text-emerald-400 inline-block">API Testing </span>
            <br />
            with
            <span in:typewriter={{ speed: 40, delay: 0 }}> Flexiberry</span>
          {/if}
        </h1>
      </div>

      <div
        class="min-h-[140px] transition-all duration-1000 ease-in-out transform"
      >
        <p
          class="text-xl text-gray-200 text-center text-justify max-w-2xl mx-auto mb-10"
        >
          <!-- {#if paragraphVisible} -->
          <!-- <span in:typewriter={{ speed: 20 }}> -->
          Flexiberry simplifies API testing by allowing developers to write custom
          scripts for APIs and their test cases. No rigid structures—just full flexibility
          to test APIs the way you need.
          <!-- </span> -->
          <!-- {/if} -->
        </p>
      </div>

      <div
        class="flex flex-col sm:flex-row justify-center gap-4 transition-all duration-1000 ease-in-out"
      >
        <a
          href="#get-started"
          class="bg-emerald-500 hover:bg-emerald-600 text-gray-900 font-bold py-3 px-8 rounded-md transition-all duration-300 text-center shadow-lg hover:shadow-emerald-500/30"
        >
          Get Started
        </a>
        <a
          href="#docs"
          class="bg-gray-800/60 backdrop-blur-sm hover:bg-gray-800/80 border border-gray-700 hover:border-emerald-500 py-3 px-8 rounded-md transition-all duration-300 text-center"
        >
          Read Docs
        </a>
      </div>
    </div>

    <!-- Code Preview -->
    <div
      class={`mt-16 w-full max-w-3xl bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden transition-all duration-1000 ease-in-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div class="flex items-center bg-gray-700/90 backdrop-blur-sm px-4 py-2">
        <div class="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
        <div class="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
        <span class="text-gray-400 text-sm">example.js</span>
      </div>
      <pre class="p-4 text-sm overflow-x-auto">
        <code>
          <!-- Add your code preview content here -->
        </code>
      </pre>
    </div>
  </div>
</section>

<style>
  /* Enhanced smooth transitions */
  /* :global(*) {
    transition-property: all;
    transition-duration: 1000ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  } */

  /* section {
    transition: min-height 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  } */

  /* .transform {
    transition:
      transform 1s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 1s cubic-bezier(0.4, 0, 0.2, 1),
      min-height 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  } */
</style>
