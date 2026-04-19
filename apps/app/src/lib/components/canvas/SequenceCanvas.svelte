<script lang="ts">
  import {
    NodeType,
    type TaskBlockNode,
    type StepBlockNode,
    type ProgramNode,
    Ast,
    BerryFormatter,
  } from "@flexiberry/berrycore";
  import TaskBlock from "./sequence/TaskBlock.svelte";
  import StepColumn from "./sequence/StepColumn.svelte";
  import AddStepButton from "./sequence/AddStepButton.svelte";
  import ConnectionLine from "./sequence/ConnectionLine.svelte";
  import AddSequenceButton from "./sequence/AddSequenceButton.svelte";
  import { berryCode } from "$lib/writable/berry.store";
  import { saveFile, type FileContext } from "$lib/writable/File";
  import { onMount, tick, onDestroy } from "svelte";
  import { toast } from "svelte-sonner";

  // ─── Props ────────────────────────────────────────────────────────
  export let ctx: FileContext;
  export let tasks: TaskBlockNode[] = [];

  // ─── Internal State ───────────────────────────────────────────────
  let program: ProgramNode | null = null;
  let isUpdatingInternal = false;
  let hasParseError = false;

  // ─── Code -> UI Sync ──────────────────────────────────────────────
  // When the source code changes (e.g. from the editor), parse it and
  // update the visual tasks array.
  $: if (typeof $berryCode === "string" && !isUpdatingInternal) {
    try {
      const parsed = Ast.parse($berryCode);
      program = parsed;
      hasParseError = false;
      // Extract only Task blocks for the sequence editor
      tasks = parsed.body.filter(
        (n) => n.type === NodeType.TaskBlock,
      ) as TaskBlockNode[];
    } catch (e) {
      hasParseError = true;
      // If code is invalid, and we don't have a program yet, create a skeleton
      if (!program) {
        program = {
          type: NodeType.Program,
          body: [],
          position: { line: 1, column: 1 },
        };
      }
      console.warn(
        "SequenceCanvas: Source code contains syntax errors. Design sync disabled.",
        e,
      );
    }
  }

  // ─── UI -> Code Sync (Manual via Cmd+S) ───────────────────────────
  async function handleKeyDown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      
      // 1. Just-In-Time Parse: Ensure we are patching against the ABSOLUTE latest
      // version of the code in the editor store. This prevents race conditions
      // where recent sidebar edits are lost during canvas sync.
      try {
        const currentSource = $berryCode;
        const freshProgram = Ast.parse(currentSource);
        program = freshProgram;
        hasParseError = false;
        
        // Re-sync visual tasks to the fresh parse to ensure indices match
        tasks = freshProgram.body.filter(
          (n) => n.type === NodeType.TaskBlock,
        ) as TaskBlockNode[];
      } catch (err) {
        hasParseError = true;
        toast.error("Sync Blocked", { 
          description: "Cannot sync design while the source code has syntax errors. Please fix the editor first." 
        });
        return;
      }

      await syncToCode();
      toast.success("File Saved", {
        description: `${ctx.fileName} has been persisted to disk.`,
      });
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleKeyDown);
    }
  });

  async function syncToCode() {
    if (!program || isUpdatingInternal || hasParseError) return;
    isUpdatingInternal = true;

    try {
      // Re-construct the program by updating tasks in their original positions
      // We use the 'program' that was just refreshed in handleKeyDown.
      let taskCounter = 0;
      const newBody = program.body.map(node => {
        if (node.type === NodeType.TaskBlock) {
          const updatedTask = tasks[taskCounter];
          taskCounter++;
          return updatedTask || node;
        }
        return node;
      });

      // Append any "newly added" tasks that weren't in the original body
      while (taskCounter < tasks.length) {
        newBody.push(tasks[taskCounter]);
        taskCounter++;
      }

      const newProgram: ProgramNode = {
        ...program,
        body: newBody,
      };

      const formatter = new BerryFormatter();
      const updatedSource = formatter.format(newProgram);

      // 1. Update the shared source store (Memory)
      $berryCode = updatedSource;

      // 2. Persist to IndexedDB (Disk)
      // We perform this globally to ensure manual/stack edits are also saved.
      const blob = new Blob([updatedSource], { type: "text/plain" });
      await saveFile(ctx, blob);
    } catch (e) {
      console.error("SequenceCanvas: Failed to sync UI changes to code", e);
      toast.error("Save Failed", { description: "An unexpected error occurred during code generation." });
    } finally {
      await tick();
      isUpdatingInternal = false;
    }
  }

  // Pan and Zoom state
  let scale = 0.8;
  let translateX = 100;
  let translateY = 100;
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const zoomSpeed = 0.001;
    const delta = -e.deltaY;
    scale = Math.min(Math.max(scale + delta * zoomSpeed, 0.2), 3);
  }

  function handlePointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    translateX += dx / scale;
    translateY += dy / scale;
    lastX = e.clientX;
    lastY = e.clientY;
  }

  function handlePointerUp(e: PointerEvent) {
    isDragging = false;
  }

  function addStep(taskIdx: number) {
    const task = tasks[taskIdx];
    const newStep: StepBlockNode = {
      type: NodeType.StepBlock,
      position: { line: 0, column: 0 },
      callType: "Call",
      targetType: "Api",
      targetName: `new_step_${task.steps.length + 1}`,
      params: null,
      capture: null,
      check: null,
    };

    // Immutably update the steps array for this task
    tasks[taskIdx] = {
      ...tasks[taskIdx],
      steps: [...tasks[taskIdx].steps, newStep],
    };

    // Re-assign the entire array to ensure Svelte 4/5 detects the deep change
    tasks = [...tasks];
  }

  function addSequence() {
    const newSequence: TaskBlockNode = {
      type: NodeType.TaskBlock,
      position: { line: 0, column: 0 },
      title: `New Sequence ${tasks.length + 1}`,
      steps: [],
    };
    tasks = [...tasks, newSequence];
  }
</script>

<div
  class="w-full h-full bg-background transition-colors duration-500 overflow-hidden relative selection-none touch-none cursor-grab active:cursor-grabbing"
  on:wheel={handleWheel}
  on:pointerdown={handlePointerDown}
  on:pointermove={handlePointerMove}
  on:pointerup={handlePointerUp}
>
  <!-- Background Grid -->
  <div
    class="absolute inset-0 pointer-events-none opacity-20 dark:opacity-[0.08]"
    style="background-image: 
      radial-gradient(circle, hsl(var(--foreground) / 0.15) 1px, transparent 1px);
      background-size: 40px 40px;
      transform: scale({scale}) translate({translateX}px, {translateY}px);
      transform-origin: 0 0;"
  ></div>

  <!-- Content Layer -->
  <div
    class="relative w-full h-full"
    style="transform: scale({scale}) translate({translateX}px, {translateY}px); transform-origin: 0 0;"
  >
    {#each tasks as task, taskIdx (taskIdx)}
      <!-- Vertical Lane Margin -->
      <div class="relative last:mb-0">
        <div class="flex items-start p-5 pt-10">
          <!-- Horizontal Runway Bar (Subtle Track) -->
          <div
            class="absolute top-[40px] left-[80px] h-[100px] border-y border-border/60 dark:border-white/5 bg-card/50 dark:bg-white/[0.02] backdrop-blur-md z-0 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            style="width: calc(200px + {task.steps.length * 380}px + 200px);"
          >
            <div
              class="absolute top-1/2 left-0 w-full h-[1px] bg-border/20 dark:bg-white/[0.02] -translate-y-1/2"
            ></div>
          </div>

          <!-- Start Node -->
          <div class="relative z-10">
            <TaskBlock node={task} on:change={() => (tasks = tasks)} />
            {#if task.steps.length > 0}
              <div
                class="absolute top-[50px] -right-[100px] w-[100px] h-[2px] bg-border/40 flex items-center justify-center"
              >
                <ConnectionLine />
              </div>
            {/if}
          </div>

          <!-- Steps -->
          {#each task.steps as step, i (step.targetName + i)}
            <div class="relative z-10 flex items-start">
              <div class="ml-[100px]">
                <StepColumn {step} on:change={() => (tasks = tasks)} />
              </div>

              {#if i < task.steps.length - 1}
                <div
                  class="absolute top-[50px] -right-[0px] w-[100px] h-[2px] bg-white/10 flex items-center justify-center opacity-30"
                >
                  <ConnectionLine />
                </div>
              {/if}
            </div>
          {/each}

          <!-- Add Step Button for this task -->
          <div class="relative z-10 ml-[100px] pt-[20px]">
            <AddStepButton on:click={() => addStep(taskIdx)} />
          </div>
        </div>
      </div>
    {/each}
    <!-- Global Add Sequence Button (Now correctly inside the panning area) -->
    <div class="p-1 pt-1">
      <AddSequenceButton on:click={addSequence} />
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    overflow: hidden;
  }
</style>
