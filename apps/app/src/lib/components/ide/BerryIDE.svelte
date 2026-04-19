<script lang="ts">
  import * as Resizable from "$lib/components/ui/resizable/index";
  import NodeCanvas from "$lib/components/canvas/NodeCanvas.svelte";
  import ApiAssistant from "$lib/components/editor/ApiAssistant.svelte";
  import Header from "$lib/ui/shared/Header.svelte";
  import CanvasToolbar from "$lib/components/ide/CanvasToolbar.svelte";
  import ApiStack from "$lib/components/ide/ApiStack.svelte";
  import VarStack from "$lib/components/ide/VarStack.svelte";
  import BerryCodePanel from "$lib/components/ide/BerryCodePanel.svelte";
  import type { FileContext } from "$lib/writable/File";
  import SequenceCanvas from "../canvas/SequenceCanvas.svelte";

  // ─── Props ────────────────────────────────────────────────────────
  /** Full file location parsed from the URL. */
  export let ctx: FileContext;

  // ─── Shared resize handle class ───────────────────────────────────
  const handleBase =
    "bg-transparent hover:bg-primary/50 active:bg-primary/50 " +
    "hover:shadow-[0_0_5px_hsl(var(--primary))] active:shadow-[0_0_5px_hsl(var(--primary))] " +
    "transition-all duration-300 ease-out pointer-events-auto relative z-10";
</script>

<!--
  BerryIDE
  Full-screen IDE shell that composes the node canvas, inspector, debug
  console, and code editor panes into a resizable layout.

  Structure:
  ┌─────────────────────────────┬────────────┐
  │  Header                     │            │
  ├──────────────────────┬──────┤  Inspector │
  │  Canvas              │      │            │
  │                      │      │            │
  │  [CanvasToolbar]     │      │            │
  ├──────────────────────┤      │            │
  │  DebugConsole │ Code │      │            │
  └───────────────┴──────┴──────┘
-->
<div
  class="h-full w-full bg-background text-foreground overflow-hidden font-sans relative"
>
  <!-- Full-screen canvas sits beneath the UI overlay -->
  <div class="absolute inset-0 z-0">
    <!-- <NodeCanvas /> -->
    <SequenceCanvas {ctx} />
  </div>

  <!-- Pointer-events disabled overlay so the canvas stays interactive -->
  <div class="absolute inset-0 z-10 p-2 pointer-events-none flex flex-col">
    <Resizable.PaneGroup direction="horizontal" class="h-full w-full gap-1">
      <!-- ── LEFT + CENTER (75 %) ───────────────────────────────── -->
      <Resizable.Pane defaultSize={75} class="flex flex-col gap-1">
        <!-- Top bar -->
        <div class="pointer-events-auto shrink-0 relative z-20">
          <Header />
        </div>

        <Resizable.PaneGroup direction="vertical" class="gap-1">
          <!-- ── TOP: transparent canvas interaction area ── -->
          <Resizable.Pane defaultSize={65} class="relative">
            <CanvasToolbar />
          </Resizable.Pane>

          <Resizable.Handle
            class="{handleBase} w-full h-0.5 cursor-row-resize"
          />

          <!-- ── BOTTOM: debug + code editor ── -->
          <Resizable.Pane defaultSize={35}>
            <Resizable.PaneGroup direction="horizontal" class="gap-1 h-full">
              <!-- Api Stack (60 %) -->
              <Resizable.Pane defaultSize={60}>
                <ApiStack />
              </Resizable.Pane>

              <Resizable.Handle
                class="{handleBase} w-0.5 h-full cursor-col-resize"
              />

              <!-- Var Stack (40 %) -->
              <Resizable.Pane defaultSize={40}>
                <VarStack />
              </Resizable.Pane>
            </Resizable.PaneGroup>
          </Resizable.Pane>
        </Resizable.PaneGroup>
      </Resizable.Pane>

      <Resizable.Handle class="{handleBase} w-0.5 h-full cursor-col-resize" />

      <!-- ── RIGHT SIDEBAR: Code Editor (25 %) ──────────────── -->
      <Resizable.Pane
        defaultSize={25}
        class="pointer-events-auto overflow-hidden flex flex-col relative z-20"
      >
        <BerryCodePanel {ctx} />
      </Resizable.Pane>
    </Resizable.PaneGroup>
  </div>
</div>
