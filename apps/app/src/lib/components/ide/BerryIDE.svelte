<script lang="ts">
  import { getFile, saveFile, type FileContext } from "$lib/writable/File";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import Header from "$lib/ui/shared/Header.svelte";
  import {
    ArrowLeft,
    Code2,
    Save,
    Download,
    Copy,
    Check,
    Plus,
    FileText,
    LayoutList,
    Play,
    ChevronsDown,
    ChevronsUp,
    Database,
    CheckCircle,
    Globe,
    Code,
    List,
    Sparkles,
    X,
    Link2,
    FileSpreadsheet,
  } from "lucide-svelte";
  import BerryBlockComponent from "$lib/components/ide/BerryBlock.svelte";
  import BlockAdder from "$lib/components/ide/BlockAdder.svelte";
  import { berryBlocks } from "$lib/writable/berry.store";
  import {
    parseBerryBlocks,
    stringifyBerryBlocks,
    type BerryBlock,
    type BlockType,
  } from "$lib/utils/berryBlocks";
  import BerryChat from "./BerryChat.svelte";
  import CodeMirror from "svelte-codemirror-editor";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { mode } from "mode-watcher";
  import {
    berryLanguage,
    berryDarkTheme,
    berryLightTheme,
  } from "$lib/utils/berryLanguage";
  import { onDestroy } from "svelte";
  import { scale } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import type { RunInstance } from "./execution/execution.types";
  import ExecutionOverlay from "./execution/ExecutionOverlay.svelte";
  import {
    executions,
    runBerryFile,
    killExecution,
    closeExecution,
    toggleMinimize,
    toggleFullscreen,
    submitPromptInput,
  } from "./execution/executionRunner";

  export let ctx: FileContext;

  let runCountdown = 0;
  let countdownInterval: any = null;

  onDestroy(() => {
    if (countdownInterval) clearInterval(countdownInterval);
    $executions.forEach((exec) => {
      if (exec.timerInterval) clearInterval(exec.timerInterval);
    });
  });

  let isLoading = true;
  let isSaving = false;
  let error = "";
  let copied = false;

  $: extension = ctx.fileName.split(".").pop()?.toLowerCase() ?? "";

  let viewMode: "blocks" | "raw" = "blocks";
  let isChatOpen = false;
  let rawContent = "";
  let hoveredId: string | null = null;

  // Load the .berry file
  $: if (ctx.fileName) loadFile(ctx);

  async function loadFile(fileCtx: FileContext) {
    isLoading = true;
    error = "";
    try {
      const text = await getFile(fileCtx);
      $berryBlocks = parseBerryBlocks(text);
      rawContent = text;
    } catch {
      error = "Failed to load file content.";
    } finally {
      isLoading = false;
    }
  }

  function toggleViewMode() {
    if (viewMode === "blocks") {
      rawContent = stringifyBerryBlocks($berryBlocks);
      viewMode = "raw";
    } else {
      $berryBlocks = parseBerryBlocks(rawContent);
      viewMode = "blocks";
    }
  }

  async function handleSave() {
    if (!ctx.fileName || isSaving) return;
    isSaving = true;
    try {
      if (viewMode === "raw") {
        $berryBlocks = parseBerryBlocks(rawContent);
      }
      const text = stringifyBerryBlocks($berryBlocks);
      const blob = new Blob([text], { type: "text/plain" });
      await saveFile(ctx, blob);
      toast.success("File saved");
    } catch {
      toast.error("Failed to save file");
    } finally {
      isSaving = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
  }

  function copyContent() {
    const text =
      viewMode === "raw" ? rawContent : stringifyBerryBlocks($berryBlocks);
    navigator.clipboard.writeText(text).then(() => {
      copied = true;
      setTimeout(() => (copied = false), 2000);
    });
  }

  function downloadFile() {
    const text = stringifyBerryBlocks($berryBlocks);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ctx.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDeleteBlock(e: CustomEvent<{ id: string }>) {
    $berryBlocks = $berryBlocks.filter((b) => b.id !== e.detail.id);
  }

  function handleRunBlock(e: CustomEvent<{ id: string }>) {
    toast.success(`Block executed! (Mock)`);
  }

  function handleInsertBlock(
    e: CustomEvent<{ index: number; type: BlockType }>,
  ) {
    const { index, type } = e.detail;

    // We no longer provide default text. We start in wizard mode so the user can build it.
    const newBlock: BerryBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: "",
      viewMode: "wizard",
    };

    const newBlocks = [...$berryBlocks];
    newBlocks.splice(index, 0, newBlock);
    $berryBlocks = newBlocks;
  }

  function playClickSound() {
    try {
      const audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const gainNode = audioCtx.createGain();
      gainNode.connect(audioCtx.destination);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.25,
      );

      // Glass chime chord: D5 (587.33Hz), A5 (880.00Hz), D6 (1174.66Hz)
      const freqs = [587.33, 880.0, 1174.66];
      freqs.forEach((freq) => {
        const osc = audioCtx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.connect(gainNode);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      });
    } catch (e) {
      // Ignored if blocked
    }
  }

  function playHoverSound() {
    try {
      const audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(1300, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.012, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.035,
      );

      osc.start();
      osc.stop(audioCtx.currentTime + 0.035);
    } catch (e) {
      // Ignored if blocked
    }
  }

  function playBeepSound(frequency = 700, duration = 0.08) {
    try {
      const audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + duration,
      );

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Ignored if blocked
    }
  }

  function startCountdown() {
    if (runCountdown > 0) return;
    runCountdown = 3;
    playBeepSound(700, 0.08);

    countdownInterval = setInterval(() => {
      runCountdown -= 1;
      if (runCountdown > 0) {
        playBeepSound(700, 0.08);
      } else {
        clearInterval(countdownInterval);
        playClickSound();
        runBerryFile(
          ctx.fileName,
          viewMode === "raw" ? rawContent : stringifyBerryBlocks($berryBlocks),
          ctx.workspaceId,
        );
      }
    }, 100);
  }

  function collapseAll() {
    playClickSound();
    berryBlocks.update((blocks) =>
      blocks.map((b) => ({ ...b, collapsed: true })),
    );
  }

  function expandAll() {
    playClickSound();
    berryBlocks.update((blocks) =>
      blocks.map((b) => ({ ...b, collapsed: false })),
    );
  }

  let activeFilter: BlockType | null = null;

  function toggleFilter(filterType: BlockType) {
    playClickSound();
    if (activeFilter === filterType) {
      activeFilter = null;
    } else {
      activeFilter = filterType;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="file-viewer-root">
  <div class="viewer-bg-pattern" aria-hidden="true"></div>

  <!-- Shared App Header -->
  <div class="fv-header-wrap relative z-10">
    <Header
      mode={isChatOpen ? "assistant" : "visual"}
      onToggle={(newMode) => (isChatOpen = newMode === "assistant")}
    />
  </div>

  <!-- File Topbar (Matching FileViewer) -->
  <div class="file-viewer-topbar">
    <div class="topbar-left">
      <button class="back-btn" on:click={() => goto("/")}>
        <ArrowLeft size={14} />
        <span>Home</span>
      </button>

      <div class="file-breadcrumb">
        <span class="bc-segment bc-dim">{ctx.workspaceId}</span>
        {#if ctx.folderId}
          <span class="bc-sep">/</span>
          <span class="bc-segment bc-dim">{ctx.folderId}</span>
        {/if}
        <span class="bc-sep">/</span>
        <div class="file-title-pill">
          <Code2 size={13} />
          <span class="file-title-text">{ctx.fileName}</span>
          <span class="ext-badge">.{extension}</span>
        </div>
      </div>
    </div>

    <!-- Right: actions -->
    <div class="topbar-right">
      <div
        class="flex items-center border border-border/50 rounded-md overflow-hidden bg-background mr-2 h-7"
      >
        <button
          class="flex items-center gap-1.5 px-3 h-full text-xs font-medium transition-colors {viewMode ===
          'blocks'
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted/50'}"
          on:click={() => viewMode !== "blocks" && toggleViewMode()}
          title="Notebook View"
        >
          <LayoutList size={13} />
          <span>Blocks</span>
        </button>
        <div class="w-[1px] h-4 bg-border/50"></div>
        <button
          class="flex items-center gap-1.5 px-3 h-full text-xs font-medium transition-colors {viewMode ===
          'raw'
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted/50'}"
          on:click={() => viewMode !== "raw" && toggleViewMode()}
          title="Raw Text View"
        >
          <FileText size={13} />
          <span>Raw</span>
        </button>
      </div>

      <button
        class="action-btn action-save"
        class:loading={isSaving}
        on:click={handleSave}
        title="Save (⌘S)"
      >
        <Save size={13} />
        <span>{isSaving ? "Saving…" : "Save"}</span>
      </button>

      <button class="icon-btn" on:click={copyContent} title="Copy content">
        {#if copied}
          <Check size={14} class="text-emerald-400" />
        {:else}
          <Copy size={14} />
        {/if}
      </button>
      <button class="icon-btn" on:click={downloadFile} title="Download file">
        <Download size={14} />
      </button>
    </div>
  </div>

  <!-- Content Area -->
  <div
    class="file-viewer-content flex flex-col relative z-10 overflow-y-auto pt-6"
  >
    {#if isLoading}
      <div class="state-container">
        <div class="loading-spinner"></div>
        <p class="state-text">
          Loading <span class="mono">{ctx.fileName}</span>…
        </p>
      </div>
    {:else if error}
      <div class="state-container">
        <div class="error-icon">⚠</div>
        <p class="state-text state-error">{error}</p>
      </div>
    {:else if viewMode === "blocks"}
      <!-- Floating Left Control Sidebar -->
      {#if $berryBlocks.length > 0}
        <div
          class="fixed left-3 lg:left-auto lg:right-[calc(50vw+464px)] top-1/2 -translate-y-1/2 z-30 flex flex-col items-end gap-2 p-1.5 bg-card/90 dark:bg-[#141b2b]/90 backdrop-blur border border-border/40 dark:border-border/80 rounded-3xl shadow-lg transition-all duration-300"
          aria-label="Notebook Controls"
        >
          <!-- Global actions -->
          <button
            class="group/btn flex flex-row-reverse items-center justify-start gap-0 hover:gap-2 w-9 hover:w-32 h-9 px-2.5 rounded-full transition-all duration-300 shadow-sm active:scale-90 border border-transparent hover:border-primary/20 cursor-pointer overflow-hidden whitespace-nowrap {isChatOpen
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'}"
            on:click={() => {
              playClickSound();
              isChatOpen = !isChatOpen;
            }}
            on:mouseenter={playHoverSound}
            title="Toggle AI Copilot"
          >
            <Sparkles class="w-4 h-4 shrink-0" />
            <span
              class="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"
            >
              AI Copilot
            </span>
          </button>

          <button
            class="group/btn flex flex-row-reverse items-center justify-start gap-0 hover:gap-2 w-9 hover:w-32 h-9 px-2.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-300 shadow-sm active:scale-90 border border-transparent hover:border-primary/20 cursor-pointer overflow-hidden whitespace-nowrap"
            on:click={expandAll}
            on:mouseenter={playHoverSound}
            title="Expand All Blocks"
          >
            <ChevronsDown class="w-4 h-4 shrink-0" />
            <span
              class="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"
            >
              Expand All
            </span>
          </button>

          <button
            class="group/btn flex flex-row-reverse items-center justify-start gap-0 hover:gap-2 w-9 hover:w-32 h-9 px-2.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-300 shadow-sm active:scale-90 border border-transparent hover:border-primary/20 cursor-pointer overflow-hidden whitespace-nowrap"
            on:click={collapseAll}
            on:mouseenter={playHoverSound}
            title="Collapse All Blocks"
          >
            <ChevronsUp class="w-4 h-4 shrink-0" />
            <span
              class="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"
            >
              Collapse All
            </span>
          </button>

          <div class="w-5 h-[1px] bg-border/40 mr-2 my-1"></div>

          <!-- Filters Group -->
          <button
            class="group/btn flex flex-row-reverse items-center justify-start gap-0 hover:gap-2 w-9 hover:w-32 h-9 px-2.5 rounded-full transition-all duration-300 shadow-sm active:scale-90 border border-transparent cursor-pointer overflow-hidden whitespace-nowrap {activeFilter ===
            null
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20'}"
            on:click={() => {
              playClickSound();
              activeFilter = null;
            }}
            on:mouseenter={playHoverSound}
            title="Show All Blocks"
          >
            <List class="w-4 h-4 shrink-0" />
            <span
              class="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"
            >
              View All
            </span>
          </button>
          <button
            class="group/btn flex flex-row-reverse items-center justify-start gap-0 hover:gap-2 w-9 hover:w-32 h-9 px-2.5 rounded-full transition-all duration-300 shadow-sm active:scale-90 border border-transparent cursor-pointer overflow-hidden whitespace-nowrap {activeFilter ===
            'Api'
              ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
              : 'text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20'}"
            on:click={() => toggleFilter("Api")}
            on:mouseenter={playHoverSound}
            title="Filter API Blocks"
          >
            <Database class="w-4 h-4 shrink-0" />
            <span
              class="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"
            >
              Filter API
            </span>
          </button>

          <button
            class="group/btn flex flex-row-reverse items-center justify-start gap-0 hover:gap-2 w-9 hover:w-32 h-9 px-2.5 rounded-full transition-all duration-300 shadow-sm active:scale-90 border border-transparent cursor-pointer overflow-hidden whitespace-nowrap {activeFilter ===
            'Task'
              ? 'bg-green-500/10 text-green-500 border-green-500/30'
              : 'text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20'}"
            on:click={() => toggleFilter("Task")}
            on:mouseenter={playHoverSound}
            title="Filter Task Blocks"
          >
            <CheckCircle class="w-4 h-4 shrink-0" />
            <span
              class="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"
            >
              Filter Tasks
            </span>
          </button>

          <button
            class="group/btn flex flex-row-reverse items-center justify-start gap-0 hover:gap-2 w-9 hover:w-32 h-9 px-2.5 rounded-full transition-all duration-300 shadow-sm active:scale-90 border border-transparent cursor-pointer overflow-hidden whitespace-nowrap {activeFilter ===
            'Env'
              ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
              : 'text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20'}"
            on:click={() => toggleFilter("Env")}
            on:mouseenter={playHoverSound}
            title="Filter Env Blocks"
          >
            <Globe class="w-4 h-4 shrink-0" />
            <span
              class="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"
            >
              Filter Env
            </span>
          </button>

          <button
            class="group/btn flex flex-row-reverse items-center justify-start gap-0 hover:gap-2 w-9 hover:w-32 h-9 px-2.5 rounded-full transition-all duration-300 shadow-sm active:scale-90 border border-transparent cursor-pointer overflow-hidden whitespace-nowrap {activeFilter ===
            'Var'
              ? 'bg-purple-500/10 text-purple-500 border-purple-500/30'
              : 'text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20'}"
            on:click={() => toggleFilter("Var")}
            on:mouseenter={playHoverSound}
            title="Filter Var Blocks"
          >
            <Code class="w-4 h-4 shrink-0" />
            <span
              class="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"
            >
              Filter Var
            </span>
          </button>

          <button
            class="group/btn flex flex-row-reverse items-center justify-start gap-0 hover:gap-2 w-9 hover:w-32 h-9 px-2.5 rounded-full transition-all duration-300 shadow-sm active:scale-90 border border-transparent cursor-pointer overflow-hidden whitespace-nowrap {activeFilter ===
            'Link'
              ? 'bg-pink-500/10 text-pink-500 border-pink-500/30'
              : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'}"
            on:click={() => toggleFilter("Link")}
            on:mouseenter={playHoverSound}
            title="Filter Link Blocks"
          >
            <Link2 class="w-4 h-4 shrink-0" />
            <span
              class="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"
            >
              Filter Links
            </span>
          </button>

          <button
            class="group/btn flex flex-row-reverse items-center justify-start gap-0 hover:gap-2 w-9 hover:w-32 h-9 px-2.5 rounded-full transition-all duration-300 shadow-sm active:scale-90 border border-transparent cursor-pointer overflow-hidden whitespace-nowrap {activeFilter ===
            'Input'
              ? 'bg-teal-500/10 text-teal-500 border-teal-500/30'
              : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'}"
            on:click={() => toggleFilter("Input")}
            on:mouseenter={playHoverSound}
            title="Filter Input Blocks"
          >
            <FileSpreadsheet class="w-4 h-4 shrink-0" />
            <span
              class="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"
            >
              Filter Inputs
            </span>
          </button>
        </div>
      {/if}

      <!-- Floating Right Run Sidebar / Dashboard -->
      {#if $berryBlocks.length > 0}
        <div
          class="fixed right-3 lg:right-auto lg:left-[calc(50vw+464px)] top-1/2 -translate-y-1/2 z-30 w-28 flex flex-col gap-2 p-2 bg-card/95 dark:bg-[#141b2b]/95 backdrop-blur border border-border/40 dark:border-border/80 rounded-2xl shadow-xl transition-all duration-300"
          aria-label="Execution Controller"
        >
          <!-- Run Button -->
          <button
            class="group/btn flex items-center justify-center gap-1.5 w-full h-8 px-2 rounded-lg text-white font-bold uppercase text-[9px] tracking-wider transition-all duration-300 shadow-sm active:scale-95 border border-transparent cursor-pointer
                {runCountdown > 0
              ? 'bg-amber-500 hover:bg-amber-600 animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-700'}"
            on:click={() => {
              if (runCountdown > 0) return;
              startCountdown();
            }}
            on:mouseenter={playHoverSound}
            title={runCountdown > 0
              ? `Launching in ${runCountdown}s...`
              : "Run Notebook File"}
            disabled={runCountdown > 0}
          >
            {#if runCountdown > 0}
              <span class="text-xs font-black">{runCountdown}</span>
              <span>Launching…</span>
            {:else}
              <Play class="w-3 h-3 fill-current shrink-0" />
              <span>Run File</span>
            {/if}
          </button>

          <!-- Executions Grid -->
          {#if $executions.length > 0}
            <div class="w-full h-[1px] bg-border/40 my-0.5"></div>

            <div class="grid grid-cols-4 gap-1.5 w-full justify-items-center">
              {#each $executions as exec, i (exec.id)}
                <button
                  transition:scale={{ duration: 250, start: 0.6 }}
                  class="group relative w-5 h-5 flex items-center justify-center rounded-md border text-[8px] font-black tracking-tighter transition-all duration-200 active:scale-90 cursor-pointer
                      {exec.status === 'running'
                    ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border-blue-500/30'
                    : exec.status === 'completed'
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/20'
                      : exec.status === 'failed'
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/20'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground border-border/40'}"
                  on:click={() => {
                    playClickSound();
                    executions.update((list) => {
                      return list.map((e) =>
                        e.id === exec.id ? { ...e, minimized: false } : e,
                      );
                    });
                  }}
                  on:mouseenter={() => {
                    playHoverSound();
                    hoveredId = exec.id;
                  }}
                  on:mouseleave={() => {
                    hoveredId = null;
                  }}
                >
                  {i + 1}

                  {#if exec.status === "running"}
                    <span
                      class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"
                    ></span>
                  {/if}

                  <!-- Hover Popover Status Card -->
                  <div
                    class="absolute right-[125%] top-1/2 -translate-y-1/2 w-52 p-3 bg-card dark:bg-[#141b2b] border border-border/80 dark:border-border rounded-xl shadow-2xl z-50 pointer-events-none transition-all duration-200 origin-right flex flex-col gap-1.5 text-xs text-foreground font-sans text-left {hoveredId ===
                      exec.id || exec.forceShowPopover
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-95'}"
                  >
                    <!-- Header -->
                    <div
                      class="flex items-center justify-between gap-2 border-b border-border/40 pb-1.5"
                    >
                      <span
                        class="font-black text-[10px] tracking-tight truncate max-w-[120px]"
                        >{exec.fileName}</span
                      >
                      <span
                        class="text-[9px] font-mono text-muted-foreground/60"
                        >{exec.elapsedTime}s</span
                      >
                    </div>

                    <!-- Status Indicator -->
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span
                        class="w-1.5 h-1.5 rounded-full
                          {exec.status === 'completed'
                          ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]'
                          : exec.status === 'failed'
                            ? 'bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]'
                            : exec.status === 'running'
                              ? 'bg-blue-500 animate-pulse'
                              : 'bg-muted-foreground/50'}"
                      ></span>
                      <span
                        class="text-[9px] font-extrabold uppercase tracking-wide
                          {exec.status === 'completed'
                          ? 'text-emerald-500'
                          : exec.status === 'failed'
                            ? 'text-rose-500'
                            : exec.status === 'running'
                              ? 'text-blue-500'
                              : 'text-muted-foreground'}"
                      >
                        {exec.status}
                      </span>
                    </div>

                    <!-- Progress Details -->
                    <div
                      class="text-[10px] text-muted-foreground/80 font-medium flex flex-col gap-1"
                    >
                      {#if exec.totalSteps > 0}
                        <div
                          class="flex justify-between items-center text-[9px] font-bold"
                        >
                          <span>Steps Progress</span>
                          <span>{exec.completedSteps}/{exec.totalSteps}</span>
                        </div>
                        <!-- Mini Progress Bar -->
                        <div
                          class="w-full h-1 bg-muted rounded-full overflow-hidden"
                        >
                          <div
                            class="h-full bg-emerald-500 transition-all duration-300"
                            style="width: {(exec.completedSteps /
                              exec.totalSteps) *
                              100}%"
                          ></div>
                        </div>
                      {:else}
                        <span class="italic text-[9px] text-muted-foreground/50"
                          >Preparing execution...</span
                        >
                      {/if}
                    </div>

                    <!-- Footer Hint -->
                    <div
                      class="border-t border-border/30 pt-1 mt-1 text-[8px] text-muted-foreground/40 font-semibold uppercase tracking-wider text-center"
                    >
                      Click to inspect details
                    </div>
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      <!-- Blocks Container -->
      <div class="w-full max-w-4xl mx-auto pb-32 px-4 flex flex-col">
        {#if activeFilter === null}
          {#each $berryBlocks as block, i (block.id)}
            <BlockAdder index={i} on:add={handleInsertBlock} />
            <BerryBlockComponent
              bind:block
              index={i}
              on:delete={handleDeleteBlock}
              on:run={handleRunBlock}
              allBlocks={$berryBlocks}
              workspaceId={ctx.workspaceId}
              currentFileName={ctx.fileName}
            />
          {/each}

          <!-- Final Adder at the bottom -->
          <BlockAdder index={$berryBlocks.length} on:add={handleInsertBlock} />
        {:else}
          {#each $berryBlocks.filter((b) => b.type === activeFilter) as block, i (block.id)}
            <div class="mb-4">
              <BerryBlockComponent
                bind:block
                index={i}
                on:delete={handleDeleteBlock}
                on:run={handleRunBlock}
                allBlocks={$berryBlocks}
                workspaceId={ctx.workspaceId}
                currentFileName={ctx.fileName}
              />
            </div>
          {/each}

          {#if $berryBlocks.filter((b) => b.type === activeFilter).length === 0}
            <div
              class="text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed border-border mt-8 flex flex-col items-center"
            >
              <Code2 class="w-12 h-12 mb-3 opacity-20" />
              <p class="mb-2">No {activeFilter} blocks found.</p>
              <button
                class="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
                on:click={() => (activeFilter = null)}
              >
                Clear Filter
              </button>
            </div>
          {/if}
        {/if}

        {#if $berryBlocks.length === 0}
          <div
            class="text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed border-border mt-8 flex flex-col items-center"
          >
            <Code2 class="w-12 h-12 mb-3 opacity-20" />
            <p class="mb-2">This file is empty.</p>
            <p class="text-sm mb-6">
              Click a button below to add your first block.
            </p>
            <div class="flex gap-2">
              <button
                class="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md bg-[#282a30] text-gray-200 hover:bg-[#32363e] hover:text-white transition-colors border border-transparent shadow-sm"
                on:click={() =>
                  handleInsertBlock(
                    new CustomEvent("add", {
                      detail: { index: 0, type: "Api" },
                    }),
                  )}
              >
                <Plus class="w-3.5 h-3.5" /> Api
              </button>
              <button
                class="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md bg-[#282a30] text-gray-200 hover:bg-[#32363e] hover:text-white transition-colors border border-transparent shadow-sm"
                on:click={() =>
                  handleInsertBlock(
                    new CustomEvent("add", {
                      detail: { index: 0, type: "Var" },
                    }),
                  )}
              >
                <Plus class="w-3.5 h-3.5" /> Var
              </button>
              <button
                class="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md bg-[#282a30] text-gray-200 hover:bg-[#32363e] hover:text-white transition-colors border border-transparent shadow-sm"
                on:click={() =>
                  handleInsertBlock(
                    new CustomEvent("add", {
                      detail: { index: 0, type: "Env" },
                    }),
                  )}
              >
                <Plus class="w-3.5 h-3.5" /> Env
              </button>
              <button
                class="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md bg-[#282a30] text-gray-200 hover:bg-[#32363e] hover:text-white transition-colors border border-transparent shadow-sm"
                on:click={() =>
                  handleInsertBlock(
                    new CustomEvent("add", {
                      detail: { index: 0, type: "Task" },
                    }),
                  )}
              >
                <Plus class="w-3.5 h-3.5" /> Task
              </button>
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <!-- Raw Text Editor -->
      <div class="w-full h-full pb-16">
        <CodeMirror
          bind:value={rawContent}
          theme={$mode === "dark" ? oneDark : null}
          lang={berryLanguage}
          extensions={[$mode === "dark" ? berryDarkTheme : berryLightTheme]}
          lineWrapping={true}
          styles={{
            "&": {
              height: "100%",
              backgroundColor: "transparent",
              fontSize: "14px",
            },
            ".cm-content": {
              padding: "16px 24px",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            },
            ".cm-gutters": {
              backgroundColor: "transparent",
              borderRight: "1px solid hsl(var(--border)/0.2)",
              color: "hsl(var(--muted-foreground)/0.5)",
            },
            ".cm-activeLine": { backgroundColor: "hsl(var(--muted)/0.3)" },
            ".cm-activeLineGutter": { backgroundColor: "transparent" },
          }}
        />
      </div>
    {/if}
  </div>

  <!-- Sliding AI Sidebar Panel -->
  {#if isChatOpen}
    <div
      class="fixed right-0 top-[3.75rem] bottom-8 w-full sm:w-[380px] z-40 border-l border-border/40 dark:border-border/80 bg-card/95 dark:bg-[#141b2b]/95 backdrop-blur shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-right duration-300"
    >
      <!-- Panel Header -->
      <div
        class="p-4 border-b border-border/40 flex items-center justify-between"
      >
        <div class="flex items-center gap-3 select-none">
          <div
            class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm"
          >
            <Sparkles class="w-4 h-4" />
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold tracking-tight">AI Copilot</span>
              <span
                class="text-[9px] font-black uppercase tracking-tighter bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20"
              >
                Active
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="p-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-all cursor-pointer"
          on:click={() => {
            playClickSound();
            isChatOpen = false;
          }}
        >
          <X class="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      <!-- Panel Body -->
      <div class="flex-grow overflow-hidden p-4">
        <BerryChat />
      </div>
    </div>
  {/if}

  <!-- Floating Execution Overlay Component -->
  <ExecutionOverlay
    executions={$executions}
    on:toggleMinimize={(e) => toggleMinimize(e.detail.id)}
    on:toggleFullscreen={(e) => toggleFullscreen(e.detail.id)}
    on:kill={(e) => killExecution(e.detail.id)}
    on:close={(e) => closeExecution(e.detail.id)}
    on:submitPrompt={(e) => {
      const exec = $executions.find((ex) => ex.id === e.detail.id);
      if (exec) {
        if (!exec.promptValue.trim()) {
          toast.error("Please enter a value.");
          return;
        }
        submitPromptInput(e.detail.id, exec.promptValue);
      }
    }}
  />
</div>

<style>
  /* ─── Root ─────────────────────────────────────────────── */
  .file-viewer-root {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: hsl(var(--background));
    color: hsl(var(--foreground));
    font-family: inherit;
    overflow: hidden;
  }

  .viewer-bg-pattern {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background-image: radial-gradient(
      hsl(var(--muted-foreground) / 0.08) 1px,
      transparent 1px
    );
    background-size: 14px 14px;
  }

  /* ─── App Header wrapper ───────────────────────────────── */
  .fv-header-wrap {
    flex-shrink: 0;
    padding: 0.5rem 0.5rem 0;
    background: transparent;
  }

  /* ─── File Topbar ──────────────────────────────────────── */
  .file-viewer-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.45rem 1rem;
    border-bottom: 1px solid hsl(var(--border) / 0.5);
    background: transparent;
    flex-shrink: 0;
    gap: 0.5rem;
  }

  .topbar-left,
  .topbar-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* Back button */
  .back-btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
    border: 1px solid hsl(var(--border) / 0.6);
    background: transparent;
    color: hsl(var(--muted-foreground));
    font-size: 0.7rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .back-btn:hover {
    background: hsl(var(--muted) / 0.5);
    color: hsl(var(--foreground));
  }

  /* ─── Breadcrumb ───────────────────────────────────────── */
  .file-breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.68rem;
  }
  .bc-segment {
    font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
    max-width: 8rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .bc-dim {
    color: hsl(var(--muted-foreground) / 0.55);
  }
  .bc-sep {
    color: hsl(var(--muted-foreground) / 0.3);
    font-size: 0.75rem;
  }

  /* File title pill */
  .file-title-pill {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.2rem 0.55rem;
    border-radius: 6px;
    background: hsl(var(--primary) / 0.08);
    border: 1px solid hsl(var(--primary) / 0.2);
    color: hsl(var(--foreground));
    font-size: 0.72rem;
  }
  .file-title-text {
    font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
    font-weight: 500;
    max-width: 18rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ext-badge {
    font-size: 0.6rem;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    background: hsl(var(--primary) / 0.15);
    color: hsl(var(--primary));
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  /* Icon button */
  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 1px solid hsl(var(--border) / 0.5);
    background: transparent;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }
  .icon-btn:hover {
    background: hsl(var(--muted) / 0.5);
    color: hsl(var(--foreground));
  }

  /* Action buttons (Edit / Save) */
  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.65rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }
  .action-save {
    background: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
  }
  .action-save:hover:not(.loading) {
    opacity: 0.9;
  }
  .action-save.loading {
    opacity: 0.65;
    cursor: wait;
  }

  /* ─── Content ──────────────────────────────────────────── */
  .file-viewer-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
  }

  /* Loading / empty / error states */
  .state-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 1rem;
    color: hsl(var(--muted-foreground));
  }
  .state-text {
    font-size: 0.85rem;
  }
  .state-error {
    color: hsl(var(--destructive));
  }
  .mono {
    font-family: ui-monospace, monospace;
  }
  .error-icon {
    font-size: 2rem;
    color: hsl(var(--destructive));
  }

  /* Spinner */
  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid hsl(var(--border));
    border-top-color: hsl(var(--primary));
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .editor-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
