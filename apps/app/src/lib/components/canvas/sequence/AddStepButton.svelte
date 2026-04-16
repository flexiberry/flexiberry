<script lang="ts">
  import { Plus } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  import { Button } from "$lib/components/ui/button";

  const dispatch = createEventDispatcher();
</script>

<div class="flex flex-col items-center justify-center gap-4">
  <Button
    variant="outline"
    size="icon"
    class="w-[60px] h-[60px] rounded-full border-2 border-dashed border-border/60 bg-card hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-300 shadow-sm"
    on:click={() => dispatch("click")}
  >
    <Plus class="w-8 h-8 text-muted-foreground/40" />
  </Button>
  
  <span class="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] transition-colors">
    Add Step
  </span>
</div>
