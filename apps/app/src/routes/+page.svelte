<script lang="ts">
  import Header from "$lib/ui/shared/Header.svelte";
  import { liveQuery } from "dexie";
  import { db, type folderTable } from "$lib/db/db";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import { activeWorkspaceId } from "$lib/writable/workspace.store";

  // Dashboard Components
  import DashboardHeader from "$lib/components/dashboard/DashboardHeader.svelte";
  import FileTable from "$lib/components/dashboard/FileTable.svelte";
  import DirectoryGrid from "$lib/components/dashboard/DirectoryGrid.svelte";
  import DeleteConfirmDialog from "$lib/components/dashboard/DeleteConfirmDialog.svelte";

  import { dashboardSearchQuery, dashboardCurrentFolderId } from "$lib/writable/assistant.store";
  import { onDestroy } from "svelte";

  let searchQuery = "";
  let scrollY = 0;
  let currentFolderId: string | null = null;

  // Two-way synchronization of dashboard states with assistant stores
  const unsubSearch = dashboardSearchQuery.subscribe((val) => {
    searchQuery = val;
  });

  $: dashboardSearchQuery.set(searchQuery);
  $: dashboardCurrentFolderId.set(currentFolderId);

  onDestroy(() => {
    unsubSearch();
    dashboardSearchQuery.set("");
    dashboardCurrentFolderId.set(null);
  });

  let isEditingFolder = false;
  let editingFolderName = "";
  let folderInputEl: HTMLInputElement;

  let isEditingFileId: string | null = null;
  let editingFileName = "";
  let fileInputEl: HTMLInputElement;

  // ─── Delete confirmation state ──────────────────────────────────
  let deleteDialogOpen = false;
  let pendingDelete: { type: "file" | "folder"; id: string; name: string } | null = null;

  // Reactively reload files & folders whenever the active workspace changes
  $: filesStore = liveQuery(() =>
    db.fileStore.where("workspaceId").equals($activeWorkspaceId).toArray(),
  );
  $: foldersStore = liveQuery(() =>
    db.folderTable
      ? db.folderTable.where("workspaceId").equals($activeWorkspaceId).toArray()
      : Promise.resolve<folderTable[]>([]),
  );

  $: allFiles = $filesStore || [];
  $: folders = $foldersStore || [];

  // Dynamic Navigation derived logic
  $: currentFolder = folders.find((f) => f.id === currentFolderId);
  $: folderName = currentFolder?.data?.[0]?.name || "Workspace";
  $: activeFiles = allFiles.filter((f) =>
    currentFolderId
      ? (f as any).folderId === currentFolderId
      : !(f as any).folderId,
  );

  // Reset folder navigation when workspace changes
  $: if ($activeWorkspaceId) currentFolderId = null;

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
        folderId: currentFolderId,
        workspaceId: $activeWorkspaceId,
      } as any);
      // Wait for liveQuery to render the new row, then enter inline rename mode
      setTimeout(() => {
        editingFileName = defaultName;
        isEditingFileId = defaultName;
        setTimeout(() => {
          fileInputEl?.focus();
          fileInputEl?.select();
        }, 10);
      }, 80);
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
          workspaceId: $activeWorkspaceId, // isolate to active workspace
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
        currentFolderId = newId;
        setTimeout(() => {
          startEditingFolder();
        }, 50);
      }
    } catch (e) {
      toast.error("Database schema might not be ready");
    }
  };

  // Opens the confirm dialog; actual deletion runs only on confirm
  const handleDeleteFile = (e: Event, id: string) => {
    e.stopPropagation();
    const file = allFiles.find((f) => f.id === id);
    pendingDelete = { type: "file", id, name: file?.name ?? "this file" };
    deleteDialogOpen = true;
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
    if (!editingFileName.trim()) return;

    // Ensure .berry extension is always present
    const raw = editingFileName.trim();
    // Only add .berry if the name has no extension; leave any existing extension as-is
    const hasExtension = raw.includes(".") && !raw.endsWith(".");
    const normalized = hasExtension ? raw : `${raw}.berry`;

    if (normalized !== file.name) {
      try {
        await db.fileStore.update(file.id, { name: normalized });
        toast.success("File saved");
      } catch (err) {
        toast.error("Failed to save file name");
      }
    }
  };

  // Opens the confirm dialog; actual deletion runs only on confirm
  const handleDeleteFolder = (e: Event, id: string) => {
    e.stopPropagation();
    const folder = folders.find((f) => f.id === id);
    pendingDelete = { type: "folder", id, name: folder?.data?.[0]?.name ?? "this folder" };
    deleteDialogOpen = true;
  };

  // Executed after user confirms in the dialog
  async function confirmDelete() {
    if (!pendingDelete) return;
    const { type, id } = pendingDelete;
    try {
      if (type === "file") {
        await db.fileStore.delete(id);
        toast.success("File deleted");
      } else {
        await db.folderTable?.delete(id);
        toast.success("Folder deleted");
        if (currentFolderId === id) currentFolderId = null;
      }
    } catch {
      toast.error(`Failed to delete ${type}`);
    }
    pendingDelete = null;
  }

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
        <DashboardHeader
          {scrollY}
          bind:currentFolderId
          {folderName}
          bind:searchQuery
          bind:isEditingFolder
          bind:editingFolderName
          bind:folderInputEl
          on:createFolder={handleCreateFolder}
          on:createFile={handleCreateFile}
          on:saveFolderName={saveFolderName}
          on:startEditingFolder={startEditingFolder}
        />

        <FileTable
          files={activeFiles}
          {searchQuery}
          {scrollY}
          {folderName}
          {currentFolderId}
          bind:isEditingFileId
          bind:editingFileName
          bind:fileInputEl
          {formatDate}
          on:deleteFile={(e) => handleDeleteFile(e.detail.e, e.detail.id)}
          on:saveFileName={(e) => saveFileName(e.detail.file)}
          on:startEditingFile={(e) =>
            startEditingFile(e.detail.e, e.detail.file)}
        />

        <DirectoryGrid
          {folders}
          bind:currentFolderId
          {scrollY}
          on:deleteFolder={(e) => handleDeleteFolder(e.detail.e, e.detail.id)}
        />
      </div>
    </div>
  </div>
</div>

<!-- Delete Confirmation Dialog (shared for files and folders) -->
<DeleteConfirmDialog
  bind:open={deleteDialogOpen}
  itemName={pendingDelete?.name ?? ""}
  itemType={pendingDelete?.type ?? "file"}
  on:confirm={confirmDelete}
/>

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
