<script lang="ts">
  import { Handle, Position } from "@xyflow/svelte";
  import { Eye, Plus, Trash2, Save } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";

  export let data: any = {
    title: "Capture",
    capture: [{ key: "petId", value: "response.id" }]
  };

  function addCapture() {
    data.capture = [...data.capture, { key: "", value: "response." }];
  }

  function removeCapture(index: number) {
    data.capture = data.capture.filter((_: any, i: number) => i !== index);
  }
</script>

<div
  class="w-[320px] bg-[#1a1b1e]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden font-sans flex flex-col relative transition-all duration-300 group hover:border-emerald-500/30 subnode-train-block"
>
  <!-- Header -->
  <div class="px-5 py-3 flex items-center gap-3 text-white bg-emerald-500/10 border-b border-white/5">
    <div class="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
        <Eye class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
    </div>
    <span class="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200 flex-1">{data.title || 'Extraction'}</span>
    <Plus class="w-3.5 h-3.5 text-emerald-400/50 cursor-pointer hover:text-emerald-400 transition-colors" on:click={addCapture} />
  </div>

  <!-- Content -->
  <div class="p-4 flex flex-col gap-2 bg-black/40">
    {#each data.capture as item, i}
      <div class="flex flex-col gap-2 bg-black/40 p-3 rounded-xl border border-white/5 group/item relative">
        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <Save class="w-3 h-3 text-emerald-500/40" />
                <Input bind:value={item.key} placeholder="Var name..." class="h-6 text-[11px] bg-black/20 border-none px-2 font-mono text-emerald-300 focus-visible:ring-0" />
            </div>
            <div class="flex items-center gap-2">
                <span class="text-[9px] font-bold text-gray-500 uppercase tracking-tighter w-8">From</span>
                <Input bind:value={item.value} placeholder="response.data.id" class="h-6 text-[11px] bg-black/20 border-none px-2 font-mono text-gray-400 focus-visible:ring-0" />
            </div>
        </div>

        <Button variant="ghost" size="icon" class="absolute top-1 right-1 h-6 w-6 opacity-0 group-item/hover:opacity-100 group-hover:opacity-100 transition-opacity" on:click={() => removeCapture(i)}>
            <Trash2 class="w-3.5 h-3.5 text-red-500/50" />
        </Button>
      </div>
    {/each}

    {#if data.capture.length === 0}
        <div class="py-2 text-center">
            <span class="text-[9px] text-gray-600 uppercase tracking-widest">No extractions</span>
        </div>
    {/if}
  </div>

  <Handle type="target" position={Position.Top} class="invisible" />
  <Handle type="source" position={Position.Bottom} class="invisible" />

  <!-- Shadow system for sticking -->
  <div class="absolute inset-x-0 top-0 h-[1px] bg-white/10 shadow-[0_-2px_10px_rgba(0,0,0,0.5)] z-30"></div>
  <div class="absolute inset-x-0 bottom-0 h-[1px] bg-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.5)] z-30"></div>
  
  <div class="absolute inset-y-0 left-0 w-[4px] bg-emerald-500/40"></div>
</div>

<style>
  .subnode-train-block {
    border-top: none;
    border-bottom: none;
    border-left: none;
    border-right: none;
  }
</style>
