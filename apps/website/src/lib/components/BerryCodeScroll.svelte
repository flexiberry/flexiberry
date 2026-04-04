<script lang="ts">
  import { onMount } from "svelte";
  import Lenis from "lenis";

  // ── Berry code segments from demo-test.berry ──────────────────────────────
  // Token shape: type, text, newline?
  //   newline: true  → this token starts a NEW visual row
  //   newline: false → this token is appended INLINE on the previous row
  //   newline absent → treated as true (each token is its own row)
  const segments = [
    {
      label: "Variables",
      color: "#a78bfa",
      lines: [
        { type: "keyword", text: "Var", newline: true },
        { type: "env", text: " @UAT", newline: false },
        { type: "comment", text: "  # global variable", newline: false },
        { type: "prop", text: "  - baseUrl", newline: true },
        {
          type: "value",
          text: ": 'https://petstore.swagger.io/v2'",
          newline: false,
        },
        { type: "prop", text: "  - petId", newline: true },
        { type: "value", text: ": '1'", newline: false },
      ],
    },
    {
      label: "API Definition",
      color: "#34d399",
      lines: [
        { type: "keyword", text: "Api", newline: true },
        { type: "method", text: " POST", newline: false },
        { type: "id", text: " #addPet", newline: false },
        { type: "comment", text: "  Add a new pet", newline: false },
        { type: "keyword", text: "Url", newline: true },
        {
          type: "value",
          text: "  https://petstore.swagger.io/v2/pet",
          newline: false,
        },
        { type: "keyword", text: "Header", newline: true },
        { type: "prop", text: "  - Content-Type", newline: true },
        { type: "value", text: ": 'application/json'", newline: false },
        { type: "keyword", text: "Body JSON", newline: true },
        {
          type: "value",
          text: '  `{ "id": 1, "name": "doggie" }`',
          newline: false,
        },
      ],
    },
    {
      label: "Task & Steps",
      color: "#fb923c",
      lines: [
        { type: "keyword", text: "Task", newline: true },
        { type: "comment", text: "  add new pet and find", newline: false },
        { type: "keyword", text: "Step", newline: true },
        { type: "value", text: "  Call ", newline: false },
        { type: "keyword", text: " Api ", newline: false },
        { type: "id", text: " addPet", newline: false },
        { type: "keyword", text: "Capture", newline: true },
        { type: "prop", text: "  - id", newline: true },
        { type: "value", text: ": response.id", newline: false },
        { type: "keyword", text: "Check", newline: true },
        { type: "check", text: "  - $.status == 200", newline: true },
        { type: "check", text: "  - id != null", newline: true },
      ],
    },
    {
      label: "Second Step",
      color: "#38bdf8",
      lines: [
        { type: "keyword", text: "Step", newline: true },
        { type: "value", text: "  Call ", newline: false },
        { type: "keyword", text: " Api ", newline: false },
        { type: "id", text: " getPetById", newline: false },
        { type: "keyword", text: "Params", newline: true },
        { type: "prop", text: "  - petId", newline: true },
        { type: "value", text: ": Step.1.id", newline: false },
        { type: "keyword", text: "Check", newline: true },
        { type: "check", text: "  - $.status == 200", newline: true },
        { type: "check", text: "  - id == Step.1.id", newline: true },
      ],
    },
  ];

  // ── Token → Row grouping ───────────────────────────────────────────────────
  // A "row" is a visual line. Tokens with newline:true (or absent) start a new
  // row; newline:false tokens are appended inline on the same row.
  // The model tracks character offsets so the typing animation types one
  // character at a time across the full file.

  interface Token {
    type: string;
    text: string;
    newline?: boolean;
  }

  // Token after layout — knows its char position within the row
  interface PlacedToken extends Token {
    startInRow: number; // char offset from row start
  }

  interface Row {
    tokens: PlacedToken[];
    si: number; // segment index
    rowIndex: number; // global row index
    startChar: number; // global char index where this row starts
    length: number; // total chars in this row
  }

  /** Group tokens into visual rows and annotate with char offsets. */
  function buildRows(
    segs: Array<{ label: string; color: string; lines: Token[] }>,
  ): { segRows: Row[][]; flatRows: Row[] } {
    const flatRows: Row[] = [];
    const segRows: Row[][] = [];
    let globalRowIndex = 0;
    let globalCharIndex = 0;

    for (let si = 0; si < segs.length; si++) {
      const rows: Row[] = [];
      let currentRow: Row | null = null;

      for (const token of segs[si].lines) {
        if (token.newline !== false) {
          // Close previous row before opening a new one
          if (currentRow) globalCharIndex += currentRow.length;
          currentRow = {
            tokens: [],
            si,
            rowIndex: globalRowIndex++,
            startChar: globalCharIndex,
            length: 0,
          };
          rows.push(currentRow);
          flatRows.push(currentRow);
        }
        const placed: PlacedToken = {
          ...token,
          startInRow: currentRow!.length,
        };
        currentRow!.tokens.push(placed);
        currentRow!.length += token.text.length;
      }
      // Close the last row of this segment
      if (currentRow) globalCharIndex += currentRow.length;
      segRows.push(rows);
    }
    return { segRows, flatRows };
  }

  const { segRows, flatRows } = buildRows(segments);
  // Total characters across the whole file — scroll maps to this range
  const totalChars = flatRows.reduce((s, r) => s + r.length, 0);

  const tokenColors: Record<string, string> = {
    keyword: "#c084fc",
    env: "#f472b6",
    comment: "#6b7280",
    prop: "#93c5fd",
    value: "#fcd34d",
    id: "#34d399",
    method: "#f97316",
    title: "#e5e7eb",
    check: "#4ade80",
  };

  // ── State ─────────────────────────────────────────────────────────────────
  let outerEl: HTMLDivElement;
  let codeAreaEl: HTMLDivElement;

  let rawProgress = 0;
  let smoothProgress = 0;
  let progress = 0; // exposed to template (= smoothProgress)

  // typedChars: how many characters across the whole file have been "typed"
  // This is the core value the template uses to slice token text.
  let typedChars = 0;
  let currentSeg = 0;

  function updateTyping(p: number) {
    typedChars = p * totalChars;

    // Active segment = last segment where any row has startChar < typedChars
    let seg = 0;
    for (let s = 0; s < segments.length; s++) {
      if (segRows[s].some((r) => r.startChar < typedChars)) seg = s;
    }
    currentSeg = seg;
  }

  // ── Scroll tracking ───────────────────────────────────────────────────────
  function calcRawProgress() {
    if (!outerEl) return;
    const offsetTop = outerEl.offsetTop;
    const scrollable = outerEl.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    rawProgress = Math.max(
      0,
      Math.min(1, (window.scrollY - offsetTop) / scrollable),
    );
  }

  onMount(() => {
    updateTyping(0);

    // Lenis handles smooth wheel inertia; lerp: 0.06 = silky feel
    const lenis = new Lenis({ lerp: 0.06, smoothWheel: true });

    lenis.on("scroll", ({ scroll }: { scroll: number }) => {
      if (!outerEl) return;
      const offsetTop = outerEl.offsetTop;
      const scrollable = outerEl.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      rawProgress = Math.max(0, Math.min(1, (scroll - offsetTop) / scrollable));
    });

    // ── Master rAF loop ────────────────────────────────────────────────────
    // One coordinated tick per frame drives everything: Lenis, progress lerp,
    // row reveals and code-area auto-scroll.
    const LERP = 0.07; // progress smoothness — lower = silkier
    const CODE_LERP = 0.09; // editor scroll lerp — slightly snappier

    function raf(t: number) {
      lenis.raf(t);

      // 1. Lerp the display progress toward raw scroll
      smoothProgress += (rawProgress - smoothProgress) * LERP;
      if (smoothProgress > 0.9995) smoothProgress = 1;
      if (smoothProgress < 0.0005) smoothProgress = 0;

      // 2. Expose smoothed value to template (triggers Svelte reactivity)
      progress = smoothProgress;

      // 3. Update typing state using the smoothed progress
      updateTyping(smoothProgress);

      // 4. Lerp the code-area scroll toward its bottom
      if (codeAreaEl) {
        const target = codeAreaEl.scrollHeight;
        const diff = target - codeAreaEl.scrollTop;
        if (Math.abs(diff) > 0.5) {
          codeAreaEl.scrollTop += diff * CODE_LERP;
        }
      }

      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Fallback for keyboard / programmatic scroll (no Lenis event)
    window.addEventListener("scroll", calcRawProgress, { passive: true });

    return () => {
      lenis.destroy();
      window.removeEventListener("scroll", calcRawProgress);
    };
  });
</script>

<!--
  STICKY ANIMATION RULES:
  1. outerEl = tall container (400vh) — its scroll position drives the animation
  2. inner div = position:sticky + height:100vh — stays locked to viewport
  3. NO ancestor may have overflow:hidden/auto — it breaks sticky
-->
<div bind:this={outerEl} style="height: 400vh; position: relative;">
  <div
    style="position: sticky; top: 0; height: 100vh; overflow: hidden;
              display: flex; flex-direction: column; align-items: center;
              justify-content: center; padding: 1rem 1.5rem; gap: 0;"
  >
    <!-- Section heading -->
    <div style="text-align: center; margin-bottom: 1.25rem;">
      <p
        style="font-size: 0.65rem; letter-spacing: 0.18em; color: #34d39966;
                text-transform: uppercase; font-family: monospace; margin: 0 0 0.4rem;"
      >
        Berry Language
      </p>
      <h2
        style="font-size: clamp(1.4rem, 3.5vw, 2rem); font-weight: 700; color: #fff;
                 font-family: monospace; margin: 0;"
      >
        Write tests like <span style="color: #34d399;">reading English</span>
      </h2>
    </div>

    <!-- Segment indicator dots -->
    <div style="display: flex; gap: 1.5rem; margin-bottom: 1rem;">
      {#each segments as seg, i}
        <span
          style="display: inline-flex; align-items: center; gap: 0.4rem;
                     font-size: 0.68rem; font-family: monospace;
                     opacity: {i <= currentSeg ? 1 : 0.3};
                     color: {i === currentSeg ? seg.color : '#6b7280'};
                     transition: all 0.4s ease;"
        >
          <span
            style="width: 0.45rem; height: 0.45rem; border-radius: 50%;
                       background: {seg.color};
                       display: inline-block;
                       box-shadow: {i === currentSeg
              ? `0 0 7px ${seg.color}`
              : 'none'};
                       transition: box-shadow 0.4s ease;"
          ></span>
          {seg.label}
        </span>
      {/each}
    </div>

    <!-- Code editor card -->
    <div
      style="width: 100%; max-width: 660px;
                border-radius: 0.9rem; overflow: hidden;
                border: 1px solid rgba(255,255,255,0.07);
                background: #0d1117;
                box-shadow: 0 24px 60px rgba(0,0,0,0.6);"
    >
      <!-- Title bar -->
      <div
        style="display: flex; align-items: center; gap: 0.4rem;
                  padding: 0.6rem 1rem;
                  background: #161b22;
                  border-bottom: 1px solid rgba(255,255,255,0.05);"
      >
        <div
          style="width:11px;height:11px;border-radius:50%;background:#ff5f56;"
        ></div>
        <div
          style="width:11px;height:11px;border-radius:50%;background:#ffbd2e;"
        ></div>
        <div
          style="width:11px;height:11px;border-radius:50%;background:#27c93f;"
        ></div>
        <span
          style="margin-left:0.6rem; font-size:0.68rem; font-family:monospace; color:#6b7280;"
        >
          demo-test.berry
        </span>
        <div
          style="margin-left:auto; display:flex; align-items:center; gap:0.4rem;"
        >
          <span style="font-size:0.6rem; font-family:monospace; color:#4b5563;">
            {Math.round(progress * 100)}%
          </span>
          <div
            style="width:4.5rem; height:3px; border-radius:9999px; background:rgba(255,255,255,0.05); overflow:hidden;"
          >
            <div
              style="height:100%; border-radius:9999px; transition: width 0.15s linear;
                        width:{Math.round(progress * 100)}%;
                        background:linear-gradient(90deg,#a78bfa,#34d399);"
            ></div>
          </div>
        </div>
      </div>

      <!-- Code area — fixed height, no scrollbar, auto-scrolled programmatically -->
      <div
        bind:this={codeAreaEl}
        style="padding: 1rem 1.25rem 160px; font-family:'JetBrains Mono',monospace;
               font-size: 12.5px; line-height: 1.7rem;
               height: 340px; overflow-y: hidden;
               scroll-behavior: smooth;"
      >
        {#each segments as seg, si}
          <!-- Separator between segments -->
          {#if si > 0}
            {@const firstRow = segRows[si]?.[0]}
            {@const segStarted = firstRow
              ? typedChars > firstRow.startChar
              : false}
            <div
              style="height:1px; margin: 0.3rem 0;
                        transition: background 0.5s ease;
                        background: {segStarted
                ? seg.color + '1e'
                : 'transparent'};"
            ></div>
          {/if}

          {#each segRows[si] as row}
            {@const rowChars = Math.max(0, typedChars - row.startChar)}
            {@const isRevealed = rowChars > 0}
            {@const isTyping = rowChars > 0 && rowChars < row.length}
            {@const isCursor =
              isTyping ||
              (row.rowIndex === flatRows.length - 1 && progress >= 1)}

            <!-- One visual row — chars revealed letter by letter as we scroll -->
            <div
              style="display:flex; align-items:baseline; overflow:hidden;
                        max-height: {isRevealed ? '1.7rem' : '0'};
                        opacity: {isRevealed ? 1 : 0};
                        transform: translateX({isRevealed ? '0' : '-8px'});
                        transition: max-height 0.18s ease, opacity 0.2s ease, transform 0.2s ease;"
            >
              <!-- Line number -->
              <span
                style="width:1.8rem; text-align:right; font-size:0.6rem;
                           color:#374151; margin-right:0.9rem; flex-shrink:0; user-select:none;"
              >
                {isRevealed ? row.rowIndex + 1 : ""}
              </span>
              <!-- Each token sliced to only show typed chars -->
              {#each row.tokens as token}
                {@const visible = Math.max(
                  0,
                  Math.min(rowChars - token.startInRow, token.text.length),
                )}
                {#if visible > 0}
                  <span
                    style="color:{tokenColors[token.type] ??
                      '#e5e7eb'}; white-space:pre;"
                    >{token.text.slice(0, visible)}</span
                  >
                {/if}
              {/each}
              <!-- Blinking cursor after the last typed character on this row -->
              {#if isCursor}
                <span class="berry-cursor"></span>
              {/if}
            </div>
          {/each}
        {/each}

        {#if progress >= 0.99}
          <div
            style="margin-top:1rem; display:flex; align-items:center; gap:0.5rem;
                      color:#34d399; font-size:0.72rem; font-family:monospace;"
          >
            <span>✔</span>
            <span
              >Ready — <span style="color:#6ee7b7;"
                >`berrycore run demo-test.berry`</span
              ></span
            >
          </div>
        {/if}
      </div>
    </div>

    <!-- Scroll hint -->
    {#if progress < 0.96}
      <div style="margin-top:1.25rem; text-align:center; opacity:0.45;">
        <div
          style="font-size:0.58rem; letter-spacing:0.18em; color:#6b7280;
                    font-family:monospace; text-transform:uppercase; margin-bottom:0.25rem;"
        >
          Scroll to write
        </div>
        <div class="berry-bounce">↓</div>
      </div>
    {/if}
  </div>
</div>

<style>
  @keyframes blink {
    0%,
    49% {
      opacity: 1;
    }
    50%,
    100% {
      opacity: 0;
    }
  }
  .berry-cursor {
    display: inline-block;
    width: 2px;
    height: 0.9em;
    background: #34d399;
    margin-left: 2px;
    border-radius: 1px;
    vertical-align: middle;
    animation: blink 0.85s step-start infinite;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(5px);
    }
  }
  .berry-bounce {
    color: #6b7280;
    font-size: 1rem;
    animation: bounce 1.5s ease-in-out infinite;
  }
</style>
