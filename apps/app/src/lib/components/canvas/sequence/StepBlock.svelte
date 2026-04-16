<script lang="ts">
  import { type StepBlockNode } from "@flexiberry/berrycore";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Activity } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";

  export let step: StepBlockNode;
  const dispatch = createEventDispatcher();
</script>

<Dialog.Root>
  <Dialog.Trigger 
    class="text-left h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-xl group"
    aria-label="Edit Step: {step.targetName}"
  >
    <div
      class="w-[280px] h-[100px] border-x border-border flex flex-col items-center justify-center relative transition-all duration-300 hover:bg-violet-500/[0.03] cursor-pointer overflow-hidden p-4 bg-card dark:bg-violet-950/20 dark:backdrop-blur-md transition-all shadow-sm dark:shadow-[0_0_25px_rgba(139,92,246,0.05)]"
    >
      <div class="flex flex-col items-center gap-2 w-full">
        <!-- Action & Type row -->
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20">
            <Activity class="w-2.5 h-2.5 text-violet-500 dark:text-violet-400" />
            <span class="text-[8px] font-black text-violet-500 dark:text-violet-400 uppercase tracking-widest leading-none">
              {step.callType || "PERFORM"}
            </span>
          </div>
          <span class="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] leading-none">
            {step.targetType || "Action"}
          </span>
        </div>

        <!-- Main Title -->
        <span class="text-foreground text-xs font-bold tracking-widest uppercase text-center w-full truncate px-2 opacity-90 transition-colors leading-none">
          {step.targetName}
        </span>
      </div>
      
      <!-- Subtle side markers instead of full borders -->
      <div class="absolute top-0 left-2 w-[1px] h-full bg-border/20 pointer-events-none"></div>
      <div class="absolute top-0 right-2 w-[1px] h-full bg-border/20 pointer-events-none"></div>

      <!-- Progressive Disclosure: Tiny dot to indicate config exists -->
      {#if step.params || step.capture || step.check}
        <div class="absolute top-2 right-2 w-1 h-1 bg-violet-500/40 rounded-full"></div>
      {/if}
    </div>
  </Dialog.Trigger>

  <Dialog.Content class="sm:max-w-[425px] bg-popover border-border text-foreground rounded-2xl shadow-2xl">
    <Dialog.Header>
      <Dialog.Title class="text-xl font-black tracking-tight">Step Configuration</Dialog.Title>
      <Dialog.Description class="text-muted-foreground text-sm mt-1">
        Configure the core details for this action.
      </Dialog.Description>
    </Dialog.Header>
    <div class="grid gap-5 py-6">
      <div class="space-y-2">
        <label for="callType" class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Process (e.g. Call, Run)</label>
        <Input
          id="callType"
          bind:value={step.callType}
          on:input={() => dispatch("change")}
          class="h-10 bg-background border-border text-foreground rounded-lg focus:ring-violet-500/30 font-medium"
        />
      </div>
      <div class="space-y-2">
        <label for="targetType" class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Type (e.g. API, Database)</label>
        <Input
          id="targetType"
          bind:value={step.targetType}
          on:input={() => dispatch("change")}
          class="col-span-3 bg-background border-border text-foreground rounded-lg focus:ring-violet-500/30 font-medium"
        />
      </div>
      <div class="space-y-2">
        <label for="targetName" class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Target Name</label>
        <Input
          id="targetName"
          bind:value={step.targetName}
          on:input={() => dispatch("change")}
          class="col-span-3 bg-background border-border text-foreground rounded-lg focus:ring-violet-500/30 font-black"
        />
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
