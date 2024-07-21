<script lang="ts">
  import { Button } from "../components/ui/button";
  import FolderItem from "./FolderItem.svelte";

  import { Folder, Trash } from "lucide-svelte";
  import { FolderPlus } from "lucide-svelte";
  import { FilePlus } from "lucide-svelte";

  import { FolderOpen } from "lucide-svelte";
  import { FileCode } from "lucide-svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { EllipsisVertical } from "lucide-svelte";

  import { flip } from "svelte/animate";
  import { v4 as uuidv4 } from "uuid";
  import type { FolderModel } from "../types/folder.model";

  import { Input } from "$lib/components/ui/input/index.js";

  import { createEventDispatcher } from "svelte";
  export let folder: FolderModel;

  export let path: FolderModel;
  export let onDrop;
  export let onDragStart;
  export let onDragOver;

  let dragging = false;
  const toggle = () => (folder.expand = !folder.expand);
  const dispatch = createEventDispatcher();

  function addFolder(type: "folder" | "file") {
    if (!folder.subfolders) folder.subfolders = [];
    folder.expand = true;
    folder.subfolders.push({
      name: "",
      subfolders: [],
      type: type,
      rename: true,
      expand: false,
      uid: uuidv4().toString(),
    });
    dispatch("folderUpdate", {
      fld: folder,
    });
  }

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

  let showStatusBar = true;
  let showActivityBar = false;
  let showPanel = false;

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
    <button
      on:click={toggle}
      on:dblclick={() => (folder.rename = true)}
      class="flex flex-auto items-center ring-0 align-middle"
    >
      <div class="flex-none">
        {#if folder.type == "folder"}
          {#if !folder.expand}
            <Folder size={20}></Folder>
          {:else}
            <FolderOpen size={20}></FolderOpen>
          {/if}
        {:else}
          <FileCode class="text-blue-400" size={20}></FileCode>
        {/if}
      </div>

      {#if folder.rename}
        <Input
          type="text"
          class="m-1 focus-visible:ring-0 h-6 bg-slate-200 dark:bg-slate-800 "
          bind:value={folder.name}
          on:keydown={handleKey}
          on:focusout={() => {
            if (folder.name !== "") folder.rename = false;
          }}
          placeholder="Enter {folder.type} name"
        />
      {:else}
        <span class="ml-2 flex-none"> {folder.name} </span>
      {/if}
    </button>
    <div
      class="inline-flex group-hover:bg-slate-50 group-hover:dark:bg-slate-900"
    >
      {#if folder.type == "folder"}
        <button
          on:click={() => addFolder("folder")}
          class=" px-1 group-hover:opacity-100 opacity-0 hover:bg-slate-100 hover:dark:bg-slate-900 rounded-sm"
        >
          <FolderPlus size={16}></FolderPlus>
        </button>
        <button
          on:click={() => addFolder("file")}
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

  {#if folder.expand && folder?.subfolders != null && folder?.subfolders?.length > 0}
    <div
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
    <!-- <div style="margin-left: 24px;  ">
      <div class="flex flex-col flex-1">
        <div class="flex flex-col items-center justify-center p-4">
          <img src="%sveltekit.assets%/104-dumbbell.svg" alt="" srcset="" />
          <span
            class="max-w-sm mt-2 text-center whitespace-normal font-thin text-xs text-secondaryLight"
            >🫙 Empty
          </span>
          <span></span>
        </div>
      </div>
    </div> -->
  {/if}
</div>

<style>
  .folder {
    margin-left: 0.5em;
    /* margin-right: 0.5em; */
  }
</style>
