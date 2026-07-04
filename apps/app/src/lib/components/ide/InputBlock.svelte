<script lang="ts">
  import { db } from "../../db/db";
  import { onMount } from "svelte";
  import { 
    ExternalLink, 
    FileText, 
    Folder, 
    FolderOpen, 
    ChevronRight, 
    ChevronDown, 
    Search,
    X,
    FolderKanban,
    AlertCircle,
    FileSpreadsheet
  } from "lucide-svelte";
  import { goto } from "$app/navigation";
  
  export let content: string;
  export let workspaceId: string;
  export let currentFileName: string;
  export let onChange: (newContent: string) => void;

  let pathValue = "";
  let files: any[] = [];
  let folders: any[] = [];
  let showSelector = false;
  let searchQuery = "";
  let expandedFolders: Record<string, boolean> = {};

  $: {
    // Parse Input path from content by finding the active "Input <path>" line
    const lines = content.split("\n");
    const inputLine = lines.find(line => line.trim().toLowerCase().startsWith("input "));
    if (inputLine) {
      const match = inputLine.trim().match(/^Input\s+(.+)$/i);
      pathValue = match ? match[1].trim() : "";
    } else {
      pathValue = "";
    }
  }

  async function loadWorkspaceData() {
    try {
      // Fetch files
      const allFiles = await db.fileStore
        .where("workspaceId")
        .equals(workspaceId)
        .toArray();
      // Filter out self and keep only .csv and .json files
      files = allFiles.filter(f => 
        f.name !== currentFileName && 
        (f.name.toLowerCase().endsWith('.csv') || f.name.toLowerCase().endsWith('.json'))
      );

      // Fetch folders
      const allFolders = await db.folderTable
        .where("workspaceId")
        .equals(workspaceId)
        .toArray();
      folders = allFolders.map(folder => {
        const id = folder.id;
        const name = folder.data?.[0]?.name || "Unnamed Folder";
        
        // Initialize expanded state to true
        if (expandedFolders[id] === undefined) {
          expandedFolders[id] = true;
        }

        return { id, name };
      });
    } catch (e) {
      console.error(e);
    }
  }

  onMount(() => {
    loadWorkspaceData();
  });

  function selectFile(filename: string, folderId?: string | null) {
    let path = filename;
    if (folderId) {
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        path = `${folder.name}/${filename}`;
      }
    }
    pathValue = path;
    updatePath(path);
    showSelector = false;
  }

  function handleManualInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    pathValue = val;
    updatePath(val);
  }

  function openLinkedFile() {
    if (!pathValue) return;
    
    // Check if it's a remote URL
    if (pathValue.startsWith("http://") || pathValue.startsWith("https://")) {
      window.open(pathValue, "_blank");
      return;
    }
    
    // It's a local file, split and resolve folder name to folder ID
    const parts = pathValue.split("/");
    if (parts.length >= 2) {
      const folderName = parts[0];
      const fileName = parts[1];
      const targetFolder = folders.find(f => f.name.toLowerCase() === folderName.toLowerCase());
      const folderId = targetFolder ? targetFolder.id : folderName;
      goto(`/${workspaceId}/${folderId}/${fileName}`);
    } else {
      goto(`/${workspaceId}/${pathValue}`);
    }
  }

  function toggleFolder(folderId: string) {
    expandedFolders[folderId] = !expandedFolders[folderId];
  }

  // Filtered files & folders based on search
  $: filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: rootFiles = filteredFiles.filter(f => !f.folderId);
  
  $: folderList = folders.map(folder => {
    const folderFiles = filteredFiles.filter(f => f.folderId === folder.id);
    return {
      ...folder,
      files: folderFiles
    };
  }).filter(folder => folder.files.length > 0 || searchQuery === "");

  let isValidPath = false;
  $: {
    const isUrl = pathValue.startsWith("http://") || pathValue.startsWith("https://");
    let isWorkspaceFile = false;
    
    if (!isUrl) {
      const parts = pathValue.split("/");
      if (parts.length >= 2) {
        const folderName = parts[0];
        const fileName = parts[1];
        const targetFolder = folders.find(f => f.name.toLowerCase() === folderName.toLowerCase());
        if (targetFolder) {
          isWorkspaceFile = files.some(f => f.name === fileName && f.folderId === targetFolder.id);
        }
      } else {
        isWorkspaceFile = files.some(f => f.name === pathValue && !f.folderId);
      }
    }
    
    isValidPath = isUrl || isWorkspaceFile;
  }

  function updatePath(newPath: string) {
    const lines = content.split("\n");
    const inputLineIndex = lines.findIndex(line => line.trim().toLowerCase().startsWith("input "));
    if (inputLineIndex !== -1) {
      lines[inputLineIndex] = `Input ${newPath}`;
      onChange(lines.join("\n"));
    } else {
      onChange(content ? `${content}\nInput ${newPath}` : `Input ${newPath}`);
    }
  }
</script>

<div class="flex flex-col gap-2 p-1.5 w-full select-none">
  <!-- Horizontal Input & Controls Row -->
  <div class="flex items-center gap-2">
    <!-- Path Input -->
    <div class="relative flex-grow">
      <input
        type="text"
        value={pathValue}
        on:input={handleManualInput}
        placeholder="Type CSV/JSON path (e.g. users.csv) or remote URL..."
        class="h-9 w-full bg-card border border-border/60 dark:border-border/80 rounded-lg text-xs font-mono px-3 focus:outline-none focus:ring-1 focus:ring-primary/45 transition-all placeholder:text-muted-foreground/45"
      />
    </div>

    <!-- Choose File Button -->
    <button
      type="button"
      on:click={() => { loadWorkspaceData(); searchQuery = ""; showSelector = true; }}
      class="h-9 px-3 text-xs font-bold rounded-lg bg-secondary hover:bg-secondary/80 border border-border/50 text-secondary-foreground shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
    >
      <FolderKanban class="w-3.5 h-3.5 text-muted-foreground" />
      <span>Browse</span>
    </button>

    <!-- Open Target Button -->
    <button
      type="button"
      on:click={openLinkedFile}
      disabled={!isValidPath}
      class="h-9 px-3 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 select-none
             {isValidPath
               ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 cursor-pointer'
               : 'bg-muted text-muted-foreground/35 border border-border/45 cursor-not-allowed opacity-50'}"
    >
      <ExternalLink class="w-3.5 h-3.5" />
      <span>Open</span>
    </button>
  </div>

  <!-- Status indicator row -->
  {#if pathValue}
    <div class="flex items-center gap-1.5 px-1 text-[10px] font-semibold {isValidPath ? 'text-emerald-500' : 'text-amber-500/80'}">
      <span class="w-1.5 h-1.5 rounded-full {isValidPath ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
      <span>{isValidPath ? 'Valid input target' : 'File does not exist in workspace'}</span>
    </div>
  {/if}
</div>

<!-- Custom Workspace File Selector Modal Dialog -->
{#if showSelector}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-250">
    <!-- Modal Card -->
    <div class="bg-card dark:bg-[#141b2b] border border-border/80 rounded-2xl shadow-2xl w-full max-w-md max-h-[75vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
      <!-- Modal Header -->
      <div class="p-4 border-b border-border/40 flex items-center justify-between bg-muted/20">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500">
            <FileSpreadsheet class="w-4 h-4" />
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-bold text-foreground">Select Input File</span>
            <span class="text-[10px] text-muted-foreground">Choose CSV or JSON data source</span>
          </div>
        </div>
        <button
          type="button"
          on:click={() => showSelector = false}
          class="p-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-all cursor-pointer"
        >
          <X class="w-4.5 h-4.5" />
        </button>
      </div>

      <!-- Search Box -->
      <div class="p-3 border-b border-border/20 bg-muted/5 flex items-center gap-2">
        <div class="relative w-full">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search data files..."
            class="h-9 w-full bg-card border border-border/60 rounded-lg text-xs pl-9 pr-3.5 focus:outline-none focus:ring-1 focus:ring-primary/45 transition-all shadow-sm placeholder:text-muted-foreground/45"
          />
        </div>
      </div>

      <!-- Modal Body (Tree List) -->
      <div class="flex-grow overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar">
        {#if folderList.length > 0 || rootFiles.length > 0}
          <div class="flex flex-col gap-2">
            <!-- Folders -->
            {#each folderList as folder}
              <div class="flex flex-col">
                <!-- Folder Header toggle -->
                <button
                  type="button"
                  on:click={() => toggleFolder(folder.id)}
                  class="flex items-center justify-between w-full py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-all text-left cursor-pointer font-semibold text-xs text-foreground/90 active:scale-[0.99]"
                >
                  <div class="flex items-center gap-2">
                    {#if expandedFolders[folder.id]}
                      <ChevronDown class="w-3.5 h-3.5 text-muted-foreground/60" />
                      <FolderOpen class="w-4 h-4 text-teal-500" fill="currentColor" fill-opacity="0.1" />
                    {:else}
                      <ChevronRight class="w-3.5 h-3.5 text-muted-foreground/60" />
                      <Folder class="w-4 h-4 text-teal-500" fill="currentColor" fill-opacity="0.1" />
                    {/if}
                    <span>{folder.name}</span>
                  </div>
                  <span class="text-[10px] text-muted-foreground/55 font-normal bg-muted px-1.5 py-0.5 rounded">
                    {folder.files.length}
                  </span>
                </button>

                <!-- Folder Files -->
                {#if expandedFolders[folder.id]}
                  <div class="ml-5 mt-1 pl-1.5 border-l border-border/40 flex flex-col gap-1">
                    {#if folder.files.length > 0}
                      {#each folder.files as file}
                        <button
                          type="button"
                          on:click={() => selectFile(file.name, file.folderId)}
                          class="w-full text-left py-1.5 px-2.5 rounded-lg text-xs hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400 transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div class="flex items-center gap-2 truncate">
                            <FileSpreadsheet class="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                            <span class="truncate font-mono">{file.name}</span>
                          </div>
                          {#if pathValue === `${folder.name}/${file.name}`}
                            <span class="text-[9px] font-bold text-teal-500 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">Selected</span>
                          {/if}
                        </button>
                      {/each}
                    {:else}
                      <span class="text-[10px] text-muted-foreground/40 py-1.5 px-2.5 italic">Empty folder</span>
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}

            <!-- Root Files Header -->
            {#if rootFiles.length > 0}
              <div class="flex flex-col mt-2">
                <div class="flex items-center gap-2 py-1.5 px-2 font-bold text-xs text-foreground/80 select-none">
                  <Folder class="w-4 h-4 text-muted-foreground/50" fill="currentColor" fill-opacity="0.1" />
                  <span>Workspace Root</span>
                </div>
                <div class="ml-5 pl-1.5 border-l border-border/40 flex flex-col gap-1">
                  {#each rootFiles as file}
                    <button
                      type="button"
                      on:click={() => selectFile(file.name)}
                      class="w-full text-left py-1.5 px-2.5 rounded-lg text-xs hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div class="flex items-center gap-2 truncate">
                        <FileSpreadsheet class="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                        <span class="truncate font-mono">{file.name}</span>
                      </div>
                      {#if pathValue === file.name}
                        <span class="text-[9px] font-bold text-teal-500 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">Selected</span>
                      {/if}
                    </button>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
            <AlertCircle class="w-8 h-8 text-muted-foreground/35 mb-2.5 animate-pulse" />
            <span class="text-xs font-bold text-muted-foreground">No files found</span>
            <span class="text-[10px] text-muted-foreground/60 mt-1">Try expanding your search query or verify workspace files.</span>
          </div>
        {/if}
      </div>

      <!-- Modal Footer -->
      <div class="p-3 border-t border-border/40 bg-muted/20 flex items-center justify-end gap-2">
        <button
          type="button"
          on:click={() => showSelector = false}
          class="text-xs font-semibold px-4 py-2 rounded-lg border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-all active:scale-95"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
