<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import {
    Sparkles,
    Code,
    Database,
    Check,
    SendHorizontal,
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

    toast.info(
      "Command not recognized. Try 'Add API', 'Add Var', or paste cURL.",
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

<div
  class="flex items-center gap-4 px-4 py-3 bg-muted/20 w-full overflow-hidden"
>
  <!-- Brand Icon -->
  <div
    class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0"
  >
    <Sparkles class="w-4 h-4" />
  </div>

  <!-- Command Input -->
  <div class="relative flex-1 max-w-xl">
    <Input
      bind:value={query}
      on:keydown={(e) => e.key === "Enter" && sendMessage()}
      placeholder="Type a command (e.g. 'Add API', paste cURL)..."
      class="h-9 bg-card border-border/60 rounded-md focus-visible:ring-1 focus-visible:ring-primary/40 shadow-sm text-sm"
    />
    <Button
      size="icon"
      variant="ghost"
      class="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-primary transition-all rounded-r-md"
      on:click={sendMessage}
    >
      <SendHorizontal class="w-4 h-4" />
    </Button>
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
