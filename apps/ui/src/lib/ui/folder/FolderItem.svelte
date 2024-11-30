<script lang="ts">
  import FolderName from "./FolderName.svelte";

  import FolderAction from "./FolderAction.svelte";

  import FolderItem from "./FolderItem.svelte";
  import { flip } from "svelte/animate";
  import { slide } from "svelte/transition";
  import type { FolderModel } from "../../types/folder.model";
  import { createEventDispatcher } from "svelte";
  import { quintOut } from "svelte/easing";
  export let folder: FolderModel;

  export let path: FolderModel;
  export let onDrop;
  export let onDragStart;
  export let onDragOver;

  let dragging = false;
  const toggle = () => (folder.expand = !folder.expand);
  const dispatch = createEventDispatcher();

  const handleDrop = (event: { preventDefault: () => void }) => {
    onDrop({ event, path });
    dragging = false;
    event.preventDefault();
  };

  const handleDragStart = (event: any) => {
    onDragStart({ event, path });
    if (!!event && !!event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      console.log(event.dataTransfer);
      event.dataTransfer.setData("text/plain", "");
    }
    dragging = true;
  };

  const handleDragOver = (event: any) => {
    if (!!event && !!event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
      console.log(event.dataTransfer);
    }
    onDragOver({ event, path });
    dragging = true;
    event.preventDefault();
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

<div class=" rounded-lg {dragging ? 'bg-primary bg-blend-multiply ' : ''}">
  <div
    role="listitem"
    draggable={true}
    on:dragstart={handleDragStart}
    on:drop={handleDrop}
    on:dragover={handleDragOver}
    on:dragexit={() => (dragging = false)}
    on:dragleave={() => (dragging = false)}
    on:dragenter={() => (dragging = true)}
    class="relative group flex hover:bg-primary/10
     justify-between select-none items-center rounded-sm px-2 py-0 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
  >
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
      style="margin-left: 24px; border-left-width: 1px; border-bottom-left-radius: 12px; "
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

<style>
</style>
