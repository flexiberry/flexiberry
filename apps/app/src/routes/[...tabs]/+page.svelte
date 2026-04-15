<script lang="ts">
  import BerryIDE from "$lib/components/ide/BerryIDE.svelte";
  import FileViewer from "$lib/components/viewer/FileViewer.svelte";

  import { page } from "$app/stores";
  import { parseFileContext, type FileContext } from "$lib/writable/File";

  // ─── Routing ──────────────────────────────────────────────────────
  // Parse the URL segments into a typed FileContext:
  //   /$workspaceId/$fileName           → root file
  //   /$workspaceId/$folderId/$fileName → file inside a folder
  $: ctx = parseFileContext($page.params.tabs ?? "");

  $: fileExtension = ctx.fileName.includes(".")
    ? (ctx.fileName.split(".").pop()?.toLowerCase() ?? "")
    : "";

  /** True when the open file is a Berry source file (.berry). */
  $: isBerryFile = fileExtension === "berry";

  // Components own their own file loading via the FileContext prop.
</script>

{#if isBerryFile}
  <!-- {#key} forces a clean remount whenever workspace/folder/file changes -->
  {#key `${ctx.workspaceId}/${ctx.folderId}/${ctx.fileName}`}
    <BerryIDE {ctx} />
  {/key}

{:else if ctx.fileName}
  <!-- {#key} guarantees FileViewer starts fresh on every navigation -->
  {#key `${ctx.workspaceId}/${ctx.folderId}/${ctx.fileName}`}
    <div class="h-full w-full overflow-hidden flex flex-col bg-background relative">
      <div class="viewer-bg-pattern" aria-hidden="true"></div>
      <div class="flex-1 overflow-hidden relative z-10">
        <FileViewer {ctx} />
      </div>
    </div>
  {/key}

{:else}
  <!-- Fallback: no file selected yet -->
  <div class="h-full w-full flex items-center justify-center bg-background text-muted-foreground">
    <p class="text-sm">No file selected.</p>
  </div>
{/if}

<style>
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
</style>
