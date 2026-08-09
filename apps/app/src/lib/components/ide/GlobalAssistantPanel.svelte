<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { db } from "$lib/db/db";
  import { activeWorkspaceId } from "$lib/writable/workspace.store";
  import {
    dashboardSearchQuery,
    dashboardCurrentFolderId,
    assistantOpen,
  } from "$lib/writable/assistant.store";
  import { berryBlocks } from "$lib/writable/berry.store";
  import { parseFileContext, getFile } from "$lib/writable/File";
  import { auth } from "$lib/firebase";
  import { saasApiClient } from "$lib/services/saasApiClient";
  import { toast } from "svelte-sonner";
  import { afterUpdate } from "svelte";
  import {
    Sparkles,
    SendHorizontal,
    Globe,
    CheckSquare,
    Terminal,
    X,
    FileText,
    Copy,
    LogOut,
    Home,
    Plus,
    Search,
    ChevronRight,
    Bot,
  } from "lucide-svelte";

  interface Message {
    id: string;
    sender: "user" | "bot";
    text: string;
    generatedBerry?: string;
  }

  let query = "";
  let messages: Message[] = [];
  let chatContainer: HTMLElement;
  let isAiThinking = false;
  let activeSessionId: string | undefined = undefined;

  // Reactively track pathname, route id and file tabs parameter
  $: pathname = $page.url.pathname;
  $: routeId = $page.route.id;
  $: tabsParam = $page.params.tabs ?? "";
  $: isBerryFile = tabsParam.endsWith(".berry");

  // Determine current active page context
  $: context = (() => {
    if (routeId === "/profile") return "profile";
    if (tabsParam) {
      return isBerryFile ? "editor" : "viewer";
    }
    if (routeId === "/" || pathname === "/") return "dashboard";
    return "general";
  })();

  // Reset messages when switching context
  $: {
    const ctxVal = context;
    messages = [
      {
        id: "welcome",
        sender: "bot",
        text: getWelcomeMessage(ctxVal),
      },
    ];
  }

  afterUpdate(() => {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });

  function getWelcomeMessage(ctxType: string): string {
    switch (ctxType) {
      case "dashboard":
        return "Hi! I am your Flexiberry AI Copilot. Ask me anything or try: **create file demo.berry**, **create folder Tests**, or **search demo**.";
      case "editor":
        return "Hi! I am your Notebook Copilot. Ask me to generate API test suites or try **Add API**, **Add Task**, or paste a **cURL** command.";
      case "viewer":
        return "Hi! I am your File Viewer Assistant. Ask me to summarize or check your file content!";
      case "profile":
        return "Hi! I am your Settings Assistant. Try typing **logout** or **go home**.";
      default:
        return "Hi! I am the Flexiberry AI Copilot. How can I help you write or test APIs today?";
    }
  }

  async function sendMessage() {
    const text = query.trim();
    if (!text) return;
    query = "";

    // Add user message
    messages = [...messages, { id: Math.random().toString(), sender: "user", text }];

    // First try local command intents
    const localReply = await handleLocalIntent(text, context);
    if (localReply) {
      messages = [...messages, { id: Math.random().toString(), sender: "bot", text: localReply }];
      return;
    }

    // Delegate to Cloudflare LangGraph AI Copilot Agent backend!
    isAiThinking = true;
    try {
      const res = await saasApiClient.sendCopilotMessage(text, activeSessionId);
      activeSessionId = res.sessionId;
      messages = [
        ...messages,
        {
          id: Math.random().toString(),
          sender: "bot",
          text: res.reply,
          generatedBerry: res.generatedBerry,
        },
      ];
    } catch (err: any) {
      messages = [
        ...messages,
        {
          id: Math.random().toString(),
          sender: "bot",
          text: `⚠️ **AI Copilot Alert**: ${err.message}`,
        },
      ];
    } finally {
      isAiThinking = false;
    }
  }

  async function handleLocalIntent(text: string, ctxType: string): Promise<string | null> {
    const lower = text.toLowerCase().trim();

    if (ctxType === "dashboard") {
      if (lower.startsWith("create file ") || lower.startsWith("new file ")) {
        const name = text.replace(/^(create file|new file)\s+/i, "").trim();
        if (!name) return "Please specify a file name. Example: **create file test.berry**.";
        const finalName = name.endsWith(".berry") ? name : `${name}.berry`;
        try {
          await db.fileStore.add({
            id: finalName,
            name: finalName,
            data: new Blob([""], { type: "text/plain" }),
            createdAt: new Date(),
            folderId: $dashboardCurrentFolderId,
            workspaceId: $activeWorkspaceId,
          } as any);
          toast.success(`File ${finalName} created`);
          return `Successfully created file \`${finalName}\` inside the active workspace.`;
        } catch (e) {
          return "Failed to create file in database.";
        }
      }

      if (lower.startsWith("create folder ") || lower.startsWith("new folder ")) {
        const name = text.replace(/^(create folder|new folder)\s+/i, "").trim();
        if (!name) return "Please specify a folder name. Example: **create folder Tests**.";
        const newId = `folder-${Date.now()}`;
        try {
          await db.folderTable.add({
            id: newId,
            workspaceId: $activeWorkspaceId,
            data: [
              {
                name: name,
                type: "dir",
                expand: false,
                remove: false,
                uid: newId,
                rename: false,
                subfolders: [],
              },
            ],
          });
          toast.success(`Folder ${name} created`);
          return `Successfully created folder \`${name}\` inside the active workspace.`;
        } catch (e) {
          return "Failed to create folder.";
        }
      }

      if (lower.startsWith("search ")) {
        const queryVal = text.replace(/^search\s+/i, "").trim();
        dashboardSearchQuery.set(queryVal);
        return `Workspace search query updated to: "${queryVal}".`;
      }
    }

    if (ctxType === "editor") {
      if (lower.includes("curl ")) {
        return processCurl(text);
      }

      const createId = () => Math.random().toString(36).substr(2, 9);

      if (lower === "add api" || lower === "new api" || lower === "create api") {
        berryBlocks.update((blocks) => [
          ...blocks,
          { id: createId(), type: "Api", content: "", viewMode: "wizard" },
        ]);
        toast.success("Started API Wizard");
        return "Added an API block to your notebook stack.";
      }
    }

    if (lower === "logout" || lower === "sign out") {
      try {
        await auth.signOut();
        toast.success("Signed out");
        return "Signed out successfully.";
      } catch {
        return "Error signing out.";
      }
    }

    if (lower === "go home" || lower === "dashboard") {
      goto("/");
      return "Navigating to workspace dashboard...";
    }

    // Return null to fall back to Cloudflare LangGraph AI Copilot
    return null;
  }

  function processCurl(curl: string): string {
    const methodMatch = curl.match(/-X\s+(\w+)/i) || curl.match(/--request\s+(\w+)/i);
    const method = methodMatch ? methodMatch[1].toUpperCase() : curl.includes("-d") ? "POST" : "GET";
    const urlMatch = curl.match(/https?:\/\/[^\s'"]+/);
    const url = urlMatch ? urlMatch[0] : "https://api.example.com";
    const createId = () => Math.random().toString(36).substr(2, 9);

    berryBlocks.update((blocks) => [
      ...blocks,
      {
        id: createId(),
        type: "Api",
        content: `Api ${method} #newApi\nUrl ${url}`,
      },
    ]);
    toast.success(`Added ${method} API block from cURL`);
    return `Parsed cURL command successfully. Added **${method} API** block to stack.`;
  }

  function triggerQuickAction(actionText: string) {
    query = actionText;
    sendMessage();
  }
</script>

<div
  class="fixed right-0 top-0 bottom-7 w-full sm:w-[380px] z-40 border-l border-border/50 bg-card/95 backdrop-blur-md shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-right duration-300"
>
  <!-- Panel Header -->
  <div class="p-4 border-b border-border/40 flex items-center justify-between">
    <div class="flex items-center gap-3 select-none">
      <div
        class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm"
      >
        <Sparkles class="w-4 h-4" />
      </div>
      <div class="flex flex-col">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold tracking-tight">Flexiberry AI Copilot</span>
          <span
            class="text-[9px] font-black uppercase tracking-tighter bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20"
          >
            {context.toUpperCase()}
          </span>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="p-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-all cursor-pointer"
      on:click={() => assistantOpen.set(false)}
    >
      <X class="w-4 h-4" strokeWidth={2} />
    </button>
  </div>

  <!-- AI Copilot Active Status Banner -->
  <div class="px-4 py-2 bg-emerald-500/10 border-b border-border/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 shrink-0 select-none">
    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
    <span>Cloudflare LangGraph JS AI Copilot Connected</span>
  </div>

  <!-- Panel Body / Message list -->
  <div
    bind:this={chatContainer}
    class="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
  >
    {#each messages as msg (msg.id)}
      <div
        class="flex flex-col gap-1.5 max-w-[85%] {msg.sender === 'user'
          ? 'self-end items-end'
          : 'self-start items-start'}"
      >
        <span class="text-[9px] text-muted-foreground/50 font-bold uppercase"
          >{msg.sender === "user" ? "You" : "Copilot"}</span
        >
        <div
          class="p-3 text-xs font-medium leading-relaxed rounded-2xl {msg.sender ===
          'user'
            ? 'bg-primary text-primary-foreground rounded-tr-none'
            : 'bg-muted text-foreground border border-border/40 rounded-tl-none'}"
        >
          {@html msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\`(.*?)\`/g, "<code class='bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono'>$1</code>")}

          {#if msg.generatedBerry}
            <div class="mt-2 p-2 bg-gray-950 border border-gray-800 rounded font-mono text-[11px] text-emerald-300 overflow-x-auto">
              <pre>{msg.generatedBerry}</pre>
            </div>
          {/if}
        </div>
      </div>
    {/each}

    {#if isAiThinking}
      <div class="flex items-center gap-2 text-xs text-muted-foreground animate-pulse p-2">
        <Bot class="w-4 h-4 text-primary animate-spin" />
        <span>LangGraph AI Copilot is thinking...</span>
      </div>
    {/if}
  </div>

  <!-- Input Field -->
  <div class="p-3 border-t border-border/40 bg-card">
    <form on:submit|preventDefault={sendMessage} class="flex items-center gap-2">
      <input
        type="text"
        bind:value={query}
        placeholder="Ask AI Copilot to generate or debug .berry code..."
        class="flex-1 px-3 py-2 bg-muted/50 border border-border/50 rounded-lg text-xs focus:outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={isAiThinking || !query.trim()}
        class="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition"
      >
        <SendHorizontal class="w-4 h-4" />
      </button>
    </form>
  </div>
</div>
