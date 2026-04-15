<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { ScrollArea } from "$lib/components/ui/scroll-area";

  // ─── Placeholder log entries ─────────────────────────────────────
  // Replace with a real log store / prop when the debug runtime is wired up.
  const logEntries = [
    { type: "timestamp", text: "{14:22:49:720} Debug running" },
    { type: "success",   text: "let customView = UIView()" },
    { type: "bullet",    text: "customView.frame = CGRect(x: 0, y: 0, width: 56, height: 56)" },
    { type: "normal",    text: "customView.layer.backgroundColor = UIColor(red: 0.163, green: 0.174, blue: 0.196, alpha: 1).cgColor" },
    { type: "normal",    text: "customView.layer.cornerRadius = 16" },
    { type: "normal",    text: "customView.layer.borderWidth = 1" },
    { type: "bullet",    text: "customView.layer.borderColor = UIColor(...).cgColor" },
    { type: "normal",    text: "let mainView = self.view!" },
  ] as const;

  let selectObjects = false;

  function clearLogs() {
    // TODO: clear real log store
  }
</script>

<!--
  DebugConsole
  Bottom-left panel — shows runtime debug output with a toolbar for
  filtering and clearing entries.
-->
<div class="pointer-events-auto rounded-xl overflow-hidden border bg-card/95 backdrop-blur text-card-foreground shadow-sm flex flex-col relative z-20 h-full">
  <!-- Header -->
  <div class="flex items-center justify-between p-3 border-b border-border/50 bg-muted/20 shrink-0">
    <span class="text-xs font-semibold flex items-center gap-2">
      Debug running
      <span class="text-[10px] text-muted-foreground font-normal">In progress</span>
    </span>
    <div class="flex items-center gap-4">
      <label class="flex items-center gap-2 text-[10px] text-muted-foreground cursor-pointer">
        <input
          type="checkbox"
          bind:checked={selectObjects}
          class="rounded border-border accent-primary w-3 h-3"
        />
        Select object(s)
      </label>
      <Button
        variant="ghost"
        size="sm"
        class="text-[10px] uppercase tracking-wider text-muted-foreground h-6 px-2 hover:bg-transparent hover:text-foreground"
        on:click={clearLogs}
      >Clear</Button>
    </div>
  </div>

  <!-- Log entries -->
  <ScrollArea class="flex-1 p-4">
    <div class="font-mono text-[11px] leading-relaxed text-muted-foreground space-y-1">
      {#each logEntries as entry}
        {#if entry.type === "timestamp"}
          <div class="text-pink-500">{entry.text}</div>
        {:else if entry.type === "success"}
          <div class="text-emerald-500">{entry.text}</div>
        {:else if entry.type === "bullet"}
          <div>
            <span class="text-pink-500">•</span>
            {entry.text}
          </div>
        {:else}
          <div>{entry.text}</div>
        {/if}
      {/each}
    </div>
  </ScrollArea>
</div>
