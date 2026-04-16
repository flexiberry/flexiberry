<script lang="ts">
  import { Handle, Position } from "@xyflow/svelte";
  import { Zap, Activity, Link, Share2 } from "lucide-svelte";

  export let data: any = {
    stepIndex: 1,
    description: "Post new pet",
    apiId: "addPet",
  };
</script>

<div
  class="w-[320px] bg-[#1a1b1e]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden font-sans flex flex-col relative transition-all duration-300 group hover:border-violet-500/30 step-train-block"
>
  <!-- Main Header -->
  <div
    class="px-6 py-5 flex items-center gap-4 text-white bg-violet-500/10 border-b border-white/5 relative z-10"
  >
    <div
      class="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
    >
      <Zap class="w-6 h-6 text-violet-400 fill-violet-400" />
    </div>

    <div class="flex flex-col flex-1 min-w-0">
      <span
        class="text-[10px] font-black text-violet-400 uppercase tracking-[0.3em]"
        >Step {data.stepIndex}</span
      >
      <span
        class="text-[15px] font-bold text-gray-100 truncate mt-0.5 tracking-tight uppercase tracking-widest"
        >{data.description}</span
      >
    </div>
  </div>

  <!-- Body Info -->
  <div class="p-6 flex flex-col gap-4 relative z-10 bg-black/20 flex-1">
    <div
      class="flex flex-col gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
    >
      <div class="flex items-center gap-2">
        <Activity class="w-3.5 h-3.5 text-violet-500/60" />
        <span
          class="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]"
          >Execution Scope</span
        >
      </div>
      <div class="flex items-center gap-2 mt-1">
        <Link class="w-3 h-3 text-blue-400/70" />
        <span class="text-[11px] font-mono text-blue-400/80 font-bold"
          >API.TARGET → {data.apiId}</span
        >
      </div>
    </div>

    <div class="mt-auto pt-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Share2 class="w-3 h-3 text-violet-500/40" />
        <span
          class="text-[8px] font-bold text-gray-600 uppercase tracking-widest"
          >Active State</span
        >
      </div>
      <div class="flex gap-1">
        <div class="w-1.5 h-1.5 rounded-full bg-violet-500/30"></div>
        <div class="w-1.5 h-1.5 rounded-full bg-violet-500/10"></div>
      </div>
    </div>
  </div>

  <!-- Note: Invisible handles for Logic, Sticking via Coordinate spacing -->
  <Handle type="target" position={Position.Left} class="invisible" />
  <Handle type="source" position={Position.Right} class="invisible" />
  <Handle
    type="source"
    id="sub-node-anchor"
    position={Position.Bottom}
    class="invisible"
  />

  <!-- The "Train Connector" Shadows -->
  <div
    class="absolute inset-y-0 left-0 w-[1px] bg-white/10 shadow-[-2px_0_10px_rgba(0,0,0,0.5)] z-30"
  ></div>
  <div
    class="absolute inset-y-0 right-0 w-[1px] bg-white/10 shadow-[2px_0_10px_rgba(0,0,0,0.5)] z-30"
  ></div>

  <!-- Subtle Bottom border hint for sticking -->
  <div
    class="absolute inset-x-0 bottom-0 h-[1px] bg-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.5)] z-30"
  ></div>
</div>

<style>
  .step-train-block {
    border-left: none;
    border-right: none;
    border-bottom: none;
  }
</style>
