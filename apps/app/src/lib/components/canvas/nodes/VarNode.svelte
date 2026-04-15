<script lang="ts">
  import { Handle, Position } from "@xyflow/svelte";
  import { Database, Plus, Trash2, Pencil, X } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";

  export let data: any = {
    env: "@UAT",
    description: "Global variables",
    variables: [
      { key: "name", value: "rintu" },
      { key: "age", value: "10" }
    ]
  };

  let isEditingEnv = false;

  function addVariable() {
    data.variables = [...data.variables, { key: "", value: "" }];
  }

  function removeVariable(index: number) {
    data.variables = data.variables.filter((_: any, i: number) => i !== index);
  }
</script>

<div
  class="w-[300px] bg-[#1a1b1e]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden font-sans flex flex-col relative transition-all duration-300"
>
  <!-- Header -->
  <div class="px-4 py-3 flex items-center gap-3 text-white bg-black/20 border-b border-white/5">
    <Database class="w-4 h-4 text-blue-400 shrink-0" />
    
    <div class="flex-1 min-w-0">
      {#if isEditingEnv}
        <Input
          bind:value={data.env}
          on:blur={() => (isEditingEnv = false)}
          on:keydown={(e) => e.key === "Enter" && (isEditingEnv = false)}
          class="h-7 text-[13px] font-bold text-blue-400 bg-black/40 border-blue-500/50 px-2 py-0.5 outline-none w-full transition-all focus-visible:ring-1 focus-visible:ring-blue-500/50"
          placeholder="@Env..."
        />
      {:else}
        <button
          on:click={() => (isEditingEnv = true)}
          class="group flex items-center gap-1.5 text-left px-1 py-0.5 rounded hover:bg-white/5 transition-colors w-full"
        >
          <span class="text-[13px] font-bold text-blue-400 truncate uppercase tracking-wider">
            {data.env || "@ENV"}
          </span>
          <Pencil class="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>
      {/if}
    </div>

    <Button
      variant="ghost"
      size="icon"
      class="w-6 h-6 hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-colors"
    >
      <X class="w-4 h-4" />
    </Button>
  </div>

  <!-- Content -->
  <div class="p-4 flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <span class="text-[10px] font-bold tracking-widest text-[#a1a1aa] uppercase">Variables</span>
      <Button 
        variant="ghost" 
        size="icon" 
        class="h-6 w-6 rounded-full hover:bg-blue-500/20 text-blue-400"
        on:click={addVariable}
      >
        <Plus class="w-3.5 h-3.5" />
      </Button>
    </div>

    <div class="flex flex-col gap-2">
      {#each data.variables as variable, i}
        <div class="flex items-center gap-2 group">
          <Input 
            bind:value={variable.key}
            placeholder="Key"
            class="h-8 text-xs bg-black/40 border-white/10 text-gray-200 focus-visible:ring-blue-500/50"
          />
          <span class="text-gray-500">:</span>
          <Input 
            bind:value={variable.value}
            placeholder="Value"
            class="h-8 text-xs bg-black/40 border-white/10 text-gray-200 focus-visible:ring-blue-500/50"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            class="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 text-red-400 shrink-0"
            on:click={() => removeVariable(i)}
          >
            <Trash2 class="w-3.5 h-3.5" />
          </Button>
        </div>
      {/each}
    </div>
  </div>

  <!-- Footer decoration -->
  <div class="px-4 py-2 bg-black/20 border-t border-white/5 flex justify-center gap-1">
    <div class="w-1 h-1 rounded-full bg-blue-500/30"></div>
    <div class="w-1 h-1 rounded-full bg-blue-500/30"></div>
    <div class="w-1 h-1 rounded-full bg-blue-500/30"></div>
  </div>
</div>
