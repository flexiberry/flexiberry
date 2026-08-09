<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import {
    Search,
    Home,
    ChevronRight,
    Layers,
    Clock,
    FileCode2,
    Pencil,
    Folder as FolderIcon,
    FilePlus2,
    FolderPlus,
    ArrowLeft,
    Cloud,
    Activity,
  } from "lucide-svelte";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import WorkspaceSwitcher from "$lib/components/dashboard/WorkspaceSwitcher.svelte";
  import CloudMonitoringModal from "$lib/components/dashboard/CloudMonitoringModal.svelte";
  import { syncActiveWorkspaceToCloud } from "$lib/services/workspaceSync";

  export let scrollY: number;
  export let currentFolderId: string | null;
  export let folderName: string;
  export let searchQuery: string;
  export let isEditingFolder: boolean;
  export let editingFolderName: string;
  export let folderInputEl: HTMLInputElement;

  const dispatch = createEventDispatcher();

  let showMonitoringModal = false;
  let isSyncing = false;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  function handleCreateFolder() {
    dispatch("createFolder");
  }
  function handleCreateFile() {
    dispatch("createFile");
  }
  function saveFolderName() {
    dispatch("saveFolderName");
  }
  function startEditingFolder() {
    dispatch("startEditingFolder");
  }
  function navigateBack() {
    currentFolderId = null;
  }

  async function handleCloudSync() {
    isSyncing = true;
    await syncActiveWorkspaceToCloud();
    isSyncing = false;
  }
</script>

<CloudMonitoringModal open={showMonitoringModal} onClose={() => (showMonitoringModal = false)} />

<!-- Merged Compact Dashboard Header -->
<!-- Row 1 collapses cleanly on scroll; Row 2 (toolbar) is always visible -->
<div class="flex flex-col gap-3 will-change-[opacity,max-height,transform]">
  <!-- ─── Collapsible Context Row ────────────────────────── -->
  <div
    class="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] {scrollY >
    60
      ? 'max-h-0 opacity-0 pointer-events-none'
      : 'max-h-40 opacity-100'}"
  >
    <div class="flex items-center justify-between">
      <!-- Left: Greeting + Date -->
      <div class="flex flex-col gap-0.5">
        <div class="flex items-center gap-2">
          <span
            class="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1.5"
          >
            <Layers class="w-3 h-3" />
            {currentFolderId ? "Directory" : "Workspace"}
          </span>
          <span
            class="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-px"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
            ></span>
            Active
          </span>
        </div>
        <h1
          class="text-xl font-bold tracking-tight leading-tight {currentFolderId
            ? 'text-primary'
            : 'text-foreground'} transition-colors duration-300"
        >
          {currentFolderId ? folderName : greeting + ", Developer"}
        </h1>
        <p
          class="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5"
        >
          <Clock class="w-3 h-3 shrink-0" />
          {today}
          <span class="opacity-30">·</span>
          <span
            >{currentFolderId
              ? `Inside ${folderName}`
              : "Flexiberry Workspace"}</span
          >
        </p>
      </div>

      <!-- Right: Stat Chips -->
      <div class="hidden sm:flex items-center gap-2 self-start mt-0.5">
        <button
          on:click={handleCloudSync}
          disabled={isSyncing}
          class="flex items-center gap-1.5 text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2.5 py-1.5 backdrop-blur-sm hover:bg-indigo-500/20 transition"
        >
          <Cloud class="w-3.5 h-3.5 text-indigo-400 {isSyncing ? 'animate-bounce' : ''}" />
          {isSyncing ? "Syncing..." : "Cloud Sync"}
        </button>

        <button
          on:click={() => (showMonitoringModal = true)}
          class="flex items-center gap-1.5 text-xs font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-lg px-2.5 py-1.5 backdrop-blur-sm hover:bg-purple-500/20 transition"
        >
          <Activity class="w-3.5 h-3.5 text-purple-400" />
          Cloud Monitoring
        </button>
      </div>
    </div>
  </div>

  <!-- ─── Sticky Toolbar Row (always visible) ────────────── -->
  <div class="flex items-center gap-2">
    <!-- Path Navigator -->
    <div
      class="flex items-center ring-1 ring-primary/5 gap-1 bg-muted/30 border border-border/40 rounded-lg px-2 h-9 backdrop-blur-sm text-sm font-medium overflow-hidden shrink-0"
    >
      {#if currentFolderId}
        <button
          class="flex items-center justify-center h-6 w-6 rounded-md hover:bg-muted transition-colors shrink-0"
          on:click={navigateBack}
          title="Back to root"
        >
          <ArrowLeft class="w-3.5 h-3.5 text-foreground/70" />
        </button>
        <span class="text-border/60 select-none mx-0.5">|</span>
      {/if}

      <WorkspaceSwitcher />

      {#if currentFolderId}
        <ChevronRight class="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />

        {#if isEditingFolder}
          <input
            bind:this={folderInputEl}
            bind:value={editingFolderName}
            on:keydown={(e) => {
              if (e.key === "Enter") saveFolderName();
              if (e.key === "Escape") isEditingFolder = false;
            }}
            on:blur={saveFolderName}
            class="h-6 px-2 text-sm font-semibold text-foreground bg-background border border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary rounded-md w-[140px] shadow-sm"
          />
        {:else}
          <button
            class="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-foreground bg-muted/60 hover:bg-muted transition-colors group"
            on:click={startEditingFolder}
            title="Click to rename"
          >
            <FolderIcon
              class="w-3.5 h-3.5 text-primary shrink-0"
              fill="currentColor"
              fill-opacity="0.18"
            />
            <span class="whitespace-nowrap truncate max-w-[120px]"
              >{folderName}</span
            >
            <Pencil
              class="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors shrink-0"
            />
          </button>
        {/if}
      {/if}
    </div>

    <!-- Search Input (flex-grow) -->
    <div class="relative group flex-1">
      <div
        class="absolute inset-0 bg-primary/6 blur-xl rounded-full transition-opacity group-focus-within:opacity-100 opacity-50 z-0"
      ></div>
      <Search
        class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40  group-focus-within:text-primary transition-colors z-20 pointer-events-none"
      />
      <Input
        bind:value={searchQuery}
        placeholder="Search files, folders..."
        class="pl-10 h-9 text-sm rounded-lg bg-background/60 dark:bg-muted/30 backdrop-blur-xl border border-border/50 dark:border-white/10 hover:bg-background/80 group-focus-within:bg-background focus-visible:ring-1 focus-visible:ring-primary/40 ring-primary/20 ring-1 relative z-10 transition-all duration-200"
      />
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center gap-1.5 shrink-0">
      {#if !currentFolderId}
        <Button
          variant="ghost"
          class="h-9 gap-1.5 rounded-lg ring-1 ring-primary/20 text-sm text-muted-foreground border border-border/40 bg-muted/30 hover:bg-muted/60 hover:text-foreground px-3 transition-all"
          on:click={handleCreateFolder}
        >
          <FolderPlus class="w-4 h-4 text-primary" />
          <span class="hidden md:inline">New Folder</span>
        </Button>
      {/if}

      <Button
        class="h-9 gap-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-3 shadow-md shadow-primary/20 transition-all"
        on:click={handleCreateFile}
      >
        <FilePlus2 class="w-4 h-4" />
        <span>New File</span>
      </Button>
    </div>
  </div>
</div>
