<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import BerryEditor from "$lib/components/editor/BerryEditor.svelte";
  import { berryCode } from "$lib/writable/berry.store";
  import { saveFile, getFile, type FileContext } from "$lib/writable/File";
  import { toast } from "svelte-sonner";
  import { Play, Save, Settings2 } from "lucide-svelte";

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
    toast.success("Running cell...");
  }
</script>

<!--
  BerryCodePanel (Notebook Cell)
  Styled to resemble a Jupyter/Colab code cell.
-->
<div
  class="group relative flex rounded-xl border border-border/60 bg-card shadow-sm transition-all hover:border-border hover:shadow-md"
>
  <!-- Left execution gutter -->
  <div class="flex flex-col items-center w-12 py-3 border-r border-border/30 bg-muted/10 shrink-0">
    <Button
      variant="ghost"
      size="icon"
      class="w-8 h-8 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all group-hover:opacity-100 opacity-60"
      on:click={handleRun}
      title="Run cell"
    >
      <Play class="w-4 h-4 ml-0.5" fill="currentColor" />
    </Button>
    <div class="mt-2 text-[9px] font-mono text-muted-foreground/50 rotate-[-90deg] uppercase tracking-widest translate-y-4">
      [ ]
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col min-w-0">
    <!-- Top toolbar (appears on hover) -->
    <div class="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-card/80 backdrop-blur-sm border rounded-lg p-0.5 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        class="w-7 h-7 rounded-md text-muted-foreground hover:text-foreground"
        on:click={handleSave}
        title="Save File"
      >
        <Save class="w-3.5 h-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="w-7 h-7 rounded-md text-muted-foreground hover:text-foreground"
        title="Cell Settings"
      >
        <Settings2 class="w-3.5 h-3.5" />
      </Button>
    </div>

    <!-- Code Editor -->
    <div class="flex-1 p-4 overflow-hidden relative">
      <BerryEditor />
    </div>
  </div>
</div>
