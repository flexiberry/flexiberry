<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import {
    Loader2,
    ChevronUp,
    ChevronDown,
    StopCircle,
    X,
    ArrowRight,
    AlertCircle,
    Maximize2,
    Minimize2,
    Download
  } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { Card, CardHeader } from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import type { RunInstance } from "./execution.types";
  import TaskChecklist from "./TaskChecklist.svelte";
  import StepInspector from "./StepInspector.svelte";
  import LogsTerminal from "./LogsTerminal.svelte";
  import ErrorDetailsAlert from "./ErrorDetailsAlert.svelte";

  export let exec: RunInstance;
  export let index: number;

  const dispatch = createEventDispatcher();

  // Local state per card
  let selectedStep: { taskIndex: number; stepIndex: number } | null = null;
  let showLogs = true;

  function handleToggleMinimize() {
    dispatch("toggleMinimize", { id: exec.id });
  }

  function handleToggleFullscreen() {
    dispatch("toggleFullscreen", { id: exec.id });
  }

  function handleKill() {
    dispatch("kill", { id: exec.id });
  }

  function handleClose() {
    dispatch("close", { id: exec.id });
  }

  function handleSubmitPrompt() {
    dispatch("submitPrompt", { id: exec.id });
  }

  function handleSelectStep(e: CustomEvent<{ taskIndex: number; stepIndex: number }>) {
    selectedStep = e.detail;
  }

  function formatBody(body: any): string {
    if (!body) return "";
    if (typeof body === "object") {
      return JSON.stringify(body, null, 2);
    }
    if (typeof body === "string") {
      try {
        const parsed = JSON.parse(body);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return body;
      }
    }
    return String(body);
  }

  function downloadReport() {
    let report = `# Execution Report: ${exec.fileName}\n\n`;
    report += `## Summary\n`;
    report += `- **Status**: ${exec.status.toUpperCase()}\n`;
    report += `- **File**: ${exec.fileName}\n`;
    report += `- **Duration**: ${exec.elapsedTime}s\n`;
    report += `- **Start Time**: ${new Date(exec.startTime).toLocaleString()}\n`;
    if (exec.endTime) {
      report += `- **End Time**: ${new Date(exec.endTime).toLocaleString()}\n`;
    }
    if (exec.error) {
      report += `- **Error**: ${exec.error}\n`;
    }
    report += `\n`;

    report += `## Execution Plan\n`;
    exec.plan.forEach((task, ti) => {
      const completedCount = task.steps.filter(s => s.status === 'completed').length;
      report += `### Task ${ti + 1}: ${task.title || 'Untitled Task'} (${completedCount}/${task.steps.length} steps)\n`;
      report += `- **Status**: ${task.status.toUpperCase()}\n\n`;
      
      task.steps.forEach((step, si) => {
        report += `#### Step ${ti + 1}.${si + 1}: ${step.targetName}\n`;
        report += `- **Status**: ${step.status.toUpperCase()}\n`;
        if (step.duration !== undefined) {
          report += `- **Duration**: ${step.duration}ms\n`;
        }
        if (step.error) {
          report += `- **Step Error**: ${step.error}\n`;
        }
        
        if (step.request) {
          report += `##### Request\n`;
          report += `\`\`\`http\n`;
          report += `${step.request.method} ${step.request.url}\n`;
          if (step.request.headers && Object.keys(step.request.headers).length > 0) {
            report += `Headers:\n`;
            Object.entries(step.request.headers).forEach(([k, v]) => {
              report += `  ${k}: ${v}\n`;
            });
          }
          if (step.request.body) {
            report += `Body:\n${formatBody(step.request.body)}\n`;
          }
          report += `\`\`\`\n\n`;
        }

        if (step.response) {
          report += `##### Response\n`;
          report += `\`\`\`http\n`;
          report += `Status: ${step.response.status}\n`;
          if (step.response.headers && Object.keys(step.response.headers).length > 0) {
            report += `Headers:\n`;
            Object.entries(step.response.headers).forEach(([k, v]) => {
              report += `  ${k}: ${v}\n`;
            });
          }
          if (step.response.body) {
            report += `Body:\n${formatBody(step.response.body)}\n`;
          }
          report += `\`\`\`\n\n`;
        }
      });
    });

    report += `## Execution Logs\n`;
    report += `\`\`\`\n`;
    exec.logs.forEach(log => {
      report += `[${log.time}] [${log.level.toUpperCase()}] ${log.msg}\n`;
    });
    report += `\`\`\`\n`;

    const blob = new Blob([report], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const cleanFileName = exec.fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute("download", `execution_report_${cleanFileName}_${new Date().getTime()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
</script>

<Card
  class="pointer-events-auto transition-all duration-300 flex flex-col bg-card/95 border-border/50 shadow-2xl rounded-2xl overflow-hidden
    {exec.isFullscreen
      ? 'fixed inset-10 z-[70] w-auto h-auto max-h-none max-w-none'
      : `w-96 max-w-[calc(100vw-2rem)] fixed bottom-20 right-6 z-[60] ${exec.minimized ? 'h-auto' : 'h-[32rem]'}`}"
  style={exec.isFullscreen ? "" : `margin-bottom: ${index * 12}px;`}
>
  <!-- Card Header -->
  <CardHeader
    class="px-4 py-3 bg-muted/40 border-b border-border/50 flex flex-row items-center justify-between gap-3 shrink-0 space-y-0"
  >
    <div class="flex items-center gap-2 overflow-hidden flex-grow min-w-0">
      {#if exec.status === "running"}
        <Loader2 class="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
      {:else}
        <div
          class="shrink-0 w-2 h-2 rounded-full {exec.status === 'completed'
            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
            : exec.status === 'failed'
              ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
              : 'bg-muted-foreground/60'}"
        ></div>
      {/if}
      <span class="text-xs font-black tracking-tight truncate flex-grow min-w-0">{exec.fileName}</span>
      <span class="text-[10px] text-muted-foreground/60 font-mono shrink-0">{exec.elapsedTime}s</span>
    </div>

    <div class="flex items-center gap-1 shrink-0">
      <!-- Download Report Button -->
      {#if exec.status !== "running"}
        <Button
          variant="ghost"
          size="icon"
          class="h-7 w-7 rounded-md text-muted-foreground hover:text-primary transition-colors"
          on:click={downloadReport}
          title="Download Report"
        >
          <Download class="w-3.5 h-3.5" />
        </Button>
      {/if}

      <!-- Fullscreen Toggle Button -->
      <Button
        variant="ghost"
        size="icon"
        class="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground transition-colors"
        on:click={handleToggleFullscreen}
        title={exec.isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      >
        {#if exec.isFullscreen}
          <Minimize2 class="w-3.5 h-3.5" />
        {:else}
          <Maximize2 class="w-3.5 h-3.5" />
        {/if}
      </Button>

      <!-- Minimize Toggle (only when not fullscreen) -->
      {#if !exec.isFullscreen}
        <Button
          variant="ghost"
          size="icon"
          class="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          on:click={handleToggleMinimize}
          title={exec.minimized ? "Expand" : "Collapse"}
        >
          {#if exec.minimized}
            <ChevronUp class="w-3.5 h-3.5" />
          {:else}
            <ChevronDown class="w-3.5 h-3.5" />
          {/if}
        </Button>
      {/if}

      <!-- Stop / Close Button -->
      {#if exec.status === "running"}
        <Button
          variant="ghost"
          size="icon"
          class="h-7 w-7 rounded-md hover:bg-rose-500/10 text-rose-500 transition-colors"
          on:click={handleKill}
          title="Stop Execution"
        >
          <StopCircle class="w-3.5 h-3.5" />
        </Button>
      {:else}
        <Button
          variant="ghost"
          size="icon"
          class="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          on:click={handleClose}
          title="Close"
        >
          <X class="w-3.5 h-3.5" />
        </Button>
      {/if}
    </div>
  </CardHeader>

  <!-- Card Body (Only if expanded) -->
  {#if !exec.minimized}
    <div class="flex-1 min-h-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/50">
      
      <!-- Left Pane: Tasks Checklist Widget -->
      <TaskChecklist
        plan={exec.plan}
        {selectedStep}
        isFullscreen={exec.isFullscreen}
        on:toggleFullscreen={handleToggleFullscreen}
        on:selectStep={handleSelectStep}
      />

      <!-- Right Pane: Step details & Terminal logs -->
      <div class="flex-grow flex flex-col min-h-0 bg-background/20">
        <!-- Right Pane Header -->
        <div class="px-4 py-1.5 bg-muted/15 border-b border-border/50 flex items-center justify-between shrink-0 select-none">
          <div class="flex items-center gap-2">
            <span class="text-[9px] font-black uppercase tracking-wider text-muted-foreground">
              {#if selectedStep}
                Step Inspector
              {:else}
                API Details
              {/if}
            </span>
            {#if selectedStep}
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
            {/if}
          </div>

          <div class="flex items-center gap-1.5">
            <!-- Logs Toggle Button -->
            <Button
              variant="ghost"
              size="xs"
              class="text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 px-2 py-1 h-7 border border-border/20 rounded
                {showLogs
                  ? 'bg-accent text-accent-foreground border-border/60 shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground bg-transparent font-medium border-transparent'}"
              on:click={() => (showLogs = !showLogs)}
            >
              <span>Logs</span>
              <span class="w-1.5 h-1.5 rounded-full {showLogs ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-zinc-500'}"></span>
            </Button>

            <!-- Download Report Button -->
            {#if exec.status !== "running"}
              <Button
                variant="ghost"
                size="xs"
                class="text-[9px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 h-7 px-2 border border-border/20 rounded-md"
                on:click={downloadReport}
              >
                <Download class="w-3 h-3" />
                <span>Download Report</span>
              </Button>
            {/if}

            <!-- Reset View Button -->
            {#if selectedStep}
              <Button
                variant="ghost"
                size="xs"
                class="text-[9px] font-bold text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 h-7 px-2"
                on:click={() => (selectedStep = null)}
              >
                <X class="w-3 h-3" />
                <span>Clear Selection</span>
              </Button>
            {/if}
          </div>
        </div>

        <!-- Right Pane Body: Split panels -->
        <div class="flex-grow flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/50 min-h-0">
          
          <!-- Step Inspector Panel -->
          <StepInspector
            step={selectedStep ? (exec.plan[selectedStep.taskIndex]?.steps[selectedStep.stepIndex] || null) : null}
          />

          <!-- Logs Terminal Panel -->
          {#if showLogs}
            <LogsTerminal
              logs={exec.logs}
              currentTask={exec.currentTask}
              currentStep={exec.currentStep}
              status={exec.status}
              isFullscreen={exec.isFullscreen}
            />
          {/if}
        </div>
      </div>
    </div>

    <!-- Interactive Prompt Input -->
    {#if exec.promptActive}
      <div class="p-3 border-t border-border/50 bg-cyan-500/5 space-y-2 shrink-0">
        <div class="text-[9px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
          <span>Input Required</span>
        </div>
        <div class="text-xs font-bold text-foreground/80 mb-1 leading-relaxed">
          {exec.promptMessage}
        </div>
        <div class="flex gap-2">
          <Input
            type="text"
            bind:value={exec.promptValue}
            on:keydown={(e) => e.key === "Enter" && handleSubmitPrompt()}
            placeholder="Type response and press Enter..."
            class="flex-1 h-8 bg-background border border-border/50 rounded-lg px-2.5 text-xs font-mono text-foreground focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40"
          />
          <Button
            variant="default"
            size="sm"
            class="h-8 w-8 p-0 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center shrink-0"
            on:click={handleSubmitPrompt}
          >
            <ArrowRight class="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    {/if}

    <!-- Error message if failed -->
    {#if exec.status === "failed" && exec.error}
      <div class="m-4 mt-0 shrink-0">
        <ErrorDetailsAlert error={exec.error} title="Execution Error Details" size="md" />
      </div>
    {/if}
  {/if}
</Card>
