<script lang="ts">
  import { Activity } from "lucide-svelte";
  import type { RunLog } from "./execution.types";

  export let logs: RunLog[] = [];
  export let currentTask: string | undefined = undefined;
  export let currentStep: string | undefined = undefined;
  export let status: string;
  export let isFullscreen = false;

  // Helper to scroll logs element automatically
  function autoscroll(node: HTMLElement) {
    const observer = new MutationObserver(() => {
      node.scrollTo({
        top: node.scrollHeight,
        behavior: "smooth"
      });
    });
    observer.observe(node, { childList: true });
    node.scrollTop = node.scrollHeight;

    return {
      destroy() {
        observer.disconnect();
      }
    };
  }
</script>

<div class="shrink-0 flex flex-col min-h-0 bg-black/30 {isFullscreen ? 'w-full md:w-80 lg:w-[26rem] h-auto' : 'w-full h-36'}">
  <!-- Realtime Task Status Box (Only in Floating view) -->
  {#if !isFullscreen && status === "running" && (currentTask || currentStep)}
    <div class="px-4 py-1.5 border-b border-border/50 bg-black/20 text-[9px] space-y-0.5 shrink-0 flex items-center justify-between gap-4">
      <span class="truncate text-zinc-400 flex items-center gap-1.5">
        <Activity class="w-3 h-3 animate-pulse text-cyan-500 shrink-0" />
        {#if currentTask}Task: <span class="font-bold text-zinc-300">{currentTask}</span>{/if}
        {#if currentStep} • Step: <code class="text-cyan-500">{currentStep}</code>{/if}
      </span>
    </div>
  {/if}

  <!-- Logs Terminal content -->
  <div class="flex-grow flex flex-col p-3 min-h-0 min-w-0 h-full">
    <div class="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 shrink-0 select-none">
      Execution Logs Terminal
    </div>
    
    <div 
      class="bg-[#18181b] border border-border/50 font-mono text-[9px] rounded-lg p-2.5 overflow-y-auto overflow-x-hidden flex flex-col gap-1 custom-scrollbar text-zinc-300 selection:bg-primary/20 selection:text-primary flex-1 min-h-0"
      use:autoscroll
    >
      {#each logs as log}
        <div class="flex items-start gap-1.5 leading-relaxed">
          <span class="text-zinc-600 select-none shrink-0 font-light">{log.time}</span>
          <span class="select-text break-all {log.level === 'error' ? 'text-rose-400 font-semibold' : log.level === 'warn' ? 'text-amber-400' : log.level === 'system' ? 'text-emerald-400 font-bold' : 'text-zinc-300'}">
            {log.msg}
          </span>
        </div>
      {:else}
        <div class="text-zinc-500 italic select-none h-full flex items-center justify-center">No logs generated yet.</div>
      {/each}
    </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(16, 185, 129, 0.1);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(16, 185, 129, 0.3);
  }
</style>
