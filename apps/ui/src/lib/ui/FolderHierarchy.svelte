<!-- src/FolderHierarchy.svelte -->
<script lang="ts">
  import {
    Download,
    FolderPlus,
    Inbox,
    Info,
    Plus,
    Share,
  } from "lucide-svelte";
  import Button from "../components/ui/button/button.svelte";
  import FolderItem from "./FolderItem.svelte";
  import Input from "../components/ui/input/input.svelte";
  import { moveItemInHierarchy } from "../util/util";
  import { flip } from "svelte/animate";
  import { v4 as uuidv4 } from "uuid";
  import { savedFolders, updateFolder } from "../writable/folder.store";
  import type { Folder } from "../types/folder.model";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

  export let height: number = 100;
  let folders: any[] = [];
  savedFolders.subscribe((data) => {
    folders = data;
  });

  function addFolder() {
    folders.push({
      name: uuidv4().toString(),
      subfolder: [],
      type: "folder",
      uid: uuidv4().toString(),
    });
    updateFolder(folders);
  }

  let draggedItemPath: string | any[] | null;

  const handleDragStart = ({
    event,
    path,
  }: {
    event: DragEvent;
    path: any[];
  }) => {
    draggedItemPath = path;
  };

  const handleDrop = ({ event, path }: { event: DragEvent; path: any[] }) => {
    console.log(event);
    console.log(draggedItemPath);
    console.log(path);

    if (
      !draggedItemPath ||
      JSON.stringify(draggedItemPath) === JSON.stringify(path)
    )
      return;

    folders = moveItemInHierarchy(folders, path, draggedItemPath);
    updateFolder(folders);
    draggedItemPath = null;
  };

  const handleDragOver = (e: any) => {
    e.event.preventDefault();

    // console.log(e.event.target);
    // console.log(e.path);
  };
</script>

<div style="height:{height - 40}px;" class="pb-4">
  <div class="flex justify-between rounded-lg m-2">
    <div class="flex-auto">
      <Input
        class="w-full focus-visible:ring-0 bg-slate-50 dark:bg-slate-800"
        placeholder="search for files or folders"
      ></Input>
    </div>

    <div class="grid grid-cols-2 gap-2 flex-none grow-0">
      <Button variant="ghost" on:click={addFolder} style="icon">
        <Plus size={18}></Plus>
        New
      </Button>
      <Button variant="ghost" style="icon">
        <Share size={18}></Share>
      </Button>
    </div>
  </div>
  <ScrollArea class=" h-full  w-full rounded-md border">
    {#if folders.length <= 0}
      <div class="flex flex-col mt-6 items-center justify-center p-4">
        <Inbox size={56} strokeWidth={1} />

        <span
          class="max-w-sm mt-2 text-center whitespace-normal font-thin text-xs text-secondaryLight"
          >Collections are empty</span
        >
        <div class="mt-4 border-t-2">
          <div class="flex flex-col mt-4 items-center space-y-4">
            <span class="text-center text-secondaryLight"
              >Import or create a collection</span
            >
            <div class="flex flex-col items-stretch gap-4">
              <Button color="primary" variant="default">
                <Download class="mr-2" size={14}></Download>
                Import</Button
              >
              <Button color="" variant="secondary">
                <Plus class="mr-2" size={14}></Plus>
                Create</Button
              >
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#each folders as folder (folder.name)}
      <div animate:flip={{ delay: 250, duration: 250 }}>
        <FolderItem
          {folder}
          path={folder}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
        />
      </div>
    {/each}
  </ScrollArea>
</div>
