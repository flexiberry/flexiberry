<script lang="ts">
  import { NodeType, type TaskBlockNode, type StepBlockNode } from "@flexiberry/berrycore";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { PlayCircle, Plus } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";

  export let node: TaskBlockNode;
  const dispatch = createEventDispatcher();

  let newStepCallType = "Call";
  let newStepTargetType = "Api";
  let newStepTargetName = "";

  function handleTitleInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    (node as any).title = target.value;
    dispatch("change");
  }

  function addFirstStep() {
    if (!newStepTargetName.trim()) return;
    const newStep: StepBlockNode = {
      type: NodeType.StepBlock,
      position: { line: 0, column: 0 },
      callType: newStepCallType,
      targetType: newStepTargetType,
      targetName: newStepTargetName.trim(),
      params: null,
      capture: null,
      check: null,
    };
    (node as any).steps = [newStep];
    dispatch("change");
    newStepTargetName = "";
  }
</script>

<Dialog.Root>
  <Dialog.Trigger 
    class="text-left h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl group"
    aria-label="Edit Sequence Start: {node?.title || 'Untitled'}"
  >
    <div
      class="w-[200px] h-[100px] border-r border-border flex flex-col items-center justify-center relative group transition-all duration-300 hover:bg-emerald-500/10 cursor-pointer overflow-hidden bg-card dark:bg-emerald-950/20 dark:backdrop-blur-md shadow-sm dark:shadow-[0_0_20px_rgba(16,185,129,0.05)] transition-all"
    >
      <div class="flex flex-col items-center gap-2">
        <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <PlayCircle class="w-2.5 h-2.5 text-emerald-500 dark:text-emerald-400" />
          <span class="text-[8px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.1em]">Start Sequence</span>
        </div>
        <span class="text-foreground text-xs font-semibold tracking-tight px-4 text-center line-clamp-2 leading-tight transition-colors">
          {node?.title || "Untitled Sequence"}
        </span>
      </div>
      
      <!-- Subtle marker -->
      <div class="absolute bottom-2 right-2 w-1.5 h-1.5 bg-emerald-500/20 rounded-full group-hover:bg-emerald-500/40 transition-colors"></div>
    </div>
  </Dialog.Trigger>

  <Dialog.Content class="sm:max-w-[425px] bg-popover border-border text-foreground rounded-2xl shadow-2xl">
    <Dialog.Header>
      <Dialog.Title class="text-xl font-black tracking-tight">Sequence Details</Dialog.Title>
      <Dialog.Description class="text-muted-foreground text-sm mt-1">
        Define the primary name for this task flow.
      </Dialog.Description>
    </Dialog.Header>
    
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-3">
        <!-- Icon Container -->
        <div
          class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner"
        >
          <PlayCircle class="w-6 h-6 text-emerald-500" />
        </div>

        <div class="flex flex-col">
          <h3 class="text-sm font-black text-foreground tracking-tight">
            {node?.title || "Untitled Sequence"}
          </h3>
          <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">
            Start Point
          </p>
        </div>
      </div>

      <div class="space-y-4 pt-2">
        <div class="space-y-2">
          <label for="title" class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Sequence Name</label>
          <Input
            id="title"
            value={node.title ?? ""}
            on:input={handleTitleInput}
            placeholder="e.g. User Signup Flow"
            class="h-10 bg-background border-border text-foreground rounded-lg focus:ring-emerald-500/30"
          />
        </div>

        {#if !node.steps || node.steps.length === 0}
          <div class="space-y-3 pt-3 border-t border-border/40">
            <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Add First Step Details</span>
            
            <div class="grid grid-cols-2 gap-2">
              <div class="space-y-1">
                <label for="stepCallType" class="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block ml-0.5">Process (e.g. Call)</label>
                <Input
                  id="stepCallType"
                  bind:value={newStepCallType}
                  placeholder="Call"
                  class="h-9 bg-background border-border text-foreground rounded-lg focus:ring-emerald-500/30 text-xs font-medium"
                />
              </div>
              <div class="space-y-1">
                <label for="stepTargetType" class="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block ml-0.5">Type (e.g. Api)</label>
                <Input
                  id="stepTargetType"
                  bind:value={newStepTargetType}
                  placeholder="Api"
                  class="h-9 bg-background border-border text-foreground rounded-lg focus:ring-emerald-500/30 text-xs font-medium"
                />
              </div>
            </div>

            <div class="space-y-1">
              <label for="stepTargetName" class="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block ml-0.5">Target Name</label>
              <Input
                id="stepTargetName"
                bind:value={newStepTargetName}
                placeholder="e.g. getUserProfile"
                class="h-9 bg-background border-border text-foreground rounded-lg focus:ring-emerald-500/30 text-xs font-bold"
              />
            </div>

            <Button
              size="sm"
              class="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold h-9 mt-2 flex items-center justify-center gap-1.5"
              on:click={addFirstStep}
              disabled={!newStepTargetName.trim()}
            >
              <Plus class="w-3.5 h-3.5" /> Add First Step
            </Button>
          </div>
        {/if}
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
