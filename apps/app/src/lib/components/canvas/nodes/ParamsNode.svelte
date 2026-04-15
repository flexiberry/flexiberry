<script lang="ts">
  import { Handle, Position } from "@xyflow/svelte";
  import { Database, Plus, Trash2, Link } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";

  export let data: any = {
    title: "Params",
    params: [{ key: "name", value: "doggie", type: "literal" }]
  };

  function addParam() {
    data.params = [...data.params, { key: "", value: "", type: "literal" }];
  }

  function removeParam(index: number) {
    data.params = data.params.filter((_: any, i: number) => i !== index);
  }

  function toggleParamType(index: number) {
    data.params[index].type = data.params[index].type === "literal" ? "reference" : "literal";
    if (data.params[index].type === "reference" && !data.params[index].value.startsWith("Step.")) {
        data.params[index].value = "Step.1.";
    }
  }
</script>

<div
  class="w-[320px] bg-[#1a1b1e]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden font-sans flex flex-col relative transition-all duration-300 group hover:border-orange-500/30 subnode-train-block"
>
  <!-- Header -->
  <div class="px-5 py-3 flex items-center gap-3 text-white bg-orange-500/10 border-b border-white/5">
    <div class="w-6 h-6 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
        <Database class="w-3.5 h-3.5 text-orange-400 shrink-0" />
    </div>
    <span class="text-[10px] font-black uppercase tracking-[0.2em] text-orange-200 flex-1">{data.title || 'Parameters'}</span>
    <Plus class="w-3.5 h-3.5 text-orange-400/50 cursor-pointer hover:text-orange-400 transition-colors" on:click={addParam} />
  </div>

  <!-- Content -->
  <div class="p-4 flex flex-col gap-2 bg-black/40">
    {#each data.params as param, i}
      <div class="flex flex-col gap-1.5 bg-black/40 p-2.5 rounded-xl border border-white/5 group/item">
        <div class="flex items-center justify-between">
            <Input bind:value={param.key} placeholder="Key" class="h-6 text-[11px] bg-transparent border-none px-1 w-full font-mono text-orange-200 focus-visible:ring-0" />
            <Button variant="ghost" size="icon" class="h-5 w-5 opacity-0 group-item/hover:opacity-100 group-hover:opacity-100 transition-opacity" on:click={() => removeParam(i)}>
                <Trash2 class="w-3 h-3 text-red-500/50" />
            </Button>
        </div>
        
        <div class="flex items-center gap-2 bg-black/20 rounded-md px-2 py-1 border border-white/5">
            <Input 
                bind:value={param.value} 
                placeholder={param.type === 'literal' ? "Value..." : "Step.1.var"} 
                class="h-6 text-[11px] bg-transparent border-none focus-visible:ring-0 px-0 flex-1 font-mono {param.type === 'reference' ? 'text-blue-400' : 'text-gray-300'}" 
            />
            <Button 
                variant="ghost" 
                size="icon" 
                class="h-5 px-1.5 text-[8px] font-black uppercase rounded {param.type === 'reference' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/10 text-gray-500'}"
                on:click={() => toggleParamType(i)}
            >
                {param.type === 'literal' ? 'VAL' : 'REF'}
            </Button>
        </div>
      </div>
    {/each}

    {#if data.params.length === 0}
        <div class="py-2 text-center">
            <span class="text-[9px] text-gray-600 uppercase tracking-widest">No keys defined</span>
        </div>
    {/if}
  </div>

  <Handle type="target" position={Position.Top} class="invisible" />
  <Handle type="source" position={Position.Bottom} class="invisible" />

  <!-- Shadow system for sticking -->
  <div class="absolute inset-x-0 top-0 h-[1px] bg-white/10 shadow-[0_-2px_10px_rgba(0,0,0,0.5)] z-30"></div>
  <div class="absolute inset-x-0 bottom-0 h-[1px] bg-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.5)] z-30"></div>
  
  <div class="absolute inset-y-0 left-0 w-[4px] bg-orange-500/40"></div>
</div>

<style>
  .subnode-train-block {
    border-top: none;
    border-bottom: none;
    border-left: none;
    border-right: none;
  }
</style>
