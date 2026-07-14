<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { createEventDispatcher } from "svelte";
  import { Key, PlayCircle } from "lucide-svelte";

  export let open = false;
  export let apiName = "";
  export let placeholders: string[] = [];

  export let declaredVars: Record<string, string> = {};

  const dispatch = createEventDispatcher();
  let values: Record<string, string> = {};

  // Reset values when dialog opens with new placeholders, prefilled with declared variables if available
  $: if (open) {
    values = placeholders.reduce((acc, p) => ({ ...acc, [p]: declaredVars[p] || "" }), {});
  }

  function handleSubmit() {
    dispatch("submit", values);
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-[450px] bg-popover border-border shadow-2xl rounded-2xl">
    <Dialog.Header>
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Key class="w-5 h-5 text-primary" />
        </div>
        <div>
          <Dialog.Title class="text-xl font-black tracking-tight uppercase">Run API: #{apiName}</Dialog.Title>
          <Dialog.Description class="text-sm text-muted-foreground font-medium">
            This API contains dynamic placeholders. Please provide the required values.
          </Dialog.Description>
        </div>
      </div>
    </Dialog.Header>

    <div class="grid gap-6 py-6">
      {#each placeholders as placeholder}
        <div class="space-y-2">
          <label 
            for={placeholder} 
            class="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] block ml-1"
          >
            {placeholder}
          </label>
          <Input
            id={placeholder}
            bind:value={values[placeholder]}
            placeholder="Enter value for {placeholder}..."
            class="h-10 bg-muted/20 border-border/50 text-foreground font-mono text-base focus:ring-primary/20"
          />
        </div>
      {/each}
    </div>

    <Dialog.Footer>
      <Button variant="ghost" on:click={() => (open = false)} class="rounded-lg text-sm font-bold uppercase tracking-wider h-10 px-6">
        Cancel
      </Button>
      <Button on:click={handleSubmit} class="rounded-lg h-10 px-6 bg-primary hover:bg-primary/90 text-sm font-black uppercase tracking-wider shadow-lg shadow-primary/20">
        <PlayCircle class="w-4 h-4 mr-2" />
        Execute API
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
