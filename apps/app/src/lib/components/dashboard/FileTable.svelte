<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { FileText, Pencil, Trash2 } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { goto } from "$app/navigation";
  import { activeWorkspaceId } from "$lib/writable/workspace.store";
  import { buildFilePath } from "$lib/writable/File";

  export let files: any[];
  export let searchQuery: string;
  export let scrollY: number;
  export let folderName: string;
  export let currentFolderId: string | null;
  export let isEditingFileId: string | null = null;
  export let editingFileName: string = "";
  export let fileInputEl: HTMLInputElement;
  export let formatDate: (date: any) => string;

  const dispatch = createEventDispatcher();

  function handleDeleteFile(e: Event, id: string) {
    dispatch("deleteFile", { e, id });
  }

  function startEditingFile(e: Event, file: any) {
    dispatch("startEditingFile", { e, file });
  }

  function saveFileName(file: any) {
    dispatch("saveFileName", { file, $activeWorkspaceId });
  }
</script>

<div
  class="flex flex-col gap-5 pb-1 transition-all duration-500 ease-out {scrollY >
  60
    ? 'lg:-translate-y-24'
    : ''}"
>
  <div class="flex items-center justify-between px-1">
    <h2 class="text-lg font-medium tracking-tight">
      {currentFolderId ? `${folderName} Files` : "Root Files"}
    </h2>
    <span class="text-xs text-muted-foreground">{files.length} items</span>
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
      {#if files.length === 0}
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

      {#each files.filter((f) => f.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) as file}
        <button
          on:click={() =>
            goto(buildFilePath($activeWorkspaceId, file.name, file.folderId ?? currentFolderId))
          }
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
