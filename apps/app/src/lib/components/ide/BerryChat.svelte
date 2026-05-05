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
    Undo2,
    Check
  } from "lucide-svelte";
  import { tick } from "svelte";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
  import { berryCode } from "$lib/writable/berry.store";
  import { cn } from "$lib/utils";

  type Role = "user" | "assistant";
  
  interface Message {
    role: Role;
    content: string;
    isWizard?: boolean;
  }

  type WizardState = 'IDLE' | 'ADD_API_URL' | 'ADD_API_METHOD' | 'ADD_API_NAME';

  let messages: Message[] = [
    {
      role: "assistant",
      content: "Hello! I'm your Berry Assistant. I can help you convert your thoughts or cURL commands into .berry scripts. What would you like to build today?",
    },
  ];

  let query = "";
  let currentWizardState: WizardState = 'IDLE';
  let wizardData = {
    url: '',
    method: 'GET',
    name: ''
  };

  let chatContainer: HTMLElement;

  async function sendMessage() {
    const trimmed = query.trim();
    if (!trimmed) return;

    // Add user message
    messages = [...messages, { role: "user", content: trimmed }];
    const userQuery = trimmed;
    query = "";

    await tick();
    scrollToBottom();

    // Handle Logic
    if (currentWizardState !== 'IDLE') {
      handleWizard(userQuery);
    } else {
      handleGeneralIntent(userQuery);
    }
  }

  function handleGeneralIntent(text: string) {
    const lower = text.toLowerCase();

    // 1. Check for cURL
    if (lower.includes("curl ")) {
      processCurl(text);
      return;
    }

    // 2. Check for "add api"
    if (lower.includes("add api") || lower.includes("new api")) {
      startAddApiWizard();
      return;
    }

    // 3. Default fallback
    addAssistantMessage("I'm not sure how to handle that yet. Try 'add api' or paste a cURL command!");
  }

  function startAddApiWizard() {
    currentWizardState = 'ADD_API_URL';
    addAssistantMessage("Great! Let's add a new API. First, what is the **URL**?");
  }

  function handleWizard(text: string) {
    switch (currentWizardState) {
      case 'ADD_API_URL':
        wizardData.url = text;
        currentWizardState = 'ADD_API_METHOD';
        addAssistantMessage("Got it. What **HTTP Method** should we use? (e.g., GET, POST, PUT, DELETE)");
        break;
      case 'ADD_API_METHOD':
        wizardData.method = text.toUpperCase();
        currentWizardState = 'ADD_API_NAME';
        addAssistantMessage("And how should we **name** this API? (e.g., #getUserById)");
        break;
      case 'ADD_API_NAME':
        wizardData.name = text.startsWith('#') ? text : `#${text}`;
        currentWizardState = 'IDLE';
        finalizeApi();
        break;
    }
  }

  function processCurl(curl: string) {
    // Very basic cURL parser
    const methodMatch = curl.match(/-X\s+(\w+)/i) || curl.match(/--request\s+(\w+)/i);
    const method = methodMatch ? methodMatch[1].toUpperCase() : (curl.includes('--data') || curl.includes('-d') ? 'POST' : 'GET');
    
    // Attempt to extract URL - usually the first thing that looks like a URL after curl
    const urlMatch = curl.match(/https?:\/\/[^\s'"]+/);
    const url = urlMatch ? urlMatch[0] : 'https://api.example.com';

    wizardData = {
      url,
      method,
      name: `#api_${Math.floor(Math.random() * 1000)}`
    };

    addAssistantMessage(`I detected a cURL command! I've parsed it as a **${method}** request to **${url}**. Should I add it? (Type 'yes' or name it like '#myApi')`);
    currentWizardState = 'ADD_API_NAME'; // Skip to name
  }

  function finalizeApi() {
    const codeBlock = `\nApi ${wizardData.method} ${wizardData.name}\nUrl ${wizardData.url}\nHeader\n- Content-Type: 'application/json'\n`;
    
    berryCode.update(current => current + codeBlock);
    
    addAssistantMessage(`Perfect! I've appended the **${wizardData.name}** API to your script. ✨`);
    
    // Reset data
    wizardData = { url: '', method: 'GET', name: '' };
  }

  function addAssistantMessage(content: string) {
    setTimeout(async () => {
      messages = [...messages, { role: "assistant", content }];
      await tick();
      scrollToBottom();
    }, 400);
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

<div class="flex flex-col h-full w-full bg-card/30 backdrop-blur-xl border border-border/40 rounded-3xl overflow-hidden shadow-2xl">
  <!-- Header -->
  <div class="px-6 py-4 border-b border-border/40 flex items-center justify-between bg-muted/20">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm ring-4 ring-primary/5">
        <Sparkles class="w-5 h-5" />
      </div>
      <div>
        <h3 class="text-sm font-bold tracking-tight">Berry Assistant</h3>
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <p class="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">CLI Mode Active</p>
        </div>
      </div>
    </div>
    
    <div class="flex items-center gap-2">
      <Button variant="ghost" size="icon" class="w-8 h-8 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
        <Undo2 class="w-4 h-4" />
      </Button>
    </div>
  </div>

  <!-- Chat Area -->
  <ScrollArea class="flex-1 p-6">
    <div 
      class="flex flex-col space-y-6 pb-4"
      bind:this={chatContainer}
    >
      {#each messages as msg}
        <div class="flex gap-4 {msg.role === 'user' ? 'flex-row-reverse' : ''}">
          <div class={cn(
            "w-9 h-9 shrink-0 rounded-2xl flex items-center justify-center border transition-all duration-500",
            msg.role === 'user' 
              ? 'bg-muted/50 border-border group-hover:scale-110' 
              : 'bg-primary/10 text-primary border-primary/20 shadow-sm'
          )}>
            {#if msg.role === "user"}
              <User class="w-4 h-4 text-foreground" />
            {:else}
              <Bot class="w-4 h-4" />
            {/if}
          </div>
          
          <div class={cn(
            "px-4 py-3 max-w-[85%] text-sm leading-relaxed shadow-sm transition-all duration-300",
            msg.role === 'user'
              ? 'rounded-3xl rounded-tr-none bg-primary/5 border border-primary/10'
              : 'rounded-3xl rounded-tl-none bg-card border border-border/50'
          )}>
            <div class={cn(
              "prose prose-sm dark:prose-invert",
              msg.role === 'assistant' ? 'text-foreground/90' : 'text-foreground'
            )}>
              {@html msg.content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </ScrollArea>

  <!-- Input Area -->
  <div class="p-6 bg-muted/10 border-t border-border/40">
    <div class="flex flex-col gap-4">
      <!-- Quick Actions -->
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar">
        <Button
          variant="outline"
          size="sm"
          class="h-8 text-[11px] rounded-xl whitespace-nowrap border-border/60 bg-card/50 hover:bg-primary/5 hover:border-primary/30 transition-all font-semibold"
          on:click={() => triggerQuickAction("Add API")}
        >
          <Database class="w-3.5 h-3.5 mr-2 opacity-70" /> Add New API
        </Button>
        <Button
          variant="outline"
          size="sm"
          class="h-8 text-[11px] rounded-xl whitespace-nowrap border-border/60 bg-card/50 hover:bg-primary/5 hover:border-primary/30 transition-all font-semibold"
          on:click={() => triggerQuickAction("paste a cURL command")}
        >
          <Code class="w-3.5 h-3.5 mr-2 opacity-70" /> Paste cURL
        </Button>
      </div>

      <!-- Main Input -->
      <div class="relative group">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/0 rounded-[20px] blur opacity-0 group-focus-within:opacity-100 transition duration-1000"></div>
        <div class="relative flex items-center gap-2">
          <Input
            bind:value={query}
            on:keydown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={currentWizardState === 'IDLE' ? "Tell Berry what to add..." : "Typing answer..."}
            class="pr-12 bg-card border-border/60 rounded-2xl h-14 focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xl text-sm placeholder:text-muted-foreground/40 transition-all hover:border-primary/30"
          />
          <Button
            size="icon"
            variant="ghost"
            class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 text-muted-foreground hover:text-primary transition-all rounded-xl"
            on:click={sendMessage}
          >
            <SendHorizontal class="w-5 h-5" />
          </Button>
        </div>
      </div>
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
