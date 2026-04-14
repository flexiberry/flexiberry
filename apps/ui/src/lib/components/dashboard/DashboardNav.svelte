<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    ArrowLeft,
    Pencil,
    Folder as FolderIcon,
    Plus,
    Home,
    ChevronRight,
    FilePlus2,
    FolderPlus,
  } from "lucide-svelte";

  export let currentFolderId: string | null;
  export let folderName: string;
  export let isEditingFolder: boolean;
  export let editingFolderName: string;
  export let scrollY: number;
  export let folderInputEl: HTMLInputElement;

  const dispatch = createEventDispatcher();

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
</script>

<!-- App-style Toolbar: Breadcrumb Path + Context Actions -->
<div
  class="flex items-center justify-between w-full transition-all duration-500 ease-out {scrollY >
  60
    ? 'lg:-translate-y-24'
    : ''}"
>
  <!-- Left: Path Navigator -->
  <div
    class="flex items-center gap-1 bg-muted border border-border rounded-xl px-2 h-9 backdrop-blur-sm text-sm font-medium overflow-hidden"
  >
    <!-- Back Button (inline, only in subfolder) -->
    {#if currentFolderId}
      <button
        class="flex items-center justify-center h-6 w-6 rounded-lg hover:bg-muted transition-colors shrink-0"
        on:click={navigateBack}
        title="Go back to root"
      >
        <ArrowLeft class="w-3.5 h-3.5 text-foreground/70" />
      </button>
      <span class="text-border/60 select-none">|</span>
    {/if}

    <!-- Home / Root Segment -->
    <button
      class="flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-colors
        {currentFolderId
        ? 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        : 'text-foreground bg-muted/60'}"
      on:click={navigateBack}
    >
      <Home class="w-3.5 h-3.5 shrink-0" />
      <span class="whitespace-nowrap">Workspace</span>
    </button>

    <!-- Folder Segment -->
    {#if currentFolderId}
      <ChevronRight class="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />

      {#if isEditingFolder}
        <!-- Inline Rename Input -->
        <input
          bind:this={folderInputEl}
          bind:value={editingFolderName}
          on:keydown={(e) => {
            if (e.key === "Enter") saveFolderName();
            if (e.key === "Escape") isEditingFolder = false;
          }}
          on:blur={saveFolderName}
          class="h-6 px-2 text-sm font-semibold text-foreground bg-background border border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary rounded-md w-[160px] shadow-sm"
        />
      {:else}
        <button
          class="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-foreground bg-muted/60 hover:bg-muted transition-colors group"
          on:click={startEditingFolder}
          title="Click to rename"
        >
          <FolderIcon
            class="w-3.5 h-3.5 text-primary shrink-0"
            fill="currentColor"
            fill-opacity="0.18"
          />
          <span class="whitespace-nowrap truncate max-w-[140px]"
            >{folderName}</span
          >
          <Pencil
            class="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground/70 transition-colors shrink-0 ml-0.5"
          />
        </button>
      {/if}
    {/if}
  </div>

  <!-- Right: Contextual Action Buttons -->
  <div class="flex items-center gap-2">
    {#if !currentFolderId}
      <Button
        variant="ghost"
        class="h-9 gap-1.5 rounded-xl text-sm font-medium text-muted-foreground border border-border/40 bg-muted/30 hover:bg-muted/60 hover:text-foreground backdrop-blur-sm transition-all px-3"
        on:click={handleCreateFolder}
      >
        <FolderPlus class="w-4 h-4" />
        <span class="hidden sm:inline">New Folder</span>
      </Button>
    {/if}
    <Button
      class="h-9 gap-1.5 rounded-xl text-sm font-medium bg-primary hover:bg-primary/90 text-white shadow-sm transition-all px-3"
      on:click={handleCreateFile}
    >
      <FilePlus2 class="w-4 h-4" />
      <span>New File</span>
    </Button>
  </div>
</div>
