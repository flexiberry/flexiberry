<script lang="ts">
  import { Handle, Position } from "@xyflow/svelte";
  import { CheckCircle2, Plus, Trash2 } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";

  export let data: any = {
    title: "Assertions",
    checks: [{ left: "$.status", op: "==", right: "201" }]
  };

  const operators = ["==", "!=", ">", "<", "contains", "exists"];

  function addCheck() {
    data.checks = [...data.checks, { left: "", op: "==", right: "" }];
  }

  function removeCheck(index: number) {
    data.checks = data.checks.filter((_: any, i: number) => i !== index);
  }
</script>

<div
  class="w-[320px] bg-[#1a1b1e]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-b-3xl overflow-hidden font-sans flex flex-col relative transition-all duration-300 group hover:border-amber-500/30 subnode-train-block"
>
  <!-- Header -->
  <div class="px-5 py-3 flex items-center gap-3 text-white bg-amber-500/10 border-b border-white/5">
    <div class="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
        <CheckCircle2 class="w-3.5 h-3.5 text-amber-400 shrink-0" />
    </div>
    <span class="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200 flex-1">{data.title || 'Checks'}</span>
    <Plus class="w-3.5 h-3.5 text-amber-400/50 cursor-pointer hover:text-amber-400 transition-colors" on:click={addCheck} />
  </div>

  <!-- Content -->
  <div class="p-4 flex flex-col gap-2 bg-black/40">
    {#each data.checks as check, i}
      <div class="flex flex-col gap-2 bg-black/40 p-3 rounded-xl border border-white/5 group/item relative">
        <div class="flex items-center gap-2">
            <Input bind:value={check.left} placeholder="Operand" class="h-7 text-[11px] bg-black/20 border-none px-2 font-mono text-amber-200 flex-1 focus-visible:ring-0" />
            
            <div class="px-1.5 py-0.5 bg-black/40 rounded border border-white/5">
                <select 
                    bind:value={check.op}
                    class="bg-transparent border-none text-[10px] font-black text-amber-400/80 uppercase cursor-pointer outline-none w-14"
                >
                    {#each operators as op}
                        <option value={op}>{op}</option>
                    {/each}
                </select>
            </div>

            <Input bind:value={check.right} placeholder="Expected" class="h-7 text-[11px] bg-black/20 border-none px-2 font-mono text-gray-300 flex-1 focus-visible:ring-0" />
        </div>
        
        <Button 
            variant="ghost" 
            size="icon" 
            class="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-black border border-white/10 opacity-0 group-item/hover:opacity-100 group-hover:opacity-100 shadow-xl transition-all" 
            on:click={() => removeCheck(i)}
        >
            <Trash2 class="w-3 h-3 text-red-500/50" />
        </Button>
      </div>
    {/each}

    {#if data.checks.length === 0}
        <div class="py-2 text-center">
            <span class="text-[9px] text-gray-600 uppercase tracking-widest">No assertions</span>
        </div>
    {/if}
  </div>

  <Handle type="target" position={Position.Top} class="invisible" />

  <!-- Shadow system for sticking -->
  <div class="absolute inset-x-0 top-0 h-[1px] bg-white/10 shadow-[0_-2px_10px_rgba(0,0,0,0.5)] z-30"></div>
  
  <div class="absolute inset-y-0 left-0 w-[4px] bg-amber-500/40"></div>
</div>

<style>
  .subnode-train-block {
    border-top: none;
    border-left: none;
    border-right: none;
  }
</style>
