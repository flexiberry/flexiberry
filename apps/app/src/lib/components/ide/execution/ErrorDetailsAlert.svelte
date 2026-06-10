<script lang="ts">
  import { AlertCircle } from "lucide-svelte";

  export let error: string;
  export let title = "Step Error";
  export let size: "sm" | "md" = "sm";
</script>

{#if size === 'sm'}
  <div class="bg-rose-500/5 rounded-lg border border-rose-500/20 p-2 text-rose-600 dark:text-rose-400 font-mono text-[8px]">
    <div class="font-bold uppercase mb-0.5 text-rose-600 dark:text-rose-500 flex items-center gap-1">
      <AlertCircle class="w-3 h-3 shrink-0" />
      <span>{title}</span>
    </div>
    <div class="break-all whitespace-pre-wrap select-text">{error}</div>
  </div>
{:else}
  <div class="bg-rose-500/5 rounded-xl border border-rose-500/20 p-3.5 text-rose-600 dark:text-rose-400 font-mono text-[10px] space-y-1">
    <div class="font-bold uppercase text-rose-600 dark:text-rose-500 flex items-center gap-1.5 text-[9px]">
      <AlertCircle class="w-3.5 h-3.5 shrink-0" />
      <span>{title}</span>
    </div>
    <div class="break-all whitespace-pre-wrap select-text leading-relaxed">{error}</div>
  </div>
{/if}
