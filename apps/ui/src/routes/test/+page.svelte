<script lang="ts">
  import AutoScrollViewPort from "../../lib/ui/components/AutoScrollViewPort.svelte";
  import { onMount } from "svelte";
  import Blocks from "../../lib/ui/components/Blocks.svelte";

  // Type definitions
  type NodeType = "input" | "output" | "process" | "default";

  interface Node {
    id: number;
    x: number;
    y: number;
    type: NodeType;
    label: string;
    inputs?: string[];
    outputs?: string[];
  }

  interface Connection {
    from: number;
    fromOutput: string;
    to: number;
    toInput: string;
  }

  let viewportElement: HTMLElement | null = null;

  // Sample nodes data
  let nodes: Node[] = [
    {
      id: 1,
      x: 100,
      y: 100,
      type: "input",
      label: "Input Data",
      outputs: ["data"],
    },
    {
      id: 2,
      x: 400,
      y: 50,
      type: "process",
      label: "Process Data",
      inputs: ["data"],
      outputs: ["result"],
    },
    {
      id: 3,
      x: 700,
      y: 150,
      type: "output",
      label: "Output",
      inputs: ["result"],
    },
    {
      id: 4,
      x: 400,
      y: 250,
      type: "process",
      label: "Filter",
      inputs: ["data"],
      outputs: ["filtered"],
    },
  ];

  // Connections between nodes
  let connections: Connection[] = [
    { from: 1, fromOutput: "data", to: 2, toInput: "data" },
    { from: 1, fromOutput: "data", to: 4, toInput: "data" },
    { from: 2, fromOutput: "result", to: 3, toInput: "result" },
  ];

  // Draw grid pattern
  function drawGrid(
    context: CanvasRenderingContext2D,
    color: string,
    stepx: number,
    stepy: number
  ) {
    const width = context.canvas.width;
    const height = context.canvas.height;

    context.strokeStyle = color;
    context.lineWidth = 0.5;

    for (let i = stepx + 0.5; i < width; i += stepx) {
      context.beginPath();
      context.moveTo(i, 0);
      context.lineTo(i, height);
      context.stroke();
    }

    for (let j = stepy + 0.5; j < height; j += stepy) {
      context.beginPath();
      context.moveTo(0, j);
      context.lineTo(width, j);
      context.stroke();
    }
  }

  onMount(() => {
    const canvas = document.getElementById(
      "editor-canvas"
    ) as HTMLCanvasElement | null;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size to match its display size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Draw grid
      drawGrid(ctx, "#e5e7eb", 20, 20);

      // Draw connections
      connections.forEach((conn) => {
        const fromNode = nodes.find((n) => n.id === conn.from);
        const toNode = nodes.find((n) => n.id === conn.to);

        if (fromNode && toNode) {
          ctx.beginPath();
          ctx.strokeStyle = "#6b7280";
          ctx.lineWidth = 2;
          ctx.moveTo(fromNode.x + 200, fromNode.y + 15);
          ctx.bezierCurveTo(
            fromNode.x + 250,
            fromNode.y + 15,
            toNode.x - 50,
            toNode.y + 15,
            toNode.x,
            toNode.y + 15
          );
          ctx.stroke();

          // Draw arrow
          const headLength = 10;
          const angle = Math.atan2(
            toNode.y + 15 - (fromNode.y + 15),
            toNode.x - (fromNode.x + 200)
          );

          ctx.beginPath();
          ctx.moveTo(toNode.x, toNode.y + 15);
          ctx.lineTo(
            toNode.x - headLength * Math.cos(angle - Math.PI / 6),
            toNode.y + 15 - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            toNode.x - headLength * Math.cos(angle + Math.PI / 6),
            toNode.y + 15 - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = "#6b7280";
          ctx.fill();
        }
      });
    }
  });

  // Function to get node color based on type
  function getNodeColor(type: NodeType): string {
    switch (type) {
      case "input":
        return "bg-blue-100 border-blue-400";
      case "output":
        return "bg-green-100 border-green-400";
      case "process":
        return "bg-purple-100 border-purple-400";
      default:
        return "bg-gray-100 border-gray-400";
    }
  }
</script>

<div class="w-full h-screen bg-gray-50 overflow-hidden">
  <AutoScrollViewPort scrollSpeed={8} edgeThreshold={60} smoothScroll={true}>
    <Blocks></Blocks>
    <Blocks></Blocks>
    <Blocks></Blocks>
  </AutoScrollViewPort>
</div>
