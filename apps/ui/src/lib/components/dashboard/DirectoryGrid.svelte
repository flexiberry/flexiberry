<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Folder as FolderIcon, Trash2 } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";

  export let folders: any[];
  export let currentFolderId: string | null;
  export let scrollY: number;

  const dispatch = createEventDispatcher();

  function navigateToFolder(id: string) {
    currentFolderId = id;
  }

  function handleDeleteFolder(e: Event, id: string) {
    dispatch("deleteFolder", { e, id });
  }
</script>

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
            on:click={() => navigateToFolder(folder.id)}
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
