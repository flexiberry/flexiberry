<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Description } from "../components/ui/alert-dialog";

  export let onInsert: (template: string) => void;

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

<div class="absolute top-2 left-0 z-[100]">
  <Card.Root class="w-[350px]">
    <Card.Header>
      <Card.Description>API Suggestions</Card.Description>
    </Card.Header>

    <Card.Content>
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
