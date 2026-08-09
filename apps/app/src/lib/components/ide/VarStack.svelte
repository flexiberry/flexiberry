<script lang="ts">
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { Input } from "$lib/components/ui/input";
  import { berryCode } from "$lib/writable/berry.store";
  import { 
    Ast, 
    NodeType, 
    type VarDeclarationNode,
    type ProgramNode,
    type KeyValuePairNode,
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
  let varBlocks: VarDeclarationNode[] = [];
  let fullProgram: ProgramNode | null = null;
  let expandedVar: string | null = null;

  // ─── Extraction Logic ─────────────────────────────────────────────
  $: if ($berryCode) {
    try {
      fullProgram = Ast.parse($berryCode);
      // Filter for variable nodes
      varBlocks = fullProgram.body.filter(n => n.type === NodeType.VarDeclaration) as VarDeclarationNode[];
    } catch (e) {
      // If code is invalid, keep previous list or clear it
    }
  }

  function toggleExpand(id: string) {
    expandedVar = expandedVar === id ? null : id;
  }

  function getKeyValueEntries(node: VarDeclarationNode): KeyValuePairNode[] {
    return node.entries.filter((e): e is KeyValuePairNode => e.type === NodeType.KeyValuePair);
  }

  // ─── Update Logic ────────────────────────────────────────────────
  async function updateValue(varNode: VarDeclarationNode, key: string, newValue: string) {
    if (!fullProgram) return;

    // 1. Find the entry and update it
    const entry = varNode.entries.find(e => e.type === NodeType.KeyValuePair && e.key === key) as KeyValuePairNode | undefined;
    if (!entry) return;
    
    // Only update if value actually changed
    if (entry.value === newValue) return;

    try {
      (entry as any).value = newValue;

      // 2. Format the entire program back to string
      const formatter = new BerryFormatter();
      const updatedCode = formatter.format(fullProgram);

      // 3. Update the store
      $berryCode = updatedCode;
    } catch (e) {
      console.error("Failed to update var value AST:", e);
    }
  }

  function handleKeydown(e: KeyboardEvent, varNode: VarDeclarationNode, key: string, value: string) {
    if (e.key === "Enter") {
      updateValue(varNode, key, value);
      (e.target as HTMLElement)?.blur();
    }
  }
</script>

<div class="space-y-4">
  {#if varBlocks.length === 0}
    <div class="p-8 border border-dashed border-border/50 rounded-2xl text-center flex flex-col items-center justify-center gap-3 bg-muted/10">
      <div class="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground/40">
        <Database class="w-5 h-5" />
      </div>
      <div class="flex flex-col gap-1 max-w-[240px]">
        <span class="text-xs font-bold text-foreground">No Variable Blocks</span>
        <span class="text-[11px] text-muted-foreground">Add a Var statement to define re-usable key-value maps and environment pointers.</span>
      </div>
    </div>
  {:else}
    {#each varBlocks as v (v.title || (v.pointer ? v.pointer.target : Math.random().toString()))}
      {@const varId = v.title || (v.pointer ? v.pointer.target : "var")}
      <div class="border border-border/40 bg-card rounded-xl overflow-hidden shadow-sm hover:border-border/80 transition-all duration-200 group">
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
                {getKeyValueEntries(v).length} entries
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

        <!-- Expanded Key-Value Form -->
        {#if expandedVar === varId}
          <div transition:slide={{ duration: 300 }} class="border-t border-border/30 bg-background/40 p-3 pt-4">
            <div class="space-y-3">
              {#each getKeyValueEntries(v) as entry}
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
  {/if}
</div>
