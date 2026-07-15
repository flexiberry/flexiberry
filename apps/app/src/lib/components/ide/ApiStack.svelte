<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { berryCode } from "$lib/writable/berry.store";
  import { 
    Ast, 
    NodeType, 
    type ApiBlockNode, 
    BerryCore,
    InterpreterEvent,
    type TaskResult
  } from "@flexiberry/berrycore";
  import { 
    Activity, 
    Play, 
    ChevronDown, 
    ChevronUp, 
    Globe, 
    Lock,
    Key,
    Database,
    Zap,
    Plus
  } from "lucide-svelte";
  import { slide } from "svelte/transition";
  import ApiPromptDialog from "./ApiPromptDialog.svelte";
  import CreateApiDialog from "./CreateApiDialog.svelte";
  import { toast } from "svelte-sonner";

  // ─── State ────────────────────────────────────────────────────────
  let apis: ApiBlockNode[] = [];
  let expandedApi: string | null = null;
  let showCreate = false;
  let executionResults: Record<string, {
    status: number;
    body: any;
    duration: number;
    timestamp: Date;
    error?: string;
  }> = {};

  // Dialog State
  let showPrompt = false;
  let activeApi: ApiBlockNode | null = null;
  let activePlaceholders: string[] = [];

  // ─── Extraction Logic ─────────────────────────────────────────────
  $: if ($berryCode) {
    try {
      const program = Ast.parse($berryCode);
      apis = program.body.filter(n => n.type === NodeType.ApiBlock) as ApiBlockNode[];
    } catch (e) {
      // If code is invalid, keep previous list or clear it
    }
  }

  function toggleExpand(name: string) {
    expandedApi = expandedApi === name ? null : name;
  }

  // ─── Placeholder Detection ────────────────────────────────────────
  function findPlaceholders(api: ApiBlockNode): string[] {
    const placeholders = new Set<string>();
    const regex = /\{\{(\w+(?:\.\w+)*)\}\}/g;
    
    // Check URL
    if (api.url?.value) {
      let match;
      while ((match = regex.exec(api.url.value)) !== null) {
        placeholders.add(match[1]);
      }
    }

    // Check Body
    if (api.body?.content) {
      let match;
      while ((match = regex.exec(api.body.content)) !== null) {
        placeholders.add(match[1]);
      }
    }

    return Array.from(placeholders);
  }

  // ─── Execution Logic ─────────────────────────────────────────────
  async function runApi(api: ApiBlockNode) {
    const placeholders = findPlaceholders(api);
    
    if (placeholders.length > 0) {
      activeApi = api;
      activePlaceholders = placeholders;
      showPrompt = true;
    } else {
      await execute(api, {});
    }
  }

  async function execute(api: ApiBlockNode, variables: Record<string, string>) {
    const start = Date.now();
    
    // Construct a temporary script
    let varBlock = "";
    if (Object.keys(variables).length > 0) {
      varBlock = "Var\n" + Object.entries(variables)
        .map(([k, v]) => `- ${k}: "${v}"`)
        .join("\n") + "\n\n";
    }

    // The full script includes the original code (to get API defs) 
    // + our injected variables + a task to run it.
    // NOTE: In a real implementation, we might want to isolate the API def 
    // but for now, appending to the existing code is the most "integrated" check.
    const tempScript = `${$berryCode}\n\n${varBlock}Task "Quick Run"\n  Step Call Api ${api.name}`;

    try {
      const core = new BerryCore(tempScript);
      const results = await core.run();
      const duration = Date.now() - start;

      // Find the specific step result for our API
      const taskResult = results.find(r => r.title === "Quick Run");
      const stepResult = taskResult?.steps.find(s => s.targetName === api.name);

      if (stepResult) {
        executionResults[api.name] = {
          status: stepResult.response?.status ?? 0,
          body: stepResult.response?.body ?? null,
          duration,
          timestamp: new Date(),
          error: stepResult.error ?? undefined
        };
        
        // Auto-expand on success to show results
        expandedApi = api.name;
        
        if (stepResult.status === 'Pass') {
           toast.success(`API Run Completed: ${api.name}`);
        } else {
           toast.error(`API Failed: ${stepResult.error}`);
        }
      }
    } catch (e: any) {
      toast.error("Execution Error", { description: e.message });
    }
  }

  function handlePromptSubmit(event: CustomEvent<Record<string, string>>) {
    if (activeApi) {
      execute(activeApi, event.detail);
    }
  }

  function handleCreateApi(event: CustomEvent<any>) {
    const { name, method, url, title } = event.detail;
    
    // Check for duplicate name
    if (apis.some(a => a.name === name)) {
      toast.error("Duplicate API", { description: `An API with name #${name} already exists.` });
      return;
    }

    // Generate Berry code
    const newApiCode = `Api ${method} #${name}${title ? ' ' + title : ''}\nUrl ${url}`;
    
    // Append to existing code
    const currentCode = $berryCode.trim();
    const updatedCode = currentCode ? `${currentCode}\n\n${newApiCode}\n` : `${newApiCode}\n`;
    
    $berryCode = updatedCode;
    toast.success("API Added", { description: `#${name} has been added to the source. Press Cmd+S to save.` });
  }

  function getMethodColor(method: string) {
    const colors: Record<string, string> = {
      GET: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      POST: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      PUT: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      DELETE: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      PATCH: "bg-purple-500/10 text-purple-500 border-purple-500/20"
    };
    return colors[method.toUpperCase()] || "bg-muted text-muted-foreground";
  }
</script>

<div class="pointer-events-auto rounded-xl overflow-hidden border bg-card/95 backdrop-blur text-card-foreground shadow-sm flex flex-col relative z-20 h-full">
  <!-- Header -->
  <div class="flex items-center justify-between p-3 border-b border-border/50 bg-muted/20 shrink-0">
    <div class="flex items-center gap-2">
      <div class="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
      <span class="text-xs font-black uppercase tracking-widest flex items-center gap-2">
        API Stack
        <span class="text-[10px] text-muted-foreground font-bold opacity-50 px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/50">
          {apis.length} definitions
        </span>
      </span>
    </div>
    <div class="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        class="text-[10px] uppercase font-bold tracking-wider text-emerald-500 h-7 px-3 hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent hover:border-emerald-500/20"
        on:click={() => (showCreate = true)}
      >
        <Plus class="w-3.5 h-3.5 mr-1" />
        Add API
      </Button>
      <Button
        variant="ghost"
        size="sm"
        class="text-[10px] uppercase font-bold tracking-wider text-muted-foreground h-7 px-3 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border/50"
        on:click={() => (executionResults = {})}
      >Clear Stack</Button>
    </div>
  </div>

  <!-- API List -->
  <ScrollArea class="flex-1">
    <div class="p-3 space-y-2">
      {#each apis as api (api.name)}
        <div class="group border border-border/40 rounded-xl bg-muted/5 hover:bg-muted/10 transition-all duration-300 overflow-hidden">
          <!-- API Card Header -->
          <div class="p-3 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 overflow-hidden">
              <!-- Method Tag -->
              <span class="text-xs font-black px-2 py-0.5 rounded-md border {getMethodColor(api.method || 'GET')} flex shadow-sm min-w-[48px] justify-center tracking-tight">
                {api.method || "GET"}
              </span>

              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-1.5 overflow-hidden">
                  <span class="text-base font-black tracking-tight truncate">#{api.name}</span>
                  {#if api.title}
                    <span class="text-sm text-muted-foreground font-medium truncate opacity-70">
                      • {api.title}
                    </span>
                  {/if}
                </div>
                <div class="flex items-center gap-1 text-sm text-muted-foreground/75 font-mono truncate">
                   <Globe class="w-3.5 h-3.5" />
                   {api.url?.value || "no url"}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                class="h-8 w-8 rounded-lg p-0 hover:bg-primary/10 text-primary transition-colors"
                on:click={() => runApi(api)}
                title="Execute Request"
              >
                <Play class="w-3.5 h-3.5 fill-current" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                class="h-8 w-8 rounded-lg p-0 hover:bg-muted/50 transition-colors"
                on:click={() => toggleExpand(api.name)}
              >
                {#if expandedApi === api.name}
                  <ChevronUp class="w-4 h-4" />
                {:else}
                  <ChevronDown class="w-4 h-4" />
                {/if}
              </Button>
            </div>
          </div>

          <!-- Inline Response Area (Option A) -->
          {#if expandedApi === api.name}
            <div transition:slide={{ duration: 300 }} class="border-t border-border/30 bg-background/50 backdrop-blur-sm relative overflow-hidden">
              {#if executionResults[api.name]}
                {@const result = executionResults[api.name]}
                <div class="p-4 space-y-3">
                  <!-- Meta Header -->
                  <div class="flex items-center justify-between border-b border-border/50 pb-2">
                    <div class="flex items-center gap-4">
                       <div class="flex flex-col">
                         <span class="text-xs font-black text-muted-foreground uppercase tracking-widest">Status</span>
                         <span class="text-lg font-black {result.status < 400 ? 'text-emerald-500' : 'text-rose-500'}">
                           {result.status}
                         </span>
                       </div>
                       <div class="flex flex-col border-l border-border/50 pl-4">
                         <span class="text-xs font-black text-muted-foreground uppercase tracking-widest">Time</span>
                         <span class="text-base font-bold text-foreground/80">{result.duration}ms</span>
                       </div>
                    </div>
                    <span class="text-sm text-muted-foreground/50 font-mono">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  {#if result.error}
                     <div class="p-3 rounded-lg bg-rose-500/5 border border-rose-500/10 text-rose-500 text-xs font-bold">
                       {result.error}
                     </div>
                  {/if}

                  <!-- Response Body -->
                  <div class="space-y-1.5">
                    <span class="text-xs font-black text-muted-foreground uppercase tracking-widest">Response Body</span>
                    <div class="p-3 rounded-xl bg-muted/30 border border-border/40 font-mono text-sm max-h-[200px] overflow-auto custom-scrollbar whitespace-pre-wrap selection-primary">
                      {JSON.stringify(result.body, null, 2)}
                    </div>
                  </div>
                </div>
              {:else}
                <div class="p-8 text-center flex flex-col items-center gap-3 opacity-40">
                  <Activity class="w-8 h-8 text-muted-foreground" />
                  <p class="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">No execution data</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    class="h-7 text-[9px] font-black uppercase tracking-widest rounded-full px-4 border-dashed"
                    on:click={() => runApi(api)}
                  >Run API Now</Button>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}

      {#if apis.length === 0}
        <div class="py-20 text-center space-y-4 px-6 border border-dashed border-border/60 rounded-2xl bg-muted/5">
           <div class="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto border border-border/30">
              <Zap class="w-6 h-6 text-muted-foreground/40" />
           </div>
           <div>
              <p class="text-sm font-black uppercase tracking-tighter text-foreground/60 mb-1">No APIs Detected</p>
              <p class="text-xs text-muted-foreground font-medium leading-relaxed">
                Add an <code>Api</code> block in your .berry code to see it here. Example: 
                <br/><code class="text-primary/70">Api GET #v1 Hello World</code>
              </p>
           </div>
        </div>
      {/if}
    </div>
  </ScrollArea>
</div>

<ApiPromptDialog 
  bind:open={showPrompt} 
  apiName={activeApi?.name || ""} 
  placeholders={activePlaceholders}
  on:submit={handlePromptSubmit}
/>

<CreateApiDialog 
  bind:open={showCreate}
  on:submit={handleCreateApi}
/>

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

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  }
</style>
