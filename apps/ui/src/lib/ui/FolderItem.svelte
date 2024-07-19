<script>
  import { Button } from "../components/ui/button";
  import FolderItem from "./FolderItem.svelte";

  import { Delete, Folder, Trash } from "lucide-svelte";
  import { FolderPlus } from "lucide-svelte";
  import { FilePlus } from "lucide-svelte";

  import { FolderOpen } from "lucide-svelte";
  import { FileCode } from "lucide-svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { EllipsisVertical } from "lucide-svelte";

  import { flip } from "svelte/animate";

  export let folder;

  /**
   * @type {any[]}
   */
  export let path = [];
  export let onDrop;
  export let onDragStart;
  export let onDragOver;

  let open = false;
  let dragging = false;
  const toggle = () => (open = !open);

  const handleDrop = (/** @type {DragEvent} */ event) => {
    onDrop({ event, path });
    dragging = false;
    event.preventDefault();
  };

  const handleDragStart = (/** @type {DragEvent} */ event) => {
    onDragStart({ event, path });
    if (!!event && !!event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      console.log(event.dataTransfer);
      event.dataTransfer.setData("text/plain", "");
    }
    dragging = true;
  };

  const handleDragOver = (/** @type {DragEvent} */ event) => {
    if (!!event && !!event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
      console.log(event.dataTransfer);
    }
    onDragOver({ event, path });
    dragging = true;
    event.preventDefault();
  };

  let showStatusBar = true;
  let showActivityBar = false;
  let showPanel = false;
</script>

<div
  class="folder rounded-lg {dragging ? 'bg-green-100 dark:bg-green-950 ' : ''}"
>
  <div
    role="listitem"
    draggable={true}
    on:dragstart={handleDragStart}
    on:drop={handleDrop}
    on:dragover={handleDragOver}
    on:dragexit={() => (dragging = false)}
    on:dragleave={() => (dragging = false)}
    on:dragenter={() => (dragging = true)}
    class="relative group flex hover:bg-slate-50 dark:hover:bg-slate-800
     
    justify-between select-none items-center rounded-sm px-2 py-0 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
  >
    <button on:click={toggle} class="flex flex-auto align-middle">
      <div class="flex-none">
        {#if folder.type == "folder"}
          {#if !open}
            <Folder size={20}></Folder>
          {:else}
            <FolderOpen size={20}></FolderOpen>
          {/if}
        {:else}
          <FileCode class="text-blue-400" size={20}></FileCode>
        {/if}
      </div>
      <span class="ml-2 flex-none"> {folder.name} </span>
    </button>
    <div
      class="inline-flex group-hover:bg-slate-50 group-hover:dark:bg-slate-900"
    >
      {#if folder.type == "folder"}
        <button
          on:click={() => console.log("click on create")}
          class=" px-1 group-hover:opacity-100 opacity-0 hover:bg-slate-100 hover:dark:bg-slate-900 rounded-sm"
        >
          <FolderPlus size={16}></FolderPlus>
        </button>
        <button
          on:click={() => console.log("click on create")}
          class=" px-1 group-hover:opacity-100 opacity-0 hover:bg-slate-100 hover:dark:bg-slate-900 rounded-sm"
        >
          <FilePlus size={16}></FilePlus>
        </button>
      {:else}
        <button
          on:click={() => console.log("click on create")}
          class=" px-1 group-hover:opacity-100 opacity-0 hover:bg-slate-100 hover:dark:bg-slate-900 rounded-sm"
        >
          <Trash class="text-red-500" size={16}></Trash>
        </button>
      {/if}
      <div class="group-hover:opacity-100 opacity-20">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild let:builder>
            <Button
              class="px-1"
              builders={[builder]}
              variant="link"
              style="icon"
            >
              <EllipsisVertical size={16}></EllipsisVertical>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Label>Appearance</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.CheckboxItem bind:checked={showStatusBar}>
              Status Bar
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem bind:checked={showActivityBar} disabled>
              Activity Bar
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem bind:checked={showPanel}
              >Panel</DropdownMenu.CheckboxItem
            >
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  </div>

  {#if open && folder?.subfolders != null && folder?.subfolders?.length > 0}
    <div
      style="margin-left: 24px; border-left-width: 1px; border-bottom-left-radius: 12px; "
    >
      {#each folder?.subfolders as subfolder (subfolder.name)}
        <div animate:flip>
          <FolderItem
            folder={subfolder}
            path={subfolder}
            {onDrop}
            {onDragStart}
            {onDragOver}
          />
        </div>
      {/each}
    </div>
  {:else if open}
    <div style="margin-left: 24px;  ">
      <div class="flex flex-col flex-1">
        <div class="flex flex-col items-center justify-center p-4">
          <span
            class="max-w-sm mt-2 text-center whitespace-normal font-thin text-xs text-secondaryLight"
            >Collections are empty</span
          >
          <div class="mt-4">
            <div class="flex flex-col items-center space-y-4">
              <span class="text-center text-secondaryLight"
                >Import or create a collection</span
              >
              <div class="flex flex-col items-stretch gap-4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .folder {
    margin-left: 0.5em;
    /* margin-right: 0.5em; */
  }
</style>
