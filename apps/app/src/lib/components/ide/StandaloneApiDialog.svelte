<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { X, Play, Clock, CheckCircle, AlertTriangle, Key } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let open = false;
  export let loading = false;
  export let placeholders: string[] = [];
  export let declaredVars: Record<string, string> = {};

  export let apiDetails: {
    name: string;
    method: string;
    url: string;
    headers: Record<string, string>;
    body: string;
  } | null = null;

  export let responseDetails: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    duration: number;
    error?: string;
  } | null = null;

  // Local placeholder values editable by the user
  let placeholderValues: Record<string, string> = {};

  // Reset/Initialize values when dialog opens
  $: if (open && placeholders) {
    // Only initialize keys that aren't already set, to avoid wiping edits during re-runs
    const nextValues = { ...placeholderValues };
    for (const p of placeholders) {
      if (nextValues[p] === undefined) {
        nextValues[p] = declaredVars[p] || "";
      }
    }
    placeholderValues = nextValues;
  }

  function handleSend() {
    dispatch("rerun", placeholderValues);
  }

  // XML formatting helper
  function formatXml(xmlStr: string): string {
    let formatted = '';
    const reg = /(>)(<)(\/*)/g;
    xmlStr = xmlStr.replace(reg, '$1\r\n$2$3');
    let pad = 0;
    xmlStr.split('\r\n').forEach((node) => {
      let indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/)) {
        if (pad !== 0) pad -= 1;
      } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }

      let padding = '';
      for (let i = 0; i < pad; i++) {
        padding += '  ';
      }
      formatted += padding + node + '\r\n';
      pad += indent;
    });
    return formatted.trim();
  }

  // Pretty format request body if JSON or XML
  $: formattedRequestBody = (() => {
    if (!apiDetails?.body) return "";
    const trimmed = apiDetails.body.trim();
    if (trimmed.startsWith("<")) {
      try { return formatXml(trimmed); } catch { return trimmed; }
    }
    try {
      const obj = JSON.parse(trimmed);
      return JSON.stringify(obj, null, 2);
    } catch {
      return trimmed;
    }
  })();

  // Pretty format response body if JSON or XML
  $: formattedBody = (() => {
    if (!responseDetails?.body) return "";
    const trimmed = responseDetails.body.trim();
    if (trimmed.startsWith("<")) {
      try {
        return formatXml(trimmed);
      } catch {
        return trimmed;
      }
    }
    try {
      const obj = JSON.parse(trimmed);
      return JSON.stringify(obj, null, 2);
    } catch {
      return trimmed;
    }
  })();

  // Generate Raw Request Text
  $: requestRawText = (() => {
    if (!apiDetails) return "";
    let headersStr = Object.entries(apiDetails.headers)
      .map(([k, v]) => `${k}: ${(v as string).replace(/^['"]|['"]$/g, '')}`)
      .join("\n");
    let bodyStr = apiDetails.body ? `\n\n${formattedRequestBody}` : "";
    return `${apiDetails.method} ${apiDetails.url}\n${headersStr}${bodyStr}`;
  })();

  // Generate Raw Response Text
  $: responseRawText = (() => {
    if (!responseDetails) return "";
    if (responseDetails.error) {
      return `HTTP/1.1 500 Error\nContent-Type: text/plain\n\nError: ${responseDetails.error}`;
    }
    let headersStr = Object.entries(responseDetails.headers)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    let bodyStr = responseDetails.body ? `\n\n${formattedBody}` : "";
    return `HTTP/1.1 ${responseDetails.status} ${responseDetails.statusText}\n${headersStr}${bodyStr}`;
  })();

  // Regex-based raw HTTP syntax highlighter
  function highlightHttpText(text: string): string {
    if (!text) return "";
    
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Highlight JSON keys: e.g. "name":
    escaped = escaped.replace(/("[\w-]+")\s*:/g, '<span class="text-sky-600 dark:text-sky-400 font-bold">$1</span>:');

    // Highlight JSON string values: e.g. "value"
    escaped = escaped.replace(/:\s*(".*?")/g, ': <span class="text-amber-600 dark:text-amber-200">$1</span>');

    // Highlight JSON numbers/booleans: e.g. 123 or true
    escaped = escaped.replace(/:\s*(true|false|null|\d+(?:\.\d+)?)/gi, ': <span class="text-purple-600 dark:text-purple-400 font-bold">$1</span>');

    // Highlight HTTP Methods: GET, POST etc. at start
    escaped = escaped.replace(/^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\b/m, '<span class="text-emerald-600 dark:text-emerald-400 font-black">$1</span>');

    // Highlight HTTP status response: e.g. HTTP/1.1 200 OK
    escaped = escaped.replace(/^(HTTP\/1\.[01])\s+(\d{3})\s+(.+)$/m, (m, p1, p2, p3) => {
      const statusClass = parseInt(p2) >= 200 && parseInt(p2) < 300 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
      return `<span class="text-muted-foreground/60">${p1}</span> <span class="${statusClass} font-black">${p2}</span> <span class="${statusClass} font-bold">${p3}</span>`;
    });

    // Highlight Headers: e.g. Content-Type: application/json
    escaped = escaped.replace(/^([\w-]+)\s*:\s*(.+)$/gm, (m, p1, p2) => {
      if (p1.startsWith('"') || m.startsWith(' ') || m.startsWith('\t')) {
        return m;
      }
      return `<span class="text-orange-600 dark:text-orange-300 font-semibold">${p1}</span>: <span class="text-foreground/80">${p2}</span>`;
    });

    // Highlight XML tags: e.g. &lt;apiResponse&gt;
    escaped = escaped.replace(/(&lt;\/?[a-zA-Z0-9:-]+(?:\s+.*?)*\/?&gt;)/g, '<span class="text-sky-600 dark:text-sky-400">$1</span>');

    return escaped;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="max-w-6xl h-[90vh] bg-popover border-border shadow-2xl rounded-2xl flex flex-col p-0 overflow-hidden">
    <!-- Header -->
    <div class="p-6 border-b border-border/40 shrink-0 flex items-center justify-between bg-card/50">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Play class="w-5 h-5 text-primary" />
        </div>
        <div>
          <Dialog.Title class="text-base font-black tracking-tight uppercase text-foreground">
            Standalone Run: #{apiDetails?.name || "API"}
          </Dialog.Title>
          <Dialog.Description class="text-xs text-muted-foreground font-medium">
            Inspect, customize, and execute the standalone HTTP transaction.
          </Dialog.Description>
        </div>
      </div>
    </div>

    <!-- Body Layout (Adaptive Light/Dark Theme - Unified Single Scroll Area + Side-by-Side Columns) -->
    <div class="flex-grow overflow-y-auto p-6 bg-background select-text">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        <!-- Left: Request Section -->
        <div class="flex flex-col gap-4 min-w-0">
          <div class="flex flex-col gap-2 shrink-0">
            <h3 class="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <span>Request Transaction</span>
              <span class="px-2 py-0.5 rounded text-[9px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">RAW HTTP</span>
            </h3>
            
            <!-- Prominent Endpoint details with embedded Send button -->
            <div class="flex items-center gap-2 bg-muted/40 border border-border/50 rounded-xl p-2 pl-3">
              <span class="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0
                {apiDetails?.method === 'GET' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 
                 apiDetails?.method === 'POST' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20' : 
                 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'}">
                {apiDetails?.method || 'GET'}
              </span>
              <span class="text-xs font-mono font-bold truncate text-foreground flex-grow" title={apiDetails?.url}>
                {apiDetails?.url || ''}
              </span>
              <Button 
                on:click={handleSend} 
                disabled={loading}
                class="h-8 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-md shadow-primary/10 shrink-0"
              >
                <Play class="w-3.5 h-3.5 fill-current" />
                {loading ? 'Running...' : 'Send'}
              </Button>
            </div>
          </div>

          <!-- Embedded Variable Interpolations Prompt -->
          {#if placeholders.length > 0}
            <div class="flex flex-col gap-3 bg-muted/20 border border-border/40 rounded-xl p-4 shrink-0">
              <div class="flex items-center gap-2 border-b border-border/20 pb-2">
                <Key class="w-4 h-4 text-primary" />
                <h4 class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Variables / Placeholders</h4>
              </div>
              <div class="grid grid-cols-3 gap-3 items-center">
                {#each placeholders as p}
                  <span class="text-xs font-mono font-bold text-muted-foreground truncate" title={p}>{p}</span>
                  <div class="col-span-2">
                    <Input
                      bind:value={placeholderValues[p]}
                      placeholder="Value for {p}..."
                      class="h-8 bg-background border-border/60 text-[11px] font-mono focus:ring-primary/20"
                    />
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <pre class="border border-border/40 rounded-xl bg-muted/20 dark:bg-[#181822]/40 p-4 text-[11px] font-mono leading-relaxed text-foreground whitespace-pre-wrap select-text shadow-inner"><code>{@html highlightHttpText(requestRawText)}</code></pre>
        </div>

        <!-- Right: Response Section -->
        <div class="flex flex-col gap-3 min-w-0">
          <div class="flex flex-col gap-2 shrink-0">
            <h3 class="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Response Transaction
            </h3>

            {#if responseDetails && !loading}
              <!-- Prominent Response Status details -->
              <div class="flex items-center justify-between bg-muted/40 border border-border/50 rounded-xl p-3">
                <div class="flex items-center gap-2">
                  {#if responseDetails.error}
                    <AlertTriangle class="w-4 h-4 text-rose-500" />
                    <span class="text-xs font-bold text-rose-600 dark:text-rose-400">FAILED</span>
                    <span class="text-[11px] text-muted-foreground truncate max-w-[200px]" title={responseDetails.error}>{responseDetails.error}</span>
                  {:else}
                    {#if responseDetails.status >= 200 && responseDetails.status < 300}
                      <CheckCircle class="w-4 h-4 text-emerald-500" />
                    {:else}
                      <AlertTriangle class="w-4 h-4 text-rose-500" />
                    {/if}
                    <span class="text-xs font-black font-mono px-2 py-0.5 rounded
                      {responseDetails.status >= 200 && responseDetails.status < 300 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}">
                      {responseDetails.status}
                    </span>
                    <span class="text-xs font-bold {responseDetails.status >= 200 && responseDetails.status < 300 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
                      {responseDetails.statusText || (responseDetails.status >= 200 && responseDetails.status < 300 ? 'OK' : 'Error')}
                    </span>
                  {/if}
                </div>

                {#if !responseDetails.error}
                  <div class="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                    <Clock class="w-3.5 h-3.5" />
                    <span>{responseDetails.duration} ms</span>
                  </div>
                {/if}
              </div>
            {/if}
          </div>

          {#if responseDetails && !loading}
            <pre class="border rounded-xl bg-muted/20 dark:bg-[#181822]/40 p-4 text-[11px] font-mono leading-relaxed text-foreground whitespace-pre-wrap select-text shadow-inner
              {responseDetails.error ? 'border-rose-500/20' : 
               responseDetails.status >= 200 && responseDetails.status < 300 ? 'border-emerald-500/20' : 'border-rose-500/20'}"><code>{@html highlightHttpText(responseRawText)}</code></pre>
          {:else}
            <!-- Loading state -->
            <div class="border border-border/40 rounded-xl bg-muted/10 p-12 flex flex-col items-center justify-center text-muted-foreground/50">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
              <p class="text-xs font-semibold">Executing standalone HTTP request...</p>
            </div>
          {/if}
        </div>

      </div>
    </div>

    <!-- Footer -->
    <div class="p-4 border-t border-border/40 shrink-0 bg-muted/20 flex justify-end">
      <Button variant="outline" on:click={() => (open = false)} class="rounded-lg text-xs font-bold uppercase tracking-wider h-10 px-6">
        Close
      </Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
