<script lang="ts">
  import { NodeType } from "@flexiberry/berrycore";
  import type { 
    ParamsBlockNode, 
    CaptureBlockNode, 
    CheckBlockNode,
    KeyValuePairNode,
    ConditionNode
  } from "@flexiberry/berrycore";
  import * as Card from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Plus, Trash2, Settings2, Info } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";

  export let node: ParamsBlockNode | CaptureBlockNode | CheckBlockNode | null = null;
  export let title = "Block";
  export let color = "violet";
  
  const dispatch = createEventDispatcher();

  $: isParams = node?.type === NodeType.ParamsBlock;
  $: isCapture = node?.type === NodeType.CaptureBlock;
  $: isCheck = node?.type === NodeType.CheckBlock;

  // Modern Terminology Mapping
  $: displayTitle = 
      isParams ? "Inputs" : 
      isCapture ? "Save Results" : 
      isCheck ? "Assertions" : title;

  // Helper to safely get entries or conditions
  $: entries = (isParams || isCapture) ? (node as ParamsBlockNode | CaptureBlockNode).entries : [];
  $: conditions = isCheck ? (node as CheckBlockNode).conditions : [];

  function addItem() {
    if (!node) return;
    if (isParams || isCapture) {
      const newNode: KeyValuePairNode = {
        type: NodeType.KeyValuePair,
        position: { line: 0, column: 0 },
        key: "name",
        value: "",
        isKeyQuoted: false,
        isValueQuoted: false,
        isMultiline: false
      };
      (node as any).entries = [...(node as any).entries, newNode];
    } else if (isCheck) {
      const newNode: ConditionNode = {
        type: NodeType.Condition,
        position: { line: 0, column: 0 },
        lhs: "",
        operator: "==",
        rhs: "",
        orConditions: []
      };
      (node as any).conditions = [...(node as any).conditions, newNode];
    }
    dispatch("change");
  }

  function removeItem(index: number) {
    if (!node) return;
    if (isParams || isCapture) {
      (node as any).entries = (node as any).entries.filter((_: any, i: number) => i !== index);
    } else if (isCheck) {
      (node as any).conditions = (node as any).conditions.filter((_: any, i: number) => i !== index);
    }
    dispatch("change");
  }

  // Accessibility: Handle space/enter for non-button triggers if needed
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      // Dialog.Trigger handles this automatically if it's a button/trigger
    }
  }
</script>

<Dialog.Root>
  <Dialog.Trigger 
    class="text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-{color}-500 rounded-lg group"
    aria-label="Edit {displayTitle}"
  >
    <Card.Root
      class="w-[280px] min-h-[60px] bg-card dark:bg-white/[0.02] dark:backdrop-blur-md border border-border p-4 relative transition-all duration-300 hover:bg-muted/20 hover:border-{color}-500/30 shadow-md dark:shadow-[0_0_15px_rgba(0,0,0,0.2)] transition-colors"
    >
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-0.5">
          <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] transition-colors">{displayTitle}</span>
          
          <!-- Progressive Disclosure: Summary instead of full list -->
          {#if isParams || isCapture}
             <span class="text-xs text-foreground/70 font-medium transition-colors">
               {entries.length} {entries.length === 1 ? 'item' : 'items'} configured
             </span>
          {:else if isCheck}
             <span class="text-xs text-foreground/70 font-medium transition-colors">
               {conditions.length} {conditions.length === 1 ? 'rule' : 'rules'} defined
             </span>
          {/if}
          
          {#if (!node || (entries.length === 0 && conditions.length === 0))}
            <span class="text-[10px] text-muted-foreground/60 font-medium italic transition-colors">Unconfigured</span>
          {/if}
        </div>
        
        <div class="w-8 h-8 rounded-full bg-{color}-500/10 flex items-center justify-center border border-{color}-500/20 group-hover:scale-110 transition-transform">
           <Info class="w-4 h-4 text-{color}-500 dark:text-{color}-400" />
        </div>
      </div>

      <!-- Subtle connection stem -->
      <div class="absolute -left-[1px] top-0 w-[1px] h-full bg-border/20"></div>
    </Card.Root>
  </Dialog.Trigger>

  <Dialog.Content class="sm:max-w-[600px] bg-popover border-border text-foreground shadow-2xl rounded-2xl">
    <Dialog.Header>
      <div class="flex items-center justify-between pr-6">
        <div>
           <Dialog.Title class="text-xl font-black tracking-tight tracking-[-0.02em]">Edit {displayTitle}</Dialog.Title>
           <Dialog.Description class="text-muted-foreground text-sm mt-1">
             Define the {displayTitle.toLowerCase()} required for this step.
           </Dialog.Description>
        </div>
        <Button size="sm" class="bg-primary hover:bg-primary/90 rounded-full px-4 h-9" on:click={addItem}>
          <Plus class="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>
    </Dialog.Header>

    <div class="flex flex-col gap-3 py-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
      {#if isParams || isCapture}
        {#each entries as entry, i}
          <div class="flex items-center gap-3 bg-muted/30 p-4 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div class="flex-1 space-y-2">
              <label class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Name</label>
              <Input 
                bind:value={entry.key} 
                on:input={() => dispatch("change")}
                placeholder="e.g. user_id"
                class="h-10 bg-background border-border/50 text-violet-500 dark:text-violet-300 font-mono text-sm rounded-lg focus:ring-violet-500/30" 
              />
            </div>
            <div class="flex-1 space-y-2">
               <label class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Value</label>
               <Input 
                 bind:value={entry.value} 
                 on:input={() => dispatch("change")}
                 placeholder="Enter value..."
                 class="h-10 bg-background border-border/50 text-foreground/80 font-mono text-sm rounded-lg focus:ring-violet-500/30" 
               />
            </div>
            <Button variant="ghost" size="icon" class="mt-6 h-10 w-10 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-full" on:click={() => removeItem(i)}>
              <Trash2 class="w-5 h-5" />
            </Button>
          </div>
        {/each}
      {:else if isCheck}
        {#each conditions as cond, i}
          <div class="flex items-center gap-3 bg-muted/30 p-4 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div class="flex-[2] space-y-2">
              <label class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Expression (LHS)</label>
              <Input 
                bind:value={cond.lhs} 
                on:input={() => dispatch("change")}
                placeholder="e.g. response.status"
                class="h-10 bg-background border-border/50 text-amber-600 dark:text-amber-200/80 font-mono text-sm rounded-lg" 
              />
            </div>
            <div class="flex-1 space-y-2">
               <label class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1 text-center">Operator</label>
               <Input 
                 bind:value={cond.operator} 
                 on:input={() => dispatch("change")}
                 class="h-10 bg-background border-border/50 text-center text-foreground/50 font-mono text-sm rounded-lg" 
               />
            </div>
            <div class="flex-[2] space-y-2">
               <label class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Expected (RHS)</label>
               <Input 
                 bind:value={cond.rhs} 
                 on:input={() => dispatch("change")}
                 placeholder="e.g. 200"
                 class="h-10 bg-background border-border/50 text-amber-500 font-mono text-sm rounded-lg" 
               />
            </div>
            <Button variant="ghost" size="icon" class="mt-6 h-10 w-10 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-full" on:click={() => removeItem(i)}>
              <Trash2 class="w-5 h-5" />
            </Button>
          </div>
        {/each}
      {/if}

      {#if (entries.length === 0 && conditions.length === 0)}
        <div class="py-12 text-center border-2 border-dashed border-border rounded-3xl bg-muted/20">
           <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Plus class="w-6 h-6 text-muted-foreground/40" />
           </div>
           <span class="text-sm text-muted-foreground font-medium">Click "Add Item" to define your configuration</span>
        </div>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
</style>
