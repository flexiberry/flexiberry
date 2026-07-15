<script lang="ts">
  import {
    CheckCircle2,
    Loader2,
    XCircle,
    MinusCircle,
    PlayCircle,
    ChevronDown,
    ChevronRight,
  } from "lucide-svelte";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { slide } from "svelte/transition";
  import type { PlanStep } from "./execution.types";
  import RequestDetailsCard from "./RequestDetailsCard.svelte";
  import ResponseDetailsCard from "./ResponseDetailsCard.svelte";
  import ErrorDetailsAlert from "./ErrorDetailsAlert.svelte";

  export let step: PlanStep | null = null;

  let apiDetailsExpanded = false;
  let checksExpanded = true;
  let capturesExpanded = true;

  // Reset expanded states when step changes to keep it clean
  $: if (step) {
    apiDetailsExpanded = false;
    checksExpanded = true;
    capturesExpanded = true;
  }
</script>

<div class="flex-grow flex flex-col min-h-0 select-text h-full">
  {#if step}
    <ScrollArea class="flex-grow min-h-0">
      <div class="p-4 space-y-4">
        <!-- Inspector Title/Status -->
        <div
          class="flex items-center justify-between gap-3 border-b border-border/40 pb-2.5 shrink-0 select-none"
        >
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
            <h3
              class="text-xs font-black tracking-tight truncate font-mono text-foreground"
            >
              {step.targetName}
            </h3>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            {#if step.duration !== undefined}
              <span class="text-[9px] font-mono text-muted-foreground/60"
                >Duration: {step.duration}ms</span
              >
            {/if}
            <span
              class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border
              {step.status === 'completed'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : step.status === 'failed'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  : step.status === 'running'
                    ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                    : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20'}"
            >
              {step.status}
            </span>
          </div>
        </div>

        <!-- Inspector Sections -->
        <div class="space-y-3">
          <!-- Step Error Details -->
          {#if step.error}
            <ErrorDetailsAlert
              error={step.error}
              title="Execution Error Details"
              size="md"
            />
          {/if}

          <!-- API Request & Response Details (Collapsible) -->
          {#if step.request || step.response}
            <div
              class="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm"
            >
              <button
                type="button"
                class="w-full px-3.5 py-2 bg-muted/20 border-b border-border/40 flex items-center justify-between gap-2 select-none hover:bg-muted/30 cursor-pointer transition-colors focus:outline-none"
                on:click={() => (apiDetailsExpanded = !apiDetailsExpanded)}
              >
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span
                    class="text-[9px] font-black uppercase tracking-wider text-muted-foreground"
                    >API Request & Response Details</span
                  >
                </div>
                <div class="text-muted-foreground/60">
                  {#if apiDetailsExpanded}
                    <ChevronDown class="w-3.5 h-3.5" />
                  {:else}
                    <ChevronRight class="w-3.5 h-3.5" />
                  {/if}
                </div>
              </button>

              {#if apiDetailsExpanded}
                <div
                  transition:slide={{ duration: 150 }}
                  class="p-3 space-y-3 bg-muted/5"
                >
                  {#if step.request}
                    <RequestDetailsCard request={step.request} />
                  {/if}
                  {#if step.response}
                    <ResponseDetailsCard response={step.response} />
                  {/if}
                </div>
              {/if}
            </div>
          {/if}

          <!-- Validation Checks (Collapsible) -->
          {#if step.checks && step.checks.length > 0}
            <div
              class="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm"
            >
              <button
                type="button"
                class="w-full px-3.5 py-2 bg-muted/20 border-b border-border/40 flex items-center justify-between gap-2 select-none hover:bg-muted/30 cursor-pointer transition-colors focus:outline-none"
                on:click={() => (checksExpanded = !checksExpanded)}
              >
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span
                    class="text-[9px] font-black uppercase tracking-wider text-muted-foreground"
                    >Validation Checks ({step.checks.filter((c) => c.pass)
                      .length}/{step.checks.length})</span
                  >
                </div>
                <div class="text-muted-foreground/60">
                  {#if checksExpanded}
                    <ChevronDown class="w-3.5 h-3.5" />
                  {:else}
                    <ChevronRight class="w-3.5 h-3.5" />
                  {/if}
                </div>
              </button>

              {#if checksExpanded}
                <div
                  transition:slide={{ duration: 150 }}
                  class="p-3 bg-muted/5 divide-y divide-border/10"
                >
                  {#each step.checks as check}
                    <div
                      class="flex items-start justify-between gap-4 py-2 font-mono text-[10px] last:pb-0 first:pt-0"
                    >
                      <div class="flex items-center gap-2">
                        {#if check.pass}
                          <CheckCircle2
                            class="w-3.5 h-3.5 text-emerald-500 shrink-0"
                          />
                        {:else}
                          <XCircle class="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        {/if}
                        <span
                          class={check.pass
                            ? "text-zinc-300"
                            : "text-rose-400 font-bold"}
                          >{check.expression}</span
                        >
                      </div>
                      <span
                        class="text-muted-foreground/80 select-text break-all text-right font-sans text-[9px]"
                      >
                        Evaluated: <code
                          class="bg-muted px-1 py-0.5 rounded font-mono text-[9px] text-zinc-300"
                          >{check.evaluated}</code
                        >
                      </span>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}

          <!-- Captures Info (Collapsible) -->
          {#if step.captures && Object.keys(step.captures).length > 0}
            <div
              class="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm"
            >
              <button
                type="button"
                class="w-full px-3.5 py-2 bg-muted/20 border-b border-border/40 flex items-center justify-between gap-2 select-none hover:bg-muted/30 cursor-pointer transition-colors focus:outline-none"
                on:click={() => (capturesExpanded = !capturesExpanded)}
              >
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  <span
                    class="text-[9px] font-black uppercase tracking-wider text-muted-foreground"
                    >Captured Variables</span
                  >
                </div>
                <div class="text-muted-foreground/60">
                  {#if capturesExpanded}
                    <ChevronDown class="w-3.5 h-3.5" />
                  {:else}
                    <ChevronRight class="w-3.5 h-3.5" />
                  {/if}
                </div>
              </button>

              {#if capturesExpanded}
                <div
                  transition:slide={{ duration: 150 }}
                  class="p-3 bg-muted/5 divide-y divide-border/10"
                >
                  {#each Object.entries(step.captures) as [key, value]}
                    <div
                      class="flex items-start justify-between gap-4 py-2 font-mono text-[10px] last:pb-0 first:pt-0"
                    >
                      <span class="text-indigo-400 font-bold">{key}</span>
                      <span
                        class="text-zinc-300 select-text break-all text-right"
                      >
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                      </span>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </ScrollArea>
  {:else}
    <div
      class="text-muted-foreground/80 italic select-none h-full flex flex-col items-center justify-center p-6 text-[10px] space-y-2"
    >
      <PlayCircle class="w-8 h-8 text-muted-foreground/30" />
      <span
        >Select a step from the execution checklist to inspect full
        request/response payloads.</span
      >
    </div>
  {/if}
</div>
