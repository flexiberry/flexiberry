<script lang="ts">
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { Input } from "$lib/components/ui/input";
  import { berryCode } from "$lib/writable/berry.store";
  import { 
    Ast, 
    NodeType, 
    type VarDeclarationNode,
    type ProgramNode,
    BerryFormatter
  } from "@flexiberry/berrycore";
  import { 
    Database, 
    Hash, 
    Layers,
    ChevronDown,
    ChevronUp,
    Edit3
  } from "lucide-svelte";
  import { slide } from "svelte/transition";
  import { toast } from "svelte-sonner";

  // ─── State ────────────────────────────────────────────────────────
  let vars: VarDeclarationNode[] = [];
  let fullProgram: ProgramNode | null = null;
  let expandedVar: string | null = null;

  // ─── Extraction Logic ─────────────────────────────────────────────
  $: if ($berryCode) {
    try {
      fullProgram = Ast.parse($berryCode);
      // Filter for variable nodes
      vars = fullProgram.body.filter(n => n.type === NodeType.VarDeclaration) as VarDeclarationNode[];
    } catch (e) {
      // If code is invalid, keep previous list or clear it
    }
  }

  function toggleExpand(id: string) {
    expandedVar = expandedVar === id ? null : id;
  }

  function getVarId(node: VarDeclarationNode): string {
    return node.pointer 
      ? `${node.pointer.symbol}${node.pointer.target}` 
      : node.title || "unnamed";
  }

  // ─── Update Logic ────────────────────────────────────────────────
  async function updateValue(varNode: VarDeclarationNode, key: string, newValue: string) {
    if (!fullProgram) return;

    // 1. Find the entry and update it
    // Note: We use the existing node reference in fullProgram
    const entry = varNode.entries.find(e => e.key === key);
    if (!entry) return;
    
    // Only update if value actually changed
    if (entry.value === newValue) return;

    try {
      // Mutation (AST nodes are usually readonly via types, so cast)
      (entry as any).value = newValue;

      // 2. Format the entire program back to string
      const formatter = new BerryFormatter();
      const updatedCode = formatter.format(fullProgram);

      // 3. Update the store
      $berryCode = updatedCode;
      
      toast.success("Variable Updated", { 
        description: `Set ${key} = "${newValue}" in the source code.` 
      });
    } catch (err: any) {
      toast.error("Update Failed", { description: err.message });
    }
  }

  function handleKeydown(e: KeyboardEvent, varNode: VarDeclarationNode, key: string, value: string) {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  }
</script>

<div class="pointer-events-auto rounded-xl overflow-hidden border bg-card/95 backdrop-blur text-card-foreground shadow-sm flex flex-col relative z-20 h-full">
  <!-- Header -->
  <div class="flex items-center justify-between p-3 border-b border-border/50 bg-muted/20 shrink-0">
    <div class="flex items-center gap-2">
      <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
      <span class="text-xs font-black uppercase tracking-widest flex items-center gap-2">
        Var Stack
        <span class="text-[10px] text-muted-foreground font-bold opacity-50 px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/50">
          {vars.length} declarations
        </span>
      </span>
    </div>
  </div>

  <!-- Variable List -->
  <ScrollArea class="flex-1">
    <div class="p-3 space-y-2">
      {#each vars as v (getVarId(v))}
        {@const varId = getVarId(v)}
        <div class="group border border-border/40 rounded-xl bg-muted/5 hover:bg-muted/10 transition-all duration-300 overflow-hidden">
          <!-- Var Card Header -->
          <div 
            class="p-3 flex items-center justify-between gap-3 cursor-pointer"
            on:click={() => toggleExpand(varId)}
          >
            <div class="flex items-center gap-3 overflow-hidden">
              <div class="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-sm">
                <Database class="w-4 h-4" />
              </div>

              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-1.5 overflow-hidden">
                  {#if v.pointer}
                    <span class="text-xs font-black text-blue-500 tracking-tight font-mono">
                      {v.pointer.symbol}{v.pointer.target}
                    </span>
                  {/if}
                  <span class="text-xs font-black tracking-tight truncate">
                    {v.title || (v.pointer ? "" : "Unnamed Variable")}
                  </span>
                </div>
                <div class="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-medium">
                  {v.entries.length} entries
                  <span class="opacity-30">•</span>
                  <span class="flex items-center gap-1 uppercase tracking-tighter text-[9px] font-black group-hover:text-blue-500 transition-colors">
                    <Edit3 class="w-2.5 h-2.5" />
                    Interactive
                  </span>
                </div>
              </div>
            </div>

            <div class="text-muted-foreground/40">
              {#if expandedVar === varId}
                <ChevronUp class="w-4 h-4" />
              {:else}
                <ChevronDown class="w-4 h-4" />
              {/if}
            </div>
          </div>

          <!-- Expanded Entries Area -->
          {#if expandedVar === varId}
            <div transition:slide={{ duration: 300 }} class="border-t border-border/30 bg-background/40 p-3 pt-4">
              <div class="space-y-3">
                {#each v.entries as entry}
                  <div class="flex flex-col gap-1.5 group/entry relative">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <Hash class="w-3 h-3 text-muted-foreground/40 shrink-0" />
                        <span class="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{entry.key}</span>
                      </div>
                    </div>
                    
                    <div class="relative group">
                      <Input
                        value={entry.value}
                        on:blur={(e) => updateValue(v, entry.key, e.currentTarget.value)}
                        on:keydown={(e) => handleKeydown(e, v, entry.key, e.currentTarget.value)}
                        class="h-9 w-full bg-muted/30 border-border/50 text-[11px] font-mono focus:ring-1 focus:ring-blue-500/30 transition-all rounded-lg pl-3 pr-8"
                      />
                      <Edit3 class="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/20 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/each}

      {#if vars.length === 0}
        <div class="py-20 text-center space-y-4 px-6 border border-dashed border-border/60 rounded-2xl bg-muted/5">
           <div class="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto border border-border/30">
              <Layers class="w-6 h-6 text-muted-foreground/40" />
           </div>
           <div>
              <p class="text-xs font-black uppercase tracking-tighter text-foreground/60 mb-1">No Variables Defined</p>
              <p class="text-[10px] text-muted-foreground font-medium leading-relaxed">
                Define a <code>Var</code> block in your code to edit its value here.
              </p>
           </div>
        </div>
      {/if}
    </div>
  </ScrollArea>
</div>

<style>
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  }
</style>
