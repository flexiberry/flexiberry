<script lang="ts">
  import type { RunInstance } from "./execution.types";
  import ExecutionCard from "./ExecutionCard.svelte";

  export let executions: RunInstance[] = [];
</script>

{#each executions as exec, index (exec.id)}
  {#if !exec.minimized}
    <!-- Fullscreen Backdrop -->
    {#if exec.isFullscreen}
      <div
        class="fixed inset-0 bg-background/60 backdrop-blur-sm z-[65] pointer-events-auto transition-all duration-300"
      ></div>
    {/if}

    <ExecutionCard
      {exec}
      {index}
      on:toggleFullscreen
      on:toggleMinimize
      on:kill
      on:close
      on:submitPrompt
    />
  {/if}
{/each}
