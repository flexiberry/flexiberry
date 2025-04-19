<script lang="ts">
  import { onMount } from "svelte";

  export let isVisible = false;
  let headingVisible = false;
  let paragraphVisible = false;
  let sectionHeight = "100vh";

  // --- Canvas background animation variables ---
  let bgCanvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  // Mouse tracking for flying code words
  let mouse = { x: -1000, y: -1000 }; // off-canvas by default
  function handleMouseMove(event: MouseEvent) {
    const rect = bgCanvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  }
  function handleMouseLeave() {
    mouse.x = -1000;
    mouse.y = -1000;
  }
  const words = [
    "program",
    "code",
    "function",
    "async",
    "const",
    "let",
    "var",
    "return",
    "if",
    "else",
    "while",
    "for",
    "class",
    "import",
    "export",
    "try",
    "catch",
    "await",
    "promise",
    "lambda",
    "yield",
  ];
  const flyingWords: Array<{
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
  }> = [];
  const colors = [
    "#0fffc3",
    "#5eead4",
    "#22d3ee",
    "#818cf8",
    "#f472b6",
    "#facc15",
    "#38bdf8",
    "#f87171",
  ];
  function randomWord() {
    return words[Math.floor(Math.random() * words.length)];
  }
  function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
  }
  function spawnWord(width: number, height: number) {
    const size = 18 + Math.random() * 18;
    return {
      text: randomWord(),
      x: Math.random() * width,
      y: Math.random() * height,
      vx: -0.2 + Math.random() * 0.4,
      vy: -0.1 + Math.random() * 0.2,
      size,
      baseSize: size,
      scale: 1,
      color: randomColor(),
      alpha: 0.5 + Math.random() * 0.4,
      rotate: Math.random() * Math.PI * 2,
      rotateSpeed: -0.005 + Math.random() * 0.01,
      hoverTick: 0,
      deflectTick: 0,
    };
  }
  // --- Typing code animation for code preview ---
  const codeBlocks = [
    `Api GET #exAPi2 \nUrl http://localhost:8080/api/order/createPaymentOrder\nBody JSON  {\namount: 10.24,\nfirstName: Rintu,\nlastName: Raj,\nphone: 9400848033, \nemail: rinturajc@gmail.com,\nstreet: cheeranhouse,\ncity: kkm,\nstate: IN,\ncountry: KW,\npostalCode: 560024,\ntransactionId: Order1234\n} \nHeader\n- Content-Type: 'application/json'`,
    `Api POST #CliApi   \nUrl http://localhost:8080/api/order/createPaymentOrder\nBody JSON {\"amount\": \"10.24\",\"firstName\": \"Rintu\",\"lastName\": \"Raj\",\"phone\": \"9400848033\", \"email\": \"rinturajc@gmail.com\",\"street\": \"cheeran house\",\"city\": \"kkm\",\"state\": \"IN\",\"country\": \"KW\",\"postalCode\": \"560024\",\"transactionId\": \"Order1234\"} \nHeader\n - Content-Type: application/json`,
  ];
  let previewBlock = 0;
  let previewChar = 0;
  let previewPause = 0;
  let previewTyped = "";
  let previewEl: HTMLPreElement;
  // Auto-scroll code preview to bottom
  $: if (previewEl && previewTyped) {
    previewEl.scrollTop = previewEl.scrollHeight;
  }
  // Animate code preview typing
  function animateCodePreview() {
    if (previewPause > 0) {
      previewPause--;
    } else {
      if (previewChar < codeBlocks[previewBlock].length) {
        previewChar++;
        previewTyped = codeBlocks[previewBlock].slice(0, previewChar);
      } else {
        previewPause = 60; // pause before next block
        previewBlock = (previewBlock + 1) % codeBlocks.length;
        previewChar = 0;
        previewTyped = "";
      }
    }
    requestAnimationFrame(animateCodePreview);
  }
  onMount(() => {
    animateCodePreview();
    // Mouse listeners for flying code
    // Use setTimeout to ensure canvas is in DOM
    setTimeout(() => {
      if (bgCanvas) {
        bgCanvas.addEventListener("mousemove", handleMouseMove);
        bgCanvas.addEventListener("mouseleave", handleMouseLeave);
      }
    }, 0);
  });
  // --- Canvas flying words only ---
  function animateWords() {
    if (!bgCanvas || !ctx) return;
    // Always set canvas size to match display size
    const width = (bgCanvas.width = bgCanvas.offsetWidth);
    const height = (bgCanvas.height = bgCanvas.offsetHeight);
    ctx.clearRect(0, 0, width, height);
    // Add more words if needed
    while (flyingWords.length < 18) {
      flyingWords.push(spawnWord(width, height));
    }
    for (let i = 0; i < flyingWords.length; i++) {
      const w = flyingWords[i];
      // --- Hover/deflect logic ---
      ctx.save();
      ctx.font = `${w.size}px 'Fira Mono', 'Menlo', 'monospace'`;
      const textWidth = ctx.measureText(w.text).width;
      ctx.restore();
      const dx = mouse.x - w.x;
      const dy = mouse.y - w.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const hitRadius = Math.max(w.size, textWidth) * 0.7;
      if (dist < hitRadius) {
        // Hovering: scale up and deflect
        w.scale += (1.4 - w.scale) * 0.25;
        w.hoverTick = 8;
        if (w.deflectTick === 0) {
          // Deflect velocity away from mouse
          const angle = Math.atan2(dy, dx) + Math.PI;
          w.vx += Math.cos(angle) * 0.6;
          w.vy += Math.sin(angle) * 0.6;
          w.deflectTick = 12;
        }
      } else {
        w.scale += (1 - w.scale) * 0.08;
        if (w.hoverTick > 0) w.hoverTick--;
        if (w.deflectTick > 0) w.deflectTick--;
      }
      // --- Drawing ---
      ctx.save();
      ctx.globalAlpha = w.alpha;
      ctx.font = `${w.baseSize * w.scale}px 'Fira Mono', 'Menlo', 'monospace'`;
      ctx.fillStyle = w.color;
      ctx.translate(w.x, w.y);
      ctx.rotate(w.rotate);
      ctx.scale(w.scale, w.scale);
      ctx.fillText(w.text, 0, 0);
      ctx.restore();
      w.x += w.vx;
      w.y += w.vy;
      w.rotate += w.rotateSpeed;
      // Friction to slow deflected words
      w.vx *= 0.97;
      w.vy *= 0.97;
      // If out of bounds, respawn
      if (w.x < -100 || w.x > width + 100 || w.y < -40 || w.y > height + 40) {
        flyingWords[i] = spawnWord(width, height);
      }
    }
    // Debug: draw mouse circle
    // ctx.save();
    // ctx.beginPath();
    // ctx.arc(mouse.x, mouse.y, 8, 0, 2 * Math.PI);
    // ctx.strokeStyle = '#fff';
    // ctx.lineWidth = 2;
    // ctx.stroke();
    // ctx.restore();
    requestAnimationFrame(animateWords);
  }
  onMount(() => {
    setTimeout(() => {
      isVisible = true;
      setTimeout(() => (headingVisible = true), 500);
      setTimeout(() => (paragraphVisible = true), 2000);
    }, 100);
    // Setup canvas
    if (bgCanvas) {
      ctx = bgCanvas.getContext("2d");
      animateWords();
    }
    // Responsive: re-trigger on resize
    const handleResize = () => {
      if (bgCanvas && ctx) {
        bgCanvas.width = bgCanvas.offsetWidth;
        bgCanvas.height = bgCanvas.offsetHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

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
  <div class="w-full h-full opacity-55 inset-0 -z-10 overflow-hidden">
    <canvas bind:this={bgCanvas} class="absolute w-full h-full block z-10"
    ></canvas>
    <svg
      class="absolute opacity-50 h-full w-full z-0"
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
  <div class="  inset-0 -z-10">
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
          <!-- Diagonal line: top-left to bottom-right -->
          <line
            x1="0"
            y1="0"
            x2="20"
            y2="20"
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
          <!-- Diagonal line: bottom-left to top-right -->
          <line
            x1="0"
            y1="20"
            x2="20"
            y2="0"
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
      class={`mt-16 w-full  max-w-3xl bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden transition-all duration-1000 ease-in-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div class="flex items-center bg-gray-700/90 backdrop-blur-sm px-4 py-2">
        <div class="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
        <div class="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
        <span class="text-gray-400 text-sm">example.js</span>
      </div>
      <pre
        class="p-4 text-sm max-h-[100px] h-[100px] overflow-x-auto"
        bind:this={previewEl}>
        <code>{previewTyped}</code>
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
