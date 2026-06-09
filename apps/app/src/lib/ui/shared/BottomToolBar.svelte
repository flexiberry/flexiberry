<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { parseFileContext } from "$lib/writable/File";
  import { db } from "$lib/db/db";
  import { activeWorkspaceId } from "$lib/writable/workspace.store";
  import { liveQuery } from "dexie";
  import {
    Settings,
    FileCode,
    FileText,
    Folder,
    Terminal,
    ExternalLink,
    HelpCircle,
  } from "lucide-svelte";
  import { toast } from "svelte-sonner";

  // 1. Connection Status
  let isOnline = true;
  onMount(() => {
    isOnline = navigator.onLine;
    const goOnline = () => {
      isOnline = true;
    };
    const goOffline = () => {
      isOnline = false;
    };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  });

  // 2. Active Workspace Query
  $: workspaceQuery = liveQuery(() => db.workspaces.get($activeWorkspaceId));
  $: activeWorkspace = $workspaceQuery;

  // 3. Active File Parse
  $: ctx = parseFileContext($page.params.tabs ?? "");
  $: isBerryFile = ctx.fileName?.endsWith(".berry");

  function openSettings() {
    toast.info("Settings menu is currently under construction.", {
      description:
        "Custom keybinds and runner configuration options will be available soon.",
    });
  }

  function showShortcuts() {
    toast("Keyboard Shortcuts", {
      description:
        "Ctrl+S: Save file • Ctrl+P: Command palette • Alt+R: Run node stack",
      duration: 5000,
    });
  }
</script>

<div
  class="flex items-center justify-between w-full h-full px-2 text-[11px] text-muted-foreground select-none font-medium"
>
  <!-- LEFT: Connection, Workspace, Active File -->
  <div class="flex items-center gap-3">
    <!-- Network Indicator -->
    <div
      class="flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-muted/50 cursor-default transition-colors"
    >
      {#if isOnline}
        <span class="relative flex h-2 w-2">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
          ></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"
          ></span>
        </span>
        <span
          class="text-xs font-semibold text-emerald-600 dark:text-emerald-400"
          >Connected</span
        >
      {:else}
        <span class="relative flex h-2 w-2">
          <span class="relative inline-flex rounded-full h-2 w-2 bg-destructive"
          ></span>
        </span>
        <span class="text-xs font-semibold text-destructive">Offline</span>
      {/if}
    </div>

    <div class="w-[1px] h-3 bg-border"></div>

    <!-- Active Workspace -->
    {#if activeWorkspace}
      <div
        class="flex items-center gap-1.5 hover:bg-muted/50 px-1.5 py-0.5 rounded cursor-default transition-colors"
        title="Active Workspace"
      >
        <span>{activeWorkspace.emoji}</span>
        <span class="font-bold text-foreground">{activeWorkspace.name}</span>
      </div>
    {:else}
      <div
        class="flex items-center gap-1.5 hover:bg-muted/50 px-1.5 py-0.5 rounded cursor-default transition-colors"
      >
        <Folder size={12} />
        <span class="font-bold">Default Workspace</span>
      </div>
    {/if}

    <!-- Active File (if present) -->
    {#if ctx.fileName}
      <div class="w-[1px] h-3 bg-border"></div>
      <div
        class="flex items-center gap-1.5 hover:bg-muted/50 px-1.5 py-0.5 rounded cursor-default transition-colors"
        title="Currently Editing File"
      >
        {#if isBerryFile}
          <FileCode size={12} class="text-primary" />
          <span class="text-foreground">{ctx.fileName}</span>
          <span
            class="text-[9px] bg-primary/20 text-primary px-1 rounded font-bold uppercase tracking-wider scale-90"
            >Berry</span
          >
        {:else}
          <FileText size={12} class="text-indigo-400" />
          <span class="text-foreground">{ctx.fileName}</span>
          <span
            class="text-[9px] bg-indigo-500/20 text-indigo-400 px-1 rounded font-bold uppercase tracking-wider scale-90"
            >Asset</span
          >
        {/if}
      </div>
    {/if}
  </div>

  <!-- RIGHT: Svelte stats, Docs, Shortcuts, Settings -->
  <div class="flex items-center gap-3">
    <!-- Framework label -->
    <div
      class="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground/60"
    >
      <Terminal size={10} />
      <span>Flexiberry CLI v{CORE_VERSION}</span>
    </div>

    <div class="hidden sm:block w-[1px] h-3 bg-border"></div>

    <!-- Shortcuts Info -->
    <button
      class="flex items-center gap-1 hover:text-foreground hover:bg-muted/50 px-1.5 py-0.5 rounded transition-colors text-[11px]"
      on:click={showShortcuts}
    >
      <HelpCircle size={12} />
      <span>Shortcuts</span>
    </button>

    <!-- Docs link -->
    <a
      href="https://docs.flexiberry.dev"
      target="_blank"
      rel="noreferrer"
      class="flex items-center gap-1 hover:text-foreground hover:bg-muted/50 px-1.5 py-0.5 rounded transition-colors text-[11px]"
    >
      <span>Docs</span>
      <ExternalLink size={10} />
    </a>

    <!-- Settings Button -->
    <button
      class="flex items-center gap-1 hover:text-foreground hover:bg-muted/50 px-1.5 py-0.5 rounded transition-colors text-[11px]"
      on:click={openSettings}
    >
      <Settings size={12} />
      <span>Settings</span>
    </button>
  </div>
</div>
