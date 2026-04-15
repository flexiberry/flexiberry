<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import {
    Bot,
    User,
    SendHorizontal,
    Sparkles,
    Code,
    Database,
    Filter,
  } from "lucide-svelte";
  import { tick } from "svelte";
  import ScrollArea from "../ui/scroll-area/scroll-area.svelte";

  let query = "";
  let messages = [
    {
      role: "assistant",
      content:
        "Hi! I'm your Berry AI Assistant. How can I help you build your architecture today?",
    },
  ];

  let chatContainer: HTMLElement;

  async function sendMessage() {
    if (!query.trim()) return;

    // Add user message
    messages = [...messages, { role: "user", content: query }];
    const userQuery = query;
    query = "";

    await tick();
    scrollToBottom();

    // Simulate AI thinking and response
    setTimeout(async () => {
      messages = [
        ...messages,
        {
          role: "assistant",
          content: `I can help you with "${userQuery}". I'm analyzing your current workspace...`,
        },
      ];
      await tick();
      scrollToBottom();
    }, 600);
  }

  function scrollToBottom() {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  function triggerQuickAction(action: string) {
    query = action;
    sendMessage();
  }
</script>

<ScrollArea class="h-full p-4 w-full">
  <div class="flex flex-col h-full w-full">
    <!-- Header -->
    <div
      class="flex items-center gap-3 pb-4 border-b border-border/40 shrink-0 mb-4"
    >
      <div
        class="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm"
      >
        <Sparkles class="w-4 h-4" />
      </div>
      <div>
        <h3 class="text-sm font-semibold tracking-tight">Berry AI</h3>
        <p
          class="text-[10px] text-muted-foreground uppercase tracking-wider font-medium"
        >
          Agentic Support
        </p>
      </div>
    </div>

    <!-- Messages -->
    <div
      class="flex-1 overflow-y-auto pr-2 space-y-5 pb-4 scrollbar-thin"
      bind:this={chatContainer}
    >
      {#each messages as msg}
        <div class="flex gap-3 {msg.role === 'user' ? 'flex-row-reverse' : ''}">
          <div
            class="w-7 h-7 shrink-0 rounded-full flex items-center justify-center border {msg.role ===
            'user'
              ? 'bg-muted/50 border-border'
              : 'bg-primary/10 text-primary border-primary/20'}"
          >
            {#if msg.role === "user"}
              <User class="w-3.5 h-3.5 text-foreground" />
            {:else}
              <Bot class="w-3.5 h-3.5" />
            {/if}
          </div>
          <div
            class="bg-muted/30 border border-border/50 px-3.5 py-2.5 max-w-[85%] text-[13px] leading-relaxed shadow-sm {msg.role ===
            'user'
              ? 'rounded-2xl rounded-tr-sm bg-primary/5 border-primary/10'
              : 'rounded-2xl rounded-tl-sm'}"
          >
            {msg.content}
          </div>
        </div>
      {/each}
    </div>

    <!-- Footer Actions & Input -->
    <div class="shrink-0 pt-2 flex flex-col gap-3 mt-auto">
      <!-- Quick Actions -->
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Button
          variant="outline"
          size="sm"
          class="h-7 text-[10px] rounded-full whitespace-nowrap border-border bg-muted/20 hover:bg-muted/50 transition-colors shadow-sm"
          on:click={() => triggerQuickAction("Generate API endpoint")}
        >
          <Database class="w-3 h-3 mr-1.5 opacity-60" /> Data Node
        </Button>
        <Button
          variant="outline"
          size="sm"
          class="h-7 text-[10px] rounded-full whitespace-nowrap border-border bg-muted/20 hover:bg-muted/50 transition-colors shadow-sm"
          on:click={() => triggerQuickAction("Write JS Transform")}
        >
          <Code class="w-3 h-3 mr-1.5 opacity-60" /> JS Transform
        </Button>
        <Button
          variant="outline"
          size="sm"
          class="h-7 text-[10px] rounded-full whitespace-nowrap border-border bg-muted/20 hover:bg-muted/50 transition-colors shadow-sm"
          on:click={() => triggerQuickAction("Filter by status")}
        >
          <Filter class="w-3 h-3 mr-1.5 opacity-60" /> Filter
        </Button>
      </div>

      <!-- Input -->
      <div class="relative">
        <Input
          bind:value={query}
          on:keydown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask Berry AI to build..."
          class="pr-10 bg-muted/40 border-input rounded-[14px] h-11 focus-visible:ring-1 focus-visible:ring-primary shadow-sm text-sm placeholder:text-muted-foreground/60 transition-colors hover:bg-muted/60"
        />
        <Button
          size="icon"
          variant="ghost"
          class="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 text-muted-foreground hover:text-primary transition-colors rounded-xl"
          on:click={sendMessage}
        >
          <SendHorizontal class="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
</ScrollArea>

<style>
  .scrollbar-thin::-webkit-scrollbar {
    width: 4px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: hsl(var(--border));
    border-radius: 4px;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
