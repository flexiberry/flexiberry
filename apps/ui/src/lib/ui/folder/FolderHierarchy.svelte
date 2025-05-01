<!-- src/FolderHierarchy.svelte -->
<script lang="ts">
  import {
    Download,
    FolderPlus,
    Inbox,
    Info,
    Plus,
    Share,
    Upload,
  } from "lucide-svelte";
  import Button from "../../components/ui/button/button.svelte";
  import FolderItem from "./FolderItem.svelte";
  import Input from "../../components/ui/input/input.svelte";
  import { moveItemInHierarchy } from "../../util/util";
  import { flip } from "svelte/animate";
  import { v4 as uuidv4 } from "uuid";
  import { savedFolders, updateFolder } from "$lib/writable/folder.store";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { onMount } from "svelte";
  import { db } from "../../db/db";
  import berry from "$lib/assets/berry-fotor-2024090211181.png";
  import Separator from "../../components/ui/separator/separator.svelte";

  export let height: number = 100;

  onMount(async () => {
    let d = await db.folderTable.get("folder");
    if (d) updateFolder(d.data);
  });

  let folders: any[] = [];

  savedFolders.subscribe((data) => {
    folders = data || [];
  });

  function addFolder() {
    folders.push({
      name: "",
      subfolder: [],
      type: "folder",
      rename: true,
      expand: false,
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
  <div
    class="flex bg-secondary/45 mt-2 drop-shadow-lg justify-end m-0.5 rounded-lg border p-2"
  >
    <Input placeholder="Search" class=" mr-2"></Input>
    <Button
      on:click={addFolder}
      class="mr-2 flex-shrink-0"
      size="icon"
      variant="outline"
    >
      <Plus strokeWidth={1}></Plus>
    </Button>
    <Button class="mr-2 flex-shrink-0" size="icon" variant="outline">
      <Upload strokeWidth={1}></Upload>
    </Button>
  </div>
  <ScrollArea class=" h-full pt-2  w-full ">
    {#if folders == null || folders.length <= 0}
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
              <Button color="" on:click={addFolder} variant="secondary">
                <Plus class="mr-2" size={14}></Plus>
                Create</Button
              >
            </div>
          </div>
        </div>
      </div>
    {:else}
      {#each folders as folder, index (index)}
        <div animate:flip={{ delay: 250, duration: 250 }}>
          <FolderItem
            {folder}
            on:folderUpdate={(f) => {
              updateFolder(folders);
            }}
            path={folder}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
          />
        </div>
      {/each}
    {/if}
  </ScrollArea>
</div>
