<script lang="ts">
  import { PlusCircle } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  import { Button } from "$lib/components/ui/button";

  const dispatch = createEventDispatcher();
</script>

<div class="flex flex-col items-start px-2">
  <Button
    variant="default"
    class="rounded-full shadow-lg h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground group transition-all duration-300 hover:scale-105 active:scale-95 border border-primary/20"
    on:click={() => dispatch("click")}
  >
    <PlusCircle class="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
    <span class="font-bold tracking-tight">Add New Sequence</span>
  </Button>
</div>
