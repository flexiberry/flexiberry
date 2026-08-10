<script lang="ts">
  import { marked } from "marked";
  import { BookOpen, Pencil, Copy, Check, FileText, ExternalLink } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { goto } from "$app/navigation";
  import { activeWorkspaceId } from "$lib/writable/workspace.store";
  import { buildFilePath } from "$lib/writable/File";

  export let file: any;

  let rawContent = "";
  let renderedHtml = "";
  let isLoading = true;
  let copied = false;

  marked.use({
    gfm: true,
    breaks: true,
  });

  $: if (file) {
    loadReadmeContent(file);
  }

  async function loadReadmeContent(readmeFile: any) {
    isLoading = true;
    rawContent = "";
    renderedHtml = "";

    try {
      if (!readmeFile || !readmeFile.data) {
        isLoading = false;
        return;
      }

      let text = "";
      if (typeof readmeFile.data === "string") {
        text = readmeFile.data;
      } else if (readmeFile.data instanceof Blob) {
        text = await readmeFile.data.text();
      }

      rawContent = text;
      renderedHtml = await marked.parse(text, { async: false });
    } catch (e) {
      console.error("Failed to parse README markdown:", e);
      renderedHtml = "<p class='text-destructive'>Failed to render README content.</p>";
    } finally {
      isLoading = false;
    }
  }

  function handleCopy() {
    if (!rawContent) return;
    navigator.clipboard.writeText(rawContent).then(() => {
      copied = true;
      setTimeout(() => (copied = false), 2000);
    });
  }

  function handleEdit() {
    if (!file) return;
    goto(buildFilePath($activeWorkspaceId, file.name, file.folderId ?? null));
  }

  $: lineCount = rawContent ? rawContent.split("\n").length : 0;
  $: byteCount = new Blob([rawContent]).size;
  $: formattedSize =
    byteCount < 1024
      ? `${byteCount} B`
      : `${(byteCount / 1024).toFixed(1)} KB`;
</script>

<div class="flex flex-col gap-3 mt-4">
  <!-- GitHub Repo-Style README Card -->
  <div
    class="bg-card border border-border/80 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:border-border"
  >
    <!-- Header Bar -->
    <div
      class="bg-muted/40 border-b border-border/60 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 backdrop-blur-sm"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <div
          class="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0"
        >
          <BookOpen class="w-4 h-4" />
        </div>

        <div class="flex items-center gap-2 min-w-0">
          <span class="font-semibold text-sm tracking-tight truncate text-foreground">
            {file?.name || "README.md"}
          </span>
          <span
            class="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/40 shrink-0 hidden sm:inline-block"
          >
            {lineCount} lines ({formattedSize})
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-1.5 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          class="h-8 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60"
          on:click={handleCopy}
          title="Copy raw markdown content"
        >
          {#if copied}
            <Check class="w-3.5 h-3.5 text-emerald-500" />
            <span class="text-emerald-500 font-medium hidden xs:inline">Copied</span>
          {:else}
            <Copy class="w-3.5 h-3.5" />
            <span class="hidden xs:inline">Copy</span>
          {/if}
        </Button>

        <Button
          variant="outline"
          size="sm"
          class="h-8 px-3 text-xs gap-1.5 font-medium border-border/70 hover:bg-muted/60 transition-colors"
          on:click={handleEdit}
          title="Open in full editor"
        >
          <Pencil class="w-3.5 h-3.5 text-primary" />
          <span>Edit</span>
        </Button>
      </div>
    </div>

    <!-- Body Area -->
    <div class="p-6 sm:p-8 bg-card/50">
      {#if isLoading}
        <div class="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
          <div class="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <span class="text-xs">Loading documentation...</span>
        </div>
      {:else if !rawContent.trim()}
        <div class="flex flex-col items-center justify-center py-10 text-center gap-2 text-muted-foreground">
          <FileText class="w-8 h-8 opacity-30" />
          <p class="text-sm font-medium">This README file is currently empty.</p>
          <Button variant="ghost" size="sm" class="text-xs gap-1.5 text-primary" on:click={handleEdit}>
            <Pencil class="w-3.5 h-3.5" />
            <span>Add content</span>
          </Button>
        </div>
      {:else}
        <!-- Markdown Prose Renderer -->
        <article class="github-readme-prose prose dark:prose-invert max-w-none">
          {@html renderedHtml}
        </article>
      {/if}
    </div>
  </div>
</div>

<style>
  /* ─── GitHub Markdown Styling ─────────────────────────────────────── */
  :global(.github-readme-prose) {
    font-size: 0.925rem;
    line-height: 1.7;
    color: hsl(var(--foreground));
  }

  /* Headings */
  :global(.github-readme-prose h1) {
    font-size: 1.75rem;
    font-weight: 700;
    margin-top: 0.5rem;
    margin-bottom: 1.25rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid hsl(var(--border) / 0.6);
    letter-spacing: -0.025em;
    color: hsl(var(--foreground));
  }

  :global(.github-readme-prose h2) {
    font-size: 1.35rem;
    font-weight: 600;
    margin-top: 1.75rem;
    margin-bottom: 0.85rem;
    padding-bottom: 0.35rem;
    border-bottom: 1px solid hsl(var(--border) / 0.4);
    letter-spacing: -0.015em;
    color: hsl(var(--foreground));
  }

  :global(.github-readme-prose h3) {
    font-size: 1.125rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.65rem;
    color: hsl(var(--foreground));
  }

  :global(.github-readme-prose h4),
  :global(.github-readme-prose h5),
  :global(.github-readme-prose h6) {
    font-size: 0.95rem;
    font-weight: 600;
    margin-top: 1.2rem;
    margin-bottom: 0.5rem;
    color: hsl(var(--foreground));
  }

  /* Paragraphs & Text */
  :global(.github-readme-prose p) {
    margin-bottom: 1rem;
    color: hsl(var(--muted-foreground));
  }

  :global(.github-readme-prose strong) {
    color: hsl(var(--foreground));
    font-weight: 600;
  }

  :global(.github-readme-prose a) {
    color: hsl(var(--primary));
    text-decoration: none;
    font-weight: 500;
    transition: underline 0.15s;
  }

  :global(.github-readme-prose a:hover) {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  /* Inline & Block Code */
  :global(.github-readme-prose code) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.85em;
    background: hsl(var(--muted) / 0.6);
    padding: 0.15em 0.4em;
    border-radius: 6px;
    border: 1px solid hsl(var(--border) / 0.4);
    color: hsl(var(--foreground));
  }

  :global(.github-readme-prose pre) {
    background: hsl(var(--muted) / 0.4);
    border: 1px solid hsl(var(--border) / 0.6);
    border-radius: 10px;
    padding: 1.1rem 1.3rem;
    overflow-x: auto;
    margin: 1.25rem 0;
  }

  :global(.github-readme-prose pre code) {
    background: transparent;
    border: none;
    padding: 0;
    font-size: 0.85rem;
    line-height: 1.6;
    color: hsl(var(--foreground));
  }

  /* Lists */
  :global(.github-readme-prose ul) {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
    color: hsl(var(--muted-foreground));
  }

  :global(.github-readme-prose ol) {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
    color: hsl(var(--muted-foreground));
  }

  :global(.github-readme-prose li) {
    margin-bottom: 0.35rem;
  }

  :global(.github-readme-prose li > ul),
  :global(.github-readme-prose li > ol) {
    margin-top: 0.35rem;
    margin-bottom: 0;
  }

  /* Blockquotes */
  :global(.github-readme-prose blockquote) {
    border-left: 3.5px solid hsl(var(--primary));
    padding: 0.5rem 1.2rem;
    margin: 1.25rem 0;
    background: hsl(var(--primary) / 0.04);
    border-radius: 0 8px 8px 0;
    color: hsl(var(--muted-foreground));
  }

  :global(.github-readme-prose blockquote p:last-child) {
    margin-bottom: 0;
  }

  /* Tables */
  :global(.github-readme-prose table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1.25rem 0;
    font-size: 0.875rem;
    overflow: hidden;
    border-radius: 8px;
    border: 1px solid hsl(var(--border) / 0.6);
  }

  :global(.github-readme-prose th) {
    background: hsl(var(--muted) / 0.5);
    padding: 0.6rem 0.9rem;
    text-align: left;
    font-weight: 600;
    border-bottom: 1px solid hsl(var(--border) / 0.6);
    color: hsl(var(--foreground));
  }

  :global(.github-readme-prose td) {
    padding: 0.55rem 0.9rem;
    border-bottom: 1px solid hsl(var(--border) / 0.4);
    color: hsl(var(--muted-foreground));
  }

  :global(.github-readme-prose tr:last-child td) {
    border-bottom: none;
  }

  :global(.github-readme-prose tr:nth-child(even)) {
    background: hsl(var(--muted) / 0.15);
  }

  /* Horizontal Rules */
  :global(.github-readme-prose hr) {
    border: none;
    border-top: 1px solid hsl(var(--border) / 0.6);
    margin: 2rem 0;
  }

  /* Images */
  :global(.github-readme-prose img) {
    max-width: 100%;
    border-radius: 8px;
    margin: 1rem 0;
    border: 1px solid hsl(var(--border) / 0.4);
  }
</style>
