<script lang="ts">
  import { marked } from "marked";
  import { getFile, saveFile, type FileContext } from "$lib/writable/File";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import Header from "$lib/ui/shared/Header.svelte";
  import {
    FileText, Code2, Hash, ArrowLeft,
    Download, Copy, Check, Pencil, Eye, Save,
  } from "lucide-svelte";

  // Configure marked to handle single line breaks as <br>
  marked.use({
    breaks: true,
    gfm: true
  });

  // ─── Props ──────────────────────────────────────────────────
  export let ctx: FileContext;

  // ─── State ──────────────────────────────────────────────────
  let fileContent = "";
  let renderedHtml = "";
  let isLoading = true;
  let isSaving = false;
  let error = "";
  let copied = false;

  /** Toggle between edit and preview/read-only modes. */
  let isEditing = false;

  // ─── Derived ─────────────────────────────────────────────────
  $: extension   = ctx.fileName.split(".").pop()?.toLowerCase() ?? "";
  $: isMarkdown  = extension === "md" || extension === "mdx";
  $: isCode      = ["ts","js","json","css","html","xml","yaml","yml","toml","sh","env"].includes(extension);
  $: viewerLabel = isEditing ? "Editing" : isMarkdown ? "Markdown" : isCode ? "Code" : "Text";

  $: lineCount = fileContent.split("\n").length;
  $: charCount = fileContent.length;

  // ─── Load ────────────────────────────────────────────────────
  $: if (ctx.fileName) loadFile(ctx);

  async function loadFile(fileCtx: FileContext) {
    isLoading = true;
    isEditing = false;
    error = "";
    fileContent = "";
    renderedHtml = "";
    try {
      const text = await getFile(fileCtx);
      fileContent = text;
      if (isMarkdown) {
        renderedHtml = await marked.parse(text, { async: false });
      }
    } catch {
      error = "Failed to load file content.";
    } finally {
      isLoading = false;
    }
  }

  // ─── Save ────────────────────────────────────────────────────
  async function handleSave() {
    if (!ctx.fileName || isSaving) return;
    isSaving = true;
    try {
      const blob = new Blob([fileContent], { type: "text/plain" });
      await saveFile(ctx, blob);
      // Re-render markdown after saving
      if (isMarkdown) {
        renderedHtml = await marked.parse(fileContent, { async: false });
      }
      toast.success("File saved");
      isEditing = false;
    } catch {
      toast.error("Failed to save file");
    } finally {
      isSaving = false;
    }
  }

  // ─── Keyboard shortcut: Ctrl/Cmd+S saves ────────────────────
  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      if (isEditing) handleSave();
    }
    if (e.key === "Escape" && isEditing) {
      // Reload original content on Escape — discards unsaved edits
      isEditing = false;
      loadFile(ctx);
    }
  }

  // ─── Copy / Download ─────────────────────────────────────────
  function copyContent() {
    navigator.clipboard.writeText(fileContent).then(() => {
      copied = true;
      setTimeout(() => (copied = false), 2000);
    });
  }

  function downloadFile() {
    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ctx.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="file-viewer-root">

  <!-- ── Shared App Header ─────────────────────────────────── -->
  <div class="fv-header-wrap">
    <Header />
  </div>

  <!-- ── File Topbar ───────────────────────────────────────── -->
  <div class="file-viewer-topbar">
    <div class="topbar-left">
      <button class="back-btn" on:click={() => goto("/")}>
        <ArrowLeft size={14} />
        <span>Home</span>
      </button>

      <!-- Breadcrumb: workspace / folder? / file -->
      <div class="file-breadcrumb">
        <span class="bc-segment bc-dim">{ctx.workspaceId}</span>
        {#if ctx.folderId}
          <span class="bc-sep">/</span>
          <span class="bc-segment bc-dim">{ctx.folderId}</span>
        {/if}
        <span class="bc-sep">/</span>
        <div class="file-title-pill">
          {#if isMarkdown}
            <Hash size={13} />
          {:else if isCode}
            <Code2 size={13} />
          {:else}
            <FileText size={13} />
          {/if}
          <span class="file-title-text">{ctx.fileName}</span>
          <span class="ext-badge">.{extension}</span>
        </div>
      </div>
    </div>

    <!-- Right: stats + actions -->
    <div class="topbar-right">
      {#if !isLoading && !error}
        <span class="meta-pill">{lineCount} lines</span>
        <span class="meta-pill">{charCount} chars</span>
      {/if}

      <!-- Edit / Preview toggle -->
      {#if !isLoading && !error}
        {#if isEditing}
          <button
            class="action-btn action-save"
            class:loading={isSaving}
            on:click={handleSave}
            title="Save (⌘S)"
          >
            <Save size={13} />
            <span>{isSaving ? "Saving…" : "Save"}</span>
          </button>
          <button
            class="icon-btn"
            on:click={() => { isEditing = false; loadFile(ctx); }}
            title="Cancel editing (Esc)"
          >
            <Eye size={14} />
          </button>
        {:else}
          <button
            class="action-btn action-edit"
            on:click={() => (isEditing = true)}
            title="Edit file"
          >
            <Pencil size={13} />
            <span>Edit</span>
          </button>
        {/if}
      {/if}

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

  <!-- ── Content Area ──────────────────────────────────────── -->
  <div class="file-viewer-content">
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

    {:else if isEditing}
      <!-- ── Edit mode: writable textarea ── -->
      <div class="editor-wrap">
        <div class="editor-line-numbers" aria-hidden="true">
          {#each fileContent.split("\n") as _l, i}
            <span>{i + 1}</span>
          {/each}
        </div>
        <textarea
          class="editor-textarea"
          bind:value={fileContent}
          spellcheck="false"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          placeholder="Start typing…"
        ></textarea>
      </div>

    {:else if fileContent === ""}
      <div class="state-container">
        <FileText size={36} class="empty-icon" />
        <p class="state-text">This file is empty.</p>
        <button class="action-btn action-edit" on:click={() => (isEditing = true)}>
          <Pencil size={13} />
          <span>Start editing</span>
        </button>
      </div>

    {:else if isMarkdown}
      <!-- ── Markdown rendered view ── -->
      <div class="md-prose-wrapper">
        <article class="md-prose">
          {@html renderedHtml}
        </article>
      </div>

    {:else}
      <!-- ── Code / plain-text read-only view with line numbers ── -->
      <div class="code-wrapper">
        <div class="line-numbers" aria-hidden="true">
          {#each fileContent.split("\n") as _l, i}
            <span>{i + 1}</span>
          {/each}
        </div>
        <pre class="code-body"><code>{fileContent}</code></pre>
      </div>
    {/if}
  </div>

  <!-- ── Mode chip (bottom-right) ───────────────────────────── -->
  {#if !isLoading && !error}
    <div class="viewer-mode-chip" class:chip-editing={isEditing}>
      <span
        class="chip-dot"
        class:chip-md={isMarkdown && !isEditing}
        class:chip-code={isCode && !isEditing}
        class:chip-edit={isEditing}
      ></span>
      {viewerLabel}
    </div>
  {/if}
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

  /* ─── App Header wrapper ───────────────────────────────── */
  .fv-header-wrap {
    flex-shrink: 0;
    padding: 0.5rem 0.5rem 0;
    background: hsl(var(--background));
    border-bottom: 1px solid hsl(var(--border) / 0.4);
  }

  /* ─── File Topbar ──────────────────────────────────────── */
  .file-viewer-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.45rem 1rem;
    border-bottom: 1px solid hsl(var(--border) / 0.5);
    background: hsl(var(--card) / 0.8);
    backdrop-filter: blur(8px);
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

  /* Meta stats */
  .meta-pill {
    font-size: 0.65rem;
    color: hsl(var(--muted-foreground));
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    background: hsl(var(--muted) / 0.4);
    font-family: ui-monospace, monospace;
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
  .action-edit {
    background: hsl(var(--muted) / 0.5);
    border-color: hsl(var(--border) / 0.6);
    color: hsl(var(--foreground));
  }
  .action-edit:hover {
    background: hsl(var(--primary) / 0.12);
    border-color: hsl(var(--primary) / 0.3);
    color: hsl(var(--primary));
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
    overflow: hidden;
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
  :global(.empty-icon) { opacity: 0.3; }

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

  /* ── Edit mode: textarea with matching line numbers ──────── */
  .editor-wrap {
    flex: 1;
    display: flex;
    overflow: auto;
    font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
    font-size: 13px;
    line-height: 1.65;
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--border)) transparent;
  }
  .editor-line-numbers {
    display: flex;
    flex-direction: column;
    padding: 1rem 0.75rem;
    text-align: right;
    color: hsl(var(--muted-foreground) / 0.35);
    font-size: 12px;
    user-select: none;
    border-right: 1px solid hsl(var(--border) / 0.3);
    min-width: 3rem;
    flex-shrink: 0;
    background: hsl(var(--muted) / 0.12);
    pointer-events: none;
  }
  .editor-line-numbers span { display: block; line-height: 1.65; }

  .editor-textarea {
    flex: 1;
    padding: 1rem 1.25rem;
    resize: none;
    border: none;
    outline: none;
    background: transparent;
    color: hsl(var(--foreground));
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    tab-size: 2;
    caret-color: hsl(var(--primary));
  }
  .editor-textarea::selection {
    background: hsl(var(--primary) / 0.2);
  }

  /* ── Markdown ── */
  .md-prose-wrapper {
    flex: 1;
    overflow-y: auto;
    padding: 2rem 3rem;
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--border)) transparent;
  }
  .md-prose {
    max-width: 72ch;
    margin: 0 auto;
    font-size: 0.9rem;
    line-height: 1.75;
    color: hsl(var(--foreground));
  }
  :global(.md-prose h1) { font-size:1.8rem;font-weight:700;margin-bottom:1rem;border-bottom:1px solid hsl(var(--border)/.5);padding-bottom:.4rem; }
  :global(.md-prose h2) { font-size:1.3rem;font-weight:600;margin-top:1.8rem;margin-bottom:.7rem; }
  :global(.md-prose h3) { font-size:1.05rem;font-weight:600;margin-top:1.4rem;margin-bottom:.5rem; }
  :global(.md-prose p)  { margin-bottom:.9rem;color:hsl(var(--muted-foreground)); }
  :global(.md-prose a)  { color:hsl(var(--primary));text-decoration:underline;text-underline-offset:3px; }
  :global(.md-prose code)   { font-family:ui-monospace,Menlo,monospace;font-size:.8rem;background:hsl(var(--muted)/.6);padding:.1rem .35rem;border-radius:4px;color:hsl(var(--primary)); }
  :global(.md-prose pre)    { background:hsl(var(--card));border:1px solid hsl(var(--border)/.5);border-radius:8px;padding:1rem 1.2rem;overflow-x:auto;margin:1rem 0; }
  :global(.md-prose pre code) { background:transparent;padding:0;color:hsl(var(--foreground));font-size:.82rem; }
  :global(.md-prose blockquote) { border-left:3px solid hsl(var(--primary)/.5);margin-left:0;padding-left:1rem;color:hsl(var(--muted-foreground));font-style:italic; }
  :global(.md-prose ul),:global(.md-prose ol) { padding-left:1.5rem;margin-bottom:.9rem;color:hsl(var(--muted-foreground)); }
  :global(.md-prose li)   { margin-bottom:.3rem; }
  :global(.md-prose table) { width:100%;border-collapse:collapse;font-size:.82rem;margin:1rem 0; }
  :global(.md-prose th)   { background:hsl(var(--muted)/.5);padding:.5rem .75rem;text-align:left;font-weight:600;border-bottom:1px solid hsl(var(--border)); }
  :global(.md-prose td)   { padding:.45rem .75rem;border-bottom:1px solid hsl(var(--border)/.4);color:hsl(var(--muted-foreground)); }
  :global(.md-prose hr)   { border:none;border-top:1px solid hsl(var(--border)/.5);margin:1.5rem 0; }
  :global(.md-prose img)  { max-width:100%;border-radius:8px;margin:.75rem 0; }

  /* ── Code / plain-text read-only ── */
  .code-wrapper {
    flex: 1;
    display: flex;
    overflow: auto;
    font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
    font-size: 13px;
    line-height: 1.65;
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--border)) transparent;
  }
  .line-numbers {
    display: flex;
    flex-direction: column;
    padding: 1rem 0.75rem;
    text-align: right;
    color: hsl(var(--muted-foreground) / 0.4);
    font-size: 12px;
    user-select: none;
    border-right: 1px solid hsl(var(--border) / 0.3);
    min-width: 3rem;
    flex-shrink: 0;
    background: hsl(var(--muted) / 0.15);
  }
  .line-numbers span { display: block; line-height: 1.65; }
  .code-body {
    flex: 1;
    padding: 1rem 1.25rem;
    margin: 0;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    overflow: visible;
    color: hsl(var(--foreground));
    background: transparent;
  }
  .code-body code {
    white-space: pre-wrap;
    background: transparent;
    color: inherit;
    font-size: inherit;
    font-family: inherit;
  }

  /* ─── Mode Chip ────────────────────────────────────────── */
  .viewer-mode-chip {
    position: absolute;
    bottom: 0.75rem;
    right: 1rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.62rem;
    font-weight: 500;
    color: hsl(var(--muted-foreground));
    background: hsl(var(--card) / 0.85);
    backdrop-filter: blur(6px);
    border: 1px solid hsl(var(--border) / 0.4);
    border-radius: 6px;
    padding: 0.2rem 0.6rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    pointer-events: none;
    transition: border-color 0.2s;
  }
  .viewer-mode-chip.chip-editing {
    border-color: hsl(var(--primary) / 0.4);
    color: hsl(var(--primary));
  }

  .chip-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: hsl(var(--muted-foreground) / 0.5);
    transition: background 0.2s;
  }
  .chip-md   { background: hsl(217 91% 60% / 0.9); }
  .chip-code { background: hsl(142 71% 45% / 0.9); }
  .chip-edit { background: hsl(var(--primary)); }
</style>
