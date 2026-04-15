<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { X } from "lucide-svelte";

  export let onInsert: (template: string) => void;
  export let onClose: () => void;

  // Handle escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
    }
  }

  // Add event listener when component mounts
  import { onMount, onDestroy } from "svelte";

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", handleKeydown);
  });

  const suggestions = [
    {
      label: "GET /api/users",
      template: `fetch('/api/users')
  .then(response => response.json())
  .then(data => console.log(data));`,
    },
    {
      label: "POST /api/users",
      template: `fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data)
})
  .then(response => response.json())
  .then(data => console.log(data));`,
    },
  ];
</script>

<div class="absolute top-1 left-0 z-[100]">
  <Card.Root
    class="w-[350px] rounded-lg border bg-card  text-card-foreground shadow-lg relative"
  >
    <Card.Header class="p-3 bg-primary bg-opacity-15">
      <div class="flex justify-between items-center">
        <div>Quick Tool</div>
        <div>
          <button
            class="text-xs bg-primary/10 hover:bg-primary/20 rounded"
            on:click={() => {
              onClose();
            }}
          >
            <X size={14}></X>
          </button>
        </div>
      </div>
    </Card.Header>

    <Card.Content class="p-2">
      <div class="space-y-2">
        {#each suggestions as suggestion}
          <div class="flex items-center justify-between">
            <span class="text-sm">{suggestion.label}</span>
            <button
              class="text-xs bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded"
              on:click={() => onInsert(suggestion.template)}
            >
              Insert
            </button>
          </div>
        {/each}
      </div>
    </Card.Content>
    <Card.Content></Card.Content>
  </Card.Root>
</div>
