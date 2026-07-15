<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";
  import {
    CheckCircle2,
    Loader2,
    XCircle,
    PlayCircle,
    MinusCircle,
    ChevronDown,
    ChevronRight,
  } from "lucide-svelte";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import type { PlanTask, PlanStep } from "./execution.types";
  import RequestDetailsCard from "./RequestDetailsCard.svelte";
  import ResponseDetailsCard from "./ResponseDetailsCard.svelte";
  import ErrorDetailsAlert from "./ErrorDetailsAlert.svelte";

  export let plan: PlanTask[] = [];
  export let selectedStep: { taskIndex: number; stepIndex: number } | null =
    null;
  export let isFullscreen = false;

  const dispatch = createEventDispatcher();

  // Local state for expanded tasks and steps
  let expandedTasks: Record<string, boolean> = {};
  let expandedSteps: Record<string, boolean> = {};

  function toggleTask(taskIndex: number) {
    const key = `task-${taskIndex}`;
    expandedTasks[key] = expandedTasks[key] === false ? true : false;
    expandedTasks = { ...expandedTasks }; // Trigger reactivity
  }

  function toggleStep(taskIndex: number, stepIndex: number) {
    const key = `step-${taskIndex}-${stepIndex}`;
    expandedSteps[key] = !expandedSteps[key];
    expandedSteps = { ...expandedSteps }; // Trigger reactivity
  }

  function isTaskExpanded(taskIndex: number): boolean {
    const key = `task-${taskIndex}`;
    return expandedTasks[key] !== false;
  }

  function isStepExpanded(taskIndex: number, stepIndex: number): boolean {
    const key = `step-${taskIndex}-${stepIndex}`;
    return !!expandedSteps[key];
  }

  function handleSelectStep(
    taskIndex: number,
    stepIndex: number,
    step: PlanStep,
  ) {
    if (!isFullscreen) {
      dispatch("toggleFullscreen");
    }
    if (step.request || step.response || step.error) {
      dispatch("selectStep", { taskIndex, stepIndex });
    }
  }
</script>

<div
  class="flex flex-col bg-muted/5 shrink-0 {isFullscreen
    ? 'w-full md:w-80 h-full'
    : 'w-full h-full'} overflow-hidden"
>
  <ScrollArea class="flex-grow min-h-0">
    <div class="p-3 space-y-2.5">
      {#each plan as task, ti}
        <div
          class="bg-card/30 border border-border/20 rounded-xl overflow-hidden shadow-sm"
        >
          <!-- Task Header -->
          <button
            type="button"
            class="w-full text-left flex items-center justify-between gap-2 text-xs font-bold p-2.5 hover:bg-muted/30 cursor-pointer select-none transition-colors focus:outline-none"
            on:click={() => toggleTask(ti)}
          >
            <div class="flex items-center gap-2 overflow-hidden min-w-0">
              {#if task.status === "completed"}
                <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {:else if task.status === "running"}
                <Loader2
                  class="w-3.5 h-3.5 animate-spin text-cyan-500 shrink-0"
                />
              {:else if task.status === "failed"}
                <XCircle class="w-3.5 h-3.5 text-rose-500 shrink-0" />
              {:else}
                <PlayCircle
                  class="w-3.5 h-3.5 text-muted-foreground/60 shrink-0"
                />
              {/if}
              <span
                class="truncate {task.status === 'running'
                  ? 'text-cyan-500 font-bold'
                  : task.status === 'completed'
                    ? 'text-zinc-800 dark:text-zinc-200'
                    : 'text-zinc-500 dark:text-zinc-400'}"
              >
                {task.title || `Task ${ti + 1}`}
              </span>
            </div>
            <div
              class="flex items-center gap-1.5 shrink-0 text-muted-foreground"
            >
              <span class="text-[9px] font-mono opacity-60">
                ({task.steps.filter((s) => s.status === "completed")
                  .length}/{task.steps.length})
              </span>
              {#if isTaskExpanded(ti)}
                <ChevronDown class="w-3.5 h-3.5" />
              {:else}
                <ChevronRight class="w-3.5 h-3.5" />
              {/if}
            </div>
          </button>

          <!-- Step List -->
          {#if isTaskExpanded(ti)}
            <div
              transition:slide={{ duration: 150 }}
              class="px-2.5 pb-2.5 border-t border-border/10 bg-muted/5 space-y-2 pt-2"
            >
              {#each task.steps as step, si}
                <div
                  class="bg-muted/40 dark:bg-black/10 border border-border/15 rounded-lg overflow-hidden"
                >
                  <!-- Step Item Row -->
                  <button
                    type="button"
                    class="w-full text-left group flex items-center justify-between text-[11px] font-medium p-2 transition-colors select-none cursor-pointer rounded-lg focus:outline-none
                      {selectedStep?.taskIndex === ti &&
                    selectedStep?.stepIndex === si
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/5'
                      : 'hover:bg-muted/20 border border-transparent'}"
                    on:click={() => handleSelectStep(ti, si, step)}
                  >
                    <div
                      class="flex items-center gap-2 overflow-hidden min-w-0"
                    >
                      {#if step.status === "completed"}
                        <CheckCircle2
                          class="w-3.5 h-3.5 text-emerald-500 shrink-0"
                        />
                      {:else if step.status === "running"}
                        <Loader2
                          class="w-3.5 h-3.5 animate-spin text-cyan-500 shrink-0"
                        />
                      {:else if step.status === "failed"}
                        <XCircle class="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      {:else if step.status === "skipped"}
                        <MinusCircle
                          class="w-3.5 h-3.5 text-amber-500 shrink-0"
                        />
                      {:else}
                        <div
                          class="w-3.5 h-3.5 flex items-center justify-center shrink-0"
                        >
                          <div
                            class="w-1.5 h-1.5 rounded-full bg-zinc-600/40"
                          ></div>
                        </div>
                      {/if}
                      <span
                        class="font-mono truncate {step.status === 'running'
                          ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                          : step.status === 'completed'
                            ? 'text-zinc-700 dark:text-zinc-300'
                            : 'text-muted-foreground/80'}"
                      >
                        {step.targetName}
                      </span>
                    </div>

                    <div class="flex items-center gap-1.5 shrink-0">
                      {#if step.duration !== undefined}
                        <span
                          class="text-[9px] font-mono text-muted-foreground/50"
                          >{step.duration}ms</span
                        >
                      {/if}
                      {#if step.request || step.response || step.error}
                        <div
                          class="text-[9px] text-primary/80 font-bold group-hover:text-primary transition-colors flex items-center gap-0.5 bg-primary/5 px-1 py-0.5 rounded border border-primary/10"
                        >
                          <span>Details</span>
                          {#if isStepExpanded(ti, si)}
                            <ChevronDown class="w-2.5 h-2.5" />
                          {:else}
                            <ChevronRight class="w-2.5 h-2.5" />
                          {/if}
                        </div>
                      {/if}
                    </div>
                  </button>

                  <!-- Step Expandable Details (API / Request / Response / Error) -->
                  {#if isStepExpanded(ti, si) && (step.request || step.response || step.error)}
                    <div
                      transition:slide={{ duration: 150 }}
                      class="p-2 border-t border-border/10 bg-muted/60 dark:bg-black/20 space-y-2 text-[10px]"
                    >
                      <!-- API Request Block -->
                      {#if step.request}
                        <RequestDetailsCard request={step.request} />
                      {/if}

                      <!-- API Response Block -->
                      {#if step.response}
                        <ResponseDetailsCard response={step.response} />
                      {/if}

                      <!-- Step Error -->
                      {#if step.error}
                        <ErrorDetailsAlert
                          error={step.error}
                          title="Step Error"
                          size="sm"
                        />
                      {/if}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        <div
          class="text-[10px] text-muted-foreground/60 italic text-center py-6"
        >
          Planning execution plan...
        </div>
      {/each}
    </div>
  </ScrollArea>
</div>
