<script lang="ts">
  import { Handle, Position } from "@xyflow/svelte";
  import { Play, Pencil, ClipboardList, X } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";

  export let data: any = {
    title: "Test User Lifecycle",
    description: "Complete flow for user creation and login",
  };

  let isEditingTitle = false;

  function editTitle() {
    isEditingTitle = true;
  }
</script>

<div
  class="w-[320px] bg-[#1a1b1e]/95 backdrop-blur-xl rounded-l-3xl border border-white/10 shadow-2xl overflow-hidden font-sans flex flex-col relative transition-all duration-300 group hover:border-emerald-500/30 task-train-head"
>
  <!-- Header Section -->
  <div
    class="px-6 py-5 flex items-center gap-4 text-white bg-emerald-500/10 border-b border-white/5 relative z-10"
  >
    <div
      class="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
    >
      <Play class="w-6 h-6 text-emerald-400 fill-emerald-400" />
    </div>

    <div class="flex-1 min-w-0">
      {#if isEditingTitle}
        <Input
          bind:value={data.title}
          on:blur={() => (isEditingTitle = false)}
          on:keydown={(e) => e.key === "Enter" && (isEditingTitle = false)}
          class="h-8 text-[14px] font-bold text-gray-100 bg-black/40 border-emerald-500/50 px-2 py-1 outline-none w-full transition-all focus-visible:ring-1 focus-visible:ring-emerald-500/50"
          placeholder="Task name..."
        />
      {:else}
        <button
          on:click={editTitle}
          class="group/btn flex items-center gap-2 text-left px-1 py-0.5 rounded hover:bg-white/5 transition-colors w-full"
        >
          <span
            class="text-[16px] font-black text-gray-100 truncate tracking-tight uppercase tracking-[0.1em]"
          >
            {data.title || "Untitled Task"}
          </span>
          <Pencil
            class="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/btn:opacity-100 transition-opacity shrink-0"
          />
        </button>
      {/if}
    </div>
  </div>

  <!-- Description Section -->
  <div class="p-6 flex flex-col gap-3 bg-black/20 flex-1">
    <div class="flex items-center gap-2">
      <ClipboardList class="w-4 h-4 text-emerald-400/50" />
      <span
        class="text-[10px] font-black tracking-[0.3em] text-[#a1a1aa] uppercase"
        >Initial Context</span
      >
    </div>

    <textarea
      bind:value={data.description}
      placeholder="Describe the start state..."
      class="w-full bg-transparent border-none text-gray-400 text-[13px] min-h-[120px] resize-none focus:outline-none transition-colors placeholder:text-gray-700 font-mono leading-relaxed p-0"
    ></textarea>
  </div>

  <!-- Footer Info -->
  <div
    class="px-6 py-4 bg-emerald-500/5 border-t border-white/5 flex items-center justify-between"
  >
    <div class="flex flex-col gap-0.5">
      <span
        class="text-[9px] font-black text-emerald-400 uppercase tracking-widest"
        >Protocol</span
      >
      <span class="text-[11px] font-mono text-gray-500">INIT_BLOCK_01</span>
    </div>
    <div class="w-2 h-2 rounded-full bg-emerald-500/40 animate-pulse"></div>
  </div>

  <!-- Note: No handles needed for seamless sticking, but we can keep one for visual hint if needed -->
  <!-- We'll use invisible handles or just exact coordinates -->
  <Handle type="source" position={Position.Right} class="invisible" />

  <!-- The "Train Connector" Shadow -->
  <div
    class="absolute inset-y-0 right-0 w-[1px] bg-white/10 shadow-[2px_0_10px_rgba(0,0,0,0.5)] z-30"
  ></div>
</div>

<style>
  .task-train-head {
    border-right: none;
  }
</style>
