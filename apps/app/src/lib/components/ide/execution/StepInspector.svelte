<script lang="ts">
  import {
    CheckCircle2,
    Loader2,
    XCircle,
    MinusCircle,
    PlayCircle
  } from "lucide-svelte";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import type { PlanStep } from "./execution.types";
  import RequestDetailsCard from "./RequestDetailsCard.svelte";
  import ResponseDetailsCard from "./ResponseDetailsCard.svelte";
  import ErrorDetailsAlert from "./ErrorDetailsAlert.svelte";

  export let step: PlanStep | null = null;
</script>

<div class="flex-grow flex flex-col min-h-0 select-text h-full">
  {#if step}
    <ScrollArea class="flex-grow min-h-0">
      <div class="p-4 space-y-4">
        <!-- Inspector Title/Status -->
        <div class="flex items-center justify-between gap-3 border-b border-border/40 pb-2.5 shrink-0 select-none">
          <div class="flex items-center gap-2 overflow-hidden min-w-0">
            {#if step.status === "completed"}
              <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
            {:else if step.status === "running"}
              <Loader2 class="w-4 h-4 animate-spin text-cyan-500 shrink-0" />
            {:else if step.status === "failed"}
              <XCircle class="w-4 h-4 text-rose-500 shrink-0" />
            {:else if step.status === "skipped"}
              <MinusCircle class="w-4 h-4 text-amber-500 shrink-0" />
            {:else}
              <div class="w-4 h-4 rounded-full bg-zinc-600/40 shrink-0"></div>
            {/if}
            <h3 class="text-xs font-black tracking-tight truncate font-mono text-foreground">{step.targetName}</h3>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            {#if step.duration !== undefined}
              <span class="text-[9px] font-mono text-muted-foreground/60">Duration: {step.duration}ms</span>
            {/if}
            <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border 
              {step.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 
               step.status === 'failed' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' : 
               step.status === 'running' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' : 
               'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20'}">
              {step.status}
            </span>
          </div>
        </div>

        <!-- Inspector Sections -->
        <div class="space-y-4">
          <!-- Step Error Details -->
          {#if step.error}
            <ErrorDetailsAlert error={step.error} title="Execution Error Details" size="md" />
          {/if}

          <!-- Request Info -->
          {#if step.request}
            <RequestDetailsCard request={step.request} />
          {/if}

          <!-- Response Info -->
          {#if step.response}
            <ResponseDetailsCard response={step.response} />
          {/if}
        </div>
      </div>
    </ScrollArea>
  {:else}
    <div class="text-muted-foreground/80 italic select-none h-full flex flex-col items-center justify-center p-6 text-[10px] space-y-2">
      <PlayCircle class="w-8 h-8 text-muted-foreground/30" />
      <span>Select a step from the execution checklist to inspect full request/response payloads.</span>
    </div>
  {/if}
</div>
