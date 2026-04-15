<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import BerryEditor from "$lib/components/editor/BerryEditor.svelte";
  import { berryCode } from "$lib/writable/berry.store";
  import { saveFile, getFile, type FileContext } from "$lib/writable/File";
  import { toast } from "svelte-sonner";

  // ─── Props ────────────────────────────────────────────────────────
  /** Full file location parsed from the URL. */
  export let ctx: FileContext;

  // ─── File loading ─────────────────────────────────────────────────
  // Re-load the file content whenever the context changes (workspace,
  // folder, or file name). Owned here so the IDE is self-contained.
  $: if (ctx.fileName) {
    getFile(ctx).then((text) => {
      $berryCode = text;
    });
  }

  // ─── Actions ──────────────────────────────────────────────────────
  async function handleSave() {
    if (!ctx.fileName) return;
    const blob = new Blob([$berryCode], { type: "text/plain" });
    try {
      await saveFile(ctx, blob);
      toast.success("File Saved");
    } catch {
      toast.error("Failed to save file");
    }
  }

  function handleRun() {
    // TODO: wire up to the Berry interpreter / runtime
  }
</script>

<!--
  BerryCodePanel
  Bottom-right panel — CodeMirror editor for the active .berry file
  with a header bar showing the full path and Save / Run controls.
-->
<div
  class="pointer-events-auto shadow-sm rounded-xl overflow-hidden border bg-card/95 backdrop-blur text-card-foreground flex flex-col relative z-20 h-full"
>
  <!-- Header -->
  <div
    class="flex items-center justify-between p-3 border-b border-border/50 bg-muted/20 shrink-0"
  >
    <div class="flex items-center gap-2 overflow-hidden">
      <span class="text-xs font-semibold shrink-0">Code</span>
      {#if ctx.fileName}
        <!-- Breadcrumb: workspaceId / folderId? / fileName -->
        <div class="flex items-center gap-1 text-[10px] font-mono text-muted-foreground overflow-hidden">
          <span class="truncate max-w-[5rem] opacity-60">{ctx.workspaceId}</span>
          {#if ctx.folderId}
            <span class="opacity-40">/</span>
            <span class="truncate max-w-[5rem] opacity-60">{ctx.folderId}</span>
          {/if}
          <span class="opacity-40">/</span>
          <span
            class="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full truncate max-w-[10rem]"
          >
            {ctx.fileName}
          </span>
        </div>
      {/if}
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <Button
        variant="ghost"
        size="sm"
        class="text-[10px] uppercase font-bold tracking-wider h-6 px-3 text-muted-foreground hover:text-foreground"
        on:click={handleSave}>Save</Button
      >
      <Button
        variant="secondary"
        size="sm"
        class="text-[10px] uppercase font-bold tracking-wider h-6 px-4"
        on:click={handleRun}>Run</Button
      >
    </div>
  </div>

  <!-- Editor -->
  <div class="flex-1 relative">
    <BerryEditor />
  </div>
</div>
