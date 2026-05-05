<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { LayoutDashboard, Terminal } from "lucide-svelte";
  import { cn } from "$lib/utils";

  export let mode: "visual" | "assistant" = "visual";
  export let onToggle: (newMode: "visual" | "assistant") => void;
</script>

<div
  class="flex items-center p-1 bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl shadow-primary/5"
>
  <Button
    variant={mode === "visual" ? "secondary" : "ghost"}
    size="sm"
    class={cn(
      "h-9 px-4 rounded-xl flex items-center gap-2 transition-all duration-300",
      mode === "visual" 
        ? "bg-primary/10 text-primary hover:bg-primary/20 shadow-inner" 
        : "text-muted-foreground hover:text-foreground"
    )}
    on:click={() => onToggle("visual")}
  >
    <LayoutDashboard class="w-4 h-4" />
    <span class="text-xs font-semibold">Visual</span>
  </Button>

  <Button
    variant={mode === "assistant" ? "secondary" : "ghost"}
    size="sm"
    class={cn(
      "h-9 px-4 rounded-xl flex items-center gap-2 transition-all duration-300",
      mode === "assistant" 
        ? "bg-primary/10 text-primary hover:bg-primary/20 shadow-inner" 
        : "text-muted-foreground hover:text-foreground"
    )}
    on:click={() => onToggle("assistant")}
  >
    <Terminal class="w-4 h-4" />
    <span class="text-xs font-semibold">Assistant</span>
  </Button>
</div>
