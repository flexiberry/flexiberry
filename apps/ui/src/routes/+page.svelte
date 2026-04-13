<script lang="ts">
  import Header from "$lib/ui/shared/Header.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import {
    Search,
    ChevronDown,
    Plus,
    FileText,
    MoreHorizontal,
    Folder as FolderIcon,
    Trash2,
    ArrowLeft,
    Pencil,
  } from "lucide-svelte";
  import { liveQuery } from "dexie";
  import { db } from "$lib/db/db";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";

  let searchQuery = "";
  let scrollY = 0;
  let currentFolderId: string | null = null;
  let isEditingFolder = false;
  let editingFolderName = "";
  let folderInputEl: HTMLInputElement;

  let isEditingFileId: string | null = null;
  let editingFileName = "";
  let fileInputEl: HTMLInputElement;

  // Reactively load files & folders from local DB
  const filesStore = liveQuery(() => db.fileStore.toArray());
  const foldersStore = liveQuery(() =>
    db.folderTable ? db.folderTable.toArray() : [],
  );

  $: allFiles = $filesStore || [];
  $: folders = $foldersStore || [
    {
      id: "1",
      data: [
        {
          name: "Onboarding",
          type: "folder",
          expand: false,
          remove: false,
          uid: "1",
          rename: false,
          subfolders: [],
        },
      ],
    },
    {
      id: "2",
      data: [
        {
          name: "Integrations",
          type: "folder",
          expand: false,
          remove: false,
          uid: "2",
          rename: false,
          subfolders: [],
        },
      ],
    },
    {
      id: "3",
      data: [
        {
          name: "Documentation",
          type: "folder",
          expand: false,
          remove: false,
          uid: "3",
          rename: false,
          subfolders: [],
        },
      ],
    },
  ];

  // Dynamic Navigation derived logic
  // Assume generic file object interface for simplicity of dynamic filtering.
  $: currentFolder = folders.find((f) => f.id === currentFolderId);
  $: folderName = currentFolder?.data?.[0]?.name || "Workspace";
  $: activeFiles = allFiles.filter((f) =>
    currentFolderId
      ? (f as any).folderId === currentFolderId
      : !(f as any).folderId,
  );

  // Helper date formatter
  const formatDate = (dateValue: any) => {
    if (!dateValue) return "Just now";
    const d = new Date(dateValue);
    return isNaN(d.getTime())
      ? "Unknown Date"
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  const handleCreateFile = async () => {
    const defaultName = `Untitled-${Date.now()}.berry`;
    try {
      await db.fileStore.add({
        id: defaultName,
        name: defaultName,
        data: new Blob([""], { type: "text/plain" }),
        createdAt: new Date(),
        folderId: currentFolderId, // Link to current directory dynamically
      } as any);
      toast.success("New file created");
    } catch (e) {
      toast.error("Failed to create file");
    }
  };

  const handleCreateFolder = async () => {
    const newId = `folder-${Date.now()}`;
    try {
      if (db.folderTable) {
        await db.folderTable.add({
          id: newId,
          data: [
            {
              name: "New Folder",
              type: "dir",
              expand: false,
              remove: false,
              uid: newId,
              rename: false,
              subfolders: [],
            },
          ],
        });
        toast.success("Folder created");

        // Auto-navigate and prompt rename instantly
        currentFolderId = newId;
        setTimeout(() => {
          startEditingFolder();
        }, 50);
      }
    } catch (e) {
      toast.error("Database schema might not be ready");
    }
  };

  const handleDeleteFile = async (e: Event, id: string) => {
    e.stopPropagation();
    try {
      await db.fileStore.delete(id);
      toast.success("File deleted successfully");
    } catch (err) {
      toast.error("Failed to delete file");
    }
  };

  const startEditingFile = (e: Event, file: any) => {
    e.stopPropagation();
    editingFileName = file.name;
    isEditingFileId = file.id;
    setTimeout(() => {
      fileInputEl?.focus();
      fileInputEl?.select();
    }, 10);
  };

  const saveFileName = async (file: any) => {
    isEditingFileId = null;
    if (editingFileName.trim() && editingFileName !== file.name) {
      try {
        await db.fileStore.update(file.id, { name: editingFileName.trim() });
        toast.success("File renamed successfully");
      } catch (err) {
        toast.error("Failed to rename file");
      }
    }
  };

  const handleDeleteFolder = async (e: Event, id: string) => {
    e.stopPropagation();
    try {
      if (db.folderTable) {
        await db.folderTable.delete(id);
        toast.success("Folder deleted");
        if (currentFolderId === id) currentFolderId = null;
      }
    } catch (err) {
      toast.error("Failed to delete folder");
    }
  };

  const startEditingFolder = () => {
    editingFolderName = folderName;
    isEditingFolder = true;
    setTimeout(() => {
      folderInputEl?.focus();
      folderInputEl?.select();
    }, 10);
  };

  const saveFolderName = async () => {
    isEditingFolder = false;
    if (
      editingFolderName.trim() &&
      editingFolderName !== folderName &&
      currentFolderId &&
      currentFolder
    ) {
      currentFolder.data[0].name = editingFolderName.trim();
      try {
        await db.folderTable.put(currentFolder);
        toast.success("Folder renamed successfully");
      } catch (e) {
        toast.error("Failed to rename folder");
      }
    }
  };
</script>

<div
  class="h-full w-full bg-background text-foreground flex flex-col font-sans overflow-hidden relative"
>
  <!-- Animated Gradient Mesh & Canvas Pattern Background -->
  <div
    class="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-background"
  >
    <!-- Animated Gradient Orbs -->
    <div
      class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 dark:bg-primary/10 rounded-full blur-[100px] animate-blob"
    ></div>
    <div
      class="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000"
    ></div>
    <div
      class="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] bg-violet-500/20 dark:bg-violet-500/10 rounded-full blur-[120px] animate-blob animation-delay-4000"
    ></div>

    <!-- Dotted Grid Overlay -->
    <div
      class="absolute inset-0 opacity-50"
      style="background-image: radial-gradient(hsl(var(--muted-foreground)/0.2) 1px, transparent 1px); background-size: 10px 10px;"
    ></div>
  </div>

  <!-- Main Stack -->
  <div class="flex flex-col h-full w-full relative z-10">
    <!-- Header Bar -->
    <div class="px-2 pt-2 shrink-0 bg-transparent z-20">
      <Header />
    </div>

    <!-- Dashboard Scroll Content -->
    <div
      class="flex-1 w-full bg-transparent overflow-y-auto z-10"
      on:scroll={(e) => (scrollY = e.currentTarget.scrollTop)}
    >
      <div class="max-w-[70rem] mx-auto px-8 py-10 flex flex-col gap-10">
        <!-- Hero Search Component (Top Centered) -->
        <div
          class="flex flex-col items-center justify-center pt-6 pb-4 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] {scrollY >
          60
            ? 'opacity-0 -translate-y-6 pointer-events-none lg:-mt-24'
            : 'opacity-100 translate-y-0 lg:mt-0'}"
        >
          <!-- Main Titles -->
          <h1
            class="text-4xl sm:text-6xl font-black tracking-tighter mb-4 {currentFolderId
              ? 'text-primary'
              : 'text-foreground'} transition-colors duration-500"
          >
            {currentFolderId ? folderName : "Everything."}
          </h1>
          <p
            class="text-muted-foreground/80 text-lg mb-10 text-center max-w-lg font-medium"
          >
            Instantly search and traverse your architecture.
          </p>

          <div
            class="w-full max-w-2xl relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-2xl group mx-auto mb-10"
          >
            <div
              class="absolute inset-0 bg-primary/10 blur-2xl rounded-full transition-opacity group-focus-within:opacity-100 opacity-0 z-0"
            ></div>
            <Search
              class="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-foreground/50 group-focus-within:text-primary transition-colors z-20 pointer-events-none"
            />
            <Input
              bind:value={searchQuery}
              placeholder="Search anything..."
              class="pl-16 h-16 text-lg rounded-2xl bg-background/40 dark:bg-muted/30 backdrop-blur-2xl border border-border/50 dark:border-white/10 hover:bg-background/60 group-focus-within:bg-background/80 focus-visible:ring-2 focus-visible:ring-primary/50 relative z-10 font-medium transition-all duration-300 shadow-xl"
            />
          </div>

          <!-- Context Header & Actions (Moved Here) -->
          <div class="flex items-center justify-between w-full max-w-5xl px-2">
            <!-- Breadcrumbs -->
            <div class="flex items-center gap-3">
              {#if currentFolderId}
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-10 w-10 rounded-xl bg-muted/40 border border-border/40 shrink-0 hover:bg-muted/80 backdrop-blur-sm shadow-sm"
                  on:click={() => (currentFolderId = null)}
                >
                  <ArrowLeft class="w-4 h-4 text-foreground/80" />
                </Button>
              {/if}
              <div
                class="flex items-center gap-1.5 text-[15px] font-semibold text-muted-foreground bg-muted/40 border border-border/40 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm h-10 w-full overflow-hidden"
              >
                <button
                  class="hover:text-foreground transition-colors whitespace-nowrap"
                  on:click={() => (currentFolderId = null)}>Workspace</button
                >
                {#if currentFolderId}
                  <span class="opacity-40">/</span>
                  {#if isEditingFolder}
                    <input
                      bind:this={folderInputEl}
                      bind:value={editingFolderName}
                      on:keydown={(e) => {
                        if (e.key === "Enter") saveFolderName();
                        if (e.key === "Escape") isEditingFolder = false;
                      }}
                      on:blur={saveFolderName}
                      class="h-6 py-0 px-2 text-[15px] font-semibold bg-background w-[140px] focus:outline-none focus:ring-1 focus:ring-primary rounded-md border border-input shadow-sm"
                    />
                  {:else}
                    <button
                      class="text-foreground tracking-tight whitespace-nowrap truncate hover:text-primary transition-colors"
                      on:click={startEditingFolder}
                      title="Click to rename folder">{folderName}</button
                    >
                    <button
                      class="text-muted-foreground hover:text-foreground ml-1 shrink-0 bg-background/50 border border-border/50 rounded-md p-0.5 hover:bg-muted"
                      on:click={startEditingFolder}
                    >
                      <Pencil class="w-3 h-3" />
                    </button>
                  {/if}
                {/if}
              </div>
            </div>

            <!-- Action Controls -->
            <div class="flex items-center gap-3">
              {#if !currentFolderId}
                <Button
                  variant="secondary"
                  class="h-10 gap-2 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/80 backdrop-blur-sm transition-all"
                  on:click={handleCreateFolder}
                >
                  <FolderIcon class="w-4 h-4 text-muted-foreground" />
                  New Folder
                </Button>
              {/if}
              <Button
                class="h-10 gap-2 rounded-xl shadow-md bg-primary hover:bg-primary/90 transition-all font-medium"
                on:click={handleCreateFile}
              >
                <Plus class="w-4 h-4" />
                New File
              </Button>
            </div>
          </div>
        </div>

        <!-- Folders (Only visible at root) -->
        {#if !currentFolderId}
          <div
            class="flex flex-col gap-5 transition-all duration-500 ease-out {scrollY >
            60
              ? 'lg:-translate-y-24'
              : ''}"
          >
            <h2 class="text-lg font-medium tracking-tight px-1">Directories</h2>
            <div
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {#each folders as folder}
                <div class="relative group">
                  <button
                    on:click={() => (currentFolderId = folder.id)}
                    class="w-full flex flex-col items-start gap-4 bg-card/80 hover:bg-muted border border-border shadow-sm p-4 rounded-xl text-left cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-primary/30"
                  >
                    <div
                      class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                    >
                      <FolderIcon
                        class="w-5 h-5 text-primary"
                        fill="currentColor"
                        fill-opacity="0.2"
                      />
                    </div>
                    <div class="flex flex-col overflow-hidden w-full">
                      <span class="font-medium text-[14px] truncate w-full"
                        >{folder.data?.[0]?.name || "Folder"}</span
                      >
                      <span class="text-[11px] text-muted-foreground mt-1"
                        >Directory</span
                      >
                    </div>
                  </button>
                  <!-- Floating Delete Button -->
                  <Button
                    variant="ghost"
                    size="icon"
                    class="absolute top-2 right-2 h-7 w-7 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-destructive/10 hover:text-destructive shadow-sm border border-transparent hover:border-destructive/20 backdrop-blur-sm"
                    on:click={(e) => handleDeleteFolder(e, folder.id)}
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </Button>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Files Data Table -->
        <div
          class="flex flex-col gap-5 pb-20 transition-all duration-500 ease-out {scrollY >
          60
            ? 'lg:-translate-y-24'
            : ''}"
        >
          <div class="flex items-center justify-between px-1">
            <h2 class="text-lg font-medium tracking-tight">
              {currentFolderId ? `${folderName} Files` : "Recent Files"}
            </h2>
            <span class="text-xs text-muted-foreground"
              >{activeFiles.length} items</span
            >
          </div>

          <div
            class="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
          >
            <div
              class="grid grid-cols-[1fr_120px] sm:grid-cols-[1fr_200px_150px_60px] gap-4 p-3 border-b border-muted bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6"
            >
              <div>Name</div>
              <div class="hidden sm:block">Owner</div>
              <div class="hidden sm:block">Modified</div>
              <div class="text-right sm:text-center">Actions</div>
            </div>

            <div class="divide-y divide-border/30">
              {#if activeFiles.length === 0}
                <div
                  class="p-10 text-center text-muted-foreground text-sm flex flex-col items-center gap-3"
                >
                  <div
                    class="w-12 h-12 rounded-full bg-muted flex items-center justify-center"
                  >
                    <FileText class="w-6 h-6 opacity-30" />
                  </div>
                  No files found in {currentFolderId
                    ? "this folder"
                    : "your workspace"}.
                </div>
              {/if}

              {#each activeFiles.filter((f) => f.name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())) as file}
                <button
                  on:click={() => goto(`/${file.id}`)}
                  class="w-full text-left grid grid-cols-[1fr_120px] sm:grid-cols-[1fr_200px_150px_60px] gap-4 p-3.5 px-6 items-center hover:bg-muted/40 transition-colors cursor-pointer group"
                >
                  <div class="flex items-center gap-3 overflow-hidden">
                    <FileText
                      class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0"
                    />
                    {#if isEditingFileId === file.id}
                      <input
                        bind:this={fileInputEl}
                        bind:value={editingFileName}
                        on:keydown={(e) => {
                          if (e.key === "Enter") saveFileName(file);
                          if (e.key === "Escape") isEditingFileId = null;
                        }}
                        on:blur={() => saveFileName(file)}
                        on:click={(e) => e.stopPropagation()}
                        class="h-6 py-0 px-2 text-[13px] font-semibold bg-background w-full focus:outline-none focus:ring-1 focus:ring-primary rounded-md border border-input shadow-sm"
                      />
                    {:else}
                      <span
                        class="font-medium text-[13px] truncate group-hover:text-primary transition-colors"
                        on:dblclick={(e) => startEditingFile(e, file)}
                        title="Double click to rename">{file.name}</span
                      >
                    {/if}
                  </div>

                  <div
                    class="hidden sm:flex items-center gap-2 text-[13px] text-muted-foreground truncate"
                  >
                    <div
                      class="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 overflow-hidden shrink-0 shadow-sm border border-border"
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${file.name}`}
                        alt="avatar"
                        class="w-full h-full object-cover bg-white"
                      />
                    </div>
                    <span class="truncate">Team Flexi</span>
                  </div>

                  <div
                    class="hidden sm:block text-[13px] text-muted-foreground truncate"
                  >
                    {formatDate(file.createdAt)}
                  </div>

                  <div class="flex justify-end sm:justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-7 w-7 text-muted-foreground opacity-50 group-hover:opacity-100 hover:text-foreground hover:bg-muted"
                      on:click={(e) => startEditingFile(e, file)}
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-7 w-7 text-muted-foreground opacity-50 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
                      on:click={(e) => handleDeleteFile(e, file.id)}
                    >
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>
                </button>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
  .animate-blob {
    animation: blob 12s infinite alternate ease-in-out;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
</style>
