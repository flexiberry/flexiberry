<script lang="ts">
  import { Card, CardHeader, CardContent } from "$lib/components/ui/card";

  export let request: {
    method: string;
    url: string;
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
  <CardHeader class="bg-muted/40 px-3.5 py-3 border-b border-border/30 flex flex-row items-center justify-between gap-3 space-y-0 select-text">
    <div class="flex items-center gap-2.5 shrink-0">
      <span class="text-xs font-black uppercase text-zinc-500 dark:text-zinc-400">Request</span>
      <span class="font-mono text-xs px-2.5 py-0.5 rounded font-black 
        {request.method === 'GET' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 
         request.method === 'POST' ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20' : 
         request.method === 'PUT' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' : 
         'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'}">
        {request.method}
      </span>
    </div>
    <span class="font-mono text-sm text-zinc-600 dark:text-zinc-300 break-all select-all flex-grow text-right">{request.url}</span>
  </CardHeader>

  <CardContent class="p-3.5 space-y-3.5 font-mono">
    <!-- Request Headers -->
    {#if request.headers && Object.keys(request.headers).length > 0}
      <div class="space-y-1.5">
        <h4 class="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Headers</h4>
        <div class="grid grid-cols-3 gap-x-3 gap-y-1 text-sm bg-muted/50 dark:bg-black/25 p-3 rounded-lg border border-border/15 max-h-40 overflow-y-auto custom-scrollbar select-text">
          {#each Object.entries(request.headers) as [hk, hv]}
            <span class="text-zinc-500 dark:text-zinc-400 font-semibold truncate select-none">{hk}:</span>
            <span class="text-zinc-800 dark:text-zinc-300 col-span-2 break-all select-all">{hv}</span>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Request Body -->
    {#if request.body}
      <div class="space-y-1.5">
        <h4 class="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Body</h4>
        <pre class="bg-muted/50 dark:bg-black/25 p-3 rounded-lg border border-border/15 overflow-x-auto max-h-48 text-sm text-zinc-800 dark:text-zinc-300 select-all custom-scrollbar leading-relaxed">{formatBody(request.body)}</pre>
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
