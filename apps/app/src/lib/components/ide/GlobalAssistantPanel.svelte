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
  } from "lucide-svelte";

  interface Message {
    id: string;
    sender: "user" | "bot";
    text: string;
  }

  let query = "";
  let messages: Message[] = [];
  let chatContainer: HTMLElement;

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
        return "Hi! I am your Workspace Assistant. I can help you manage files and folders, or search your workspace. Try typing: **create file demo.berry**, **create folder Tests**, or **search demo**.";
      case "editor":
        return "Hi! I am your Notebook Assistant. I can help you build and configure notebook blocks for this file. Try commands like **Add API** or paste a **cURL** command.";
      case "viewer":
        return "Hi! I am your File Viewer Assistant. I can help you analyze, summarize, or copy the contents of this file. Try typing **summarize** or **copy**.";
      case "profile":
        return "Hi! I am your Settings Assistant. I can help you manage your profile or sign out. Try typing **logout** or **go home**.";
      default:
        return "Hi! I am the Flexiberry Assistant. How can I help you today?";
    }
  }

  async function sendMessage() {
    const text = query.trim();
    if (!text) return;
    query = "";

    // Add user message
    messages = [...messages, { id: Math.random().toString(), sender: "user", text }];

    // Handle intent based on context
    const reply = await handleIntent(text, context);

    // Add bot reply
    messages = [...messages, { id: Math.random().toString(), sender: "bot", text: reply }];
  }

  async function handleIntent(text: string, ctxType: string): Promise<string> {
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
          return "Failed to create folder. Database schema might not be ready.";
        }
      }

      if (lower.startsWith("search ")) {
        const queryVal = text.replace(/^search\s+/i, "").trim();
        dashboardSearchQuery.set(queryVal);
        return `Workspace search query updated to: "${queryVal}".`;
      }

      if (lower === "clear search" || lower === "show all" || lower === "show all files") {
        dashboardSearchQuery.set("");
        return "Search filter cleared. Showing all files and folders.";
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
        return "Added an API block to your notebook stack. Configure it inline!";
      }

      if (lower === "add var" || lower === "new var" || lower === "create var") {
        berryBlocks.update((blocks) => [
          ...blocks,
          { id: createId(), type: "Var", content: "", viewMode: "wizard" },
        ]);
        toast.success("Started Var Wizard");
        return "Added a Variable block to your notebook stack.";
      }

      if (lower === "add env" || lower === "new env" || lower === "create env") {
        berryBlocks.update((blocks) => [
          ...blocks,
          { id: createId(), type: "Env", content: "", viewMode: "wizard" },
        ]);
        toast.success("Started Env Wizard");
        return "Added an Environment block to your notebook stack.";
      }

      if (lower === "add task" || lower === "new task" || lower === "create task") {
        berryBlocks.update((blocks) => [
          ...blocks,
          { id: createId(), type: "Task", content: "", viewMode: "wizard" },
        ]);
        toast.success("Started Task Wizard");
        return "Added a Task block scenario sequence.";
      }

      if (lower === "add link" || lower === "new link" || lower === "create link") {
        berryBlocks.update((blocks) => [
          ...blocks,
          { id: createId(), type: "Link", content: "Link ", viewMode: "wizard" },
        ]);
        toast.success("Started Link Wizard");
        return "Added a Link block connection.";
      }

      if (lower === "add input" || lower === "new input" || lower === "create input") {
        berryBlocks.update((blocks) => [
          ...blocks,
          { id: createId(), type: "Input", content: "Input ", viewMode: "wizard" },
        ]);
        toast.success("Started Input Wizard");
        return "Added an Input block reference.";
      }
    }

    if (ctxType === "viewer") {
      const fileCtx = parseFileContext($page.params.tabs ?? "");
      if (lower === "summarize" || lower === "analyze") {
        try {
          const content = await getFile(fileCtx);
          return generateSummary(fileCtx.fileName, content);
        } catch (e) {
          return "Could not retrieve the file content to summarize.";
        }
      }

      if (lower === "copy" || lower === "copy content" || lower === "copy file") {
        try {
          const content = await getFile(fileCtx);
          if (typeof navigator !== "undefined" && navigator.clipboard) {
            await navigator.clipboard.writeText(content);
            toast.success("Copied to clipboard");
            return "File content copied to clipboard successfully!";
          }
          return "Clipboard API not available.";
        } catch (e) {
          return "Could not read file content to copy.";
        }
      }
    }

    if (ctxType === "profile") {
      if (lower === "logout" || lower === "signout" || lower === "sign out") {
        try {
          await auth.signOut();
          toast.success("Signed out");
          return "Signing you out of Flexiberry. Thank you!";
        } catch (e) {
          return "Error signing out.";
        }
      }

      if (lower === "go home" || lower === "dashboard" || lower === "go to dashboard") {
        goto("/");
        return "Navigating to dashboard...";
      }
    }

    if (lower === "go home" || lower === "dashboard") {
      goto("/");
      return "Navigating to dashboard...";
    }

    // Default Fallback messages
    if (ctxType === "dashboard") {
      return "Command not recognized. Try 'create file tests.berry', 'create folder SubDir', or 'search index'.";
    }
    if (ctxType === "editor") {
      return "Command not recognized. Try 'Add API', 'Add Task', 'Add Link', 'Add Input', or paste cURL.";
    }
    if (ctxType === "viewer") {
      return "Command not recognized. Try 'summarize' or 'copy'.";
    }
    if (ctxType === "profile") {
      return "Command not recognized. Try 'logout' or 'go home'.";
    }

    return "I'm sorry, I don't recognize that command. Type **go home** to return to the workspace dashboard.";
  }

  function processCurl(curl: string): string {
    const methodMatch = curl.match(/-X\s+(\w+)/i) || curl.match(/--request\s+(\w+)/i);
    const method = methodMatch
      ? methodMatch[1].toUpperCase()
      : curl.includes("--data") || curl.includes("-d")
        ? "POST"
        : "GET";
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
    return `Parsed cURL command successfully. Added a new **${method} API** block to your notebook stack.`;
  }

  function generateSummary(fileName: string, content: string): string {
    if (!content.trim()) return `The file \`${fileName}\` is empty.`;
    const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
    const lineCount = lines.length;
    const wordCount = content.split(/\s+/).filter(Boolean).length;

    let summary = `**File Analysis: \`${fileName}\`**\n\n`;
    summary += `- **Total Lines**: ${lineCount}\n`;
    summary += `- **Total Words**: ${wordCount}\n\n`;

    const headings = lines.filter(l => l.startsWith("#"));
    if (headings.length > 0) {
      summary += `**Main Sections found**:\n`;
      headings.slice(0, 5).forEach(h => {
        summary += `- ${h.replace(/^#+\s*/, "")}\n`;
      });
    } else {
      summary += `**Content Preview**:\n`;
      lines.slice(0, 3).forEach(l => {
        summary += `> ${l.length > 60 ? l.substring(0, 60) + "..." : l}\n`;
      });
    }
    return summary;
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
          <span class="text-xs font-bold tracking-tight">AI Assistant</span>
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

  <!-- AI Warning Status Banner -->
  <div class="px-4 py-2 bg-amber-500/10 border-b border-border/20 text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2 shrink-0 select-none">
    <div class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0"></div>
    <span>AI Generation is currently disabled. Quick Actions are active.</span>
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
          >{msg.sender === "user" ? "You" : "Assistant"}</span
        >
        <div
          class="p-3 text-xs font-medium leading-relaxed rounded-2xl {msg.sender ===
          'user'
            ? 'bg-primary text-primary-foreground rounded-tr-none'
            : 'bg-muted text-foreground border border-border/40 rounded-tl-none'}"
        >
          {@html msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\`(.*?)\`/g, "<code class='bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono'>$1</code>")}
        </div>
      </div>
    {/each}

    <!-- Contextual Quick starters -->
    <div class="flex flex-col gap-2 mt-4 shrink-0">
      <span
        class="text-[9px] font-black uppercase tracking-wider text-muted-foreground/50 px-1"
        >Context Actions</span
      >

      {#if context === "dashboard"}
        <button
          type="button"
          class="w-full flex items-center justify-between p-3 bg-card hover:bg-primary/5 border border-border/50 rounded-xl transition-all duration-200 text-left cursor-pointer"
          on:click={() => triggerQuickAction("create file untitled.berry")}
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary"
            >
              <Plus class="w-3.5 h-3.5" />
            </div>
            <span class="text-xs font-bold text-foreground">Create New File</span>
          </div>
          <ChevronRight class="w-4 h-4 text-muted-foreground/40" />
        </button>

        <button
          type="button"
          class="w-full flex items-center justify-between p-3 bg-card hover:bg-primary/5 border border-border/50 rounded-xl transition-all duration-200 text-left cursor-pointer"
          on:click={() => triggerQuickAction("create folder NewFolder")}
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary"
            >
              <Plus class="w-3.5 h-3.5" />
            </div>
            <span class="text-xs font-bold text-foreground"
              >Create New Folder</span
            >
          </div>
          <ChevronRight class="w-4 h-4 text-muted-foreground/40" />
        </button>

        <button
          type="button"
          class="w-full flex items-center justify-between p-3 bg-card hover:bg-primary/5 border border-border/50 rounded-xl transition-all duration-200 text-left cursor-pointer"
          on:click={() => triggerQuickAction("clear search")}
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary"
            >
              <Search class="w-3.5 h-3.5" />
            </div>
            <span class="text-xs font-bold text-foreground"
              >Clear Search Filter</span
            >
          </div>
          <ChevronRight class="w-4 h-4 text-muted-foreground/40" />
        </button>
      {:else}
        <!-- editor context -->
        {#if context === "editor"}
          <button
            type="button"
            class="w-full flex items-center justify-between p-3 bg-card hover:bg-emerald-500/5 border border-border/50 rounded-xl transition-all duration-200 text-left cursor-pointer"
            on:click={() => triggerQuickAction("Add API")}
          >
            <div class="flex items-center gap-2.5">
              <div
                class="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500"
              >
                <Globe class="w-3.5 h-3.5" />
              </div>
              <span class="text-xs font-bold text-foreground"
                >Create HTTP Block</span
              >
            </div>
            <ChevronRight class="w-4 h-4 text-muted-foreground/40" />
          </button>

          <button
            type="button"
            class="w-full flex items-center justify-between p-3 bg-card hover:bg-blue-500/5 border border-border/50 rounded-xl transition-all duration-200 text-left cursor-pointer"
            on:click={() => triggerQuickAction("Add Task")}
          >
            <div class="flex items-center gap-2.5">
              <div
                class="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center text-blue-500"
              >
                <CheckSquare class="w-3.5 h-3.5" />
              </div>
              <span class="text-xs font-bold text-foreground"
                >Create Task Scenario</span
              >
            </div>
            <ChevronRight class="w-4 h-4 text-muted-foreground/40" />
          </button>

          <button
            type="button"
            class="w-full flex items-center justify-between p-3 bg-card hover:bg-amber-500/5 border border-border/50 rounded-xl transition-all duration-200 text-left cursor-pointer"
            on:click={() => {
              query =
                "curl -X POST https://api.example.com/v1/users -d '{\"name\":\"Rintu\"}'";
            }}
          >
            <div class="flex items-center gap-2.5">
              <div
                class="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center text-amber-500"
              >
                <Terminal class="w-3.5 h-3.5" />
              </div>
              <span class="text-xs font-bold text-foreground"
                >Paste sample cURL</span
              >
            </div>
            <ChevronRight class="w-4 h-4 text-muted-foreground/40" />
          </button>
        {:else if context === "viewer"}
          <button
            type="button"
            class="w-full flex items-center justify-between p-3 bg-card hover:bg-indigo-500/5 border border-border/50 rounded-xl transition-all duration-200 text-left cursor-pointer"
            on:click={() => triggerQuickAction("summarize")}
          >
            <div class="flex items-center gap-2.5">
              <div
                class="w-6 h-6 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-500"
              >
                <FileText class="w-3.5 h-3.5" />
              </div>
              <span class="text-xs font-bold text-foreground"
                >Summarize File</span
              >
            </div>
            <ChevronRight class="w-4 h-4 text-muted-foreground/40" />
          </button>

          <button
            type="button"
            class="w-full flex items-center justify-between p-3 bg-card hover:bg-indigo-500/5 border border-border/50 rounded-xl transition-all duration-200 text-left cursor-pointer"
            on:click={() => triggerQuickAction("copy")}
          >
            <div class="flex items-center gap-2.5">
              <div
                class="w-6 h-6 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-500"
              >
                <Copy class="w-3.5 h-3.5" />
              </div>
              <span class="text-xs font-bold text-foreground"
                >Copy File Content</span
              >
            </div>
            <ChevronRight class="w-4 h-4 text-muted-foreground/40" />
          </button>
        {:else if context === "profile"}
          <button
            type="button"
            class="w-full flex items-center justify-between p-3 bg-card hover:bg-red-500/5 border border-border/50 rounded-xl transition-all duration-200 text-left cursor-pointer"
            on:click={() => triggerQuickAction("logout")}
          >
            <div class="flex items-center gap-2.5">
              <div
                class="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center text-red-500"
              >
                <LogOut class="w-3.5 h-3.5" />
              </div>
              <span class="text-xs font-bold text-foreground">Sign Out</span>
            </div>
            <ChevronRight class="w-4 h-4 text-muted-foreground/40" />
          </button>

          <button
            type="button"
            class="w-full flex items-center justify-between p-3 bg-card hover:bg-primary/5 border border-border/50 rounded-xl transition-all duration-200 text-left cursor-pointer"
            on:click={() => triggerQuickAction("go home")}
          >
            <div class="flex items-center gap-2.5">
              <div
                class="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary"
              >
                <Home class="w-3.5 h-3.5" />
              </div>
              <span class="text-xs font-bold text-foreground"
                >Go to Dashboard</span
              >
            </div>
            <ChevronRight class="w-4 h-4 text-muted-foreground/40" />
          </button>
        {:else}
          <button
            type="button"
            class="w-full flex items-center justify-between p-3 bg-card hover:bg-primary/5 border border-border/50 rounded-xl transition-all duration-200 text-left cursor-pointer"
            on:click={() => triggerQuickAction("go home")}
          >
            <div class="flex items-center gap-2.5">
              <div
                class="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary"
              >
                <Home class="w-3.5 h-3.5" />
              </div>
              <span class="text-xs font-bold text-foreground"
                >Go to Dashboard</span
              >
            </div>
            <ChevronRight class="w-4 h-4 text-muted-foreground/40" />
          </button>
        {/if}
      {/if}
    </div>
  </div>

  <!-- Bottom Input Capsule -->
  <div class="p-4 border-t border-border/30 bg-background/50 backdrop-blur-md shrink-0">
    <div
      class="flex items-center bg-card dark:bg-[#141b2b]/95 border border-border/80 shadow-lg rounded-full px-3 py-1.5 w-full h-11 transition-all duration-300"
    >
      <div
        class="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm shrink-0 mr-2.5"
      >
        <Sparkles class="w-3.5 h-3.5" />
      </div>

      <input
        type="text"
        bind:value={query}
        on:keydown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Describe changes or type command..."
        class="bg-transparent border-none outline-none focus:outline-none focus:ring-0 w-full h-full text-xs font-semibold text-foreground placeholder:text-muted-foreground/40 flex-grow"
      />

      <button
        type="button"
        class="w-7 h-7 rounded-full bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-all shadow-sm active:scale-90 shrink-0 ml-1.5 cursor-pointer border border-primary/20"
        on:click={sendMessage}
      >
        <SendHorizontal class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</div>
