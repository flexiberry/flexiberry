<script lang="ts">
  import { SvelteFlow, Background, BackgroundVariant } from "@xyflow/svelte";
  import { writable } from "svelte/store";
  import { mode } from "mode-watcher";
  import "@xyflow/svelte/dist/style.css";

  import IdeaNode from "./nodes/IdeaNode.svelte";
  import ReferenceNode from "./nodes/ReferenceNode.svelte";
  import SettingsNode from "./nodes/SettingsNode.svelte";
  import ModelNode from "./nodes/ModelNode.svelte";
  import ApiNode from "./nodes/ApiNode.svelte";

  const nodeTypes: any = {
    ideas: IdeaNode,
    references: ReferenceNode,
    settings: SettingsNode,
    models: ModelNode,
    api: ApiNode,
  };

  const nodes = writable([
    {
      id: "n-ideas",
      type: "ideas",
      data: {},
      position: { x: 50, y: 50 },
    },
    {
      id: "n-refs",
      type: "references",
      data: {},
      position: { x: 30, y: 320 },
    },
    {
      id: "n-settings",
      type: "settings",
      data: {},
      position: { x: 480, y: 50 },
    },
    {
      id: "n-models",
      type: "models",
      data: {},
      position: { x: 480, y: 460 },
    },
    {
      id: "n-api",
      type: "api",
      data: {
        title: "User Auth Endpoint",
        method: "POST",
        url: "https://api.flexiberry.com/v1/auth",
        inputRaw: "curl -X POST https://api.flexiberry.com/v1/auth"
      },
      position: { x: 880, y: 100 },
    },
  ]);

  const edges = writable([
    // Smooth bezier curve for ideas -> settings
    {
      id: "e-ideas-settings",
      source: "n-ideas",
      target: "n-settings",
      type: "smoothstep",
      animated: true,
      style:
        "stroke: #febb4c; stroke-width: 2px; filter: drop-shadow(0px 0px 4px rgba(254, 187, 76, 0.6));",
    },
    // References -> settings
    {
      id: "e-refs-settings",
      source: "n-refs",
      target: "n-settings",
      type: "smoothstep",
      animated: true,
      style:
        "stroke: #38bdf8; stroke-width: 2px; filter: drop-shadow(0px 0px 4px rgba(56, 189, 248, 0.6));",
    },
    // Settings -> models
    {
      id: "e-settings-models",
      source: "n-settings",
      target: "n-models",
      type: "straight",
      style: "stroke: #a1a1aa; stroke-width: 1.5px; stroke-dasharray: 5 5;",
    },
    // Settings -> Api
    {
      id: "e-settings-api",
      source: "n-settings",
      target: "n-api",
      type: "smoothstep",
      animated: true,
      style: "stroke: #10b981; stroke-width: 2px;",
    },
  ]);
</script>

<div
  class="h-full w-full bg-background text-foreground relative overflow-hidden"
>
  <!-- Animated Gradient Orbs -->
  <div class="absolute inset-0 z-0 pointer-events-none">
    <div
      class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 dark:bg-primary/10 rounded-full blur-[100px] animate-blob"
    ></div>
    <div
      class="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000"
    ></div>
    <div
      class="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] bg-violet-500/20 dark:bg-violet-500/10 rounded-full blur-[120px] animate-blob animation-delay-4000"
    ></div>
  </div>

  <SvelteFlow
    {nodes}
    {edges}
    {nodeTypes}
    initialViewport={{ x: 280, y: 120, zoom: 0.35 }}
    minZoom={0.2}
    maxZoom={4}
    class="bg-transparent node-canvas-flow transition-colors relative z-10"
    colorMode={$mode === "dark" ? "dark" : "light"}
  >
    <Background
      variant={BackgroundVariant.Dots}
      gap={10}
      patternColor="hsl(var(--muted-foreground) / 0.2)"
      bgColor="transparent"
    />
  </SvelteFlow>
</div>

<style>
  :global(.node-canvas-flow .svelte-flow__edge-path) {
    transition:
      stroke-width 0.2s ease,
      filter 0.2s ease;
  }

  :global(.node-canvas-flow .svelte-flow__edge-path:hover) {
    stroke-width: 3px !important;
    filter: brightness(1.5) drop-shadow(0px 0px 6px currentColor) !important;
  }

  :global(.node-canvas-flow .svelte-flow__panel.svelte-flow__attribution) {
    display: none !important;
  }

  :global(.node-canvas-flow) {
    background-color: transparent !important;
  }
  :global(.node-canvas-flow .svelte-flow__background) {
    background-color: transparent !important;
  }

  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
  .animate-blob {
    animation: blob 12s infinite alternate ease-in-out;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
</style>
