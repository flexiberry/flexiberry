<script lang="ts">
  import FolderName from "./FolderName.svelte";

  import FolderAction from "./FolderAction.svelte";

  import FolderItem from "./FolderItem.svelte";
  import { flip } from "svelte/animate";
  import { fade, slide } from "svelte/transition";
  import type { FolderModel } from "../../types/folder.model";
  import { createEventDispatcher } from "svelte";
  import { elasticIn, quintOut } from "svelte/easing";
  import { ChevronDown, ChevronRight } from "lucide-svelte";
  export let folder: FolderModel;

  export let path: FolderModel;
  export let onDrop;
  export let onDragStart;
  export let onDragOver;

  let dragOverItem: FolderModel | null = null;
  let draggedItem: FolderModel | null = null;

  let dragging = false;
  const toggle = () => (folder.expand = !folder.expand);
  const dispatch = createEventDispatcher();

  const handleDrop = (event: { preventDefault: () => void }) => {
    onDrop({ event, path });
    dragging = false;
    event.preventDefault();
    draggedItem = null;
    dragOverItem = null;
  };

  const handleDragStart = (event: any, item: FolderModel) => {
    onDragStart({ event, path });
    if (!!event && !!event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      console.log(event.dataTransfer);
      event.dataTransfer.setData("text/plain", "");
    }
    dragging = true;
    draggedItem = item;
  };

  const handleDragOver = (event: any, item: FolderModel) => {
    if (!!event && !!event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
      console.log(event.dataTransfer);
    }
    if (item.type === "folder" && item !== draggedItem) {
      onDragOver({ event, path });
      dragging = true;
      dragOverItem = item;
      event.preventDefault();
    }
  };

  function handleKey(e: KeyboardEvent): void {
    console.log(e.key);

    if (e.key === "Enter" || e.key === "Escape") {
      if (folder.name === "") {
        alert("Please rename the folder");
        folder.rename = true;
      } else {
        folder.rename = false;
        dispatch("folderUpdate", {
          fld: folder,
        });
      }
    }
  }
</script>

<div
  class=" rounded-lg {dragging && draggedItem !== folder
    ? 'border-green-600 border bg-blend-multiply  '
    : ''}  {dragging && draggedItem === folder
    ? ' bg-primary  bg-blend-multiply'
    : ''}"
>
  <div
    role="listitem"
    draggable={true}
    on:dragstart={(e) => handleDragStart(e, folder)}
    on:drop={handleDrop}
    on:dragover={(e) => handleDragOver(e, folder)}
    on:dragexit={() => {
      dragging = false;
      dragOverItem = null;
      draggedItem = null;
    }}
    on:dragleave={() => {
      dragging = false;
      dragOverItem = null;
      draggedItem = null;
    }}
    on:dragenter={() => (dragging = true)}
    class="relative group flex hover:bg-primary/30
     justify-between select-none items-center rounded-sm px-2 py-0 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
  >
    {#if folder.type == "folder"}
      <button class="pr-2" on:click={toggle}>
        <!-- {#if !folder.expand}
          <div class="rotate-icon"> -->
        <ChevronDown
          class={`transition-transform ${folder.expand ? "" : "-rotate-90"}`}
          size={14}
        />
        <!-- </div>
        {:else}
          <div class="rotate-icon rotated">
            <ChevronRight size={14} />
          </div>
        {/if} -->
      </button>
    {/if}
    <FolderName
      {folder}
      on:folderUpdate={(f) => {
        dispatch("folderUpdate", {
          fld: folder,
        });
      }}
    ></FolderName>
    <FolderAction
      {folder}
      on:folderUpdate={(f) => {
        dispatch("folderUpdate", {
          fld: f,
        });
      }}
    ></FolderAction>
  </div>

  {#if folder.expand && folder?.subfolders != null && folder?.subfolders?.length > 0}
    <div
      transition:slide={{ duration: 200, easing: quintOut }}
      class="border-l ml-4 border-gray-200 dark:border-gray-700 pl-2 mt-1 space-y-1"
    >
      {#each folder?.subfolders as subfolder, index (index)}
        <div animate:flip>
          <FolderItem
            on:folderUpdate={(f) => {
              dispatch("folderUpdate", {
                fld: f,
              });
            }}
            folder={subfolder}
            path={subfolder}
            {onDrop}
            {onDragStart}
            {onDragOver}
          />
        </div>
      {/each}
    </div>
  {:else if folder.expand && folder.type === "folder"}
    <div transition:slide={{ duration: 200 }} style="margin-left: 24px;">
      <!-- Empty folder content -->
    </div>
  {/if}
</div>
