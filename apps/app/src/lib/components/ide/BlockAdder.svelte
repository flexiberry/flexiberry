<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Button } from "$lib/components/ui/button";
  import { Plus } from "lucide-svelte";
  import type { BlockType } from "$lib/utils/berryBlocks";

  export let index: number;

  const dispatch = createEventDispatcher();

  function addBlock(type: BlockType) {
    dispatch("add", { index, type });
  }
</script>

<!-- The adder acts as the physical gap (h-8 = 32px) between blocks -->
<div class="relative w-full h-8 z-10 flex items-center justify-center group/adder cursor-pointer">
  <!-- Horizontal Line -->
  <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-primary/40 opacity-0 group-hover/adder:opacity-100 transition-opacity duration-200"></div>
  
  <!-- Buttons Container -->
  <div class="relative flex gap-2 opacity-0 group-hover/adder:opacity-100 transition-opacity duration-200 bg-background px-2 transform scale-95 group-hover/adder:scale-100">
    <Button 
      variant="outline" 
      size="sm" 
      class="h-7 px-3 text-xs font-medium rounded-full bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/30 border-border shadow-sm flex items-center gap-1.5"
      on:click={(e) => { e.stopPropagation(); addBlock('Api'); }}
    >
      <Plus class="w-3.5 h-3.5" /> Api
    </Button>
    <Button 
      variant="outline" 
      size="sm" 
      class="h-7 px-3 text-xs font-medium rounded-full bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/30 border-border shadow-sm flex items-center gap-1.5"
      on:click={(e) => { e.stopPropagation(); addBlock('Var'); }}
    >
      <Plus class="w-3.5 h-3.5" /> Var
    </Button>
    <Button 
      variant="outline" 
      size="sm" 
      class="h-7 px-3 text-xs font-medium rounded-full bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/30 border-border shadow-sm flex items-center gap-1.5"
      on:click={(e) => { e.stopPropagation(); addBlock('Env'); }}
    >
      <Plus class="w-3.5 h-3.5" /> Env
    </Button>
    <Button 
      variant="outline" 
      size="sm" 
      class="h-7 px-3 text-xs font-medium rounded-full bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/30 border-border shadow-sm flex items-center gap-1.5"
      on:click={(e) => { e.stopPropagation(); addBlock('Task'); }}
    >
      <Plus class="w-3.5 h-3.5" /> Task
    </Button>
    <Button 
      variant="outline" 
      size="sm" 
      class="h-7 px-3 text-xs font-medium rounded-full bg-card hover:bg-pink-500/10 hover:text-pink-500 hover:border-pink-500/30 border-border shadow-sm flex items-center gap-1.5"
      on:click={(e) => { e.stopPropagation(); addBlock('Link'); }}
    >
      <Plus class="w-3.5 h-3.5" /> Link
    </Button>
    <Button 
      variant="outline" 
      size="sm" 
      class="h-7 px-3 text-xs font-medium rounded-full bg-card hover:bg-teal-500/10 hover:text-teal-500 hover:border-teal-500/30 border-border shadow-sm flex items-center gap-1.5"
      on:click={(e) => { e.stopPropagation(); addBlock('Input'); }}
    >
      <Plus class="w-3.5 h-3.5" /> Input
    </Button>
  </div>
</div>
