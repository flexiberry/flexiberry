<script lang="ts">
  import { getFile, saveFile, type FileContext } from "$lib/writable/File";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import Header from "$lib/ui/shared/Header.svelte";
  import { ArrowLeft, Code2, Save, Download, Copy, Check, Plus, FileText, LayoutList } from "lucide-svelte";
  import BerryBlockComponent from "$lib/components/ide/BerryBlock.svelte";
  import BlockAdder from "$lib/components/ide/BlockAdder.svelte";
  import { berryBlocks } from "$lib/writable/berry.store";
  import { parseBerryBlocks, stringifyBerryBlocks, type BerryBlock, type BlockType } from "$lib/utils/berryBlocks";
  import BerryChat from "./BerryChat.svelte";
  import CodeMirror from "svelte-codemirror-editor";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { mode } from "mode-watcher";

  export let ctx: FileContext;

  let isLoading = true;
  let isSaving = false;
  let error = "";
  let copied = false;

  $: extension = ctx.fileName.split(".").pop()?.toLowerCase() ?? "";

  let viewMode: 'blocks' | 'raw' = 'blocks';
  let rawContent = '';

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
    if (viewMode === 'blocks') {
      rawContent = stringifyBerryBlocks($berryBlocks);
      viewMode = 'raw';
    } else {
      $berryBlocks = parseBerryBlocks(rawContent);
      viewMode = 'blocks';
    }
  }

  async function handleSave() {
    if (!ctx.fileName || isSaving) return;
    isSaving = true;
    try {
      if (viewMode === 'raw') {
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
    const text = viewMode === 'raw' ? rawContent : stringifyBerryBlocks($berryBlocks);
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
    $berryBlocks = $berryBlocks.filter(b => b.id !== e.detail.id);
  }

  function handleRunBlock(e: CustomEvent<{ id: string }>) {
    toast.success(`Block executed! (Mock)`);
  }

  function handleInsertBlock(e: CustomEvent<{ index: number, type: BlockType }>) {
    const { index, type } = e.detail;

    // We no longer provide default text. We start in wizard mode so the user can build it.
    const newBlock: BerryBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: "",
      viewMode: 'wizard'
    };

    const newBlocks = [...$berryBlocks];
    newBlocks.splice(index, 0, newBlock);
    $berryBlocks = newBlocks;
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="file-viewer-root">
  <div class="viewer-bg-pattern" aria-hidden="true"></div>

  <!-- Shared App Header -->
  <div class="fv-header-wrap relative z-10">
    <Header />
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
      <div class="flex items-center border border-border/50 rounded-md overflow-hidden bg-background mr-2 h-7">
        <button 
          class="flex items-center gap-1.5 px-3 h-full text-xs font-medium transition-colors {viewMode === 'blocks' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'}"
          on:click={() => viewMode !== 'blocks' && toggleViewMode()}
          title="Notebook View"
        >
          <LayoutList size={13} />
          <span>Blocks</span>
        </button>
        <div class="w-[1px] h-4 bg-border/50"></div>
        <button 
          class="flex items-center gap-1.5 px-3 h-full text-xs font-medium transition-colors {viewMode === 'raw' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'}"
          on:click={() => viewMode !== 'raw' && toggleViewMode()}
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
  <div class="file-viewer-content flex flex-col relative z-10 overflow-y-auto pt-6">
    {#if isLoading}
      <div class="state-container">
        <div class="loading-spinner"></div>
        <p class="state-text">Loading <span class="mono">{ctx.fileName}</span>…</p>
      </div>
    {:else if error}
      <div class="state-container">
        <div class="error-icon">⚠</div>
        <p class="state-text state-error">{error}</p>
      </div>
    {:else}
      {#if viewMode === 'blocks'}
        <!-- Blocks Container -->
        <div class="w-full max-w-4xl mx-auto pb-16 px-4 flex flex-col">
          {#each $berryBlocks as block, i (block.id)}
            <BlockAdder index={i} on:add={handleInsertBlock} />
            <BerryBlockComponent 
              bind:block={block} 
              index={i} 
              on:delete={handleDeleteBlock}
              on:run={handleRunBlock}
            />
          {/each}
          
          <!-- Final Adder at the bottom -->
          <BlockAdder index={$berryBlocks.length} on:add={handleInsertBlock} />
          
          {#if $berryBlocks.length === 0}
            <div class="text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed border-border mt-8 flex flex-col items-center">
              <Code2 class="w-12 h-12 mb-3 opacity-20" />
              <p class="mb-2">This file is empty.</p>
              <p class="text-sm mb-6">Click a button below to add your first block.</p>
              <div class="flex gap-2">
                <button 
                  class="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md bg-[#282a30] text-gray-200 hover:bg-[#32363e] hover:text-white transition-colors border border-transparent shadow-sm"
                  on:click={() => handleInsertBlock(new CustomEvent('add', { detail: { index: 0, type: 'Api' } }))}
                >
                  <Plus class="w-3.5 h-3.5" /> Api
                </button>
                <button 
                  class="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md bg-[#282a30] text-gray-200 hover:bg-[#32363e] hover:text-white transition-colors border border-transparent shadow-sm"
                  on:click={() => handleInsertBlock(new CustomEvent('add', { detail: { index: 0, type: 'Var' } }))}
                >
                  <Plus class="w-3.5 h-3.5" /> Var
                </button>
                <button 
                  class="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md bg-[#282a30] text-gray-200 hover:bg-[#32363e] hover:text-white transition-colors border border-transparent shadow-sm"
                  on:click={() => handleInsertBlock(new CustomEvent('add', { detail: { index: 0, type: 'Env' } }))}
                >
                  <Plus class="w-3.5 h-3.5" /> Env
                </button>
                <button 
                  class="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md bg-[#282a30] text-gray-200 hover:bg-[#32363e] hover:text-white transition-colors border border-transparent shadow-sm"
                  on:click={() => handleInsertBlock(new CustomEvent('add', { detail: { index: 0, type: 'Task' } }))}
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
            lineWrapping={true}
            styles={{
              "&": { height: "100%", backgroundColor: "transparent", fontSize: "14px" },
              ".cm-content": { padding: "16px 24px", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
              ".cm-gutters": { backgroundColor: "transparent", borderRight: "1px solid hsl(var(--border)/0.2)", color: "hsl(var(--muted-foreground)/0.5)" },
              ".cm-activeLine": { backgroundColor: "hsl(var(--muted)/0.3)" },
              ".cm-activeLineGutter": { backgroundColor: "transparent" }
            }}
          />
        </div>
      {/if}
    {/if}
  </div>

  <!-- Bottom Command Bar -->
  <div class="shrink-0 w-full border-t border-border/50 bg-card z-30">
    <BerryChat />
  </div>
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
  .bc-dim  { color: hsl(var(--muted-foreground) / 0.55); }
  .bc-sep  { color: hsl(var(--muted-foreground) / 0.3); font-size: 0.75rem; }

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
  .state-text     { font-size: 0.85rem; }
  .state-error    { color: hsl(var(--destructive)); }
  .mono           { font-family: ui-monospace, monospace; }
  .error-icon     { font-size: 2rem; color: hsl(var(--destructive)); }

  /* Spinner */
  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid hsl(var(--border));
    border-top-color: hsl(var(--primary));
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .editor-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
