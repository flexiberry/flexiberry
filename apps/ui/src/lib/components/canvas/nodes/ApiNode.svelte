<script lang="ts">
  import { Handle, Position } from "@xyflow/svelte";
  import { Sparkles, Pencil, ChevronUp, ChevronDown, X } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from "$lib/components/ui/collapsible";

  export let code: string;

  export let data: any = {
    title: "Auth Endpoint",
    method: "POST",
    url: "https://api.flexiberry.com/v1/auth",
    inputRaw: ``,
  };

  let isEditingTitle = false;
  let nodeContainer: HTMLDivElement;
  // open = true means expanded; Collapsible uses `open` prop
  let open = true;

  function editTitle() {
    isEditingTitle = true;
    setTimeout(() => {
      nodeContainer?.querySelector("input")?.focus();
    }, 0);
  }

  // Mock function to format curl into berry code
  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    const val = target.value;
    if (val.trim().toLowerCase().startsWith("curl")) {
      // Very basic curl parsing simulation
      if (val.includes("-X POST")) data.method = "POST";
      else if (val.includes("-X PUT")) data.method = "PUT";
      else if (val.includes("-X DELETE")) data.method = "DELETE";
      else data.method = "GET";

      const urlMatch = val.match(/['\"](https?:\/\/[^'"]+)['"]/);
      if (urlMatch) {
        data.url = urlMatch[1];
      }
    }
  }
</script>

<div
  bind:this={nodeContainer}
  class="w-[450px] bg-[#1a1b1e]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden font-sans flex flex-col relative transition-all duration-300"
>
  <Collapsible bind:open class="flex flex-col">
    <!-- Always-visible header row -->
    <div
      class="px-4 py-2.5 flex items-center gap-3 text-white bg-black/20 shadow-sm"
    >
      <!-- Method badge -->
      <span
        class="font-bold tracking-wider shrink-0 text-[12px]"
        class:text-[#a3e635]={data.method === "GET"}
        class:text-yellow-400={data.method === "POST"}
        class:text-blue-400={data.method === "PUT"}
        class:text-red-400={data.method === "DELETE"}
      >
        {data.method}
      </span>

      <!-- Title / collapsed URL -->
      {#if open}
        <!-- Expanded: editable title -->
        <div class="flex items-center gap-1.5 flex-1 min-w-0">
          <Sparkles class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          {#if isEditingTitle}
            <Input
              bind:value={data.title}
              on:blur={() => (isEditingTitle = false)}
              on:keydown={(e) => e.key === "Enter" && (isEditingTitle = false)}
              class="h-7 text-[13px] font-medium text-gray-200 bg-black/40 border-primary/50 px-2 py-0.5 outline-none w-[150px] transition-all focus-visible:ring-1 focus-visible:ring-primary/50"
              placeholder="Enter title..."
            />
          {:else}
            <button
              on:click={editTitle}
              class="group flex items-center gap-1.5 text-left px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors max-w-[200px]"
            >
              <span class="text-[13px] font-medium text-gray-200 truncate"
                >{data.title || "Untitled API"}</span
              >
              <Pencil
                class="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              />
            </button>
          {/if}
        </div>
      {:else}
        <!-- Collapsed: show title/url as summary -->
        <span class="text-[13px] font-medium text-gray-200 truncate flex-1 min-w-0 pr-2">
          {data.title || data.url}
        </span>
      {/if}

      <!-- Action buttons -->
      <div class="ml-auto flex items-center gap-1 shrink-0">
        <!-- Collapse / expand trigger -->
        <CollapsibleTrigger asChild let:builder>
          <Button
            builders={[builder]}
            variant="ghost"
            size="icon"
            class="w-6 h-6 hover:bg-white/10 text-gray-400 transition-colors"
            title={open ? "Collapse" : "Expand"}
          >
            {#if open}
              <ChevronUp class="w-4 h-4" />
            {:else}
              <ChevronDown class="w-4 h-4" />
            {/if}
          </Button>
        </CollapsibleTrigger>

        <!-- Delete button (only shown when expanded) -->
        {#if open}
          <Button
            variant="ghost"
            size="icon"
            class="w-6 h-6 hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-colors"
            title="Delete Node"
          >
            <X class="w-4 h-4" />
          </Button>
        {/if}
      </div>
    </div>

    <!-- Collapsible body: content + footer -->
    <CollapsibleContent>
      <!-- Content (Input portion) -->
      <div
        class="px-5 pt-5 pb-3 font-mono text-[14px] flex flex-col gap-4 relative border-t border-white/5"
      >
        <!-- Highlighted formatted display -->
        <div class="flex items-start gap-3 w-full break-all leading-relaxed">
          <span
            class="font-bold tracking-wider shrink-0"
            class:text-[#a3e635]={data.method === "GET"}
            class:text-yellow-400={data.method === "POST"}
            class:text-blue-400={data.method === "PUT"}
            class:text-red-400={data.method === "DELETE"}
          >
            {data.method}
          </span>
          <span class="text-[#a1a1aa]">
            <span class="text-[#86efac]">
              {@html data.url.includes("://")
                ? data.url.split("://")[0] + "://"
                : ""}
            </span>{data.url.includes("://")
              ? data.url.split("://")[1]
              : data.url}
          </span>
        </div>

        <!-- User Input (Paste cURL here) -->
        <Textarea
          bind:value={data.inputRaw}
          on:input={handleInput}
          class="w-full bg-black/40 border-white/10 p-3 text-[#d4d4d8] text-xs resize-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors placeholder:text-muted-foreground/50 shadow-inner"
          placeholder="Paste cURL or enter API details to auto-format to .berry code..."
          rows={4}
        />
      </div>

      <!-- Footer Actions -->
      <div
        class="px-4 py-3 border-t border-white/5 bg-black/30 flex items-center justify-between text-gray-400 gap-2"
      >
        <div
          class="flex items-center bg-black/40 xl:bg-background/20 rounded-[10px] p-1 border border-white/5 shadow-sm"
        >
          <Button
            variant="ghost"
            size="sm"
            class="h-7 text-[11px] text-gray-400 hover:text-white hover:bg-white/10 px-3 rounded-md transition-colors"
            >Params</Button
          >
          <Button
            variant="ghost"
            size="sm"
            class="h-7 text-[11px] text-gray-400 hover:text-white hover:bg-white/10 px-3 rounded-md transition-colors"
            >Headers</Button
          >
          <Button
            variant="ghost"
            size="sm"
            class="h-7 text-[11px] text-gray-400 hover:text-white hover:bg-white/10 px-3 rounded-md transition-colors"
            >Body</Button
          >
        </div>

        <Button
          size="sm"
          class="h-8 text-[11px] bg-primary/20 text-primary hover:bg-primary/30 px-5 rounded-[10px] flex gap-1.5 items-center font-medium border border-primary/20 shadow-sm backdrop-blur-sm transition-all shadow-[0_0_15px_rgba(var(--primary),0.1)]"
        >
          Apply to Berry
        </Button>
      </div>
    </CollapsibleContent>
  </Collapsible>

  <!-- xyflow handles -->
  <Handle
    type="target"
    position={Position.Left}
    class="w-4 h-4 bg-muted border-[3px] border-[#1a1b1e] rounded-full shadow-md"
  />
  <Handle
    type="source"
    position={Position.Right}
    class="w-4 h-4 bg-primary border-[3px] border-[#1a1b1e] rounded-full shadow-md"
  />
</div>
