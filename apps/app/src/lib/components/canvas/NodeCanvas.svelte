<script lang="ts">
  import {
    SvelteFlow,
    Background,
    BackgroundVariant,
    SelectionMode,
    Controls,
    type Node,
  } from "@xyflow/svelte";
  import { writable } from "svelte/store";
  import { mode } from "mode-watcher";
  import "@xyflow/svelte/dist/style.css";

  import ApiNode from "./nodes/ApiNode.svelte";
  import VarNode from "./nodes/VarNode.svelte";
  import TaskNode from "./nodes/TaskNode.svelte";
  import StepNode from "./nodes/StepNode.svelte";
  import ParamsNode from "./nodes/ParamsNode.svelte";
  import CaptureNode from "./nodes/CaptureNode.svelte";
  import CheckNode from "./nodes/CheckNode.svelte";

  const nodeTypes: any = {
    api: ApiNode,
    var: VarNode,
    task: TaskNode,
    step: StepNode,
    params: ParamsNode,
    capture: CaptureNode,
    check: CheckNode,
  };

  const nodes = writable<Node[]>([
    {
      id: "n-api",
      type: "api",
      data: {
        title: "User Auth Endpoint",
        method: "POST",
        url: "https://api.flexiberry.com/v1/auth",
        inputRaw: "curl -X POST https://api.flexiberry.com/v1/auth",
      },
      position: { x: 880, y: 100 },
    },
    {
      id: "n-var",
      type: "var",
      data: {
        env: "@UAT",
        variables: [
          { key: "baseUrl", value: "https://api.petstore.com" },
          { key: "apiKey", value: "sk_test_123" },
        ],
      },
      position: { x: 30, y: 550 },
    },
    {
      id: "n-task",
      type: "task",
      data: {
        title: "Add & Verify Pet",
        description:
          "Verify that a pet can be added and then retrieved correctly.",
      },
      position: { x: 100, y: 100 },
      width: 1000,
      height: 1200,
    },
    // Step 1 Cluster (Stuck to Task side)
    {
      id: "n-step-1",
      type: "step",
      parentId: "n-task",
      data: { stepIndex: 1, description: "Post new pet", apiId: "addPet" },
      position: { x: 320, y: 0 },
      extent: "parent",
    },
    {
      id: "n-step-1-params",
      type: "params",
      parentId: "n-task",
      data: { params: [{ key: "name", value: "doggie", type: "literal" }] },
      position: { x: 320, y: 250 },
      extent: "parent",
    },
    {
      id: "n-step-1-capture",
      type: "capture",
      parentId: "n-task",
      data: { capture: [{ key: "petId", value: "response.id" }] },
      position: { x: 320, y: 500 },
      extent: "parent",
    },
    {
      id: "n-step-1-check",
      type: "check",
      parentId: "n-task",
      data: { checks: [{ left: "$.status", op: "==", right: "201" }] },
      position: { x: 320, y: 800 },
      extent: "parent",
    },

    // Step 2 Cluster (Stuck to Step 1 side)
    {
      id: "n-step-2",
      type: "step",
      parentId: "n-task",
      data: { stepIndex: 2, description: "Get pet by ID", apiId: "getPet" },
      position: { x: 640, y: 0 },
      extent: "parent",
    },
    {
      id: "n-step-2-params",
      type: "params",
      parentId: "n-task",
      data: {
        params: [{ key: "id", value: "Step.1.petId", type: "reference" }],
      },
      position: { x: 640, y: 250 },
      extent: "parent",
    },
    {
      id: "n-step-2-check",
      type: "check",
      parentId: "n-task",
      data: {
        checks: [
          { left: "$.status", op: "==", right: "200" },
          { left: "$.body.id", op: "==", right: "Step.1.petId" },
        ],
      },
      position: { x: 640, y: 500 },
      extent: "parent",
    },
  ]);

  const edges = writable([
    // No visual edges needed for "Sticky" architecture
    // Logic handles in code can remain invisible
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
    panOnDrag={true}
    selectionOnDrag={true}
    selectionMode={SelectionMode.Full}
  >
    <Background
      variant={BackgroundVariant.Dots}
      gap={10}
      patternColor="hsl(var(--muted-foreground) / 0.2)"
      bgColor="transparent"
    />
    <Controls />
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
