<script lang="ts">
  import { Folder } from "lucide-svelte";

  import { FolderOpen } from "lucide-svelte";
  import { FileCode } from "lucide-svelte";

  import type { FolderModel } from "../types/folder.model";

  import { Input } from "$lib/components/ui/input/index.js";

  import { createEventDispatcher } from "svelte";
  export let folder: FolderModel;

  const toggle = () => {
    folder.expand = !folder.expand;
    dispatch("folderUpdate", {
      fld: folder,
    });
  };
  const dispatch = createEventDispatcher();

  function handleKey(e: KeyboardEvent): void {
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
        if (folder.name != "") folder.rename = false;
      }}
      placeholder="Enter {folder.type} name"
    />
  {:else}
    <span class="ml-2 flex-none"> {folder.name} </span>
  {/if}
</button>
