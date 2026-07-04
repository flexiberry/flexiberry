<script lang="ts">
  import {
    Sparkles,
    SendHorizontal,
    Globe,
    CheckSquare,
    Terminal,
  } from "lucide-svelte";
  import { berryBlocks } from "$lib/writable/berry.store";
  import { toast } from "svelte-sonner";

  let query = "";

  function sendMessage() {
    const text = query.trim();
    if (!text) return;
    query = "";
    handleGeneralIntent(text);
  }

  function createId() {
    return Math.random().toString(36).substr(2, 9);
  }

  function handleGeneralIntent(text: string) {
    const lower = text.toLowerCase();

    // cURL detection
    if (lower.includes("curl ")) {
      processCurl(text);
      return;
    }

    // Add API
    if (lower.includes("add api") || lower.includes("new api")) {
      berryBlocks.update((blocks) => [
        ...blocks,
        {
          id: createId(),
          type: "Api",
          content: "",
          viewMode: "wizard"
        },
      ]);
      toast.success("Started API Wizard");
      return;
    }

    // Add Var
    if (lower.includes("add var") || lower.includes("new var")) {
      berryBlocks.update((blocks) => [
        ...blocks,
        { id: createId(), type: "Var", content: "", viewMode: "wizard" },
      ]);
      toast.success("Started Var Wizard");
      return;
    }

    // Add Env
    if (lower.includes("add env") || lower.includes("new env")) {
      berryBlocks.update((blocks) => [
        ...blocks,
        { id: createId(), type: "Env", content: "", viewMode: "wizard" },
      ]);
      toast.success("Started Env Wizard");
      return;
    }

    // Add Task
    if (lower.includes("add task") || lower.includes("new task")) {
      berryBlocks.update((blocks) => [
        ...blocks,
        {
          id: createId(),
          type: "Task",
          content: "",
          viewMode: "wizard"
        },
      ]);
      toast.success("Started Task Wizard");
      return;
    }

    // Add Link
    if (lower.includes("add link") || lower.includes("new link") || lower.includes("link block")) {
      berryBlocks.update((blocks) => [
        ...blocks,
        {
          id: createId(),
          type: "Link",
          content: "Link ",
          viewMode: "wizard"
        },
      ]);
      toast.success("Started Link Block Wizard");
      return;
    }

    // Add Input
    if (lower.includes("add input") || lower.includes("new input") || lower.includes("input block")) {
      berryBlocks.update((blocks) => [
        ...blocks,
        {
          id: createId(),
          type: "Input",
          content: "Input ",
          viewMode: "wizard"
        },
      ]);
      toast.success("Started Input Block Wizard");
      return;
    }

    toast.info(
      "Command not recognized. Try 'Add API', 'Add Link', 'Add Input', or paste cURL.",
    );
  }

  function processCurl(curl: string) {
    const methodMatch =
      curl.match(/-X\s+(\w+)/i) || curl.match(/--request\s+(\w+)/i);
    const method = methodMatch
      ? methodMatch[1].toUpperCase()
      : curl.includes("--data") || curl.includes("-d")
        ? "POST"
        : "GET";
    const urlMatch = curl.match(/https?:\/\/[^\s'"]+/);
    const url = urlMatch ? urlMatch[0] : "https://api.example.com";

    berryBlocks.update((blocks) => [
      ...blocks,
      {
        id: createId(),
        type: "Api",
        content: `Api ${method} #newApi\nUrl ${url}`,
      },
    ]);
    toast.success(`Parsed cURL and added ${method} API`);
  }

  function triggerQuickAction(action: string) {
    query = action;
    sendMessage();
  }
</script>

<div class="flex flex-col h-full w-full justify-between">
  <!-- Scrollable Chat Area -->
  <div class="flex-grow overflow-y-auto pr-1 flex flex-col gap-4 select-none no-scrollbar">
    <!-- Welcome message card -->
    <div class="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <Sparkles class="w-4 h-4 text-primary animate-pulse" />
        <span class="text-xs font-bold text-primary">Flexiberry Assistant</span>
      </div>
      <p class="text-xs text-muted-foreground/90 leading-relaxed font-medium">
        Hi! I can help you build and configure notebook blocks. Write a command or select a quick starter template below:
      </p>
    </div>

    <!-- Suggested Card Actions -->
    <div class="flex flex-col gap-2 mt-2">
      <span class="text-[10px] font-black uppercase tracking-wider text-muted-foreground/45 px-1">Quick Starters</span>
      
      <button
        type="button"
        class="w-full flex items-center justify-between p-3.5 bg-card hover:bg-emerald-500/5 border border-border/40 dark:border-border/80 hover:border-emerald-500/20 rounded-xl transition-all duration-200 text-left cursor-pointer group active:scale-[0.99] shadow-sm"
        on:click={() => triggerQuickAction("Add API")}
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Globe class="w-4 h-4" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-bold text-foreground">Create HTTP Block</span>
            <span class="text-[10px] text-muted-foreground">Setup an API block to fetch/test endpoints</span>
          </div>
        </div>
      </button>

      <button
        type="button"
        class="w-full flex items-center justify-between p-3.5 bg-card hover:bg-blue-500/5 border border-border/40 dark:border-border/80 hover:border-blue-500/20 rounded-xl transition-all duration-200 text-left cursor-pointer group active:scale-[0.99] shadow-sm"
        on:click={() => triggerQuickAction("Add Task")}
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
            <CheckSquare class="w-4 h-4" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-bold text-foreground">Create Task Scenario</span>
            <span class="text-[10px] text-muted-foreground">Add a sequence flow of API operations</span>
          </div>
        </div>
      </button>

      <button
        type="button"
        class="w-full flex items-center justify-between p-3.5 bg-card hover:bg-amber-500/5 border border-border/40 dark:border-border/80 hover:border-amber-500/20 rounded-xl transition-all duration-200 text-left cursor-pointer group active:scale-[0.99] shadow-sm"
        on:click={() => {
          query = "curl -X POST https://api.example.com/v1/users -d '{\"name\":\"Rintu\"}'";
        }}
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Terminal class="w-4 h-4" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-bold text-foreground">Paste sample cURL</span>
            <span class="text-[10px] text-muted-foreground">Generate request syntax from shell command</span>
          </div>
        </div>
      </button>
    </div>
  </div>

  <!-- Bottom Input Capsule -->
  <div class="pt-4 border-t border-border/20 flex flex-col gap-2 bg-transparent">
    <!-- Spotlight Command Input Capsule -->
    <div
      class="flex items-center bg-card dark:bg-[#141b2b]/95 border border-border/60 dark:border-border/80 shadow-lg rounded-full px-3 py-1.5 w-full h-11 transition-all duration-300"
    >
      <!-- Brand Icon -->
      <div class="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm shrink-0 mr-2.5">
        <Sparkles class="w-3.5 h-3.5" />
      </div>

      <!-- Input Field -->
      <input
        type="text"
        bind:value={query}
        on:keydown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Describe changes or paste cURL..."
        class="bg-transparent border-none outline-none focus:outline-none focus:ring-0 w-full h-full text-xs font-semibold text-foreground placeholder:text-muted-foreground/45 flex-grow"
      />

      <!-- Send Action Button -->
      <button
        type="button"
        class="w-7 h-7 rounded-full bg-primary/10 text-primary hover:bg-primary/25 flex items-center justify-center transition-all shadow-sm active:scale-90 shrink-0 ml-1.5 cursor-pointer border border-primary/25"
        on:click={sendMessage}
      >
        <SendHorizontal class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</div>

<style>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
