<script lang="ts">
  import { Card, CardHeader, CardContent } from "$lib/components/ui/card";

  export let response: {
    status?: number;
    headers?: any;
    body?: any;
  };

  function formatBody(body: any): string {
    if (!body) return "";
    if (typeof body === "object") {
      return JSON.stringify(body, null, 2);
    }
    if (typeof body === "string") {
      try {
        const parsed = JSON.parse(body);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return body;
      }
    }
    return String(body);
  }
</script>

<Card class="bg-card/45 border-border/30 overflow-hidden shadow-sm">
  <CardHeader class="bg-muted/40 px-3.5 py-2 border-b border-border/30 flex flex-row items-center justify-between gap-3 space-y-0 select-text">
    <span class="text-[9px] font-black uppercase text-zinc-500 dark:text-zinc-400">Response</span>
    {#if response.status !== undefined}
      <span class="font-mono text-[9px] px-2 py-0.5 rounded font-black border
        {response.status >= 200 && response.status < 300 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 
         response.status >= 300 && response.status < 400 ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' : 
         'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}">
        STATUS: {response.status}
      </span>
    {/if}
  </CardHeader>

  <CardContent class="p-3.5 space-y-3.5 font-mono">
    <!-- Response Headers -->
    {#if response.headers && Object.keys(response.headers).length > 0}
      <div class="space-y-1.5">
        <h4 class="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Headers</h4>
        <div class="grid grid-cols-3 gap-x-3 gap-y-1 text-[10px] bg-muted/50 dark:bg-black/25 p-3 rounded-lg border border-border/15 max-h-40 overflow-y-auto custom-scrollbar select-text">
          {#each Object.entries(response.headers) as [hk, hv]}
            <span class="text-zinc-500 dark:text-zinc-400 font-semibold truncate select-none">{hk}:</span>
            <span class="text-zinc-800 dark:text-zinc-300 col-span-2 break-all select-all">{hv}</span>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Response Body -->
    {#if response.body}
      <div class="space-y-1.5">
        <h4 class="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Body</h4>
        <pre class="bg-muted/50 dark:bg-black/25 p-3 rounded-lg border border-border/15 overflow-x-auto max-h-64 text-[10px] text-zinc-800 dark:text-zinc-300 select-all custom-scrollbar leading-relaxed">{formatBody(response.body)}</pre>
      </div>
    {/if}
  </CardContent>
</Card>

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
